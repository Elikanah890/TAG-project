import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Heart, HeartHandshake, Music, type LucideIcon } from 'lucide-react';
import api from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import { Button } from '@/components/ui/button';

interface Ministry { icon?: LucideIcon; name: string; logo?: string; }

const MinistriesPreview = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'sw';
  const { data } = useQuery({ queryKey:['public-ministries'], queryFn: async()=> (await api.get('/public/ministries')).data as any[], staleTime:30000, retry:false });
  const fallback: Ministry[] = [
    { icon: Music, name: t('ministries.worship') },
    { icon: Heart, name: t('ministries.youth') },
    { icon: BookOpen, name: t('ministries.children') },
    { icon: HeartHandshake, name: t('ministries.women') },
  ];
  const ministries: Ministry[] = (data && data.length>0)
    ? data.slice(0,4).map((m:any)=>({ name: lang==='sw' ? (m.nameSw || m.name) : m.name, logo: resolveMediaUrl(m.logoUrl || m.imageUrl) }))
    : fallback;

  return (
    <section className="section-padding bg-white">
      <div className="container-church">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }} className="mb-10 text-center">
          <h2 className="font-serif text-3xl font-bold text-black md:text-4xl">{t('ministries.title')}</h2>
          <p className="mt-2 text-lg text-black/60">{t('ministries.subtitle')}</p>
          <span className="mx-auto mt-5 block h-1 w-14 rounded-full bg-secondary" aria-hidden="true" />
        </motion.div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {ministries.map((ministry, index) => (
            <motion.div key={ministry.name+index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.45, delay: index * 0.1 }} className="card-church group text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary transition-colors group-hover:bg-burgundy-dark overflow-hidden">
                {ministry.logo ? <img src={ministry.logo} alt="" className="h-10 w-10 object-contain" /> : ministry.icon ? <ministry.icon className="h-8 w-8 text-primary-foreground" strokeWidth={1.8} aria-hidden="true" /> : null}
              </div>
              <h3 className="font-serif text-base font-semibold text-black sm:text-lg">{ministry.name}</h3>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/ministries"><Button className="btn-outline-church">{t('ministries.learnMore')}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Button></Link>
        </div>
      </div>
    </section>
  );
};

export default MinistriesPreview;
