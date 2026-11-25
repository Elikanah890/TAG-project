import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import { Button } from '@/components/ui/button';
import LeaderCard from '@/components/LeaderCard';
import { leadershipTeam } from '@/lib/churchData';

const LeadershipPreview = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'sw';
  const { data } = useQuery({ queryKey:['public-leaders'], queryFn: async()=> (await api.get('/public/leaders')).data as any[], staleTime:30000, retry:false });
  const cms = (data||[]).filter((l:any)=>l.featured || String(l.roleType||'').toUpperCase()==='SENIOR_PASTOR' || String(l.roleType||'').toUpperCase()==='ASSISTANT_PASTOR');
  const leaders = (cms.length>0 ? cms : data||[]).slice(0,2).map((l:any)=>({
    id:l.id,
    name:l.name,
    role:{en:l.title, sw:l.titleSw || l.title},
    featured: !!l.featured,
    image: resolveMediaUrl(l.imageUrl) || undefined,
    bio:{en:l.bio||'', sw:l.bioSw || l.bio || ''},
  }));
  const finalLeaders = leaders.length>0 ? leaders : leadershipTeam.slice(0,2);

  return (
    <section className="section-padding bg-white">
      <div className="container-church">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }} className="mb-10 text-center">
          <h2 className="font-serif text-3xl font-bold text-black md:text-4xl">{t('home.leadershipTitle')}</h2>
          <p className="mt-2 text-lg text-black/60">{t('home.leadershipSubtitle')}</p>
          <span className="mx-auto mt-5 block h-1 w-14 rounded-full bg-secondary" aria-hidden="true" />
        </motion.div>
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {finalLeaders.map((leader:any, index:number) => <LeaderCard key={leader.id} leader={leader} lang={lang} index={index} />)}
        </div>
        <div className="mt-10 text-center"><Link to="/leadership"><Button className="btn-outline-church">{t('home.viewAllLeaders')}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Button></Link></div>
      </div>
    </section>
  );
};

export default LeadershipPreview;
