import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const BASE = process.env.RBAC_BASE_URL || 'http://localhost:5000/api';
const ADMIN_EMAIL = process.env.RBAC_ADMIN_EMAIL || process.env.BOOTSTRAP_ADMIN_EMAIL || 'sospeter@gmail.com';
const ADMIN_PASSWORD = process.env.RBAC_ADMIN_PASSWORD || process.env.BOOTSTRAP_ADMIN_PASSWORD || '';
const FIXTURE_PASSWORD = 'E2eTest123!';

let passed = 0;
let failed = 0;

function check(name: string, ok: boolean, detail?: unknown) {
  if (ok) {
    passed += 1;
    console.log(`PASS ${name}`);
  } else {
    failed += 1;
    console.error(`FAIL ${name}`, detail instanceof Error ? detail.message : detail ?? '');
  }
}

async function req(method: string, path: string, token?: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { status: res.status, data };
}

async function login(email: string, password: string) {
  const res = await req('POST', '/auth/login', undefined, { email, password });
  return res;
}

async function main() {
  const stamp = Date.now();
  const testEmail = `rbac.e2e.${stamp}@example.com`;
  const testRole = `E2E_ROLE_${stamp}`;

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    if (!ADMIN_PASSWORD) throw new Error('Set BOOTSTRAP_ADMIN_PASSWORD (or RBAC_ADMIN_PASSWORD) before running this test.');

    const fixtures = [
      { role: 'FINANCE_ADMIN', label: 'FINANCE_ADMIN', email: `rbac.e2e.finance.${stamp}@example.com` },
      { role: 'CHURCH_SECRETARY', label: 'CHURCH_SECRETARY', email: `rbac.e2e.secretary.${stamp}@example.com` },
      { role: 'WEBSITE_ADMIN', label: 'WEBSITE_ADMIN', email: `rbac.e2e.website.${stamp}@example.com` },
      { role: 'CHURCH_MEMBER', label: 'CHURCH_MEMBER', email: `rbac.e2e.member.${stamp}@example.com` },
    ];
    const fixturePasswordHash = await bcrypt.hash(FIXTURE_PASSWORD, 10);
    for (const fixture of fixtures) {
      const role = await prisma.role.findUnique({ where: { name: fixture.role } });
      if (!role) {
        check(`fixture role ${fixture.role} exists`, false);
        continue;
      }
      await prisma.user.create({
        data: {
          email: fixture.email,
          passwordHash: fixturePasswordHash,
          status: 'ACTIVE',
          roles: { create: { roleId: role.id } },
        },
      });
    }

    const adminLogin = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
    check('admin login', adminLogin.status === 200, adminLogin.data);
    const token = adminLogin.data?.accessToken as string;
    const refreshToken = adminLogin.data?.refreshToken as string;
    check('login returns effective permissions', Array.isArray(adminLogin.data?.permissions) && adminLogin.data.permissions.includes('users.view'));
    check('login returns dashboards', (adminLogin.data?.dashboards || []).some((d: any) => d.path === '/admin/dashboard'));

    for (const [name, path] of [
      ['GET /admin/users', '/admin/users?page=1&pageSize=5'],
      ['GET /admin/roles', '/admin/roles'],
      ['GET /admin/permissions', '/admin/permissions'],
      ['GET /admin/role-assignments', '/admin/role-assignments'],
      ['GET /admin/sessions', '/admin/sessions'],
      ['GET /admin/audit-logs', '/admin/audit-logs?limit=5'],
    ]) {
      const r = await req('GET', path, token);
      check(name, r.status === 200, r.data);
    }

    const created = await req('POST', '/admin/users', token, { email: testEmail, roles: ['CHURCH_MEMBER'] });
    check('create user requires users.create', [200, 201].includes(created.status), created.data);
    const userId = created.data?.user?.id as string | undefined;
    check('created user has id', !!userId);

    if (userId) {
      const assign = await req('PATCH', `/admin/users/${userId}/roles`, token, { assign: ['WEBSITE_ADMIN'], reason: 'e2e assignment' });
      check('assign role', [200, 201].includes(assign.status), assign.data);
      const revoke = await req('PATCH', `/admin/users/${userId}/roles`, token, { revoke: ['WEBSITE_ADMIN'], reason: 'e2e revoke' });
      check('revoke role', [200, 201].includes(revoke.status), revoke.data);

      const reset = await req('POST', `/admin/users/${userId}/reset-password`, token);
      check('reset password issues temporary password', [200, 201].includes(reset.status) && !!reset.data?.temporaryPassword, reset.data);
      const temp = reset.data?.temporaryPassword as string;

      const suspend = await req('POST', `/admin/users/${userId}/suspend`, token);
      check('suspend account', [200, 201].includes(suspend.status), suspend.data);
      const suspendedLogin = await login(testEmail, temp);
      check('suspended account cannot log in', suspendedLogin.status === 401, suspendedLogin.data);

      const activate = await req('POST', `/admin/users/${userId}/activate`, token);
      check('activate account', [200, 201].includes(activate.status), activate.data);

      const revokeSessions = await req('POST', `/admin/users/${userId}/sessions/revoke-all`, token);
      check('revoke user sessions', [200, 201].includes(revokeSessions.status), revokeSessions.data);

      const detail = await req('GET', `/admin/users/${userId}`, token);
      check('user detail with access and activity', detail.status === 200 && Array.isArray(detail.data?.access?.permissions), detail.data);

      const selfId = adminLogin.data?.user?.id as string;
      const selfAssign = await req('PATCH', `/admin/users/${selfId}/roles`, token, { assign: ['FINANCE_ADMIN'] });
      check('cannot grant self additional roles', selfAssign.status === 400, selfAssign.data);
      const selfSuspend = await req('POST', `/admin/users/${selfId}/suspend`, token);
      check('cannot suspend last system administrator', selfSuspend.status === 400, selfSuspend.data);
      const selfRevoke = await req('PATCH', `/admin/users/${selfId}/roles`, token, { revoke: ['SYSTEM_ADMIN'] });
      check('cannot revoke last system administrator role', selfRevoke.status === 400, selfRevoke.data);
    }

    const identities = fixtures.map((fixture) => ({
      email: fixture.email,
      password: FIXTURE_PASSWORD,
      label: fixture.label,
    }));

    for (const identity of identities) {
      const session = await login(identity.email, identity.password);
      check(`${identity.label} login`, session.status === 200, session.data);
      if (session.status !== 200) continue;
      const t = session.data?.accessToken as string;
      const list = await req('GET', '/admin/users', t);
      check(`${identity.label} cannot list users`, list.status === 403, list.data);
      const create = await req('POST', '/admin/users', t, { email: `denied.${stamp}@example.com`, roles: ['CHURCH_MEMBER'] });
      check(`${identity.label} cannot create users`, create.status === 403, create.data);
    }

    const sysFinance = await req('POST', '/finance/payments', token, {});
    check('system admin has no implicit finance write', sysFinance.status === 403, sysFinance.data);
    const sysCms = await req('POST', '/cms/pages', token, { slug: `e2e-${stamp}`, title: 'x', content: 'x' });
    check('system admin has no implicit CMS write', sysCms.status === 403, sysCms.data);

    const refreshed = await req('POST', '/auth/refresh', undefined, { refreshToken });
    check('refresh token rotation', refreshed.status === 200 && !!refreshed.data?.refreshToken, refreshed.data);
    const reused = await req('POST', '/auth/refresh', undefined, { refreshToken });
    check('old refresh token cannot be reused', reused.status === 401, reused.data);

    const roleCreate = await req('POST', '/admin/roles', token, { name: testRole, description: 'e2e temporary role' });
    check('create custom role', [200, 201].includes(roleCreate.status), roleCreate.data);
    const roleId = roleCreate.data?.id as string | undefined;
    if (roleId) {
      const perms = await req('PUT', `/admin/roles/${roleId}/permissions`, token, { permissionCodes: ['users.view', 'reports.system.view'] });
      check('assign permissions to custom role', perms.status === 200, perms.data);
      const status = await req('PATCH', `/admin/roles/${roleId}/status`, token, { isActive: false });
      check('deactivate custom role', status.status === 200, status.data);
      const del = await req('DELETE', `/admin/roles/${roleId}`, token);
      check('delete custom role', del.status === 200, del.data);
    }
  } finally {
    await prisma.user.deleteMany({ where: { email: { startsWith: 'rbac.e2e.' } } }).catch(() => undefined);
    await prisma.user.deleteMany({ where: { email: { startsWith: 'denied.' } } }).catch(() => undefined);
    await prisma.role.deleteMany({ where: { name: { startsWith: 'E2E_ROLE_' } } }).catch(() => undefined);
    await prisma.$disconnect();
    await pool.end();
  }

  console.log(`\nRESULT ${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
