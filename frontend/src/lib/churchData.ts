// Church Configuration - Edit these values to customize the website
export const churchConfig = {
  name: "T.A.G FOREST YA KWANZA",
  shortName: "TAG Forest ya kwanza",
  tagline: 
  
  {
    en: "A Place of Worship, Fellowship & Transformation",
    sw: "Mahali pa Ibada, Ushirika na Mabadiliko",
  },
  
  location: {
    address: "Near Mahakama Kuu, Mbeya City, Tanzania",
    addressSw: "Karibu na Mahakama Kuu, Jiji la Mbeya, Tanzania",
    city: "Mbeya City",
    country: "Tanzania",
    mapCoords: { lat: -8.9094, lng: 33.4608 },
    mapZoom: 15,
  },
  contact: {
    phone: "+255 756 929 510",
    phoneDisplay: "0756 929 510",
    email: "tagforestyakwanza@gmail.com",
    officeHours: {
      en: "Monday - Friday: 8:00 AM - 6:00 PM",
      sw: "Jumatatu - Ijumaa: Saa 2 Asubuhi - Saa 12 Jioni",
    },
  },
  social: {
    whatsapp: "https://web.whatsapp.com/",
    youtube: "https://www.youtube.com/@forestyakwanza3804",
    instagram: "https://www.instagram.com/forestyakwanza?igsh=amo3bGZpZ2JvdWhx",
    facebook: "https://www.facebook.com/share/1KQmHFmNti/",
    tiktok: "https://www.tiktok.com/@tagforestyakwanza_prtm?_r=1&_t=ZM-93Al0BK0rWO",
    
  },
};

// Service Schedule
export const serviceSchedule = [
  {
    day: "sunday",
    dayEn: "Sunday",
    daySw: "Jumapili",
    services: [
      {
        name: { en: "Main Worship Service", sw: "Ibada Kuu" },
        time: { en: "7:00 AM - 10:30, second service 11:00-1:00 PM", sw: "Saa 1 asubuhi - Saa 4:30 asubuhi, Ibada ya pili 5:00 -7:00Mchana" },
      },
    ],
  },
  {
    day: "monday",
    dayEn: "Monday",
    daySw: "Jumatatu",
    services: [
      {
        name: { en: "CA's Youth Meeting", sw: "Mkutano wa Vijana CA's" },
        time: { en: "6:30 PM - 8:00 PM", sw: "Saa 12:30 - Saa 2 Usiku" },
      },
    ],
  },
  {
    day: "tuesday",
    dayEn: "Tuesday",
    daySw: "Jumanne",
    services: [
      {
        name: { en: "Discipleship - Maandiko", sw: "Mafundisho ya Maandiko" },
        time: { en: "10:30 PM - 12:30 AM", sw: "Saa 4:30- Saa 6:30 Usiku" },
      },
    ],
  },
  {
    day: "wednesday",
    dayEn: "Wednesday",
    daySw: "Jumatano",
    services: [
      {
        name: { en: "WWK - Women's Ministry", sw: "WWK - Huduma ya Wanawake" },
        time: { en: "10:30 PM", sw: "Saa 2:30 Usiku" },
      },
    ],
  },
  {
    day: "thursday",
    dayEn: "Thursday",
    daySw: "Alhamisi",
    services: [
      {
        name: { en: "WWK - Women's Ministry", sw: "WWK - Huduma ya Wanawake" },
        time: { en: "10:00 PM", sw: "Saa 4 Usiku" },
      },
    ],
  },
  {
    day: "friday",
    dayEn: "Friday",
    daySw: "Ijumaa",
    services: [
      {
        name: { en: "Discipleship - Maandiko", sw: "Mafundisho ya Maandiko" },
        time: { en: "10:30 PM - 12:00 AM", sw: "Saa 4:30 - Saa 6:30 Usiku" },
      },
    ],
  },
  {
    day: "saturday",
    dayEn: "Saturday",
    daySw: "Jumamosi",
    services: [
      {
        name: { en: "Preparations & Rehearsals", sw: "Maandalizi na Mazoezi" },
        time: { en: "Various", sw: "Mbalimbali" },
      },
    ],
  },
];

// Leadership Team
export const leadershipTeam = [
  {
    id: 1,
    name: "Rev. Thobias Thambikeni",
    role: { en: "Senior Pastor", sw: "Mchungaji Mkuu" },
    featured: true,
    image: "",
    bio: {
      en: "Leading the congregation with wisdom and compassion for over 40 years.",
      sw: "Ameongoza mkutano kwa hekima na huruma kwa zaidi ya miaka 40.",
    },
  },
  {
    id: 2,
    name: "Pastor Francis Larison",
    role: { en: "Assistant Pastor", sw: "Mchungaji Msaidizi" },
    image: "",
    bio: {
      en: "Dedicated to supporting the church and serving the congregation.",
      sw: "Amejitolea kusaidia kanisa na kulitumikia kusanyiko.",
    },
  },
];
// ===============================
// Church Ministries / Departments
// ===============================
export const ministries = [
  // ===============================
  // MEN – CMF
  {
    id: "cmf",
    logo: "/logos/cmf.png",
    name: { en: "Christian Men’s Fellowship (CMF)", sw: "Ushirika wa Wanaume wa Kikristo" },
    description: { en: "CMF exists to restore men to God’s original purpose.", sw: "Kuwawezesha wanaume kuishi maisha ya kimungu." },
    vision: { en: "To see men restored spiritually.", sw: "Kuinua wanaume viongozi wa kiroho." },
    mission: { en: "To enable men to worship and serve.", sw: "Kuwaimarisha wanaume katika ibada." },
    purpose: { en: "To build spiritually mature men.", sw: "Kuimarisha wanaume katika imani." },
    image: "/pc1.png",
    leaders: [
      { name: "Adv. Sospeter Tyeah", role: { en: "Chairman", sw: "Mwenyekiti" }, bio: { en: "Chairman of CMF.", sw: "Mwenyekiti wa CMF." }, image: "" },
      { name: "Mr. Edward Mwanjela", role: { en: "Vice Chairman", sw: "Makamu Mwenyekiti" }, bio: { en: "Vice Chairman of CMF.", sw: "Makamu Mwenyekiti wa CMF." }, image: "" },
      { name: "Mr. Alinanuswe Mpoki", role: { en: "Secretary", sw: "Katibu" }, bio: { en: "Secretary of CMF.", sw: "Katibu wa CMF." }, image: "" },
    ],
  },

  // ===============================
  // WOMEN – WWK
  {
    id: "wwk",
    logo: "/logos/wwk.png",
    name: { en: "WWK – Women Servants of Christ", sw: "WWK – Huduma ya Wanawake" },
    description: { en: "Empowering women spiritually.", sw: "Kuwalea wanawake katika imani." },
    vision: { en: "Women filled with the Holy Spirit.", sw: "Wanawake waliobadilishwa na Injili." },
    mission: { en: "To disciple women for service.", sw: "Kuwawezesha wanawake kupitia mafundisho." },
    purpose: { en: "To bless families and society.", sw: "Kubariki familia, kanisa na jamii." },
    image: "/pc5.png",
    leaders: [
      { name: "Mrs. Roster Sanga", role: { en: "Chairperson", sw: "Mwenyekiti" }, bio: { en: "Chairperson of WWK.", sw: "Mwenyekiti wa WWK." }, image: "" },
      { name: "Asanteamen Massawe", role: { en: "Vice Chairperson", sw: "Makamu Mwenyekiti" }, bio: { en: "Vice Chairperson of WWK.", sw: "Makamu Mwenyekiti wa WWK." }, image: "" },
      { name: "Mrs. Grace Sospeter Tyeah", role: { en: "Secretary", sw: "Katibu" }, bio: { en: "Secretary of WWK.", sw: "Katibu wa WWK." }, image: "" },
    ],
  },

  // ===============================
  // YOUTH – CA’s
  {
    id: "cas",
    logo: "/logos/cas.png",
    name: { en: "Christ’s Ambassadors (CA’s)", sw: "Christ’s Ambassadors (CA’s)" },
    description: { en: "Raising young ambassadors of Christ.", sw: "Huduma ya vijana ya TAG." },
    vision: { en: "Youth passionate for ministry.", sw: "Vijana wanaowaka kwa Mungu." },
    mission: { en: "To motivate and connect youth.", sw: "Kuwahamasisha na kuwaunganisha vijana." },
    purpose: { en: "To build disciplined youth.", sw: "Kujenga vijana wenye maadili ya Kikristo." },
    image: "/pc5.png",
    revivalHistory: { en: "CA’s revival started in 2010.", sw: "Uamsho wa CA ulianza 2010." },
    leaders: [
      { name: "Ambonisye Fungo", role: { en: "Chairman", sw: "Mwenyekiti" }, bio: { en: "Chairman of CA's.", sw: "Mwenyekiti wa CA's." }, image: "" },
      { name: "Nazareth Merere", role: { en: "Vice Chairman", sw: "Makamu Mwenyekiti" }, bio: { en: "Vice Chairman of CA's.", sw: "Makamu Mwenyekiti wa CA's." }, image: "" },
      { name: "Emmanuel Alipipi", role: { en: "Secretary", sw: "Katibu" }, bio: { en: "Secretary of CA's.", sw: "Katibu wa CA's." }, image: "" },
      { name: "Sekela Mwambolile", role: { en: "Assistant Secretary", sw: "Katibu Msaidizi" }, bio: { en: "Assistant Secretary of CA's.", sw: "Katibu Msaidizi wa CA's." }, image: "" },
      { name: "Donatha Kihombo", role: { en: "Treasurer", sw: "Mweka Hazina" }, bio: { en: "Treasurer of CA's.", sw: "Mweka Hazina wa CA's." }, image: "" },
    ],
  },

  // ===============================
  // CHILDREN
  {
    id: "watoto",
    logo: "/logos/children.png",
    name: { en: "Children & Students Department", sw: "Huduma ya Watoto" },
    description: { en: "Discipling children.", sw: "Kuwafundisha watoto njia za Bwana." },
    vision: { en: "Children raised in salvation.", sw: "Kila mtoto kumjua Yesu." },
    mission: { en: "To preach Christ.", sw: "Kuwalea watoto katika imani." },
    purpose: { en: "Prepare future servants.", sw: "Kuweka msingi wa kiroho." },
    image: "/pc5.png",
    leaders: [
      { name: "Mrs. Sara David Marenga", role: { en: "Head Teacher", sw: "Mwalimu Mkuu" }, bio: { en: "Head teacher of the children department.", sw: "Mwalimu Mkuu wa huduma ya watoto." }, image: "" },
      { name: "Mrs. Emmy Sam Mhina", role: { en: "Assistant Head Teacher", sw: "Mwalimu Mkuu Msaidizi" }, bio: { en: "Assistant head teacher of the children department.", sw: "Mwalimu Mkuu Msaidizi wa huduma ya watoto." }, image: "" },
      { name: "Mr. Charles Kizo", role: { en: "Secretary", sw: "Katibu" }, bio: { en: "Secretary of the children department.", sw: "Katibu wa huduma ya watoto." }, image: "" },
      { name: "Mrs. Nazareth Merere", role: { en: "Assistant Secretary", sw: "Katibu Msaidizi" }, bio: { en: "Assistant secretary of the children department.", sw: "Katibu Msaidizi wa huduma ya watoto." }, image: "" },
      { name: "Miss. Veronica Swilla", role: { en: "Treasurer", sw: "Mweka Hazina" }, bio: { en: "Treasurer of the children department.", sw: "Mweka Hazina wa huduma ya watoto." }, image: "" },
    ],
  },

  // ===============================
  // PRAISE & WORSHIP / CHOIR – DMS
  {
    id: "dms",
    logo: "/logos/muziki.png",
    name: { en: "Department of Music & Singing (DMS)", sw: "Huduma ya Muziki na Uimbaji" },
    description: {
      en: "Established in September 2021 as a music and singing unit under Archbishop Dr. Barnabas Mtokambal.",
      sw: "Imeanzishwa Septemba 2021 kama kitengo cha muziki na uimbaji chini ya Askofu Mkuu Dr. Barnabas Mtokambal."
    },
    vision: {
      en: "To be a tool for seeking, nurturing and reflecting the Presence and Glory of God through music and worship.",
      sw: "Kuwa chombo cha kutafuta, kulea na kuonyesha uwepo na utukufu wa Mungu kupitia huduma ya muziki."
    },
    mission: {
      en: "To preserve the life of the Church by elevating the passion and heart of Worship filled with the Holy Spirit.",
      sw: "Kuhifadhi maisha ya kanisa kwa kuinua shauku na moyo wa ibada uliojaa Roho Mtakatifu."
    },
    purpose: {
      en: "Support church leadership to teach members to worship God in excellence and holiness.",
      sw: "Kusaidia uongozi wa kanisa kufundisha wanachama kuabudu Mungu kwa ubora na utu Mtakatifu."
    },
    
    leaders: [ {
    name: "John Joel",
    role: { en: "Chairman", sw: "Mwenyekiti" },
    bio: { en: "Chairman of DMS.", sw: "Mwenyekiti wa DMS." },
    image: "",
  },
  {
    name: "Emmanuel Alipipi",
    role: { en: "Vice Chairman", sw: "Makamu Mwenyekiti" },
    bio: { en: "Vice Chairman of DMS.", sw: "Makamu Mwenyekiti wa DMS." },
    image: "",
  },
  {
    name: "Pendo Mtweve",
    role: { en: "Secretary", sw: "Katibu" },
    bio: { en: "Secretary of DMS.", sw: "Katibu wa DMS." },
    image: "",
  },],
  },

  // ===============================
  // MISSION DEPARTMENT
  {
    id: "mission",
    logo: "/logos/umisheni.png",
    name: { en: "Mission Department", sw: "Huduma ya Umisheni" },
    description: {
      en: "Established in 1989 to send missionaries locally and internationally.",
      sw: "Imeanzishwa 1989 kutuma wamisheni ndani na nje ya nchi."
    },
    vision: {
      en: "To be an excellent department fulfilling the Great Commission.",
      sw: "Kuwa kitengo bora kinachotekeleza Amri Kuu."
    },
    mission: {
      en: "Prepare, empower, and send missionaries to unreached tribes and nations.",
      sw: "Kuandaa, kuwawezesha na kutuma wamisheni kwa makabila na mataifa yasiyosikika Injili."
    },
    purpose: {
      en: "Implement church’s strategic vision and spread the Gospel.",
      sw: "Kutekeleza mpango wa maendeleo wa kanisa na kusambaza Injili."
    },
    leaders: [ {
    name: "Mr. Moses Ibrahim",
    role: { en: "Chairman", sw: "Mwenyekiti" },
    bio: { en: "Chairman of the Mission department.", sw: "Mwenyekiti wa huduma ya umisheni." },
    image: "",
  },
  {
    name: "Mr. Sam Mhina",
    role: { en: "Vice Chairman", sw: "Makamu Mwenyekiti" },
    bio: { en: "Vice Chairman of the Mission department.", sw: "Makamu Mwenyekiti wa huduma ya umisheni." },
    image: "",
  },
  {
    name: "Mr. Jacob Mbwaga",
    role: { en: "Secretary", sw: "Katibu" },
    bio: { en: "Secretary of the Mission department.", sw: "Katibu wa huduma ya umisheni." },
    image: "",
  },
  {
    name: "Pendo Mtweve",
    role: { en: "Treasurer", sw: "Mweka Hazina" },
    bio: { en: "Treasurer of the Mission department.", sw: "Mweka Hazina wa huduma ya umisheni." },
    image: "",
  },],
  },

  // ===============================
  // EVANGELISM DEPARTMENT
  {
    id: "evangelism",
    logo: "/logos/uinjilisti.png",
    name: { en: "Evangelism Department", sw: "Huduma ya Uinjilisti" },
    description: {
      en: "Started in 1940 by TAG Elders to preach the Gospel throughout Tanzania.",
      sw: "Imeanzishwa 1940 na wazee wa TAG kufundisha Injili kote Tanzania."
    },
    vision: {
      en: "Preach the Gospel by the power of the Holy Spirit everywhere.",
      sw: "Kufundisha Injili kwa nguvu ya Roho Mtakatifu kila mahali."
    },
    mission: {
      en: "Ensure the Gospel reaches all and disciples are made.",
      sw: "Kuhakikisha Injili inafika kwa wote na wanafunzi wanafanywa."
    },
    purpose: {
      en: "Promote evangelistic services and awakenings nationwide.",
      sw: "Kukuza huduma za uinjilisti na uamsho kitaifa."
    },
    leaders: [ {
    name: "Mr. Andrew Mbugi",
    role: { en: "Chairman", sw: "Mwenyekiti" },
    bio: { en: "Chairman of the Evangelism department.", sw: "Mwenyekiti wa huduma ya uinjilisti." },
    image: "",
  },
  {
    name: "Mr. Brighton Kwesi",
    role: { en: "Vice Chairman", sw: "Makamu Mwenyekiti" },
    bio: { en: "Vice Chairman of the Evangelism department.", sw: "Makamu Mwenyekiti wa huduma ya uinjilisti." },
    image: "",
  },
  {
    name: "Mrs. Dorcas Lukumay",
    role: { en: "Secretary", sw: "Katibu" },
    bio: { en: "Secretary of the Evangelism department.", sw: "Katibu wa huduma ya uinjilisti." },
    image: "",
  },],
  },

  // ===============================
  // TEACHING / MAANDIKO
  {
    id: "teaching",
    logo: "/logos/umisheni.png",
    name: { en: "Maandiko & Mafundisho", sw: "Maandiko na Mafundisho ya Biblia" },
    description: {
      en: "Teaching and discipleship through systematic Bible study.",
      sw: "Kufundisha kupitia usomaji wa Biblia."
    },
    vision: { en: "Every member grounded in the Word.", sw: "Kila mwanachama kuwa imara katika Neno." },
    mission: { en: "Provide sound biblical teaching.", sw: "Kutoa mafundisho sahihi ya Biblia." },
    purpose: { en: "Develop mature disciples.", sw: "Kuendeleza wanafunzi waliokomaa." },
    image: "/pc5.png",
    leaders: [
      { name: "Mrs. Maria Lemeirut", role: { en: "Director", sw: "Mkurugenzi" }, bio: { en: "Director of Maandiko & Mafundisho.", sw: "Mkurugenzi wa Maandiko na Mafundisho." }, image: "" },
      { name: "Mr. Selemani Nyamkinda", role: { en: "Assistant Director", sw: "Makamu Mkurugenzi" }, bio: { en: "Assistant Director of Maandiko & Mafundisho.", sw: "Makamu Mkurugenzi wa Maandiko na Mafundisho." }, image: "" },
      { name: "Mr. Alinanuswe Mpoki", role: { en: "Secretary", sw: "Katibu" }, bio: { en: "Secretary of Maandiko & Mafundisho.", sw: "Katibu wa Maandiko na Mafundisho." }, image: "" },
    ],
  },
];

// ===============================
// Placeholder arrays for other pages
// ===============================
export const upcomingEvents: any[] = [ {
    id: "event1",
    title: { en: "Annual Revival Conference", sw: "Mkutano wa Kila Mwaka wa Uamsho" },
    description: { en: "Join us for three days of prayer, worship, and spiritual growth.", sw: "Jiunge nasi kwa siku tatu za maombi, ibada, na ukuaji wa kiroho." },
    image: "/leaders/pc5.png",
    date: "2026-03-15",
    time: "09:00 AM",
    location: { en: "Main Church Hall, Mbeya", sw: "Kanisa Kuu, Mbeya" }
  },
  {
    id: "event2",
    title: { en: "Youth Empowerment Summit", sw: "Mkutano wa Uwezeshaji Vijana" },
    description: { en: "Empowering youth to lead with faith and integrity.", sw: "Kuwawezesha vijana kuongoza kwa imani na uadilifu." },
    image: "/leaders/pc5.png",
    date: "2026-04-10",
    time: "10:00 AM",
    location: { en: "Mbeya City, Tughimbe Hall", sw: "Mbeya Mjini, Tughimbe Hall" }
  },
  {
    id: "event3",
    title: { en: "Women’s Fellowship Retreat", sw: "Kambi ya Ushirika wa Wanawake" },
    description: { en: "A weekend retreat for spiritual growth and fellowship.", sw: "Mwisho wa wiki wa kambi ya ukuaji wa kiroho na ushirikiano." },
    image: "/leaders/pc5.png",
    date: "2026-05-22",
    time: "08:00 AM",
    location: { en: "Eden Highland Hotel", sw: "Eden Highland Hotel" }
  },];
export const sermons: any[] = [ {
    id: 'sermon-001',
    title: {
      en: 'Walking by Faith',
      sw: 'Kutembea kwa Imani',
    },
    speaker: 'Rev Thobias Thambiken',
    scripture: '2 Corinthians 5:7',
    date: '2024-11-10',
    duration: '42 min',
    audioUrl: '/audio/sermons/walking-by-faith.mp3',
    description: {
      en: 'A teaching on trusting God even when circumstances are unclear.',
      sw: 'Mafundisho kuhusu kumwamini Mungu hata wakati hali haieleweki.',
    },
  },
  {
    id: 'sermon-002',
    title: {
      en: 'Power of Prayer',
      sw: 'Nguvu ya Maombi',
    },
    speaker: 'Rev Thobias Thambiken ',
    scripture: 'James 5:16',
    date: '2024-11-17',
    duration: '38 min',
    audioUrl: '/home/karera/Downloads/heart/Above all guitar singing - Ricky Ralte.mp3',
    description: {
      en: 'Understanding how prayer activates God’s power in our lives.',
      sw: 'Kuelewa jinsi maombi yanavyoamsha nguvu za Mungu katika maisha yetu.',
    },
  },];
export const testimonials: any[] = [{
    id: 'testimony-001',
    name: 'Mary Joseph',
    title: {
      en: 'God Healed My Family',
      sw: 'Mungu Aliiponya Familia Yangu',
    },
    date: '2024-10-05',
    audioUrl: '/audio/testimonials/god-healed-my-family.mp3',
    description: {
      en: 'A testimony of healing and restoration through prayer.',
      sw: 'Ushuhuda wa uponyaji na urejesho kupitia maombi.',
    },
  },
  {
    id: 'testimony-002',
    name: 'Peter Emmanuel',
    title: {
      en: 'From Fear to Faith',
      sw: 'Kutoka Hofu hadi Imani',
    },
    date: '2024-10-19',
    audioUrl: '/audio/testimonials/from-fear-to-faith.mp3',
    description: {
      en: 'How God transformed my life and strengthened my faith.',
      sw: 'Jinsi Mungu alivyobadilisha maisha yangu na kuimarisha imani yangu.',
    },
  },];



// Giving Accounts (from official Sadaka account details)
export const givingAccounts = {
  churchName: "KANISA LA TAG FOREST YA KWANZA - MBEYA",
  contactLabel: { en: "For More Information", sw: "Kwa Maelezo Zaidi" },
  contactPhone: "0756 929 510",
  categories: [
    {
      id: "sadaka",
      title: { en: "Offerings (Sadaka)", sw: "Akaunti ya Sadaka" },
      description: {
        en: "Give your tithes and offerings through the official church accounts below.",
        sw: "Toa zaka na sadaka zako kupitia akaunti rasmi za kanisa zilizo hapa chini.",
      },
      accounts: [
        { bank: "CRDB", number: "015C884441700" },
        { bank: "NBC", number: "015C884441701" },
      ],
    },
    {
      id: "akiba",
      title: { en: "Savings (Akiba)", sw: "Akiba" },
      section: { en: "Payments Management - T.A.G Forest ya Kwanza", sw: "Usimamizi wa Malipo - T.A.G Forest ya Kwanza" },
      description: {
        en: "Support church savings through these accounts.",
        sw: "Changia akiba ya kanisa kupitia akaunti hizi.",
      },
      accounts: [
        { bank: "CRDB", number: "015J884441700" },
        { bank: "NBC", number: "015J884441701" },
      ],
    },
    {
      id: "miradi",
      title: { en: "Projects (Miradi)", sw: "Miradi" },
      section: { en: "Payments Management - T.A.G Forest ya Kwanza", sw: "Usimamizi wa Malipo - T.A.G Forest ya Kwanza" },
      description: {
        en: "Support church development projects through these accounts.",
        sw: "Changia miradi ya maendeleo ya kanisa kupitia akaunti hizi.",
      },
      accounts: [
        { bank: "CRDB", number: "015J884441702" },
        { bank: "NBC", number: "015J884441703" },
      ],
    },
  ],
};
