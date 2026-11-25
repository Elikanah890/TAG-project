require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const remove = ['FINANCE_COLLECTOR','DEPARTMENT_LEADER','FELLOWSHIP_LEADER','ATTENDANCE_OFFICER'];
(async()=>{
  const roles = await prisma.role.findMany({where:{name:{in:remove}}, select:{id:true,name:true}});
  console.log('FOUND', JSON.stringify(roles));
  const ids = roles.map(r=>r.id);
  if(ids.length){
    const ur = await prisma.userRole.deleteMany({where:{roleId:{in:ids}}});
    const rah = await prisma.roleAssignmentHistory.deleteMany({where:{roleId:{in:ids}}}).catch(()=>({count:0}));
    const rp = await prisma.rolePermission.deleteMany({where:{roleId:{in:ids}}}).catch(()=>({count:0}));
    const dr = await prisma.role.deleteMany({where:{id:{in:ids}}});
    console.log('DELETED', JSON.stringify({userRoles:ur.count, history:rah.count, rolePerms:rp.count, roles:dr.count}));
  } else {
    console.log('DELETED none');
  }
  const remaining = await prisma.role.findMany({select:{id:true,name:true,isSystem:true,isActive:true}, orderBy:{name:'asc'}});
  console.log('REMAINING', JSON.stringify(remaining));
  await prisma.$disconnect(); await pool.end();
})().catch(async e=>{console.error(e); try{await prisma.$disconnect(); await pool.end();}catch{} process.exit(1)});
