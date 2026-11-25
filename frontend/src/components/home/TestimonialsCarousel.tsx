import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Quote } from 'lucide-react';
import api from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import { Button } from '@/components/ui/button';

const TestimonialsCarousel = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'sw';
  const reduceMotion = useReducedMotion();
  const { data } = useQuery({ queryKey:['public-testimonials'], queryFn: async()=> (await api.get('/public/testimonials')).data as any[], staleTime:30000, retry:false });
  const fallback = [
    { id:'t1', quote: lang==='en'?'After joining T.A.G Forest ya Kwanza, my family was restored, and our children are now grounded in the Word of God.':'Baada ya kujiunga na T.A.G Forest ya Kwanza, familia yangu ilirejeshwa, na watoto wetu sasa wameimara katika Neno la Mungu.', name:'Mary Joseph', since: lang==='en'?'Member since 2019':'Mwanachama tangu 2019', initials:'MJ', image:null },
    { id:'t2', quote: lang==='en'?'God healed my mother through the prayers of this church. I will never stop testifying of His goodness in my life.':'Mungu alimponya mama yangu kupitia maombi ya kanisa hili. Sitakoma kamwe kushuhudia wema wake maishani mwangu.', name:'Peter Emmanuel', since: lang==='en'?'Member since 2021':'Mwanachama tangu 2021', initials:'PE', image:null },
    { id:'t3', quote: lang==='en'?'I came to this church broken, but through worship, teaching, and discipleship, I found purpose, healing, and peace.':'Nilikuja kanisani nikiwa nimevunjika, lakini kupitia ibada, mafundisho na uanafunzi, nilipata kusudi, uponyaji na amani.', name:'Grace Mushi', since: lang==='en'?'Youth member since 2022':'Mwanachama wa vijana tangu 2022', initials:'GM', image:null },
  ];
  const items = (data && data.length>0) ? data.map((tst:any)=>({
    id:tst.id,
    quote: lang==='sw' ? (tst.quoteSw || tst.quoteEn) : tst.quoteEn,
    name: tst.authorName,
    since: tst.date || tst.role || '',
    initials: (tst.authorName||'?').split(' ').map((p:string)=>p[0]).slice(0,2).join('').toUpperCase(),
    image: resolveMediaUrl(tst.imageUrl),
  })) : fallback;

  const track = reduceMotion ? items : [...items, ...items];
  const renderCard = (item:any, index:number) => (
    <figure key={`${item.id}-${index}`} aria-hidden={!reduceMotion && index >= items.length} className="flex w-[260px] shrink-0 flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm sm:w-[290px]">
      <Quote className="h-5 w-5 text-[#8A6A00]/80" aria-hidden="true" />
      <blockquote className="line-clamp-4 font-serif text-xs italic leading-snug text-black sm:text-sm">“{item.quote}”</blockquote>
      <figcaption className="mt-auto flex items-center gap-2 border-t border-border pt-2">
        {item.image ? <img src={item.image} alt={item.name} className="h-9 w-9 shrink-0 rounded-full object-cover" /> : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-serif text-xs font-bold text-primary-foreground" aria-hidden="true">{item.initials}</span>}
        <span className="text-left"><span className="block text-xs font-semibold leading-tight text-black">{item.name}</span><span className="block text-[10px] text-black/60">{item.since}</span></span>
      </figcaption>
    </figure>
  );

  return (
    <section className="border-y border-black/[0.07] bg-[#F7F1E6] py-16 md:py-20">
      <div className="container-church">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5 }} className="mb-6 text-center">
          <h2 className="font-serif text-2xl font-bold text-black md:text-3xl">{t('home.testimonialsTitle')}</h2>
          <p className="mt-1 text-sm text-black/60 md:text-base">{t('home.testimonialsSubtitle')}</p>
          <span className="mx-auto mt-5 block h-1 w-14 rounded-full bg-secondary" aria-hidden="true" />
        </motion.div>
      </div>
      {reduceMotion ? (
        <div className="overflow-x-auto"><div className="flex w-max gap-4 px-4 pb-2">{items.map((item:any, i:number) => renderCard(item, i))}</div></div>
      ) : (
        <div className="marquee-track relative overflow-hidden" role="region" aria-label={t('home.testimonialsTitle')}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#F7F1E6] to-transparent sm:w-20" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#F7F1E6] to-transparent sm:w-20" />
          <div className="animate-marquee-rtl flex w-max gap-4 px-4">{track.map((item:any, i:number) => renderCard(item, i))}</div>
        </div>
      )}
      <div className="container-church mt-6 text-center"><Link to="/testimonials"><Button className="btn-outline-church text-sm">{t('home.readMoreTestimonials')}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Button></Link></div>
    </section>
  );
};

export default TestimonialsCarousel;
