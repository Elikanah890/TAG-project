import 'dotenv/config';
import { PrismaClient, UserStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { seedRbac } from './rbac-seed';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const roles = [
    { name: 'SYSTEM_ADMIN', description: 'System Administrator with full access' },
    { name: 'FINANCE_ADMIN', description: 'Finance Administrator' },
    { name: 'WEBSITE_ADMIN', description: 'Website Administrator' },
    { name: 'CHURCH_SECRETARY', description: 'Church Secretary' },
    { name: 'CHURCH_MEMBER', description: 'Church Member' },
  ];
  for (const r of roles) {
    await prisma.role.upsert({ where: { name: r.name }, update: {}, create: r });
  }

  const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const systemAdminRole = await prisma.role.findUnique({ where: { name: 'SYSTEM_ADMIN' } });
    if (!systemAdminRole) throw new Error('SYSTEM_ADMIN role is missing');

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { passwordHash, status: UserStatus.ACTIVE },
      create: { email: adminEmail, passwordHash, status: UserStatus.ACTIVE },
    });
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: admin.id, roleId: systemAdminRole.id } },
      update: {},
      create: { userId: admin.id, roleId: systemAdminRole.id },
    });
    console.log(`Bootstrap system administrator ensured: ${adminEmail}`);
  } else {
    console.warn('BOOTSTRAP_ADMIN_EMAIL/BOOTSTRAP_ADMIN_PASSWORD not set; skipping bootstrap admin seed');
  }

  const defaults = [
    { key: 'nav_home_label', value: '', description: 'Override home nav label (optional)' },
    { key: 'hero_welcome', value: '', description: 'Hero welcome text override' },
    { key: 'hero_tagline', value: '', description: 'Hero tagline override' },
  ];
  for (const s of defaults) {
    await prisma.siteSetting.upsert({ where: { key: s.key }, update: {}, create: s });
  }

  const rbac = await seedRbac(prisma);
  console.log(`Seed complete: ${adminEmail} system administrator, base settings, ${rbac.permissions} permissions, ${rbac.roles} roles`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
