import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import api from '@/lib/api';
import { givingAccounts as fallback } from '@/lib/churchData';
import { Heart, Landmark, Phone, HandCoins, PiggyBank, Building2 } from 'lucide-react';

const categoryIcons: Record<string, any> = { sadaka: HandCoins, akiba: PiggyBank, miradi: Building2 };

const GivingPage = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'sw';
  const { data: page } = useQuery({ queryKey: ['public-page', 'giving'], queryFn: async () => (await api.get('/public/page?slug=giving')).data, staleTime: 30000 });
  const { data: settings = {} } = useQuery({ queryKey: ['site-settings-public'], queryFn: async () => (await api.get('/site-settings/public')).data, staleTime: 30000 });
  const content = page?.content || {};
  const categories = Array.isArray(content.categories) && content.categories.length ? content.categories : fallback.categories.map((c: any) => ({ ...c, titleEn: c.title.en, titleSw: c.title.sw, descriptionEn: c.description.en, descriptionSw: c.description.sw, sectionEn: c.section?.en, sectionSw: c.section?.sw }));
  const churchName = settings.giving_church_name || fallback.churchName;
  const contactPhone = settings.giving_contact_phone || fallback.contactPhone;
  const contactLabel = lang === 'en' ? (settings.giving_contact_label_en || fallback.contactLabel.en) : (settings.giving_contact_label_sw || fallback.contactLabel.sw);
  const intro = lang === 'en' ? (content.introEn || 'Give through the official church accounts below to support offerings, savings, and ministry projects.') : (content.introSw || 'Toa kupitia akaunti rasmi za kanisa zilizo hapa chini kusaidia sadaka, akiba, na miradi ya huduma.');
  const note = lang === 'en' ? (settings.giving_note_en || 'Please confirm the purpose of your giving (Sadaka, Akiba, or Miradi) when making a transfer so it can be recorded correctly.') : (settings.giving_note_sw || 'Tafadhali hakikisha unaonyesha madhumuni ya mchango wako (Sadaka, Akiba, au Miradi) unapofanya malipo ili urejeshwe kwa usahihi.');

  return (
    <Layout>
      <PageHeader label={lang === 'en' ? 'GIVE & SUPPORT' : 'TOA & UNGA MKONO'} title={lang === 'en' ? 'Support Our Ministry' : 'Unga Mkono Huduma Yetu'} subtitle={intro} />
      <section className="section-padding bg-background border-b border-black/5">
        <div className="container-church max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 md:p-10 text-white shadow-elevated mb-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--secondary)/0.35),transparent_35%),radial-gradient(circle_at_bottom_left,hsl(var(--church-gold-light)/0.18),transparent_30%)]" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#FFD600] px-4 py-1.5 text-sm font-semibold text-black mb-4"><Heart className="h-4 w-4" aria-hidden="true" /><span>{lang === 'en' ? 'Official Giving Accounts' : 'Akaunti Rasmi za Sadaka'}</span></div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2 text-white">{churchName}</h2>
                <p className="text-white/80 max-w-2xl">{intro}</p>
              </div>
              <a href={`tel:${String(contactPhone).replace(/\s+/g, '')}`} className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white px-5 py-4 text-black transition-colors hover:bg-[#FFF9D6]">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"><Phone className="h-5 w-5" aria-hidden="true" /></span>
                <span><span className="block text-xs uppercase tracking-wider text-black/60">{contactLabel}</span><span className="block text-lg font-semibold text-[#8A6A00]">{contactPhone}</span></span>
              </a>
            </div>
          </motion.div>
          <div className="grid gap-6 lg:grid-cols-3">
            {categories.map((category: any, index: number) => {
              const Icon = categoryIcons[category.id] ?? Landmark;
              const title = lang === 'en' ? (category.titleEn || category.title?.en) : (category.titleSw || category.title?.sw);
              const desc = lang === 'en' ? (category.descriptionEn || category.description?.en) : (category.descriptionSw || category.description?.sw);
              const section = lang === 'en' ? (category.sectionEn || category.section?.en) : (category.sectionSw || category.section?.sw);
              return (
                <motion.div key={category.id || index} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="card-church bg-white shadow-soft relative overflow-hidden border border-secondary/20">
                  <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-secondary/10" />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div>{section ? <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6A00] mb-2">{section}</p> : null}<h3 className="font-serif text-2xl font-semibold text-black mb-2">{title}</h3><p className="text-sm text-black/60">{desc}</p></div>
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-gold text-secondary-foreground shadow-gold"><Icon className="h-6 w-6" aria-hidden="true" /></span>
                    </div>
                    <div className="space-y-3">
                      {(category.accounts || []).map((account: any, ai: number) => (
                        <div key={`${category.id}-${ai}`} className="rounded-2xl border border-black/10 bg-black/[0.03] p-4">
                          <div className="flex items-center justify-between gap-3 mb-2"><div className="flex items-center gap-2"><Landmark className="h-4 w-4 text-[#8A6A00]" aria-hidden="true" /><span className="text-sm font-semibold uppercase tracking-wide text-primary">{account.bank}</span></div><span className="rounded-full bg-secondary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">{lang === 'en' ? 'Bank Account' : 'Akaunti ya Benki'}</span></div>
                          <p className="font-mono text-lg md:text-xl font-semibold tracking-wider text-black break-all">{account.number}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-10 rounded-2xl border border-primary/10 bg-primary/5 p-6 md:p-7 text-center"><p className="text-sm md:text-base text-black/60">{note}</p></motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default GivingPage;
