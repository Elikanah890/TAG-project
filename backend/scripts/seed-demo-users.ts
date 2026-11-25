import 'dotenv/config';
import { PrismaClient, UserStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { seedRbac } from '../prisma/rbac-seed';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const users = [
  { email: 'sospeter@gmail.com', password: 'sospeter@2026', role: 'SYSTEM_ADMIN' },
  { email: 'andrewmbughi@gmail.com', password: 'andrew@2026', role: 'FINANCE_ADMIN' },
  { email: 'johson@gmail.com', password: 'johnson@2026', role: 'WEBSITE_ADMIN' },
  { email: 'sarah@gmail.com', password: 'sarah@2026', role: 'CHURCH_SECRETARY' },
];

async function main() {
  await seedRbac(prisma);

  // Only bootstrap demo accounts on an empty database, or when explicitly
  // requested. This keeps restarts from recreating accounts an administrator
  // may have deliberately removed.
  const userCount = await prisma.user.count();
  if (userCount > 0 && process.env.SEED_DEMO_USERS !== 'true') {
    console.log(`Skipping demo account seed: ${userCount} user(s) already exist`);
    return;
  }

  for (const u of users) {
    const role = await prisma.role.upsert({ where: { name: u.role }, update: {}, create: { name: u.role } });
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    // Only set the password when the account is first created. Re-running the
    // seed must never overwrite a password the user has since changed.
    const user = existing
      ? existing
      : await prisma.user.create({
          data: {
            email: u.email,
            passwordHash: await bcrypt.hash(u.password, 10),
            status: UserStatus.ACTIVE,
            mustChangePassword: false,
          },
        });
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: { userId: user.id, roleId: role.id },
    });
    console.log('ok', u.email, u.role);
  }
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); await pool.end(); });
