import { PrismaClient } from '@prisma/client';
import { PERMISSIONS, ROLES } from '../src/rbac/permission-catalog';

/**
 * Idempotent RBAC seed.
 * - Creates/updates the permission catalog.
 * - Creates system roles.
 * - Adds missing baseline role permissions WITHOUT deleting administrator changes.
 * - Never deletes users, roles or existing permission grants.
 */
export async function seedRbac(prisma: PrismaClient) {
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {
        module: perm.module,
        action: perm.action,
        description: perm.description,
        isSystem: true,
      },
      create: {
        code: perm.code,
        module: perm.module,
        action: perm.action,
        description: perm.description,
        isSystem: true,
      },
    });
  }

  for (const role of ROLES) {
    const saved = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description, isSystem: true, isActive: true },
      create: { name: role.name, description: role.description, isSystem: true, isActive: true },
    });

    for (const code of role.permissions) {
      const perm = await prisma.permission.findUnique({ where: { code } });
      if (!perm) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: saved.id, permissionId: perm.id } },
        update: {},
        create: { roleId: saved.id, permissionId: perm.id },
      });
    }
  }

  // Any pre-existing custom role stays custom (never treated as protected).
  await prisma.role.updateMany({
    where: { name: { notIn: ROLES.map((r) => r.name) } },
    data: { isSystem: false },
  });

  return {
    permissions: PERMISSIONS.length,
    roles: ROLES.length,
  };
}
