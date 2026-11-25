import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsService } from '../rbac/permissions.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

const USER_STATUSES = new Set(['ACTIVE', 'SUSPENDED', 'PENDING']);
const SYSTEM_ADMIN = 'SYSTEM_ADMIN';
const ROLE_NAME_RE = /^[A-Z][A-Z0-9_]{2,49}$/;
const PERMISSION_CODE_RE = /^[a-z][a-z0-9_.]{2,80}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function tempPassword() {
  return `Tmp${randomBytes(5).toString('hex')}Aa1!`;
}

function assertPasswordPolicy(password: string) {
  if (!password || password.length < 8) throw new BadRequestException('Password must be at least 8 characters');
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new BadRequestException('Password must include upper case, lower case and a number');
  }
}

@Injectable()
export class AccessManagementService {
  constructor(
    private prisma: PrismaService,
    private permissions: PermissionsService,
  ) {}

  private async audit(actorId: string | undefined, action: string, entityType: string, entityId?: string | null, metadata?: any) {
    await this.prisma.auditLog.create({
      data: { actorId: actorId || null, action, entityType, entityId: entityId || null, metadata: metadata || {} },
    });
  }

  private userSelect() {
    return {
      id: true,
      email: true,
      phone: true,
      status: true,
      lastLoginAt: true,
      mustChangePassword: true,
      createdAt: true,
      updatedAt: true,
      member: { select: { id: true, fullName: true, memberNo: true, phone: true, membershipStatus: true } },
      roles: { select: { assignedAt: true, assignedBy: true, role: { select: { id: true, name: true, description: true, isSystem: true, isActive: true } } } },
    } as const;
  }

  private async getUserOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } }, member: true, scopes: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async activeSystemAdminCount(excludeUserId?: string) {
    return this.prisma.user.count({
      where: {
        status: 'ACTIVE',
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
        roles: { some: { role: { name: SYSTEM_ADMIN, isActive: true } } },
      },
    });
  }

  private async assertNotLastSystemAdmin(userId: string, action: string) {
    const user = await this.getUserOrThrow(userId);
    const isSys = user.roles.some((ur) => ur.role.name === SYSTEM_ADMIN);
    if (!isSys) return;
    const others = await this.activeSystemAdminCount(userId);
    if (others === 0) {
      throw new BadRequestException(`Cannot ${action}: at least one active System Administrator must remain`);
    }
  }

  private async resolveRoleIds(names: string[], opts: { allowInactive?: boolean } = {}) {
    const unique = Array.from(new Set(names.map((n) => String(n || '').trim().toUpperCase()).filter(Boolean)));
    if (!unique.length) return [];
    const roles = await this.prisma.role.findMany({ where: { name: { in: unique } } });
    const missing = unique.filter((n) => !roles.some((r) => r.name === n));
    if (missing.length) throw new BadRequestException(`Unknown role(s): ${missing.join(', ')}`);
    if (!opts.allowInactive) {
      const inactive = roles.filter((r) => !r.isActive).map((r) => r.name);
      if (inactive.length) throw new BadRequestException(`Inactive role(s) cannot be assigned: ${inactive.join(', ')}`);
    }
    return roles;
  }

  async listUsers(query: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const q = String(query.q || '').trim();
    const role = String(query.role || '').trim().toUpperCase();
    const status = String(query.status || '').trim().toUpperCase();
    const from = query.from ? new Date(query.from) : null;
    const to = query.to ? new Date(query.to) : null;

    const where: any = {};
    if (status) {
      if (!USER_STATUSES.has(status)) throw new BadRequestException('Invalid status filter');
      where.status = status;
    }
    if (role) where.roles = { some: { role: { name: role } } };
    if (from || to) where.createdAt = { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) };
    if (q) {
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { member: { is: { fullName: { contains: q, mode: 'insensitive' } } } },
        { member: { is: { memberNo: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    const [data, total, byStatus] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: this.userSelect(),
      }),
      this.prisma.user.count({ where }),
      this.prisma.user.groupBy({ by: ['status'], _count: true }),
    ]);

    return {
      data,
      meta: { total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
      counts: { byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })) },
    };
  }

  async getUserDetail(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: this.userSelect() });
    if (!user) throw new NotFoundException('User not found');
    const [access, sessions, roleHistory, activity] = await Promise.all([
      this.permissions.getEffectiveAccess(id),
      this.prisma.refreshToken.findMany({
        where: { userId: id, revokedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
        select: { id: true, createdAt: true, expiresAt: true, lastUsedAt: true, userAgent: true, ip: true },
      }),
      this.prisma.roleAssignmentHistory.findMany({ where: { userId: id }, orderBy: { createdAt: 'desc' }, take: 50 }),
      this.prisma.auditLog.findMany({
        where: { OR: [{ actorId: id }, { AND: [{ entityType: 'User' }, { entityId: id }] }] },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { actor: { select: { id: true, email: true } } },
      }),
    ]);
    return { user, access, sessions, roleHistory, activity };
  }

  async getUserActivity(id: string) {
    await this.getUserOrThrow(id);
    const [activity, roleHistory, sessions] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { OR: [{ actorId: id }, { AND: [{ entityType: 'User' }, { entityId: id }] }] },
        orderBy: { createdAt: 'desc' },
        take: 200,
        include: { actor: { select: { id: true, email: true } } },
      }),
      this.prisma.roleAssignmentHistory.findMany({ where: { userId: id }, orderBy: { createdAt: 'desc' }, take: 100 }),
      this.prisma.refreshToken.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: { id: true, createdAt: true, expiresAt: true, revokedAt: true, lastUsedAt: true, userAgent: true, ip: true },
      }),
    ]);
    return { activity, roleHistory, sessions };
  }

  async createUser(dto: any, actorId?: string) {
    const email = String(dto.email || '').toLowerCase().trim();
    if (!EMAIL_RE.test(email)) throw new BadRequestException('Valid email is required');
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('A user with this email already exists');

    const providedPassword = dto.password ? String(dto.password) : null;
    if (providedPassword) assertPasswordPolicy(providedPassword);
    const password = providedPassword || tempPassword();
    const mustChangePassword = Boolean(dto.mustChangePassword) || !providedPassword;
    const passwordHash = await bcrypt.hash(password, 10);
    const roleNames: string[] = Array.isArray(dto.roles) && dto.roles.length ? dto.roles : ['CHURCH_MEMBER'];
    const roles = await this.resolveRoleIds(roleNames);

    if (roles.some((r) => r.name === SYSTEM_ADMIN)) {
      const allowed = actorId ? await this.permissions.hasAll(actorId, ['roles.assign_system']) : false;
      if (!allowed) throw new BadRequestException('You are not authorized to assign the System Administrator role');
    }

    const status = dto.status ? String(dto.status).toUpperCase() : 'ACTIVE';
    if (!USER_STATUSES.has(status)) throw new BadRequestException('Invalid status');

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          phone: dto.phone ? String(dto.phone) : null,
          passwordHash,
          mustChangePassword,
          status: status as any,
          roles: { create: roles.map((r) => ({ roleId: r.id, assignedBy: actorId || null })) },
        },
        select: this.userSelect(),
      });
      for (const r of roles) {
        await tx.roleAssignmentHistory.create({
          data: { actorId: actorId || null, userId: created.id, roleId: r.id, roleName: r.name, action: 'ASSIGN', reason: dto.reason || 'Account created' },
        });
      }
      return created;
    });

    await this.audit(actorId, 'USER_CREATED', 'User', user.id, { email, roles: roles.map((r) => r.name), status, mustChangePassword });
    return { user, temporaryPassword: providedPassword ? undefined : password };
  }

  async updateUser(id: string, dto: any, actorId?: string) {
    const user = await this.getUserOrThrow(id);
    const data: any = {};
    if (dto.email !== undefined) {
      const email = String(dto.email || '').toLowerCase().trim();
      if (!EMAIL_RE.test(email)) throw new BadRequestException('Valid email is required');
      if (email !== user.email) {
        const conflict = await this.prisma.user.findUnique({ where: { email } });
        if (conflict) throw new ConflictException('A user with this email already exists');
      }
      data.email = email;
    }
    if (dto.phone !== undefined) data.phone = dto.phone ? String(dto.phone) : null;
    if (dto.password) {
      assertPasswordPolicy(String(dto.password));
      data.passwordHash = await bcrypt.hash(String(dto.password), 10);
    }
    if (Object.keys(data).length === 0) return { user: await this.prisma.user.findUnique({ where: { id }, select: this.userSelect() }) };
    const updated = await this.prisma.user.update({ where: { id }, data, select: this.userSelect() });
    await this.audit(actorId, 'USER_UPDATED', 'User', id, { fields: Object.keys(data) });
    return { user: updated };
  }

  async assignRoles(id: string, dto: any, actorId?: string) {
    const target = await this.getUserOrThrow(id);
    const assignNames: string[] = Array.isArray(dto.assign) ? dto.assign : [];
    const revokeNames: string[] = Array.isArray(dto.revoke) ? dto.revoke : [];
    if (!assignNames.length && !revokeNames.length) throw new BadRequestException('Provide roles to assign or revoke');
    if (assignNames.length && actorId === id) {
      throw new BadRequestException('You cannot grant yourself additional roles');
    }

    const rolesToAssign = await this.resolveRoleIds(assignNames);
    const rolesToRevoke = await this.resolveRoleIds(revokeNames, { allowInactive: true });
    const currentRoleNames = new Set(target.roles.map((ur) => ur.role.name));

    // Privilege-escalation guard: protected system roles need an explicit permission.
    const assigningProtected = rolesToAssign.some((r) => r.isSystem && r.name === SYSTEM_ADMIN);
    if (assigningProtected) {
      const allowed = actorId ? await this.permissions.hasAll(actorId, ['roles.assign_system']) : false;
      if (!allowed) throw new BadRequestException('You are not authorized to assign the System Administrator role');
    }

    if (rolesToRevoke.some((r) => r.name === SYSTEM_ADMIN) && currentRoleNames.has(SYSTEM_ADMIN)) {
      await this.assertNotLastSystemAdmin(id, 'revoke System Administrator role');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      for (const r of rolesToAssign) {
        if (currentRoleNames.has(r.name)) continue;
        await tx.userRole.upsert({
          where: { userId_roleId: { userId: id, roleId: r.id } },
          update: {},
          create: { userId: id, roleId: r.id, assignedBy: actorId || null },
        });
        await tx.roleAssignmentHistory.create({
          data: { actorId: actorId || null, userId: id, roleId: r.id, roleName: r.name, action: 'ASSIGN', reason: dto.reason || null },
        });
      }
      for (const r of rolesToRevoke) {
        if (!currentRoleNames.has(r.name)) continue;
        await tx.userRole.deleteMany({ where: { userId: id, roleId: r.id } });
        await tx.roleAssignmentHistory.create({
          data: { actorId: actorId || null, userId: id, roleId: r.id, roleName: r.name, action: 'REVOKE', reason: dto.reason || null },
        });
      }
      return tx.user.findUnique({ where: { id }, select: this.userSelect() });
    });

    await this.audit(actorId, 'USER_ROLES_UPDATED', 'User', id, {
      assigned: rolesToAssign.map((r) => r.name),
      revoked: rolesToRevoke.map((r) => r.name),
      reason: dto.reason || null,
    });

    // Role removal must not keep stale elevated sessions alive.
    if (rolesToRevoke.length) {
      await this.prisma.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date(), revokedBy: actorId || null } });
    }

    return { user: result };
  }

  async resetPassword(id: string, actorId?: string) {
    const user = await this.getUserOrThrow(id);
    const password = tempPassword();
    await this.prisma.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(password, 10), mustChangePassword: true } });
    await this.prisma.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date(), revokedBy: actorId || null } });
    await this.audit(actorId, 'USER_PASSWORD_RESET', 'User', id, { email: user.email, sessionsRevoked: true, mustChangePassword: true });
    return { success: true, userId: id, email: user.email, temporaryPassword: password };
  }

  async setStatus(id: string, status: string, actorId?: string) {
    const normalized = String(status || '').toUpperCase();
    if (!USER_STATUSES.has(normalized)) throw new BadRequestException('Invalid status');
    await this.getUserOrThrow(id);
    if (normalized !== 'ACTIVE') await this.assertNotLastSystemAdmin(id, `set status ${normalized}`);
    await this.prisma.user.update({ where: { id }, data: { status: normalized as any } });
    if (normalized !== 'ACTIVE') {
      await this.prisma.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date(), revokedBy: actorId || null } });
    }
    await this.audit(actorId, `USER_${normalized}`, 'User', id, { status: normalized });
    return { success: true, userId: id, status: normalized };
  }

  async revokeUserSessions(id: string, actorId?: string) {
    await this.getUserOrThrow(id);
    const result = await this.prisma.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date(), revokedBy: actorId || null } });
    await this.audit(actorId, 'USER_SESSIONS_REVOKED', 'User', id, { count: result.count });
    return { success: true, revoked: result.count };
  }

  async listAllSessions(query: any) {
    const userId = query.userId ? String(query.userId) : undefined;
    return this.prisma.refreshToken.findMany({
      where: { ...(userId ? { userId } : {}), revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      take: Math.min(200, Number(query.limit) || 100),
      select: { id: true, userId: true, createdAt: true, expiresAt: true, lastUsedAt: true, userAgent: true, ip: true, user: { select: { email: true } } },
    });
  }

  async revokeAnySession(sessionId: string, actorId?: string) {
    const token = await this.prisma.refreshToken.findUnique({ where: { id: sessionId } });
    if (!token) throw new NotFoundException('Session not found');
    await this.prisma.refreshToken.update({ where: { id: sessionId }, data: { revokedAt: new Date(), revokedBy: actorId || null } });
    await this.audit(actorId, 'SESSION_REVOKED', 'RefreshToken', sessionId, { userId: token.userId });
    return { success: true };
  }

  async listRoles() {
    return this.prisma.role.findMany({
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
    });
  }

  async createRole(dto: any, actorId?: string) {
    const name = String(dto.name || '').trim().toUpperCase();
    if (!ROLE_NAME_RE.test(name)) throw new BadRequestException('Role name must be 3-50 chars, uppercase letters, numbers or underscores');
    const existing = await this.prisma.role.findUnique({ where: { name } });
    if (existing) throw new ConflictException('Role already exists');
    const role = await this.prisma.role.create({ data: { name, description: dto.description || null, isSystem: false, isActive: true } });
    await this.audit(actorId, 'ROLE_CREATED', 'Role', role.id, { name });
    return role;
  }

  async updateRole(id: string, dto: any, actorId?: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    const data: any = {};
    if (dto.description !== undefined) data.description = dto.description || null;
    if (dto.name !== undefined) {
      if (role.isSystem) throw new BadRequestException('System roles cannot be renamed');
      const name = String(dto.name || '').trim().toUpperCase();
      if (!ROLE_NAME_RE.test(name)) throw new BadRequestException('Invalid role name');
      const conflict = await this.prisma.role.findUnique({ where: { name } });
      if (conflict && conflict.id !== id) throw new ConflictException('Role already exists');
      data.name = name;
    }
    const updated = await this.prisma.role.update({ where: { id }, data });
    await this.audit(actorId, 'ROLE_UPDATED', 'Role', id, { fields: Object.keys(data) });
    return updated;
  }

  async setRoleStatus(id: string, isActive: boolean, actorId?: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    if (role.name === SYSTEM_ADMIN && !isActive) throw new BadRequestException('The System Administrator role cannot be deactivated');
    await this.prisma.role.update({ where: { id }, data: { isActive } });
    await this.audit(actorId, 'ROLE_STATUS_CHANGED', 'Role', id, { name: role.name, isActive });
    return { success: true, id, isActive };
  }

  async deleteRole(id: string, actorId?: string) {
    const role = await this.prisma.role.findUnique({ where: { id }, include: { _count: { select: { users: true } } } });
    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem) throw new BadRequestException('System roles cannot be deleted');
    if (role._count.users > 0) throw new BadRequestException('Remove all users from this role before deleting it');
    await this.prisma.role.delete({ where: { id } });
    await this.audit(actorId, 'ROLE_DELETED', 'Role', id, { name: role.name });
    return { success: true };
  }

  async setRolePermissions(id: string, codes: string[], actorId?: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    const unique = Array.from(new Set((codes || []).map((c) => String(c || '').trim()).filter(Boolean)));

    if (role.name === SYSTEM_ADMIN) {
      const mustKeep = ['users.view', 'users.assign_roles', 'roles.view', 'roles.assign_permissions', 'permissions.view'];
      const missing = mustKeep.filter((c) => !unique.includes(c));
      if (missing.length) throw new BadRequestException(`Cannot remove core System Administrator permissions: ${missing.join(', ')}`);
    }

    const permissions = await this.prisma.permission.findMany({ where: { code: { in: unique } } });
    const missing = unique.filter((c) => !permissions.some((p) => p.code === c));
    if (missing.length) throw new BadRequestException(`Unknown permission(s): ${missing.join(', ')}`);

    await this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      if (permissions.length) {
        await tx.rolePermission.createMany({ data: permissions.map((p) => ({ roleId: id, permissionId: p.id })) });
      }
    });
    await this.audit(actorId, 'ROLE_PERMISSIONS_UPDATED', 'Role', id, { name: role.name, permissionCodes: unique });
    return this.listRoles();
  }

  async roleUsers(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    return this.prisma.user.findMany({
      where: { roles: { some: { roleId: id } } },
      orderBy: { createdAt: 'desc' },
      select: this.userSelect(),
    });
  }

  async listPermissionCatalog() {
    const permissions = await this.prisma.permission.findMany({ orderBy: [{ module: 'asc' }, { code: 'asc' }] });
    const grouped: Record<string, typeof permissions> = {};
    for (const p of permissions) {
      const key = p.module || 'general';
      grouped[key] = grouped[key] || [];
      grouped[key].push(p);
    }
    return { permissions, grouped };
  }

  async createPermission(dto: any, actorId?: string) {
    const code = String(dto.code || '').trim();
    if (!PERMISSION_CODE_RE.test(code)) throw new BadRequestException('Invalid permission code');
    const existing = await this.prisma.permission.findUnique({ where: { code } });
    if (existing) throw new ConflictException('Permission already exists');
    const [module, ...rest] = code.split('.');
    const permission = await this.prisma.permission.create({
      data: { code, module, action: rest.join('.') || null, description: dto.description || null, isSystem: false },
    });
    await this.audit(actorId, 'PERMISSION_CREATED', 'Permission', permission.id, { code });
    return permission;
  }

  async updatePermission(id: string, dto: any, actorId?: string) {
    const permission = await this.prisma.permission.findUnique({ where: { id } });
    if (!permission) throw new NotFoundException('Permission not found');
    if (permission.isSystem) throw new BadRequestException('System permissions cannot be modified');
    const updated = await this.prisma.permission.update({ where: { id }, data: { description: dto.description ?? permission.description } });
    await this.audit(actorId, 'PERMISSION_UPDATED', 'Permission', id, { code: permission.code });
    return updated;
  }

  async deletePermission(id: string, actorId?: string) {
    const permission = await this.prisma.permission.findUnique({ where: { id } });
    if (!permission) throw new NotFoundException('Permission not found');
    if (permission.isSystem) throw new BadRequestException('System permissions cannot be deleted');
    await this.prisma.permission.delete({ where: { id } });
    await this.audit(actorId, 'PERMISSION_DELETED', 'Permission', id, { code: permission.code });
    return { success: true };
  }

  async roleAssignmentHistory(query: any) {
    return this.prisma.roleAssignmentHistory.findMany({
      where: {
        ...(query.userId ? { userId: String(query.userId) } : {}),
        ...(query.roleId ? { roleId: String(query.roleId) } : {}),
        ...(query.action ? { action: String(query.action).toUpperCase() } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(500, Number(query.limit) || 100),
      include: { actor: { select: { id: true, email: true } }, user: { select: { id: true, email: true } }, role: { select: { id: true, name: true } } },
    });
  }

  async auditLogs(query: any) {
    return this.prisma.auditLog.findMany({
      where: {
        ...(query.action ? { action: { contains: String(query.action), mode: 'insensitive' } } : {}),
        ...(query.actorId ? { actorId: String(query.actorId) } : {}),
        ...(query.entityType ? { entityType: String(query.entityType) } : {}),
        ...(query.from || query.to
          ? { createdAt: { ...(query.from ? { gte: new Date(query.from) } : {}), ...(query.to ? { lte: new Date(query.to) } : {}) } }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(500, Number(query.limit) || 100),
      include: { actor: { select: { id: true, email: true } } },
    });
  }

  async effectiveAccess(id: string) {
    await this.getUserOrThrow(id);
    return this.permissions.getEffectiveAccess(id);
  }
}
