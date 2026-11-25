import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import { Button } from '@/components/ui/button';
const aboutImage = '/hero/hero-1.jpg';

const AboutPreview = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'sw';
  const { data: settings } = useQuery({ queryKey:['site-settings-public'], queryFn: async()=> (await api.get('/site-settings/public')).data, staleTime:30000, retry:false });
  const { data: aboutPage } = useQuery({ queryKey:['public-page','about'], queryFn: async()=> (await api.get('/public/page?slug=about')).data, staleTime:30000, retry:false });
  const cms = aboutPage?.content || {};
  const img = resolveMediaUrl(settings?.home_about_image) || aboutImage;
  const statValue = settings?.home_about_stat_value || '900+';
  const statLabel = (lang==='sw' ? settings?.home_about_stat_label_sw : settings?.home_about_stat_label_en) || t('home.membersGrowing');
  const history = (lang==='sw' ? cms.historySw : cms.historyEn) || t('home.aboutDescription');
  return (
    <section className="section-padding bg-white">
      <div className="container-church">
        <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }} className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-elevated">
              <img src={img} alt="Worship service at T.A.G FOREST YA KWANZA, Mbeya, Tanzania" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="absolute -bottom-4 -right-2 rounded-xl bg-[#FFD600] px-5 py-3 shadow-md sm:-right-4">
              <p className="font-serif text-xl font-bold text-black sm:text-2xl">{statValue}</p>
              <p className="text-xs font-medium text-black/60">{statLabel}</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6, delay: 0.1 }}>
            <p className="mb-2 font-semibold uppercase tracking-[0.2em] text-[#8A6A00]">{t('about.subtitle')}</p>
            <h2 className="font-serif text-3xl font-bold text-black md:text-4xl">{t('home.aboutTitle')}</h2>
            <span className="mt-4 block h-1 w-14 rounded-full bg-secondary" aria-hidden="true" />
            <p className="mt-6 text-base leading-relaxed text-black/60 sm:text-lg whitespace-pre-wrap">{history}</p>
            <Link to="/about" className="mt-8 inline-block"><Button className="btn-outline-church">{t('home.learnMore')}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Button></Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
