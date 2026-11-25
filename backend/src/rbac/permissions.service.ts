import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type EffectiveAccess = {
  userId: string;
  roles: string[];
  permissions: string[];
  scopes: { scopeType: string; scopeId: string }[];
};

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async getEffectiveAccess(userId: string): Promise<EffectiveAccess> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
        scopes: true,
      },
    });
    if (!user || user.status !== 'ACTIVE') {
      return { userId, roles: [], permissions: [], scopes: [] };
    }
    const activeRoles = user.roles.filter((ur) => ur.role.isActive);
    const permissionSet = new Set<string>();
    for (const ur of activeRoles) {
      for (const rp of ur.role.permissions) permissionSet.add(rp.permission.code);
    }
    return {
      userId: user.id,
      roles: activeRoles.map((ur) => ur.role.name),
      permissions: Array.from(permissionSet).sort(),
      scopes: user.scopes.map((s) => ({ scopeType: s.scopeType, scopeId: s.scopeId })),
    };
  }

  async hasAll(userId: string, codes: string[]): Promise<boolean> {
    const access = await this.getEffectiveAccess(userId);
    return codes.every((code) => access.permissions.includes(code));
  }

  async hasAny(userId: string, codes: string[]): Promise<boolean> {
    const access = await this.getEffectiveAccess(userId);
    return codes.some((code) => access.permissions.includes(code));
  }
}
