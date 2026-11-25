import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const missing = [
  { slug:'dms', name:'Department of Music & Singing (DMS)', nameSw:'Huduma ya Muziki na Uimbaji', description:'Established in September 2021 as a music and singing unit under Archbishop Dr. Barnabas Mtokambal.', descriptionSw:'Imeanzishwa Septemba 2021 kama kitengo cha muziki na uimbaji chini ya Askofu Mkuu Dr. Barnabas Mtokambal.', vision:'To be a tool for seeking, nurturing and reflecting the Presence and Glory of God through music and worship.', visionSw:'Kuwa chombo cha kutafuta, kulea na kuonyesha uwepo na utukufu wa Mungu kupitia huduma ya muziki.', mission:'To preserve the life of the Church by elevating the passion and heart of Worship filled with the Holy Spirit.', missionSw:'Kuhifadhi maisha ya kanisa kwa kuinua shauku na moyo wa ibada uliojaa Roho Mtakatifu.', purpose:'Support church leadership to teach members to worship God in excellence and holiness.', purposeSw:'Kusaidia uongozi wa kanisa kufundisha wanachama kuabudu Mungu kwa ubora na utu Mtakatifu.', logoUrl:'/logos/muziki.png', order:5, status:'PUBLISHED' as const },
  { slug:'mission', name:'Mission Department', nameSw:'Huduma ya Umisheni', description:'Established in 1989 to send missionaries locally and internationally.', descriptionSw:'Imeanzishwa 1989 kutuma wamisheni ndani na nje ya nchi.', vision:'To be an excellent department fulfilling the Great Commission.', visionSw:'Kuwa kitengo bora kinachotekeleza Amri Kuu.', mission:'Prepare, empower, and send missionaries to unreached tribes and nations.', missionSw:'Kuandaa, kuwawezesha na kutuma wamisheni kwa makabila na mataifa yasiyosikika Injili.', purpose:"Implement church’s strategic vision and spread the Gospel.", purposeSw:'Kutekeleza mpango wa maendeleo wa kanisa na kusambaza Injili.', logoUrl:'/logos/umisheni.png', order:6, status:'PUBLISHED' as const },
  { slug:'evangelism', name:'Evangelism Department', nameSw:'Huduma ya Uinjilisti', description:'Started in 1940 by TAG Elders to preach the Gospel throughout Tanzania.', descriptionSw:'Imeanzishwa 1940 na wazee wa TAG kufundisha Injili kote Tanzania.', vision:'Preach the Gospel by the power of the Holy Spirit everywhere.', visionSw:'Kufundisha Injili kwa nguvu ya Roho Mtakatifu kila mahali.', mission:'Ensure the Gospel reaches all and disciples are made.', missionSw:'Kuhakikisha Injili inafika kwa wote na wanafunzi wanafanywa.', purpose:'Promote evangelistic services and awakenings nationwide.', purposeSw:'Kukuza huduma za uinjilisti na uamsho kitaifa.', logoUrl:'/logos/uinjilisti.png', order:7, status:'PUBLISHED' as const },
  { slug:'teaching', name:'Maandiko & Mafundisho', nameSw:'Maandiko na Mafundisho ya Biblia', description:'Teaching and discipleship through systematic Bible study.', descriptionSw:'Kufundisha kupitia usomaji wa Biblia.', vision:'Every member grounded in the Word.', visionSw:'Kila mwanachama kuwa imara katika Neno.', mission:'Provide sound biblical teaching.', missionSw:'Kutoa mafundisho sahihi ya Biblia.', purpose:'Develop mature disciples.', purposeSw:'Kuendeleza wanafunzi waliokomaa.', logoUrl:'/logos/umisheni.png', order:8, status:'PUBLISHED' as const },
];
async function main(){
  for (const m of missing){
    const ex = await prisma.ministry.findFirst({where:{slug:m.slug}});
    if (ex) { console.log('exists', m.slug); continue; }
    await prisma.ministry.create({data:m as any});
    console.log('created', m.slug);
  }
}
main().catch(e=>{console.error(e); process.exit(1);}).finally(async()=>{await prisma.$disconnect(); await pool.end();});
