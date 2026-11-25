import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsService } from '../rbac/permissions.service';
import { dashboardsForRoles, defaultDashboardForRoles } from './dashboard-catalog';

export type RequestMeta = { ip?: string; userAgent?: string };

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private permissions: PermissionsService,
  ) {}

  private hashToken(raw: string) {
    return createHash('sha256').update(raw).digest('hex');
  }

  private activeRoles(user: any): string[] {
    return (user?.roles || [])
      .filter((ur: any) => ur?.role?.isActive !== false)
      .map((ur: any) => ur.role.name);
  }

  private async buildSession(user: any) {
    const roles = this.activeRoles(user);
    const accessToken = await this.jwtService.signAsync({ sub: user.id, email: user.email, roles });
    const access = await this.permissions.getEffectiveAccess(user.id);
    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roles: access.roles,
        lastLoginAt: user.lastLoginAt,
        mustChangePassword: Boolean(user.mustChangePassword),
        member: user.member ?? null,
      },
      permissions: access.permissions,
      scopes: access.scopes,
      dashboards: dashboardsForRoles(roles),
      defaultDashboard: defaultDashboardForRoles(roles),
    };
  }

  private async issueRefreshToken(userId: string, meta: RequestMeta) {
    const raw = randomBytes(48).toString('hex');
    const now = new Date();
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(raw),
        expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_MS),
        lastUsedAt: now,
        userAgent: meta.userAgent?.slice(0, 300) || null,
        ip: meta.ip || null,
      },
    });
    return { raw, now };
  }

  async validateUser(email: string, password: string) {
    const normalized = (email || '').toLowerCase().trim();
    const user = await this.usersService.findByEmail(normalized);
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    if (user.status !== 'ACTIVE') throw new UnauthorizedException('Account is not active');
    return user;
  }

  async login(email: string, password: string, meta: RequestMeta = {}) {
    let user: any;
    try {
      user = await this.validateUser(email, password);
    } catch (error) {
      await this.prisma.auditLog
        .create({
          data: {
            action: 'LOGIN_FAILED',
            entityType: 'User',
            metadata: { email: (email || '').toLowerCase().trim(), ip: meta.ip || null, at: new Date().toISOString() },
          },
        })
        .catch(() => undefined);
      throw error;
    }

    const session = await this.buildSession(user);
    const refresh = await this.issueRefreshToken(user.id, meta);
    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: now } }),
      this.prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: 'LOGIN',
          entityType: 'User',
          entityId: user.id,
          metadata: { at: now.toISOString(), outcome: 'SUCCESS', ip: meta.ip || null, userAgent: meta.userAgent?.slice(0, 300) || null },
        },
      }),
    ]);

    const fresh = await this.usersService.findById(user.id);
    return {
      ...session,
      refreshToken: refresh.raw,
      user: { ...session.user, lastLoginAt: fresh?.lastLoginAt || now },
    };
  }

  async refresh(rawRefreshToken: string, meta: RequestMeta = {}) {
    if (!rawRefreshToken) throw new UnauthorizedException('Missing refresh token');
    const tokenHash = this.hashToken(rawRefreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    });
    if (!stored) throw new UnauthorizedException('Invalid or expired refresh token');

    const user = await this.prisma.user.findUnique({
      where: { id: stored.userId },
      include: { roles: { include: { role: true } }, member: true },
    });
    if (!user || user.status !== 'ACTIVE') {
      await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date(), revokedBy: stored.userId } });
      throw new UnauthorizedException('Account is not active');
    }

    const session = await this.buildSession(user);
    const nextRaw = randomBytes(48).toString('hex');
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: now, revokedBy: user.id, lastUsedAt: now },
      }),
      this.prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: this.hashToken(nextRaw),
          expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_MS),
          lastUsedAt: now,
          userAgent: meta.userAgent?.slice(0, 300) || stored.userAgent,
          ip: meta.ip || stored.ip,
        },
      }),
    ]);

    return { ...session, refreshToken: nextRaw };
  }

  async logout(rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const tokenHash = this.hashToken(rawRefreshToken);
      const stored = await this.prisma.refreshToken.findFirst({ where: { tokenHash, revokedAt: null } });
      if (stored) {
        await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date(), revokedBy: stored.userId } });
        await this.prisma.auditLog.create({
          data: { actorId: stored.userId, action: 'LOGOUT', entityType: 'User', entityId: stored.userId, metadata: { at: new Date().toISOString() } },
        });
      }
    }
    return { success: true };
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    const roles = this.activeRoles(user);
    const access = await this.permissions.getEffectiveAccess(userId);
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      status: user.status,
      roles: access.roles,
      lastLoginAt: user.lastLoginAt,
      mustChangePassword: Boolean(user.mustChangePassword),
      member: user.member,
      permissions: access.permissions,
      scopes: access.scopes,
      dashboards: dashboardsForRoles(roles),
      defaultDashboard: defaultDashboardForRoles(roles),
    };
  }

  async listSessions(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true, expiresAt: true, lastUsedAt: true, userAgent: true, ip: true },
    });
  }

  async revokeSession(userId: string, sessionId: string, actorId?: string) {
    const token = await this.prisma.refreshToken.findUnique({ where: { id: sessionId } });
    if (!token || token.userId !== userId) throw new NotFoundException('Session not found');
    await this.prisma.refreshToken.update({ where: { id: sessionId }, data: { revokedAt: new Date(), revokedBy: actorId || userId } });
    await this.prisma.auditLog.create({
      data: { actorId: actorId || userId, action: 'SESSION_REVOKED', entityType: 'RefreshToken', entityId: sessionId, metadata: { userId } },
    });
    return { success: true };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    if (!newPassword || newPassword.length < 8) throw new BadRequestException('Password must be at least 8 characters');
    if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      throw new BadRequestException('Password must include upper case, lower case and a number');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) throw new UnauthorizedException();
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');
    if (await bcrypt.compare(newPassword, user.passwordHash)) {
      throw new BadRequestException('New password must be different from the current password');
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { passwordHash, mustChangePassword: false } }),
      this.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date(), revokedBy: userId } }),
      this.prisma.auditLog.create({ data: { actorId: userId, action: 'PASSWORD_CHANGED', entityType: 'User', entityId: userId, metadata: { at: new Date().toISOString() } } }),
    ]);
    return { success: true };
  }

  async revokeAllSessions(userId: string, actorId?: string) {
    const result = await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date(), revokedBy: actorId || userId },
    });
    await this.prisma.auditLog.create({
      data: { actorId: actorId || userId, action: 'ALL_SESSIONS_REVOKED', entityType: 'User', entityId: userId, metadata: { count: result.count } },
    });
    return { success: true, revoked: result.count };
  }
}
