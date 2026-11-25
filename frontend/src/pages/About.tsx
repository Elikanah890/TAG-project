import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import api from '@/lib/api';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Heart, Target, BookOpen, Quote } from 'lucide-react';
import heroImage from '@/assets/pc7.png';

const AboutPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'sw';
  const { data: aboutPage } = useQuery({ queryKey: ['public-page', 'about'], queryFn: async () => (await api.get('/public/page?slug=about')).data, staleTime: 30000 });
  const cms = aboutPage?.content || {};
  const historyText = lang === 'en' ? (cms.historyEn || t('about.historyText')) : (cms.historySw || t('about.historyText'));
  const visionText = lang === 'en' ? (cms.visionEn || t('about.visionText')) : (cms.visionSw || t('about.visionText'));
  const missionText = lang === 'en' ? (cms.missionEn || t('about.missionText')) : (cms.missionSw || t('about.missionText'));
  const aboutTitle = lang === 'en' ? (cms.titleEn || t('about.title')) : (cms.titleSw || t('about.title'));
  const aboutSubtitle =
    lang === 'en'
      ? (cms.subtitleEn || 'Who we are as a church family in Mbeya City, Tanzania.')
      : (cms.subtitleSw || 'Sisi ni familia ya kanisa katika Jiji la Mbeya, Tanzania.');
  const valuesText = lang === 'en' ? (cms.valuesEn || '') : (cms.valuesSw || cms.valuesEn || '');
  const values = valuesText.split(',').map((value: string) => value.trim()).filter(Boolean);

  // --- FULL STATEMENT OF FAITH TEXT ---
  const defaultStatementOfFaith = {
    en: `
FOUNDATIONS OF FAITH OF TANZANIA ASSEMBLIES OF GOD

We sincerely believe that the Bible is the guide of our faith and Christian life. This declaration is the basis of our fellowship. Our confession of faith is built upon sixteen (16) principles:

(a) Principle 1: Inspired Scriptures
We believe all Scriptures of the Old and New Testament are inspired by God, fully authoritative, and reveal God to mankind.

(b) Principle 2: One True Living God
We believe in one true living God, the eternal “I AM,” Creator and Redeemer, revealed in the Father, Son, and Holy Spirit.

(c) Principle 3: Deity of Jesus Christ
Jesus Christ is the Son of God, fully divine, born of a virgin, sinless, performed miracles, died for our sins, resurrected, and ascended.

(d) Principle 4: Fall of Man
Man was created in God’s image but fell by free choice, bringing spiritual death.

(e) Principle 5: Salvation of Man
Salvation comes only through the blood of Jesus Christ, received by repentance and faith.

(f) Principle 6: Church Ordinances
Baptism and the Lord’s Supper are commanded, symbolic of union with Christ.

(g) Principle 7: Baptism of the Holy Spirit
Believers are empowered for service and spiritual gifts through the Holy Spirit.

(h) Principle 8: Evidence of Spirit Baptism
Spirit baptism is evidenced by speaking in other tongues.

(i) Principle 9: Holiness
Believers are called to holiness by the Spirit’s power.

(j) Principle 10: The Church
The Church is Christ’s body and God’s dwelling through the Spirit.

(k) Principle 11: Ministry
Godly ministry includes witnessing, building the body, worship, service, and fellowship.

(l) Principle 12: Divine Healing
Healing is part of the gospel and available to all believers.

(m) Principle 13: Blessed Hope
The resurrection and rapture of believers is the blessed hope of the Church.

(n) Principle 14: Millennial Reign of Christ
Christ will reign a thousand years on Earth with His saints.

(o) Principle 15: Final Judgment
All will be judged; the wicked face eternal punishment.

(p) Principle 16: New Heavens and New Earth
God promises a new heaven and new earth where righteousness dwells.
`,
    sw: `
MISINGI YA IMANI YA KANISA LA TANZANIA ASSEMBLIES OF GOD

Tunaamini kwa dhati kuwa Biblia ndio Mwongozo wa Imani yetu na matendo katika maisha yetu ya Kikristo. Tamko hili
ndilo msingi wa ushirika wetu. Ukiri wa Imani yetu umejengwa katika misingi kumi na sita (16) ifuatayo:

(a) Msingi wa 1: Maandiko Yaliyovuviwa
Tunaamini kwamba Maandiko yote ya Agano la Kale na yale ya Agano Jipya yamevuviwa kihalisi na Mungu
na ni Ufunuo wa Mungu kwa mwanadamu, ni mamlaka ya mwisho ya imani.

(b) Msingi wa 2: Mungu Mmoja aliye Hai na wa Kweli
Tunaamini kwamba Mungu mmoja tu aliye hai na wa kweli amekwisha kujifunua mwenyewe kama “MIMI NIKO” wa milele, muumbaji wa mbingu na nchi na Mkombozi wa Ulimwengu na Wanadamu.

(c) Msingi wa 3: Uungu wa Bwana Yesu
Tunaamini kwamba Bwana Yesu Kristo ni Mwana wa Mungu na ana sifa zote za Uungu, alizaliwa kwa bikira, maisha yasiyo na dhambi, alifanya miujiza, alikufa kwa dhambi zetu, akafufuka, na kupaa mbinguni.

(d) Msingi wa 4: Anguko la Mwanadamu
Tunaamini kwamba mwanadamu aliumbwa kwa mfano wa Mungu lakini akaanguka kwa hiari yake mwenyewe.

(e) Msingi wa 5: Wokovu wa Mwanadamu
Tunaamini kwamba wokovu hupatikana kwa njia ya damu ya Yesu Kristo, kwa toba na imani.

(f) Msingi wa 6: Maagizo ya Kanisa
Ubatizo na Meza ya Bwana ni maagizo kwa waamini, yakionyesha mshikamano na Kristo.

(g) Msingi wa 7: Ubatizo wa Roho Mtakatifu
Waamini wanapata nguvu ya kiroho na vipaji kupitia Roho Mtakatifu.

(h) Msingi wa 8: Ushahidi wa Ubatizo katika Roho Mtakatifu
Ubatizo wa Roho huonekana kwa kutamka lugha nyingine.

(i) Msingi wa 9: Utakaso
Waamini wanaitwa kuwa watakatifu kwa nguvu ya Roho.

(j) Msingi wa 10: Kanisa
Kanisa ni mwili wa Kristo na makao ya Mungu kupitia Roho Mtakatifu.

(k) Msingi wa 11: Huduma
Huduma ya Mungu ni kuushuhudia ulimwengu, kujenga mwili wa Kristo, ibada, utumishi, na ushirika.

(l) Msingi wa 12: Uponyaji wa Kimungu
Uponyaji ni sehemu ya Injili na upo kwa waamini wote.

(m) Msingi wa 13: Tumaini lenye Baraka
Ufufuo na kunyakuliwa kwa waamini ni tumaini lenye baraka.

(n) Msingi wa 14: Utawala wa Kristo wa miaka Elfu
Kristo atatawala miaka elfu moja hapa duniani na watakatifu wake.

(o) Msingi wa 15: Hukumu ya Mwisho
Wote watakavyopimwa; waovu watapokea adhabu ya milele.

(p) Msingi wa 16: Mbingu Mpya na Nchi Mpya
Mungu atatupa mbingu mpya na nchi mpya ambapo haki inaishi.
`
  };
  const statementOfFaith = {
    en: cms.statementFaithEn || defaultStatementOfFaith.en,
    sw: cms.statementFaithSw || defaultStatementOfFaith.sw,
  };
  const pastorName = cms.pastorName || '';
  const pastorRole = lang==='en' ? (cms.pastorRoleEn || 'Senior Pastor') : (cms.pastorRoleSw || 'Mchungaji Kiongozi');
  const pastorMessage = lang==='en' ? (cms.pastorMessageEn || '') : (cms.pastorMessageSw || cms.pastorMessageEn || '');

  // --- DOWNLOAD FUNCTION ---
  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <Layout>
      <PageHeader
        label={t('about.subtitle')}
        title={aboutTitle}
        subtitle={aboutSubtitle}
      />

      {/* History Section */}
      <section className="section-padding bg-background border-b border-black/5">
        <div className="container-church">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-black mb-6">
                {t('about.history')}
              </h2>
              <p className="text-black/60 mb-6 leading-relaxed whitespace-pre-wrap">
                {historyText}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-lg overflow-hidden shadow-elevated">
                <img 
                  src={heroImage} 
                  alt="Church history"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section-padding bg-[#F7F1E6] border-y border-black/5">
        <div className="container-church">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card-church text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-hero flex items-center justify-center">
                <Target className="w-8 h-8 text-[#FFD600]" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-black mb-4">
                {t('about.vision')}
              </h3>
              <p className="text-black/60 leading-relaxed whitespace-pre-wrap">
                {visionText}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="card-church text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-gold flex items-center justify-center">
                <Heart className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-black mb-4">
                {t('about.mission')}
              </h3>
              <p className="text-black/60 leading-relaxed whitespace-pre-wrap">
                {missionText}
              </p>
            </motion.div>
          </div>
          {values.length > 0 && (
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {values.map((value: string) => (
                <span key={value} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/70">
                  {value}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {pastorMessage ? (
      <section className="section-padding bg-background border-b border-black/5">
        <div className="container-church max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card-church text-center">
            <Quote className="w-10 h-10 text-[#8A6A00] mx-auto mb-4" />
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-black mb-4">{lang==='en' ? 'Pastoral Message' : 'Ujumbe wa Mchungaji'}</h2>
            <p className="text-black/70 leading-relaxed whitespace-pre-wrap mb-4">{pastorMessage}</p>
            {pastorName && <p className="font-semibold text-black">{pastorName} <span className="text-black/60 font-normal">— {pastorRole}</span></p>}
          </motion.div>
        </div>
      </section>
      ) : null}

      {/* --- UPDATED STATEMENT OF FAITH WITH BOTH LANGUAGES --- */}
      <section className="section-padding bg-card border-t border-black/5">
        <div className="container-church max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-hero flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-[#FFD600]" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-black mb-4">
              Statement of Faith / Tamko la Imani
            </h2>
            <p className="text-black/60">
              The core beliefs that guide our faith and practice
            </p>
          </motion.div>

          {/* English Accordion */}
          <Accordion type="single" collapsible className="space-y-4 mb-8">
            <AccordionItem value="english" className="card-church border-none">
              <AccordionTrigger className="font-serif text-lg font-semibold text-black hover:no-underline">
                English
              </AccordionTrigger>
              <AccordionContent className="text-black/60">
                <pre style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5em' }}>
                  {statementOfFaith.en}
                </pre>
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => downloadFile(statementOfFaith.en, 'StatementOfFaith_English.txt')}
                    className="px-4 py-2 bg-[#FFD600] text-black font-medium rounded-md hover:bg-[#E6C000] transition"
                  >
                    Download English
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Swahili Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="swahili" className="card-church border-none">
              <AccordionTrigger className="font-serif text-lg font-semibold text-black hover:no-underline">
                Kiswahili
              </AccordionTrigger>
              <AccordionContent className="text-black/60">
                <pre style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5em' }}>
                  {statementOfFaith.sw}
                </pre>
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => downloadFile(statementOfFaith.sw, 'StatementOfFaith_Swahili.txt')}
                    className="px-4 py-2 bg-[#FFD600] text-black font-medium rounded-md hover:bg-[#E6C000] transition"
                  >
                    Pakua Kiswahili
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Pastoral Message */}
      <section className="section-padding bg-gradient-hero">
        <div className="container-church max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Quote className="w-12 h-12 mx-auto mb-6 text-secondary" />
            <blockquote className="font-serif text-2xl md:text-3xl text-white italic leading-relaxed mb-8">
              {lang === 'en'
                ? '"Welcome to T.A.G Forest Ya Kwanza Church. We are a community of believers united by faith in Jesus Christ. Our doors are open to all who seek to know God and grow in His love. Come as you are, and let us journey together in faith."'
                : '"Karibu T.A.G Forest Ya Kwanza Church. Sisi ni jamii ya waamini waliounganishwa na imani katika Yesu Kristo. Milango yetu iko wazi kwa wote wanaotafuta kumjua Mungu na kukua katika upendo Wake. Njoo ulivyo, na tusafiri pamoja kwa imani."'
              }
            </blockquote>
            <p className="text-white font-semibold">Pastor Tobias Thambikeni</p>
            <p className="text-white/70">{lang === 'en' ? 'Senior Pastor' : 'Mchungaji Mkuu'}</p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
