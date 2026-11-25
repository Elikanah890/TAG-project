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
  for (const u of users) {
    const role = await prisma.role.upsert({ where: { name: u.role }, update: {}, create: { name: u.role } });
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, status: UserStatus.ACTIVE, mustChangePassword: false },
      create: { email: u.email, passwordHash, status: UserStatus.ACTIVE, mustChangePassword: false },
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
