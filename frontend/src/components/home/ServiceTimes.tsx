import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sun, BookOpen, MoonStar } from 'lucide-react';
import api from '@/lib/api';
import { serviceSchedule } from '@/lib/churchData';

const ServiceTimes = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'sw';
  const { data } = useQuery({ queryKey:['public-page-schedule'], queryFn: async()=> (await api.get('/public/page?slug=schedule')).data, staleTime:30000, retry:false });
  const cms = (data?.content as any)?.schedule;
  const source = Array.isArray(cms) && cms.length>0 ? cms : serviceSchedule;
  const icons = [Sun, BookOpen, MoonStar, Sun, BookOpen, MoonStar, Sun];
  const services = source.slice(0,3).map((day:any, i:number)=>({
    icon: icons[i] || Sun,
    title: lang==='sw' ? (day.daySw || day.day || day.dayEn) : (day.dayEn || day.day || day.daySw),
    time: day.services?.[0] ? (lang==='sw' ? (day.services[0].time?.sw || day.services[0].time?.en || day.services[0].time) : (day.services[0].time?.en || day.services[0].time?.sw || day.services[0].time)) : '',
  }));

  return (
    <section className="border-y border-black/[0.07] bg-[#F7F1E6] py-16 md:py-24">
      <div className="container-church">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }} className="mb-10 text-center">
          <h2 className="font-serif text-3xl font-bold text-black md:text-4xl">{t('services.title')}</h2>
          <p className="mt-2 text-lg text-black/60">{t('services.subtitle')}</p>
          <span className="mx-auto mt-5 block h-1 w-14 rounded-full bg-secondary" aria-hidden="true" />
        </motion.div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {services.map((service:any, index:number) => (
            <motion.div key={service.title+index} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5, delay: index * 0.12 }} className="card-church group text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary transition-colors group-hover:bg-burgundy-dark"><service.icon className="h-8 w-8 text-primary-foreground" strokeWidth={1.8} aria-hidden="true" /></div>
              <h3 className="mb-2 font-serif text-xl font-semibold text-black">{service.title}</h3>
              <p className="font-medium leading-snug text-[#8A6A00]">{service.time}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 text-center"><Link to="/schedule" className="link-underline inline-flex items-center gap-2 font-medium text-[#8A6A00]">{t('home.servicesCta')}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      </div>
    </section>
  );
};

export default ServiceTimes;
