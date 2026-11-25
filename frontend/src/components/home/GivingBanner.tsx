import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';

const GivingBanner = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'sw';
  const { data } = useQuery({ queryKey:['site-settings-public'], queryFn: async()=> (await api.get('/site-settings/public')).data, staleTime:30000, retry:false });
  const title = (lang==='sw' ? data?.giving_banner_title_sw : data?.giving_banner_title_en) || (lang==='sw' ? 'Unga Mkono Huduma Yetu' : 'Support Our Ministry');
  const desc = (lang==='sw' ? data?.giving_banner_desc_sw : data?.giving_banner_desc_en) || (lang==='sw'
    ? 'Mchango wako unasaidia kueneza Injili, kuhudumia jamii, na kuimarisha familia za kanisa letu.'
    : 'Your giving helps spread the Gospel, serve our community, and strengthen families in our church.');
  const cta = lang==='sw' ? 'Changia Sasa' : 'Give Now';

  return (
    <section className="section-padding bg-[#F7F1E6] border-y border-black/5">
      <div className="container-church">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-4xl rounded-3xl border border-black/5 bg-white px-8 py-12 text-center shadow-soft md:px-12">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#7A1F2B]/10">
            <Heart className="h-7 w-7 text-[#7A1F2B]" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-black md:text-4xl mb-4">{title}</h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-black/65 md:text-lg mb-8">{desc}</p>
          <Link to="/giving">
            <Button className="bg-[#7A1F2B] text-white hover:bg-[#651925] px-8 py-6 text-base font-semibold">
              {cta} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
export default GivingBanner;
