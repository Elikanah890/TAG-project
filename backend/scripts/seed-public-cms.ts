import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const ministries = [
  { slug:'cmf', name:'Christian Men Fellowship (CMF)', nameSw:'Ushirika wa Wanaume wa Kikristo (CMF)', description:'A ministry dedicated to building godly men who lead with integrity, faith, and purpose in their families, church, and community.', descriptionSw:'Huduma inayojengwa kwa kuwajenga wanaume wa Mungu wanaoongoza kwa uadilifu, imani, na kusudi katika familia zao, kanisa, na jamii.', vision:'To raise up men of God who are spiritual leaders in every sphere of life.', visionSw:'Kuinua wanaume wa Mungu ambao ni viongozi wa kiroho katika kila nyanja ya maisha.', mission:'To equip men with biblical principles for godly living, leadership, and service.', missionSw:'Kuwaandaa wanaume kwa kanuni za kibiblia kwa maisha ya kimungu, uongozi, na huduma.', purpose:'Building strong families and communities through transformed men of faith.', purposeSw:'Kujenga familia na jamii imara kupitia wanaume waliobadilishwa wa imani.', logoUrl:'/logos/CMF.png', order:1, status:'PUBLISHED' as const },
  { slug:'wwk', name:"Women's Ministry (WWK)", nameSw:'Huduma ya Wanawake (WWK)', description:"Empowering women to grow in their faith, discover their God-given purpose, and impact their families and communities for Christ.", descriptionSw:'Kuwawezesha wanawake kukua katika imani yao, kugundua kusudi lao walilopewa na Mungu, na kuathiri familia zao na jamii kwa Kristo.', vision:"To see every woman fulfilled in her calling and walking in God's purpose.", visionSw:'Kumuona kila mwanamke akitimiza wito wake na kutembea katika kusudi la Mungu.', mission:"To nurture, equip, and empower women through fellowship, teaching, and mentorship.", missionSw:'Kulea, kuandaa, na kuwezesha wanawake kupitia ushirika, mafundisho, na ushauri.', purpose:"Creating a community of women who support, encourage, and uplift one another in faith.", purposeSw:'Kuunda jamii ya wanawake wanaosaidiana, kuhimiziana, na kuinua mmoja mwingine katika imani.', logoUrl:'/logos/WWK.png', order:2, status:'PUBLISHED' as const },
  { slug:'cas', name:'Christian Assemblies Youth (CA\'S)', nameSw:'Vijana wa Assemblies za Kikristo (CA\'S)', description:'A vibrant ministry for young people to encounter God, build lasting friendships, and develop their potential in Christ.', descriptionSw:'Huduma yenye nguvu kwa vijana kukutana na Mungu, kujenga urafiki wa kudumu, na kuendeleza uwezo wao katika Kristo.', vision:'To raise a generation of young people who are passionate for God and His kingdom.', visionSw:'Kuinua kizazi cha vijana wenye shauku kwa Mungu na ufalme wake.', mission:'To create an environment where youth can encounter God, grow spiritually, and discover their purpose.', missionSw:'Kuunda mazingira ambapo vijana wanaweza kukutana na Mungu, kukua kiroho, na kugundua kusudi lao.', purpose:"Equipping young people to be leaders and influencers for Christ in their generation.", purposeSw:'Kuwaandaa vijana kuwa viongozi na washawishi kwa Kristo katika kizazi chao.', logoUrl:'/logos/YOUTH.png', order:3, status:'PUBLISHED' as const },
  { slug:'watoto', name:"Children's Ministry (WATOTO WA YESU)", nameSw:'Huduma ya Watoto (WATOTO WA YESU)', description:"Nurturing children in the ways of the Lord through fun, engaging, and age-appropriate biblical teaching.", descriptionSw:'Kulea watoto katika njia za Bwana kupitia mafundisho ya kibiblia ya kufurahisha, kushirikisha, na yanayofaa umri wao.', vision:"To see every child develop a personal relationship with Jesus Christ.", visionSw:'Kumuona kila mtoto akiendeleza uhusiano wa kibinafsi na Yesu Kristo.', mission:"To teach children God's Word in creative and memorable ways.", missionSw:'Kufundisha watoto Neno la Mungu kwa njia za ubunifu na zinazokumbukwa.', purpose:"Laying a strong spiritual foundation for the next generation.", purposeSw:'Kuweka msingi imara wa kiroho kwa kizazi kijacho.', logoUrl:'/logos/WATO.png', order:4, status:'PUBLISHED' as const },
];

const leaders = [
  { name:'Ambonisye Fungo', title:'Chairman', titleSw:'Mwenyekiti', ministry:'cmf', order:1, status:'PUBLISHED' as const, roleType:'LEADER' },
  { name:'Obed Mwandalya', title:'Secretary', titleSw:'Katibu', ministry:'cmf', order:2, status:'PUBLISHED' as const, roleType:'LEADER' },
];

const testimonials = [
  { authorName:'Mary Joseph', role:'Member since 2019', titleEn:'Restored Family', titleSw:'Familia Iliyorejeshwa', quoteEn:'After joining T.A.G Forest ya Kwanza, my family was restored, and our children are now grounded in the Word of God.', quoteSw:'Baada ya kujiunga na T.A.G Forest ya Kwanza, familia yangu ilirejeshwa, na watoto wetu sasa wameimara katika Neno la Mungu.', order:1, status:'PUBLISHED' as const },
  { authorName:'Peter Emmanuel', role:'Member since 2021', titleEn:'Healing', titleSw:'Uponyaji', quoteEn:'God healed my mother through the prayers of this church. I will never stop testifying of His goodness in my life.', quoteSw:'Mungu alimponya mama yangu kupitia maombi ya kanisa hili. Sitakoma kamwe kushuhudia wema wake maishani mwangu.', order:2, status:'PUBLISHED' as const },
  { authorName:'Grace Mushi', role:'Youth member since 2022', titleEn:'Purpose and Peace', titleSw:'Kusudi na Amani', quoteEn:'I came to this church broken, but through worship, teaching, and discipleship, I found purpose, healing, and peace.', quoteSw:'Nilikuja kanisani nikiwa nimevunjika, lakini kupitia ibada, mafundisho na uanafunzi, nilipata kusudi, uponyaji na amani.', order:3, status:'PUBLISHED' as const },
];

async function main() {
  if ((await prisma.ministry.count()) === 0) {
    for (const m of ministries) await prisma.ministry.create({ data: m });
    console.log('seeded ministries', ministries.length);
  } else console.log('ministries exist, skipping');

  if ((await prisma.leadership.count()) === 0) {
    for (const l of leaders) await prisma.leadership.create({ data: l });
    console.log('seeded leadership', leaders.length);
  } else console.log('leadership exist, skipping');

  if ((await prisma.testimonial.count()) === 0) {
    for (const t of testimonials) await prisma.testimonial.create({ data: t });
    console.log('seeded testimonials', testimonials.length);
  } else console.log('testimonials exist, skipping');

  const pageUpsert = async (slug:string,title:string,content:any) => {
    const exists = await prisma.page.findFirst({ where: { slug } });
    if (!exists) await prisma.page.create({ data: { slug, title, status:'PUBLISHED', publishedAt:new Date(), content } });
  };

  await pageUpsert('about','About Page',{ historyEn:'TAG Forest Ya Kwanza is a vibrant church family in Mbeya, Tanzania, committed to worship, discipleship, and community transformation.', historySw:'TAG Forest Ya Kwanza ni familia ya kanisa yenye uhai jijini Mbeya, Tanzania, iliyojitoa katika ibada, ufuatiliaji, na mabadiliko ya jamii.', visionEn:'To be a Christ-centered church transforming lives and communities.', visionSw:'Kuwa kanisa linalomzingatia Kristo linalobadilisha maisha na jamii.', missionEn:'To worship God, make disciples, and serve our community with love.', missionSw:'Kumwabudu Mungu, kufanya wanafunzi, na kuitumikia jamii yetu kwa upendo.', valuesEn:'Faith, Love, Integrity, Service, Unity', valuesSw:'Imani, Upendo, Uadilifu, Utumishi, Umoja', pastorName:'', pastorRoleEn:'Senior Pastor', pastorRoleSw:'Mchungaji Kiongozi', pastorMessageEn:'', pastorMessageSw:'', statementFaithEn:'', statementFaithSw:'' });
  await pageUpsert('schedule','Schedule',{ schedule:[{dayEn:'Sunday',daySw:'Jumapili',services:[{name:{en:'Sunday Service',sw:'Ibada ya Jumapili'},time:{en:'09:00 AM - 12:00 PM',sw:'03:00 Asubuhi - 06:00 Mchana'}}]},{dayEn:'Wednesday',daySw:'Jumatano',services:[{name:{en:'Bible Study',sw:'Maandiko Matakatifu'},time:{en:'04:00 PM - 06:00 PM',sw:'10:00 Jioni - 12:00 Jioni'}}]},{dayEn:'Friday',daySw:'Ijumaa',services:[{name:{en:'Prayer Night',sw:'Usiku wa Maombi'},time:{en:'04:00 PM - 06:00 PM',sw:'10:00 Jioni - 12:00 Jioni'}}]}], specialNoteEn:'Special services and events are announced on our News page and social media.', specialNoteSw:'Ibada maalum na matukio hutangazwa kwenye ukurasa wetu wa Habari na mitandao ya kijamii.' });
  await pageUpsert('giving','Giving',{ titleEn:'Give & Support', titleSw:'Toa na Unga Mkono', introEn:'Your giving supports the mission and ministry of T.A.G Forest Ya Kwanza.', introSw:'Utoaji wako unaunga mkono utume na huduma ya T.A.G Forest Ya Kwanza.', scripturalQuoteEn:'Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver. (2 Corinthians 9:7)', scripturalQuoteSw:'Kila mtu atoe kama alivyokusudia moyoni mwake, si kwa huzuni wala kwa kulazimishwa; maana Mungu humpenda yeye atoaye kwa moyo wa ukunjufu. (2 Wakorintho 9:7)', bankTitle:'CRDB Bank', bankAccountName:'KANISA LA TAG USHIRIKA FOREST', bankAccountNumber:'0150469889301', mobileTitle:'LIPA NAMBA - Vodacom', mobileName:'Ushirika TAG Forest Ya Kwanza', mobileNumber:'5752871', mpesaTitle:'MPESA - Vodacom', mpesaName:'T.A.G. CHURCH MBYA FOREST', mpesaNumber:'5960638', noteEn:'Please indicate the purpose of your giving in the payment reference.', noteSw:'Tafadhali onyesha madhumuni ya utoaji wako katika rejea ya malipo.' });
  await pageUpsert('contact','Contact',{ titleEn:'Contact Us', titleSw:'Wasiliana Nasi', subtitleEn:"We're here and ready to connect with you.", subtitleSw:'Tuko hapa kwa ajili yako, wasiliana nasi.', addressLabelEn:'Address', addressLabelSw:'Anwani', phoneLabelEn:'Phone', phoneLabelSw:'Simu', emailLabelEn:'Email', emailLabelSw:'Barua Pepe', hoursLabelEn:'Office Hours', hoursLabelSw:'Saa za Ofisi', formTitleEn:'Send us a Message', formTitleSw:'Tutumie Ujumbe' });
  console.log('pages seeded (if missing)');

  const defaults: Record<string,string> = {
    nav_home_label: 'Home',
    hero_welcome: 'Karibu Sana',
    hero_tagline: 'Worship Together',
  };
  for (const [key,value] of Object.entries(defaults)) {
    await prisma.siteSetting.upsert({ where:{key}, update:{}, create:{key,value} });
  }
  console.log('site settings seeded');
}

main().catch(e=>{ console.error(e); process.exit(1); }).finally(async()=>{ await prisma.$disconnect(); await pool.end(); });
