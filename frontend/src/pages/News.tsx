import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import api from '@/lib/api';
import { upcomingEvents } from '@/lib/churchData';
import { Calendar, Clock, MapPin, Newspaper } from 'lucide-react';

const NewsPage = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'sw';
  const { data: announcements = [] } = useQuery({ queryKey: ['public-announcements'], queryFn: async () => (await api.get('/public/announcements')).data, staleTime: 30000 });
  const { data: events = [] } = useQuery({ queryKey: ['public-events'], queryFn: async () => (await api.get('/public/events')).data, staleTime: 30000 });

  const cmsEvents = (Array.isArray(events) ? events : []).map((e: any) => ({
    id: e.id,
    title: { en: e.title, sw: e.title },
    description: { en: e.description || '', sw: e.description || '' },
    date: e.startAt ? new Date(e.startAt).toLocaleDateString() : '',
    time: e.startAt ? new Date(e.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    location: { en: e.location || '', sw: e.location || '' },
    image: e.imageUrl || '/pc1.png',
  }));
  const displayEvents = cmsEvents.length ? cmsEvents : upcomingEvents;
  const displayNews = Array.isArray(announcements) ? announcements : [];

  return (
    <Layout>
      <PageHeader label={lang === 'en' ? 'STAY UPDATED' : 'TAARIFA MPYA'} title={lang === 'en' ? 'News & Events' : 'Habari & Matukio'} subtitle={lang === 'en' ? 'Updates and gatherings from our church family.' : 'Taarifa na mikusanyiko kutoka familia yetu ya kanisa.'} />

      {displayNews.length > 0 && (
        <section className="section-padding bg-[#F7F1E6] border-y border-black/5">
          <div className="container-church">
            <h2 className="font-serif text-2xl font-bold text-black mb-6">{lang === 'en' ? 'Latest News & Announcements' : 'Habari na Matangazo'}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayNews.map((item: any, index: number) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="card-church bg-white shadow-soft border border-black/5">
                  <div className="flex items-center gap-2 text-[#8A6A00] mb-3"><Newspaper className="w-4 h-4" /><span className="text-xs font-semibold uppercase tracking-wide">{item.type || 'NEWS'}</span></div>
                  <h3 className="font-serif text-xl font-semibold text-black mb-2">{item.title}</h3>
                  <p className="text-black/60 text-sm whitespace-pre-wrap">{item.body || ''}</p>
                  <p className="text-xs text-black/40 mt-3">{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section-padding bg-background border-b border-black/5">
        <div className="container-church">
          <h2 className="font-serif text-2xl font-bold text-black mb-6">{lang === 'en' ? 'Events' : 'Matukio'}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayEvents.map((event: any, index: number) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="card-church bg-white shadow-soft border border-black/5">
                <div className="aspect-video rounded-md overflow-hidden mb-4 bg-muted">
                  <img src={event.image || '/pc1.png'} alt={event.title?.[lang] || event.title?.en || 'Event'} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center gap-4 text-sm text-black/60 mb-3">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {event.date}</span>
                  {event.time ? <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {event.time}</span> : null}
                </div>
                <h3 className="font-serif text-xl font-semibold text-black mb-2">{event.title?.[lang] || event.title?.en}</h3>
                <p className="text-black/60 text-sm mb-4">{event.description?.[lang] || event.description?.en}</p>
                {(event.location?.[lang] || event.location?.en) ? <div className="flex items-center gap-2 text-sm text-black/60"><MapPin className="w-4 h-4" /> {event.location?.[lang] || event.location?.en}</div> : null}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NewsPage;
