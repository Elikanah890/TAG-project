import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Cross, Shield, Users, HandHeart, Heart, BookOpen, Sparkles } from 'lucide-react';
import api from '@/lib/api';

const iconMap: any = { Cross, Shield, Users, HandHeart, Heart, BookOpen, Sparkles };

const ValuesStrip = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'sw';
  const { data: settings } = useQuery({ queryKey:['site-settings-public'], queryFn: async()=> (await api.get('/site-settings/public')).data, staleTime:30000, retry:false });
  let cmsValues: any[] = [];
  try { cmsValues = settings?.home_values_json ? JSON.parse(settings.home_values_json) : []; } catch { cmsValues = []; }
  const fallback = [
    { icon: Cross, title: t('home.value1'), description: t('home.value1Desc') },
    { icon: Shield, title: t('home.value2'), description: t('home.value2Desc') },
    { icon: Users, title: t('home.value3'), description: t('home.value3Desc') },
    { icon: HandHeart, title: t('home.value4'), description: t('home.value4Desc') },
  ];
  const values = cmsValues.length>0 ? cmsValues.map((v:any)=>({ icon: iconMap[v.icon] || Cross, title: lang==='sw'?(v.titleSw||v.titleEn): (v.titleEn||v.titleSw), description: lang==='sw'?(v.descSw||v.descEn):(v.descEn||v.descSw) })) : fallback;

  return (
    <section className="border-y border-black/[0.07] bg-[#F7F1E6] py-14 md:py-16">
      <div className="container-church">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {values.map((value:any, index:number) => (
            <motion.div key={value.title+index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.45, delay: index * 0.1 }} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary"><value.icon className="h-8 w-8 text-primary-foreground" strokeWidth={1.8} aria-hidden="true" /></div>
              <h3 className="mb-1 font-serif text-lg font-semibold text-black">{value.title}</h3>
              <p className="text-sm leading-snug text-black/60">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default ValuesStrip;
