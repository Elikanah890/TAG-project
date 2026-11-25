import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import api from '@/lib/api';
import { serviceSchedule as fallbackSchedule } from '@/lib/churchData';
import { Clock, MapPin, Calendar } from 'lucide-react';

type Service = { nameEn: string; nameSw: string; timeEn: string; timeSw: string; name?: { en: string; sw: string }; time?: { en: string; sw: string } };
type Day = { day: string; dayEn: string; daySw: string; services: Service[] };

const DEFAULT = {
  days: fallbackSchedule.map((d: any) => ({ day: d.day, dayEn: d.dayEn, daySw: d.daySw, services: (d.services || []).map((s: any) => ({ nameEn: s.name?.en || '', nameSw: s.name?.sw || '', timeEn: s.time?.en || '', timeSw: s.time?.sw || '' })) })),
  specialNoteEn: 'For special services, revivals, and conferences, please check our News & Events page or follow us on social media for announcements.',
  specialNoteSw: 'Kwa ibada maalum, uamsho, na mikutano, tafadhali angalia ukurasa wetu wa Habari & Matukio au tufuate kwenye mitandao ya kijamii kwa matangazo.',
};

const SchedulePage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'sw';
  const { data } = useQuery({ queryKey: ['public-page', 'schedule'], queryFn: async () => (await api.get('/public/page?slug=schedule')).data, staleTime: 30000 });
  const content = { ...DEFAULT, ...(data?.content || {}), days: Array.isArray(data?.content?.days) ? data.content.days : DEFAULT.days };

  const getDayIcon = (day: string) => (day === 'sunday' ? '🙏' : day === 'saturday' ? '🎵' : '📖');

  return (
    <Layout>
      <PageHeader label={lang === 'en' ? 'SERVICE TIMES' : 'IBADA'} title={t('schedule.title')} subtitle={t('schedule.subtitle')} />
      <section className="section-padding bg-background border-b border-black/5">
        <div className="container-church max-w-4xl">
          <div className="space-y-6">
            {content.days.map((day: Day, index: number) => (
              <motion.div key={`${day.day}-${index}`} initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className={`card-church ${day.day === 'sunday' ? 'border-l-4 border-l-secondary' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{getDayIcon(day.day)}</span>
                    <div>
                      <h3 className="font-serif text-xl font-semibold text-black">{lang === 'en' ? day.dayEn : day.daySw}</h3>
                      <div className="flex items-center gap-2 text-black/60 text-sm mt-1"><MapPin className="w-4 h-4" /><span>{lang === 'en' ? 'Church Premises' : 'Majengo ya Kanisa'}</span></div>
                    </div>
                  </div>
                  <div className="space-y-2 sm:text-right">
                    {(day.services || []).map((service: Service, idx: number) => (
                      <div key={idx} className="flex items-center sm:justify-end gap-2">
                        <Clock className="w-4 h-4 text-[#8A6A00]" />
                        <span className="text-black font-medium">{lang === 'en' ? (service.nameEn || service.name?.en) : (service.nameSw || service.name?.sw)}</span>
                        <span className="text-black/60">• {lang === 'en' ? (service.timeEn || service.time?.en) : (service.timeSw || service.time?.sw)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="section-padding bg-[#F7F1E6] border-t border-black/5">
        <div className="container-church max-w-2xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card-church bg-background">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-[#8A6A00]" />
            <h3 className="font-serif text-xl font-semibold text-black mb-2">{lang === 'en' ? 'Special Services' : 'Ibada Maalum'}</h3>
            <p className="text-black/60">{lang === 'en' ? content.specialNoteEn : content.specialNoteSw}</p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default SchedulePage;
