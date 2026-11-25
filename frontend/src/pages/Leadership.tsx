import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowDown,
  BookOpenText,
  Bird,
  User,
  Phone,
  Mail,
  MessageCircle,
  HeartHandshake,
} from 'lucide-react';

import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { churchConfig, leadershipTeam } from '@/lib/churchData';
import { resolveMediaUrl } from '@/lib/media';
import { usePublicPage } from '@/lib/usePublicPage';

type Language = 'en' | 'sw';
type PublicLeader = { id: string; name: string; title: string; ministry?: string | null; bio?: string | null; imageUrl?: string | null; phone?: string | null; email?: string | null; order?: number };

const PastorCard = ({ name, role, bio, image, phone, email, whatsapp, index, t }: {
  name: string; role: string; bio: string; image: string; phone: string; email: string; whatsapp: string; index: number; t: (key: string) => string;
}) => {
  const contactButtons = [
    { icon: Phone, href: `tel:${phone.replace(/\s/g, '')}`, label: `${t('leadership.phone')} — ${name}` },
    { icon: Mail, href: `mailto:${email}`, label: `${t('leadership.email')} — ${name}` },
    { icon: MessageCircle, href: whatsapp, label: `${t('leadership.whatsapp')} — ${name}`, external: true },
  ].filter((b) => b.href && b.href !== 'tel:' && b.href !== 'mailto:');

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="card-church bg-white flex flex-col items-center gap-6 rounded-2xl border border-black/5 p-6 text-center shadow-soft transition-transform duration-300 hover:-translate-y-1 sm:flex-row sm:items-stretch sm:p-7 sm:text-left"
    >
      {image ? (
        <img src={image} alt={name} loading="lazy" className="h-52 w-40 shrink-0 self-center rounded-2xl border-4 border-secondary object-cover object-top shadow-soft sm:h-60 sm:w-48 lg:h-64 lg:w-52" />
      ) : (
        <div className="flex h-52 w-40 shrink-0 flex-col items-center justify-center gap-3 self-center rounded-2xl border-4 border-dashed border-secondary/50 bg-secondary/5 sm:h-60 sm:w-48 lg:h-64 lg:w-52" role="img" aria-label={`${name} — ${t('leadership.photoComingSoon')}`}>
          <User className="h-14 w-14 text-[#8A6A00]/70" strokeWidth={1.5} aria-hidden="true" />
          <span className="px-3 text-center text-[11px] font-semibold uppercase tracking-widest text-black/60">{t('leadership.photoComingSoon')}</span>
        </div>
      )}
      <div className="flex flex-1 flex-col items-center sm:items-start">
        <span className="inline-block rounded-full bg-gradient-gold px-5 py-1.5 text-xs font-bold uppercase tracking-wide text-[hsl(20_20%_15%)] shadow-gold sm:text-sm">{role}</span>
        <h3 className="mt-3 font-serif text-2xl font-bold text-black md:text-3xl">{name}</h3>
        {bio && <p className="mt-2 max-w-sm leading-relaxed text-black/60">{bio}</p>}
        <div className="my-4 h-1 w-24 rounded-full bg-gradient-gold" aria-hidden="true" />
        <div className="mt-auto flex items-center gap-3">
          {contactButtons.map((btn) => (
            <a key={btn.label} href={btn.href} {...(btn.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} aria-label={btn.label} className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:scale-110 hover:bg-burgundy-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary">
              <btn.icon className="h-5 w-5" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </motion.article>
  );
};

const LeadershipPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Language;
  const { data: settings = {} } = useQuery({ queryKey: ['site-settings-public'], queryFn: async () => (await api.get('/site-settings/public')).data, staleTime: 30_000, retry: false });
  const { data: cmsLeaders } = useQuery({ queryKey: ['public-leaders'], queryFn: async () => (await api.get('/public/leaders')).data as PublicLeader[], staleTime: 30_000, retry: false });
  const { data: page } = usePublicPage('leadership');
  const content = (page?.content || {}) as any;

  const fallbackPastors = leadershipTeam.slice(0, 2).map((p) => ({ id: String(p.id), name: p.name, title: p.role[lang], bio: p.bio[lang], imageUrl: p.image, phone: churchConfig.contact.phone, email: churchConfig.contact.email }));
  const cmsPastors = (cmsLeaders || []).filter((l) => !l.ministry || /pastor|senior|assistant|mchungaji/i.test(`${l.title} ${l.ministry || ''}`));
  const pastors = (cmsPastors.length > 0 ? cmsPastors : (cmsLeaders && cmsLeaders.length > 0 ? cmsLeaders.slice(0, 2) : fallbackPastors)).map((l: any) => ({
    id: l.id,
    name: l.name,
    title: l.title || l.role?.[lang] || '',
    bio: l.bio || '',
    imageUrl: resolveMediaUrl(l.imageUrl || l.image || ''),
    phone: l.phone || settings.contact_phone || churchConfig.contact.phone,
    email: l.email || settings.contact_email || churchConfig.contact.email,
  }));

  const scripture = lang === 'en' ? (content.scriptureEn || t('leadership.scripture')) : (content.scriptureSw || t('leadership.scripture'));
  const scriptureRef = lang === 'en' ? (content.scriptureRefEn || t('leadership.scriptureRef')) : (content.scriptureRefSw || t('leadership.scriptureRef'));
  const bannerText = lang === 'en' ? (content.bannerTextEn || t('leadership.together')) : (content.bannerTextSw || t('leadership.together'));

  return (
    <Layout>
      <PageHeader label={t('leadership.heroLabel')} title={t('leadership.heroTitleWhite')} accent={t('leadership.heroTitleGold')} subtitle={lang === 'en' ? (content.heroSubtitleEn || t('leadership.heroSubtitle')) : (content.heroSubtitleSw || t('leadership.heroSubtitle'))}>
        <a href="#meet-our-pastors" className="btn-secondary-church rounded-full px-7 py-4 text-base font-semibold">
          {t('leadership.knowMore')}
          <ArrowDown className="ml-2 h-4 w-4" aria-hidden="true" />
        </a>
      </PageHeader>

      <section className="bg-[#F7F1E6] pb-8 pt-10 sm:pt-14 border-y border-black/5">
        <div className="container-church">
          <motion.figure initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }} className="mx-auto flex max-w-5xl items-center gap-5 rounded-2xl border border-secondary/30 bg-secondary/10 p-5 shadow-soft sm:gap-8 sm:p-7">
            <BookOpenText className="hidden h-12 w-12 shrink-0 text-primary sm:block" strokeWidth={1.5} aria-hidden="true" />
            <span className="hidden h-14 w-px shrink-0 bg-secondary/50 sm:block" aria-hidden="true" />
            <blockquote className="flex-1 text-center sm:text-left">
              <p className="font-serif text-base italic leading-relaxed text-black sm:text-lg">{scripture}</p>
              <figcaption className="mt-2 text-[11px] font-bold uppercase tracking-[0.3em] text-[#8A6A00] sm:text-xs">{scriptureRef}</figcaption>
            </blockquote>
            <Bird className="hidden h-12 w-12 shrink-0 text-[#8A6A00] md:block" strokeWidth={1.5} aria-hidden="true" />
          </motion.figure>
        </div>
      </section>

      <section id="meet-our-pastors" className="scroll-mt-24 bg-background pb-16 pt-10 md:pb-24 border-b border-black/5">
        <div className="container-church">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }} className="mb-10 text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-12 bg-secondary sm:w-20" aria-hidden="true" />
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#8A6A00] sm:text-sm">{t('leadership.pastorsLabel')}</p>
              <span className="h-px w-12 bg-secondary sm:w-20" aria-hidden="true" />
            </div>
            <h2 className="mt-3 font-serif text-4xl font-extrabold text-black sm:text-5xl">{t('leadership.meetOurPastors')}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-black/60">{lang === 'en' ? (content.pastorsSubtitleEn || t('leadership.pastorsSubtitle')) : (content.pastorsSubtitleSw || t('leadership.pastorsSubtitle'))}</p>
          </motion.div>

          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2 lg:gap-8">
            {pastors.map((pastor, index) => (
              <PastorCard key={pastor.id} name={pastor.name} role={pastor.title} bio={pastor.bio} image={pastor.imageUrl} phone={pastor.phone} email={pastor.email} whatsapp={settings.social_whatsapp || churchConfig.social.whatsapp} index={index} t={t} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-hero py-14 md:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -left-20 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-secondary blur-3xl" />
          <div className="absolute -right-20 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-secondary blur-3xl" />
        </div>
        <div className="container-church relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }} className="flex flex-col items-center justify-center gap-6 text-center md:flex-row md:gap-10 md:text-left">
            <HeartHandshake className="h-16 w-16 shrink-0 text-secondary sm:h-20 sm:w-20" strokeWidth={1.4} aria-hidden="true" />
            <span className="hidden h-16 w-px shrink-0 bg-secondary/50 md:block" aria-hidden="true" />
            <p className="max-w-2xl font-serif text-2xl italic leading-snug text-white sm:text-3xl">{bannerText}</p>
            <Link to="/contact" className="shrink-0">
              <Button className="btn-primary-church rounded-full px-8 py-5 text-base font-semibold">
                {t('leadership.joinOurChurch')}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default LeadershipPage;
