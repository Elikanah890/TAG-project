import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execFileAsync = promisify(execFile);

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private async audit(actorId: string | undefined, action: string, entityType: string, entityId?: string, metadata?: any) {
    await this.prisma.auditLog.create({ data: { actorId: actorId || null, action, entityType, entityId: entityId || null, metadata } });
  }

  // Users & Roles
  async listUsers() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' }, include: { roles: { include: { role: true } }, member: { select: { id: true, fullName: true, memberNo: true, membershipStatus: true } } } });
  }

  async createStaff(dto: any, actorId?: string) {
    const email = (dto.email || '').toLowerCase().trim();
    if (!email) throw new BadRequestException('Email required');
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('User already exists');
    const tempPassword = dto.password || randomBytes(4).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const roleNames: string[] = Array.isArray(dto.roles) ? dto.roles : (dto.role ? [dto.role] : []);
    const user = await this.prisma.user.create({
      data: {
        email, phone: dto.phone || null, passwordHash, status: dto.status || 'ACTIVE',
        roles: { create: await Promise.all(roleNames.map(async (name) => { const role = await this.prisma.role.upsert({ where: { name }, update: {}, create: { name } }); return { roleId: role.id, assignedBy: actorId }; })) }
      },
      include: { roles: { include: { role: true } } },
    });
    await this.audit(actorId, 'USER_CREATED', 'User', user.id, { email, roles: roleNames });
    return { user, temporaryPassword: dto.password ? undefined : tempPassword };
  }

  async updateUser(id: string, dto: any, actorId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const data: any = {};
    if (dto.email) data.email = dto.email.toLowerCase().trim();
    if (dto.phone !== undefined) data.phone = dto.phone || null;
    if (dto.status) data.status = dto.status;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10);
    const updated = await this.prisma.user.update({ where: { id }, data, include: { roles: { include: { role: true } } } });
    if (Array.isArray(dto.roles)) {
      await this.prisma.userRole.deleteMany({ where: { userId: id } });
      for (const name of dto.roles) {
        const role = await this.prisma.role.upsert({ where: { name }, update: {}, create: { name } });
        await this.prisma.userRole.create({ data: { userId: id, roleId: role.id, assignedBy: actorId } });
      }
    }
    await this.audit(actorId, 'USER_UPDATED', 'User', id, { fields: Object.keys(dto) });
    return this.prisma.user.findUnique({ where: { id }, include: { roles: { include: { role: true } }, member: true } });
  }

  async resetUserPassword(id: string, actorId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const tempPassword = randomBytes(4).toString('hex');
    await this.prisma.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(tempPassword, 10), status: 'ACTIVE' } });
    await this.audit(actorId, 'USER_PASSWORD_RESET', 'User', id, { email: user.email });
    return { success: true, userId: id, email: user.email, temporaryPassword: tempPassword };
  }

  async suspendUser(id: string, actorId?: string) { await this.audit(actorId, 'USER_SUSPENDED', 'User', id, {}); return this.prisma.user.update({ where: { id }, data: { status: 'SUSPENDED' } }); }
  async activateUser(id: string, actorId?: string) { await this.audit(actorId, 'USER_ACTIVATED', 'User', id, {}); return this.prisma.user.update({ where: { id }, data: { status: 'ACTIVE' } }); }

  async listRoles() { return this.prisma.role.findMany({ include: { permissions: { include: { permission: true } }, _count: { select: { users: true } } }, orderBy: { name: 'asc' } }); }
  async createRole(dto: any, actorId?: string) { const role = await this.prisma.role.create({ data: { name: dto.name, description: dto.description || null } }); await this.audit(actorId, 'ROLE_CREATED', 'Role', role.id, { name: role.name }); return role; }
  async updateRole(id: string, dto: any, actorId?: string) { const role = await this.prisma.role.update({ where: { id }, data: { name: dto.name, description: dto.description } }); await this.audit(actorId, 'ROLE_UPDATED', 'Role', id, dto); return role; }
  async deleteRole(id: string, actorId?: string) { await this.audit(actorId, 'ROLE_DELETED', 'Role', id, {}); return this.prisma.role.delete({ where: { id } }); }
  async assignRolePermissions(roleId: string, permissionCodes: string[], actorId?: string) {
    await this.prisma.rolePermission.deleteMany({ where: { roleId } });
    for (const code of permissionCodes || []) {
      const perm = await this.prisma.permission.upsert({ where: { code }, update: {}, create: { code } });
      await this.prisma.rolePermission.create({ data: { roleId, permissionId: perm.id } });
    }
    await this.audit(actorId, 'ROLE_PERMISSIONS_UPDATED', 'Role', roleId, { permissionCodes });
    return this.listRoles();
  }

  async listPermissions() { return this.prisma.permission.findMany({ orderBy: { code: 'asc' } }); }
  async createPermission(dto: any, actorId?: string) { const p = await this.prisma.permission.create({ data: { code: dto.code, description: dto.description || null } }); await this.audit(actorId, 'PERMISSION_CREATED', 'Permission', p.id, dto); return p; }
  async updatePermission(id: string, dto: any, actorId?: string) { const p = await this.prisma.permission.update({ where: { id }, data: { code: dto.code, description: dto.description } }); await this.audit(actorId, 'PERMISSION_UPDATED', 'Permission', id, dto); return p; }
  async deletePermission(id: string, actorId?: string) { await this.audit(actorId, 'PERMISSION_DELETED', 'Permission', id, {}); return this.prisma.permission.delete({ where: { id } }); }

  // Audit logs
  async auditLogs(limit = 100) {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: Number(limit) || 100, include: { actor: { select: { id: true, email: true } } } });
  }

  // System settings/config
  async getSettings() { const rows = await this.prisma.systemConfig.findMany(); const m: any = {}; rows.forEach(r=>m[r.key]=r.value); return m; }
  async updateSettings(data: Record<string,string>, actorId?: string) {
    for (const [key,value] of Object.entries(data||{})) {
      await this.prisma.systemConfig.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value), category: key.startsWith('security.')?'SECURITY':'GENERAL' } });
    }
    await this.audit(actorId, 'SYSTEM_SETTINGS_UPDATED', 'SystemConfig', null, { keys: Object.keys(data||{}) });
    return this.getSettings();
  }

  async health() {
    let dbOk = false; try { await this.prisma.$queryRaw`SELECT 1`; dbOk = true; } catch {}
    const [users, activeUsers, members, pending, contrib, auditCount] = await Promise.all([
      this.prisma.user.count(), this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.member.count(), this.prisma.member.count({ where: { membershipStatus: { in: ['PENDING','PENDING_REVIEW'] as any } } }),
      this.prisma.contribution.aggregate({ _sum: { amount: true } }), this.prisma.auditLog.count(),
    ]);
    return { status: dbOk ? 'healthy':'degraded', database: dbOk ? 'connected':'error', uptimeSeconds: Math.floor(process.uptime()), timestamp: new Date().toISOString(), counts: { users, activeUsers, members, pending, auditLogs: auditCount }, totals: { contributions: Number(contrib._sum.amount||0) } };
  }

  private backupDatabaseUrl(raw: string) {
    const url = new URL(raw);
    ['schema', 'connection_limit', 'pool_timeout', 'pgbouncer', 'statement_cache_size'].forEach((key) => url.searchParams.delete(key));
    return url.toString();
  }

  private redactDatabaseUrl(text: string) {
    return text
      .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, '[database-url]')
      .slice(0, 300);
  }

  async backup(actorId?: string) {
    const backupsDir = path.join(process.cwd(), 'backups');
    try { fs.mkdirSync(backupsDir, { recursive: true }); } catch {}
    const file = path.join(backupsDir, `backup-${Date.now()}.sql`);
    let status = 'FAILED';
    let notes = 'DATABASE_URL is not configured.';
    try {
      if (process.env.DATABASE_URL) {
        await execFileAsync('pg_dump', [this.backupDatabaseUrl(process.env.DATABASE_URL), '-f', file], { timeout: 20000 });
        status = 'SUCCESS';
        notes = 'pg_dump completed';
      }
    } catch (e: any) {
      notes = this.redactDatabaseUrl(String(e?.stderr || e?.message || 'pg_dump failed'));
    }
    const log = await this.prisma.backupLog.create({ data: { type: 'MANUAL', status, location: status==='SUCCESS'?file:null, notes, triggeredBy: actorId || null } });
    await this.audit(actorId, 'SYSTEM_BACKUP_TRIGGERED', 'BackupLog', log.id, { status });
    return log;
  }

  async backupLogs() { return this.prisma.backupLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }); }

  async notifications() { return this.prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }); }
  async createNotification(dto: any, actorId?: string) { const n = await this.prisma.notification.create({ data: { title: dto.title, message: dto.message, audience: dto.audience||'ALL', type: dto.type||'INFO' } }); await this.audit(actorId,'NOTIFICATION_CREATED','Notification',n.id,{}); return n; }

  async budgets() { return this.prisma.budget.findMany({ orderBy: { createdAt: 'desc' }, include: { project: true } }); }
  async createBudget(dto: any, actorId?: string) { const b = await this.prisma.budget.create({ data: { name: dto.name, category: dto.category||null, amount: dto.amount, period: dto.period||null, status: dto.status||'PLANNED', notes: dto.notes||null, projectId: dto.projectId||null } }); await this.audit(actorId,'BUDGET_CREATED','Budget',b.id,{}); return b; }
  async projects() { return this.prisma.project.findMany({ orderBy: { createdAt: 'desc' }, include: { budgets: true } }); }
  async createProject(dto: any, actorId?: string) { const p = await this.prisma.project.create({ data: { name: dto.name, description: dto.description||null, targetAmount: dto.targetAmount||null, status: dto.status||'ACTIVE', startDate: dto.startDate?new Date(dto.startDate):null, endDate: dto.endDate?new Date(dto.endDate):null } }); await this.audit(actorId,'PROJECT_CREATED','Project',p.id,{}); return p; }

  async systemReports() {
    const [membersByStatus, contribs, expenses, pledges, budgets, projects] = await Promise.all([
      this.prisma.member.groupBy({ by: ['membershipStatus'], _count: true }),
      this.prisma.contribution.groupBy({ by: ['category'], _sum: { amount: true }, where: { status: 'CONFIRMED' as any } }),
      this.prisma.expense.groupBy({ by: ['category'], _sum: { amount: true } }),
      this.prisma.pledge.aggregate({ _sum: { amount: true }, _count: true }),
      this.prisma.budget.aggregate({ _sum: { amount: true }, _count: true }),
      this.prisma.project.count(),
    ]);
    return { membersByStatus, contributionsByCategory: contribs, expensesByCategory: expenses, pledges, budgets, projects };
  }

  async userActivity() {
    return this.prisma.user.findMany({ orderBy: { lastLoginAt: 'desc' }, take: 50, select: { id: true, email: true, status: true, lastLoginAt: true, roles: { include: { role: true } } } });
  }
}
