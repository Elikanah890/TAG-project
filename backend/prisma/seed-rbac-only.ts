import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { seedRbac } from './rbac-seed';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

seedRbac(prisma)
  .then((r) => console.log(`RBAC seed complete: ${r.permissions} permissions, ${r.roles} roles`))
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
