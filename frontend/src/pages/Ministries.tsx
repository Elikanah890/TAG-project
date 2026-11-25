import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import LeaderAvatar from '@/components/LeaderAvatar';
import api from '@/lib/api';
import { ministries as staticMinistries } from '@/lib/churchData';
import { resolveMediaUrl } from '@/lib/media';
import { Target, Heart, Lightbulb, Users, Flame } from 'lucide-react';

type Lang = 'en' | 'sw';

type PublicLeader = {
  id: string;
  name: string;
  title: string;
  ministry: string | null;
  imageUrl: string | null;
  order: number;
};

const pillars = [
  { icon: Target, key: 'ministries.vision' as const },
  { icon: Heart, key: 'ministries.mission' as const },
  { icon: Lightbulb, key: 'ministries.purpose' as const },
] as const;

const MinistriesPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;

  const { data: cmsLeaders } = useQuery({
    queryKey: ['public-leaders'],
    queryFn: async () => (await api.get('/public/leaders')).data as PublicLeader[],
    staleTime: 30_000,
    retry: false,
  });
  const { data: cmsMinistries } = useQuery({
    queryKey: ['public-ministries'],
    queryFn: async () => (await api.get('/public/ministries')).data as any[],
    staleTime: 30_000,
    retry: false,
  });

  const ministries = (cmsMinistries && cmsMinistries.length > 0)
    ? cmsMinistries.map((m:any, idx:number) => ({
        id: m.slug || m.id,
        logo: resolveMediaUrl(m.logoUrl || m.imageUrl) || '/placeholder.svg',
        name: { en: m.name || '', sw: m.nameSw || m.name || '' },
        description: { en: m.description || '', sw: m.descriptionSw || m.description || '' },
        vision: { en: m.vision || '', sw: m.visionSw || m.vision || '' },
        mission: { en: m.mission || '', sw: m.missionSw || m.mission || '' },
        purpose: { en: m.purpose || '', sw: m.purposeSw || m.purpose || '' },
        revivalHistory: (m.revivalHistory || m.revivalHistorySw) ? { en: m.revivalHistory || '', sw: m.revivalHistorySw || m.revivalHistory || '' } : null,
        leaders: [],
        _order: m.order ?? idx,
      }))
    : staticMinistries;

  const leadersByMinistry = new Map<string, PublicLeader[]>();
  for (const leader of cmsLeaders ?? []) {
    if (!leader.ministry) continue;
    const list = leadersByMinistry.get(leader.ministry) ?? [];
    list.push(leader);
    leadersByMinistry.set(leader.ministry, list);
  }

  return (
    <Layout>
      <PageHeader
        label={lang === 'en' ? 'SERVE TOGETHER' : 'HUDUMIA PAMOJA'}
        title={lang === 'en' ? 'Our Ministries' : 'Huduma Zetu'}
        subtitle={lang === 'en'
          ? 'Serving God together through every department.'
          : 'Kumhudumia Mungu pamoja kupitia kila idara.'}
      />

      {/* Ministry index — jump navigation */}
      <nav
        aria-label={lang === 'en' ? 'Ministry index' : 'Orodha ya huduma'}
        className="border-b border-border bg-background"
      >
        <div className="container-church">
          <div className="flex snap-x gap-2 overflow-x-auto py-4 sm:gap-3">
            {ministries.map((ministry) => (
              <a
                key={ministry.id}
                href={`#${ministry.id}`}
                className="group flex w-24 shrink-0 snap-start flex-col items-center gap-2 rounded-xl border border-transparent px-2 py-3 transition-all hover:border-secondary/40 hover:bg-secondary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              >
                <img
                  src={ministry.logo || '/placeholder.svg'}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-110"
                />
                <span className="line-clamp-2 text-center text-[10px] font-medium leading-tight text-black/60 transition-colors group-hover:text-black">
                  {ministry.name?.[lang] || ministry.name?.en || ''}
                </span>
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Ministry cards */}
      <section className="section-padding bg-background border-b border-black/5">
        <div className="container-church space-y-6 md:space-y-10">
          {ministries.map((ministry, index) => {
            const reversed = index % 2 === 1;
            const revival =
              'revivalHistory' in ministry
                ? (ministry as { revivalHistory: { en: string; sw: string } }).revivalHistory?.[lang] || (ministry as any).revivalHistory?.en || ""
                : null;

            return (
              <motion.article
                key={ministry.id}
                id={ministry.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6 }}
                className="scroll-mt-24 overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow duration-300 hover:shadow-elevated"
              >
                <div className="grid grid-cols-1 lg:grid-cols-5">
                  {/* Identity panel */}
                  <div
                    className={`relative flex flex-col items-center justify-center gap-4 overflow-hidden bg-gradient-hero p-6 text-center sm:p-8 lg:col-span-2 ${
                      reversed ? 'lg:order-2' : ''
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-4 top-2 select-none font-serif text-7xl font-extrabold leading-none text-secondary/15"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-background/95 p-3 shadow-elevated ring-4 ring-secondary/40 sm:h-28 sm:w-28">
                      <img
                        src={ministry.logo || '/placeholder.svg'}
                        alt={`${ministry.name?.[lang] || ministry.name?.en || 'Ministry'} logo`}
                        loading="lazy"
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div>
                      <h2 className="font-serif text-xl font-bold leading-tight text-background sm:text-2xl">
                        {ministry.name?.[lang] || ministry.name?.en || ''}
                      </h2>
                      <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-gradient-gold" aria-hidden="true" />
                      <p className="mt-3 max-w-md text-xs leading-relaxed text-background/80 sm:text-sm">
                        {ministry.description?.[lang] || ministry.description?.en || ''}
                      </p>
                    </div>

                    {revival && (
                      <div className="flex max-w-xs items-start gap-2 rounded-lg border border-[#FFD600]/40 bg-[#FFD600]/10 px-3 py-2 text-left">
                        <Flame className="mt-0.5 h-4 w-4 shrink-0 text-[#FFD600]" aria-hidden="true" />
                        <p className="text-xs italic leading-snug text-white/85">
                          {revival?.[lang] || revival?.en || revival?.sw || ""}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Details panel */}
                  <div className={`flex flex-col gap-5 p-5 sm:p-7 lg:col-span-3 ${reversed ? 'lg:order-1' : ''}`}>
                    {/* Vision / Mission / Purpose */}
                    <div className="grid gap-3 sm:grid-cols-3">
                      {pillars.map((pillar) => (
                        <div
                          key={pillar.key}
                          className="flex flex-col gap-2 rounded-xl border border-border bg-background p-4"
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFD600] shadow-soft">
                              <pillar.icon
                                className="h-4 w-4 text-black"
                                strokeWidth={1.8}
                                aria-hidden="true"
                              />
                            </span>
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-black">
                              {t(pillar.key)}
                            </h3>
                          </div>
                          <p className="text-xs leading-snug text-black/60">
                            {pillar.key === 'ministries.vision'
                              ? (ministry.vision?.[lang] || ministry.vision?.en || "")
                              : pillar.key === 'ministries.mission'
                                ? (ministry.mission?.[lang] || ministry.mission?.en || "")
                                : (ministry.purpose?.[lang] || ministry.purpose?.en || "")}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Leaders */}
                    {(() => {
                      const dbLeaders = leadersByMinistry.get(ministry.id) ?? [];
                      const rows = dbLeaders.length > 0
                        ? dbLeaders.map((l) => ({ key: l.id, name: l.name, role: l.title, imageUrl: l.imageUrl }))
                        : (ministry.leaders ?? []).map((l, i) => ({ key: `${ministry.id}-${i}`, name: l.name, role: l.role?.[lang] || l.role?.en || l.role?.sw || '', imageUrl: l.image || null }));
                      if (rows.length === 0) return null;
                      return (
                      <div className="mt-auto border-t border-border pt-4">
                        <div className="mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#8A6A00]" aria-hidden="true" />
                          <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-black/60">
                            {t('ministries.leaders')}
                          </h3>
                        </div>

                        <div className="flex snap-x gap-4 overflow-x-auto pb-1">
                          {rows.map((leader) => (
                            <div
                              key={leader.key}
                              className="flex w-24 shrink-0 snap-start flex-col items-center gap-2 text-center"
                            >
                              <LeaderAvatar
                                name={leader.name}
                                imageUrl={leader.imageUrl}
                                className="h-16 w-16 border-2 border-secondary shadow-soft sm:h-[4.5rem] sm:w-[4.5rem]"
                                initialsClassName="text-base sm:text-lg"
                              />
                              <div>
                                <p className="text-xs font-semibold leading-tight text-black">
                                  {leader.name}
                                </p>
                                <p className="mt-0.5 text-[10px] leading-tight text-black/60">
                                  {leader.role}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                    })()}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>
    </Layout>
  );
};

export default MinistriesPage;
