import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import { testimonials } from '@/lib/churchData';
import api from '@/lib/api';
import { Quote } from 'lucide-react';

type CmsTestimonial = { id: string; authorName: string; role?: string | null; quoteEn: string; quoteSw?: string | null; order: number };

const TestimonialsPage = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'sw';

  const { data: cmsTestimonials } = useQuery({
    queryKey: ['public-testimonials'],
    queryFn: async () => (await api.get('/public/testimonials')).data as CmsTestimonial[],
    staleTime: 30_000,
    retry: false,
  });

  const cmsItems = (cmsTestimonials ?? []).map((t:any) => ({
    id: t.id,
    title: { en: t.titleEn || t.role || 'Testimony', sw: t.titleSw || t.role || 'Ushuhuda' },
    description: { en: t.quoteEn, sw: t.quoteSw || t.quoteEn },
    name: t.authorName,
    date: t.date || '',
    audioUrl: t.audioUrl || undefined,
    imageUrl: t.imageUrl || undefined,
  }));
  type StaticItem = { id: string | number; title?: { en: string; sw: string }; description?: { en: string; sw: string }; name: string; date?: string; audioUrl?: string };
  const staticTestimonials: StaticItem[] = Array.isArray(testimonials) ? (testimonials as StaticItem[]) : [];
  const safeTestimonials: Array<StaticItem | (typeof cmsItems)[number]> = cmsItems.length > 0 ? cmsItems : staticTestimonials;

  return (
    <Layout>
      <PageHeader
        align="center"
        title={lang === 'en' ? 'Testimonies' : 'Ushuhuda'}
        subtitle={lang === 'en'
          ? "Stories of God's faithfulness in our community"
          : 'Hadithi za uaminifu wa Mungu katika jamii yetu'}
      />

      <section className="section-padding bg-[#F7F1E6] border-y border-black/5">
        <div className="container-church">
          {safeTestimonials.length === 0 ? (
            <div className="text-center text-black/60 py-20">
              {lang === 'en'
                ? 'No testimonies available yet.'
                : 'Hakuna ushuhuda kwa sasa.'}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {safeTestimonials.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card-church bg-white shadow-soft border border-black/5"
                >
                  <Quote className="w-8 h-8 text-[#8A6A00] mb-3" />

                  {/* Testimony title */}
                  <h3 className="font-serif text-lg font-semibold text-black mb-2">
                    {item.title?.[lang]}
                  </h3>

                  {/* Testimony description */}
                  <p className="text-black/60 mb-4">
                    {item.description?.[lang]}
                  </p>

                  {/* Audio testimony */}
                  {item.audioUrl && (
                    <audio controls className="w-full mb-4">
                      <source src={item.audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  )}

                  <div className="border-t pt-3 flex items-center gap-3">
                    {(item as any).imageUrl ? <img src={(item as any).imageUrl} alt={item.name} className="h-10 w-10 rounded-full object-cover" /> : null}
                    <div>
                      <p className="font-semibold text-black">{item.name}</p>
                      <p className="text-sm text-black/60">{item.date}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default TestimonialsPage;
