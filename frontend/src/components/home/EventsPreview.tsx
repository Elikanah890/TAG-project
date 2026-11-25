import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, MapPin } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import api from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import { upcomingEvents as staticEvents } from '@/lib/churchData';
import { Button } from '@/components/ui/button';

const EventsPreview = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'sw';
  const reduceMotion = useReducedMotion();
  const { data } = useQuery({ queryKey:['public-events'], queryFn: async()=> (await api.get('/public/events')).data as any[], staleTime:30000, retry:false });
  const events = (data && data.length>0) ? data.map((e:any)=>({
    id:e.id,
    title:{en:e.title, sw:e.titleSw||e.title},
    description:{en:e.description||'', sw:e.descriptionSw||e.description||''},
    location:{en:e.location||'', sw:e.locationSw||e.location||''},
    image: resolveMediaUrl(e.imageUrl) || '/pc1.png',
    date: e.startAt ? new Date(e.startAt).toLocaleDateString() : '',
    time: e.timeLabel || (e.startAt ? new Date(e.startAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : ''),
  })) : staticEvents;

  return (
    <section className="border-y border-black/[0.07] bg-[#F7F1E6] py-16 md:py-24">
      <div className="container-church">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }} className="mb-10 text-center">
          <h2 className="font-serif text-3xl font-bold text-black md:text-4xl">{t('events.title')}</h2>
          <p className="mt-2 text-lg text-black/60">{t('events.subtitle')}</p>
          <span className="mx-auto mt-5 block h-1 w-14 rounded-full bg-secondary" aria-hidden="true" />
        </motion.div>
        <Swiper modules={[Autoplay, Pagination]} spaceBetween={24} slidesPerView={1} pagination={{ clickable: true }} autoplay={reduceMotion ? false : { delay: 5000, pauseOnMouseEnter: true }} breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }} className="pb-12">
          {events.map((event:any) => (
            <SwiperSlide key={event.id} className="h-auto">
              <div className="card-church flex h-full flex-col">
                <div className="mb-4 aspect-video overflow-hidden rounded-md bg-muted"><img src={event.image} alt={event.title[lang]} className="h-full w-full object-cover" loading="lazy" /></div>
                <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-black/60">
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" aria-hidden="true" /> {event.date}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" aria-hidden="true" /> {event.time}</span>
                </div>
                <h3 className="mb-2 font-serif text-xl font-semibold text-black">{event.title[lang]}</h3>
                <p className="mb-4 text-sm text-black/60">{event.description[lang]}</p>
                <div className="mt-auto flex items-center gap-2 text-sm text-black/60"><MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />{event.location[lang]}</div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="text-center"><Link to="/news"><Button className="btn-outline-church">{t('events.viewAll')}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Button></Link></div>
      </div>
    </section>
  );
};

export default EventsPreview;
