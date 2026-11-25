import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        home: "Home",
        about: "About Us",
        leadership: "Leadership",
        ministries: "Ministries",
        news: "News & Events",
        sermons: "Sermons",
        live: "Live",
        giving: "Giving",
        schedule: "Schedule",
        testimonials: "Testimonials",
        newsletter: "Newsletter",
        contact: "Contact",
      },
      // Hero Section
      hero: {
        welcome: "Welcome to",
        churchName: "T.A.G FOREST YA KWANZA",
        tagline: "A Place of Worship, Fellowship & Transformation",
        subtitle: "Join us as we grow together in faith, love, and service to God and our community in Mbeya City.",
        joinUs: "Join Us This Sunday",
        watchLive: "Watch Live",
        learnMore: "Learn More",
      },
      // Home Page
      home: {
        quickSchedule: "Service Schedule",
        quickMinistries: "Our Ministries",
        quickGiving: "Give & Support",
        quickBible: "Bible Resources",
        worship: "Worship",
        worshipDesc: "Hearts ablaze in God's presence",
        fellowship: "Fellowship",
        fellowshipDesc: "Family united in faith and love",
        discipleship: "Discipleship",
        discipleshipDesc: "Rooted and growing in the Word",
        transformation: "Transformation",
        transformationDesc: "Changed lives, changed community",
        servicesCta: "View Full Schedule",
        leadershipTitle: "Our Leadership",
        leadershipSubtitle: "Meet the shepherds of our congregation",
        viewAllLeaders: "View All Leaders",
        ministriesTitle: "Our Ministries",
        ministriesSubtitle: "Serving God together through every department",
        ministriesExplore: "Explore Ministries",
        ministriesYouth: "CA's Youth Ministry",
        ministriesWomen: "WWK Women's Ministry",
        ministriesMen: "CMF Men's Fellowship",
        ministriesChoir: "DMS Music & Choir",
        testimonialsTitle: "Testimonies",
        testimonialsSubtitle: "Stories of God's faithfulness",
        readMoreTestimonials: "Read More Testimonies",
      },
      // Services
      services: {
        title: "Service Times",
        subtitle: "Join us for worship",
        sunday: "Sunday Service",
        sundayTime: "7:00 AM – 10:30 AM (1st Service) & 11:00 AM – 1:00 PM (2nd Service)",
        wednesday: "Mid-Week Service",
        wednesdayTime: "6:30 PM – 8:00 PM (Wednesday)",
        friday: "Night Vigil",
        fridayTime: "10:30 PM – 12:00 AM (Friday)",
      },
      // About Section
      about: {
        title: "About Our Church",
        subtitle: "Our Story of Faith",
        history: "Our History",
        historyText: "T.A.G FOREST YA KWANZA Church was established with a vision to bring the transformative power of the Gospel to Mbeya City and beyond. Located near Mahakama Kuu, our church has grown into a vibrant community of believers committed to worship, fellowship, and service.",
        vision: "Our Vision",
        visionText: "To be a beacon of hope and transformation in Mbeya City, raising disciples who impact their families, communities, and the world for Christ.",
        mission: "Our Mission",
        missionText: "To worship God in spirit and truth, teach the Word, make disciples, serve our community, and spread the Gospel to all nations.",
        learnMore: "Learn More About Us",
      },
      // Events
      events: {
        title: "Upcoming Events",
        subtitle: "Join us for fellowship and growth",
        viewAll: "View All Events",
        register: "Register",
      },
      // Sermons
      sermons: {
        title: "Latest Sermons",
        subtitle: "Listen and be blessed",
        listen: "Listen Now",
        viewAll: "View All Sermons",
        speaker: "Speaker",
        date: "Date",
        scripture: "Scripture",
      },
      // Giving
      giving: {
        title: "Support Our Ministry",
        subtitle: "Your generosity makes a difference",
        description: "Your tithes and offerings help us spread the Gospel, support our community, and grow our ministries. Give cheerfully and watch God multiply your blessings.",
        giveNow: "Give Now",
        oneTime: "One-Time",
        recurring: "Recurring",
        mpesa: "M-Pesa",
        airtel: "Airtel Money",
        halopesa: "HaloPesa",
        yas: "Yas",
      },
      // Contact
      contact: {
        title: "Contact Us",
        subtitle: "We'd love to hear from you",
        address: "Near Mahakama Kuu, Mbeya City, Tanzania",
        phone: "Phone",
        email: "Email",
        sendMessage: "Send Message",
        name: "Your Name",
        message: "Your Message",
        officeHours: "Office Hours",
        officeHoursText: "Monday - Friday: 8:00 AM - 6:00 PM",
      },
      // Footer
      footer: {
        tagline: "A Place of Worship, Fellowship & Transformation",
        quickLinks: "Quick Links",
        connect: "Connect With Us",
        subscribe: "Subscribe to Newsletter",
        subscribePlaceholder: "Enter your email",
        subscribeBtn: "Subscribe",
        rights: "All rights reserved.",
      },
      // Common
      common: {
        readMore: "Read More",
        viewAll: "View All",
        submit: "Submit",
        loading: "Loading...",
        error: "Something went wrong",
        success: "Success!",
      },
      // Schedule
      schedule: {
        title: "Weekly Schedule",
        subtitle: "Join us throughout the week",
        monday: "Monday",
        tuesday: "Tuesday",
        wednesday: "Wednesday",
        thursday: "Thursday",
        friday: "Friday",
        saturday: "Saturday",
        sunday: "Sunday",
      },
      // Testimonials
      testimonials: {
        title: "Testimonies",
        subtitle: "Stories of God's faithfulness",
        shareStory: "Share Your Story",
      },
      // Newsletter
      newsletter: {
        title: "Stay Connected",
        subtitle: "Subscribe to our newsletter",
        description: "Get updates on church events, sermons, and community news delivered to your inbox.",
        placeholder: "Enter your email address",
        subscribe: "Subscribe",
        privacy: "We respect your privacy and will never share your email.",
        success: "Thank you for subscribing! Check your email for confirmation.",
      },
      // Department
      Department: {
        title: "Our Department",
        subtitle: "Serving God through various departments",
        vision: "Vision",
        mission: "Mission",
        purpose: "Purpose",
        leaders: "Leaders",
        cmf: {
          name: "CMF - Christian Men's Fellowship",
          description: "Empowering men to lead godly lives and serve their families and communities.",
        },
        wwk: {
          name: "WWK - Women's Ministry",
          description: "Nurturing women in faith, fellowship, and service to God.",
        },
        cas: {
          name: "CA's - Youth Ministry",
          description: "Raising a generation of young believers passionate for Christ.",
        },
        watoto: {
          name: "Watoto - Children's Ministry",
          description: "Teaching children the ways of the Lord through fun and engaging activities.",
        },
        evangelism: {
          name: "Uinjilisti - Evangelism",
          description: "Spreading the Gospel to the unreached in Mbeya and beyond.",
        },
        missions: {
          name: "Umisheni - Missions",
          description: "Supporting missionaries and mission work locally and globally.",
        },
        worship: {
          name: "Praise, Worship & Choir",
          description: "Leading the congregation in heartfelt worship to our Creator.",
        },
        teaching: {
          name: "Maandiko & Mafundisho",
          description: "Teaching and discipleship through systematic Bible study.",
        },
      },
      // Ministries (labels used by the Ministries page)
      ministries: {
        title: "Our Ministries",
        subtitle: "Serving God through various departments",
        vision: "Vision",
        mission: "Mission",
        purpose: "Purpose",
        leaders: "Leaders",
      },
      // Leadership
      leadership: {
        title: "Our Leadership",
        subtitle: "Meet the shepherds of our congregation",
        pastor: "Senior Pastor",
        associate: "Assistant Pastor",
        elder: "Elder",
        deacon: "Deacon",
        heroLabel: "OUR CHURCH FAMILY",
        heroTitleWhite: "Our",
        heroTitleGold: "Leadership",
        heroSubtitle: "Meet the dedicated leaders who serve, guide and shepherd our congregation in faith and love.",
        knowMore: "Know More",
        scripture: "“And He gave some, apostles; and some, prophets; and some, evangelists; and some, pastors and teachers.”",
        scriptureRef: "EPHESIANS 4:11",
        pastorsLabel: "OUR PASTORS",
        meetOurPastors: "Meet Our Pastors",
        pastorsSubtitle: "Faithful servants of God, committed to lead His people with wisdom, love and compassion.",
        photoComingSoon: "Photo Coming Soon",
        phone: "Call",
        email: "Email",
        whatsapp: "WhatsApp",
        together: "Together in Christ, we grow, serve and make a difference.",
        joinOurChurch: "Join Our Church",
      },
      // Live
      live: {
        title: "Live Service",
        subtitle: "Join us online",
        nextService: "Next Live Service",
        watchNow: "Watch Now",
        countdown: "Service starts in",
        pastServices: "Past Services",
      },
    },
  },
  sw: {
    translation: {
      // Navigation
      nav: {
        home: "Nyumbani",
        about: "Kuhusu Sisi",
        leadership: "Uongozi",
        ministries: "Huduma",
        news: "Habari & Matukio",
        sermons: "Mahubiri",
        live: "Moja kwa Moja",
        giving: "Kutoa",
        schedule: "Ratiba",
        testimonials: "Ushuhuda",
        newsletter: "Jarida",
        contact: "Wasiliana",
      },
      // Hero Section
      hero: {
        welcome: "Karibu",
        churchName: "T.A.G FOREST YA KWANZA",
        tagline: "Mahali pa Ibada, Ushirika na Mabadiliko",
        subtitle: "Jiunge nasi tukue pamoja katika imani, upendo, na huduma kwa Mungu na jamii yetu hapa Mbeya.",
        joinUs: "Jiunge Nasi Jumapili Hii",
        watchLive: "Tazama Moja kwa Moja",
        learnMore: "Jifunze Zaidi",
      },
      // Home Page
      home: {
        quickSchedule: "Ratiba ya Ibada",
        quickMinistries: "Huduma Zetu",
        quickGiving: "Toa & Unga Mkono",
        quickBible: "Rasilimali za Biblia",
        worship: "Ibada",
        worshipDesc: "Mioyo iliyowashwa katika uwepo wa Mungu",
        fellowship: "Ushirika",
        fellowshipDesc: "Familia iliyounganishwa katika imani na upendo",
        discipleship: "Uanafunzi",
        discipleshipDesc: "Wakitulia na kukua katika Neno",
        transformation: "Mabadiliko",
        transformationDesc: "Maisha yaliyobadilika, jamii iliyobadilika",
        servicesCta: "Ona Ratiba Kamili",
        leadershipTitle: "Uongozi Wetu",
        leadershipSubtitle: "Kutana na wachungaji wa mkutano wetu",
        viewAllLeaders: "Ona Viongozi Wote",
        ministriesTitle: "Huduma Zetu",
        ministriesSubtitle: "Kumhudumia Mungu pamoja kupitia kila idara",
        ministriesExplore: "Gundua Huduma",
        ministriesYouth: "CA's – Huduma ya Vijana",
        ministriesWomen: "WWK – Huduma ya Wanawake",
        ministriesMen: "CMF – Ushirika wa Wanaume",
        ministriesChoir: "DMS – Muziki na Uimbaji",
        testimonialsTitle: "Ushuhuda",
        testimonialsSubtitle: "Hadithi za uaminifu wa Mungu",
        readMoreTestimonials: "Soma Ushuhuda Zaidi",
      },
      // Services
      services: {
        title: "Ratiba za Ibada",
        subtitle: "Jiunge nasi katika ibada",
        sunday: "Ibada ya Jumapili",
        sundayTime: "Saa 1:00 Asubuhi – Saa 4:30 Asubuhi (Ibada ya 1) & Saa 5:00 Asubuhi – Saa 7:00 Mchana (Ibada ya 2)",
        wednesday: "Ibada ya Katikati ya Wiki",
        wednesdayTime: "Saa 12:30 Jioni – Saa 2:00 Usiku (Jumatano)",
        friday: "Ibada ya Ijumaa",
        fridayTime: "Saa 4:30 Usiku – Saa 6:30 Usiku (Ijumaa)",
      },
      // About Section
      about: {
        title: "Kuhusu Kanisa Letu",
        subtitle: "Historia Yetu ya Imani",
        history: "Historia Yetu",
        historyText: "Kanisa la T.A.G FOREST YA KWANZA lilianzishwa na maono ya kuleta nguvu ya mabadiliko ya Injili katika Jiji la Mbeya na zaidi. Likiwa karibu na Mahakama Kuu, kanisa letu limekua kuwa jamii hai ya waamini waliojitolea kwa ibada, ushirika, na huduma.",
        vision: "Maono Yetu",
        visionText: "Kuwa mwanga wa tumaini na mabadiliko katika Jiji la Mbeya, tukiinua wanafunzi wanaobadilisha familia zao, jamii, na ulimwengu kwa Kristo.",
        mission: "Dhamira Yetu",
        missionText: "Kumwabudu Mungu kwa roho na kweli, kufundisha Neno, kutengeneza wanafunzi, kuhudumia jamii yetu, na kueneza Injili kwa mataifa yote.",
        learnMore: "Jifunze Zaidi Kuhusu Sisi",
      },
      // Events
      events: {
        title: "Matukio Yanayokuja",
        subtitle: "Jiunge nasi kwa ushirika na ukuaji",
        viewAll: "Ona Matukio Yote",
        register: "Jiandikishe",
      },
      // Sermons
      sermons: {
        title: "Mahubiri ya Hivi Karibuni",
        subtitle: "Sikiliza na ubarikiwe",
        listen: "Sikiliza Sasa",
        viewAll: "Ona Mahubiri Yote",
        speaker: "Mhubiri",
        date: "Tarehe",
        scripture: "Maandiko",
      },
      // Giving
      giving: {
        title: "Unga Mkono Huduma Yetu",
        subtitle: "Ukarimu wako unaleta mabadiliko",
        description: "Zaka na sadaka zako zinasaidia kueneza Injili, kuhudumia jamii yetu, na kukuza huduma zetu. Toa kwa furaha na umwone Mungu akizidisha baraka zako.",
        giveNow: "Toa Sasa",
        oneTime: "Mara Moja",
        recurring: "Kila Mwezi",
        mpesa: "M-Pesa",
        airtel: "Airtel Money",
        halopesa: "HaloPesa",
        yas: "Yas",
      },
      // Contact
      contact: {
        title: "Wasiliana Nasi",
        subtitle: "Tungependa kusikia kutoka kwako",
        address: "Karibu na Mahakama Kuu, Jiji la Mbeya, Tanzania",
        phone: "Simu",
        email: "Barua Pepe",
        sendMessage: "Tuma Ujumbe",
        name: "Jina Lako",
        message: "Ujumbe Wako",
        officeHours: "Saa za Ofisi",
        officeHoursText: "Jumatatu - Ijumaa: Saa 2:00 Asubuhi - Saa 12:00 Jioni",
      },
      // Footer
      footer: {
        tagline: "Mahali pa Ibada, Ushirika na Mabadiliko",
        quickLinks: "Viungo vya Haraka",
        connect: "Wasiliana Nasi",
        subscribe: "Jiandikishe kwa Jarida",
        subscribePlaceholder: "Weka barua pepe yako",
        subscribeBtn: "Jiandikishe",
        rights: "Haki zote zimehifadhiwa.",
      },
      // Common
      common: {
        readMore: "Soma Zaidi",
        viewAll: "Tazama Yote",
        submit: "Wasilisha",
        loading: "Inapakia...",
        error: "Kuna hitilafu imetokea",
        success: "Imefanikiwa!",
      },
      // Schedule
      schedule: {
        title: "Ratiba ya Wiki",
        subtitle: "Jiunge nasi katika ibada na huduma wiki nzima",
        monday: "Jumatatu",
        tuesday: "Jumanne",
        wednesday: "Jumatano",
        thursday: "Alhamisi",
        friday: "Ijumaa",
        saturday: "Jumamosi",
        sunday: "Jumapili",
      },
      // Testimonials
      testimonials: {
        title: "Ushuhuda",
        subtitle: "Hadithi za uaminifu wa Mungu",
        shareStory: "Shiriki Ushuhuda Wako",
      },
      // Newsletter
      newsletter: {
        title: "Kaa Karibu",
        subtitle: "Jiandikishe kwa jarida letu",
        description: "Pata taarifa za matukio ya kanisa, mahubiri, na habari za jamii moja kwa moja kwenye barua pepe yako.",
        placeholder: "Weka anwani yako ya barua pepe",
        subscribe: "Jiandikishe",
        privacy: "Tunaheshimu faragha yako na hatutashiriki barua pepe yako kamwe.",
        success: "Asante kwa kujiandikisha! Angalia barua pepe yako kwa uthibitisho.",
      },
      // Ministries
      ministries: {
        title: "Huduma Zetu",
        subtitle: "Kumhudumia Mungu kupitia idara mbalimbali",
        vision: "Maono",
        mission: "Dhamira",
        purpose: "Madhumuni",
        leaders: "Viongozi",
        cmf: {
          name: "CMF - Ushirika wa Wanaume wa Kikristo",
          description: "Kuwawezesha wanaume kuishi maisha ya kumcha Mungu na kuhudumia familia na jamii zao.",
        },
        wwk: {
          name: "WWK - Huduma ya Wanawake",
          description: "Kuwalea wanawake katika imani, ushirika, na huduma kwa Mungu.",
        },
        cas: {
          name: "CA's - Huduma ya Vijana",
          description: "Kuinua kizazi cha vijana waamini wenye shauku kwa Kristo.",
        },
        watoto: {
          name: "Watoto - Huduma ya Watoto",
          description: "Kuwafundisha watoto njia za Bwana kupitia mafundisho na shughuli za kujenga imani.",
        },
        evangelism: {
          name: "Uinjilisti",
          description: "Kueneza Injili kwa watu wasiofikiwa huko Mbeya na kwingineko.",
        },
        missions: {
          name: "Umisheni",
          description: "Kusaidia wamisionari na kazi ya umisheni ndani na nje ya nchi.",
        },
        worship: {
          name: "Sifa, Ibada na Kwaya",
          description: "Kuongoza kusanyiko katika ibada ya kumtukuza Muumba wetu.",
        },
        teaching: {
          name: "Maandiko na Mafundisho",
          description: "Kufundisha na kuwajenga wanafunzi wa Kristo kupitia mafundisho ya Biblia kwa utaratibu.",
        },
      },
      // Leadership
      leadership: {
        title: "Uongozi Wetu",
        subtitle: "Kutana na wachungaji wa mkutano wetu",
        pastor: "Mchungaji Mkuu",
        associate: "Mchungaji Msaidizi",
        elder: "Mzee",
        deacon: "Shemasi",
        heroLabel: "FAMILIA YA KANISA LETU",
        heroTitleWhite: "Uongozi",
        heroTitleGold: "Wetu",
        heroSubtitle: "Kutana na viongozi wetu waliojitolea wanaolitumikia na kuliongoza kusanyiko letu katika imani na upendo.",
        knowMore: "Jifunze Zaidi",
        scripture: "“Naye aliwapa wale wengine kuwa mitume, na wengine kuwa manabii, na wengine kuwa wainjilisti, na wengine kuwa wachungaji na walimu.”",
        scriptureRef: "WAEFESO 4:11",
        pastorsLabel: "WACHUNGAJI WETU",
        meetOurPastors: "Kutana na Wachungaji Wetu",
        pastorsSubtitle: "Watumishi waaminifu wa Mungu, waliojitolea kuwaongoza watu Wake kwa hekima, upendo na huruma.",
        photoComingSoon: "Picha Itapatikana Hivi Karibuni",
        phone: "Piga Simu",
        email: "Barua Pepe",
        whatsapp: "WhatsApp",
        together: "Pamoja katika Kristo, tunakua, tunahudumia na kuleta mabadiliko.",
        joinOurChurch: "Jiunge na Kanisa Letu",
      },
      // Live
      live: {
        title: "Ibada ya Moja kwa Moja",
        subtitle: "Jiunge nasi mtandaoni",
        nextService: "Ibada Inayofuata",
        watchNow: "Tazama Sasa",
        countdown: "Ibada inaanza baada ya",
        pastServices: "Ibada Zilizopita",
      },
    },
  },
};

const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;
const defaultLanguage = savedLanguage === 'en' || savedLanguage === 'sw' ? savedLanguage : 'sw';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: 'sw',
    interpolation: {
      escapeValue: false,
    },
  });

if (typeof document !== 'undefined') {
  document.documentElement.lang = defaultLanguage;
}

i18n.on('languageChanged', (lang) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lang', lang);
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
  }
});

export default i18n;
