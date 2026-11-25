import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Typewriter from 'typewriter-effect';
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Users,
  Heart,
  BookOpen,
  Play,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { churchConfig } from '@/lib/churchData';

const DEFAULT_HERO_IMAGES = [
  '/hero/hero-1.jpg',
  '/hero/hero-2.jpg',
  '/hero/hero-3.jpg',
  '/hero/hero-4.jpg',
  '/hero/hero-5.jpg',
  '/hero/hero-6.jpg',
  '/hero/hero-7.jpg',
];

const AUTOPLAY_MS = 4000;
const FADE_S = 1.2;
const TYPE_DONE = 4;

const HeroSection = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'sw';
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const { data: siteSettings = {} } = useQuery({
    queryKey: ['site-settings-public'],
    queryFn: async () => (await api.get('/site-settings/public')).data,
    staleTime: 0,
  });
  let HERO_IMAGES = DEFAULT_HERO_IMAGES;
  try {
    const parsed = siteSettings.hero_images_json ? JSON.parse(siteSettings.hero_images_json) : [];
    if (Array.isArray(parsed) && parsed.filter(Boolean).length > 0) HERO_IMAGES = parsed.filter(Boolean);
  } catch {}

  const titleLine1 = siteSettings.hero_title_line1 || 'T.A.G FOREST YA';
  const titleLine2 = siteSettings.hero_title_line2 || 'KWANZA';
  const heroSubtitle =
    (lang === 'sw' ? siteSettings.hero_subtitle_sw : siteSettings.hero_subtitle_en) ||
    t('hero.subtitle');
  const watchUrl = siteSettings.hero_watch_url || siteSettings.social_youtube || churchConfig.social.youtube;

  // Sequential typewriter state machine: 0 = "Welcome to", 1 = "T.A.G FOREST YA",
  // 2 = "KWANZA", 3 = tagline, 4 = done (paragraph + CTAs fade in)
  const [step, setStep] = useState(() => (reduceMotion ? TYPE_DONE : 0));
  const done = step >= TYPE_DONE;
  const timers = useRef<number[]>([]);
  const scheduleNext = useCallback((next: number, pauseMs = 600) => {
    const id = window.setTimeout(() => setStep(next), pauseMs);
    timers.current.push(id);
  }, []);
  useEffect(
    () => () => timers.current.forEach((id) => window.clearTimeout(id)),
    []
  );
  const reveal = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay },
        };

  const goTo = useCallback(
    (index: number) => setActive(((index % HERO_IMAGES.length) + HERO_IMAGES.length) % HERO_IMAGES.length),
    []
  );
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setInterval(
      () => setActive((a) => (a + 1) % HERO_IMAGES.length),
      AUTOPLAY_MS
    );
    return () => window.clearInterval(id);
  }, [paused, reduceMotion, active]);

  const quickLinks = [
    { icon: CalendarDays, label: t('home.quickSchedule'), to: '/schedule' },
    { icon: Users, label: t('home.quickMinistries'), to: '/ministries' },
    { icon: Heart, label: t('home.quickGiving'), to: '/giving' },
    { icon: BookOpen, label: t('home.quickBible'), href: watchUrl },
  ];

  return (
    <section
      className="relative flex min-h-[88vh] items-center overflow-hidden bg-neutral-900 lg:min-h-[92vh]"
      aria-roledescription="carousel"
      aria-label="T.A.G FOREST YA KWANZA — hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Slideshow — full-bleed image */}
      <div className="absolute inset-0">
        {HERO_IMAGES.map((src, i) => {
          const isActive = i === active;
          return (
            <motion.img
              key={src}
              src={src}
              alt={isActive ? 'Congregation worshipping at T.A.G FOREST YA KWANZA church in Mbeya City' : ''}
              aria-hidden={!isActive}
              draggable={false}
              loading={i === 0 ? 'eager' : 'lazy'}
              className="absolute inset-0 h-full w-full object-cover object-center"
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                scale: reduceMotion ? 1 : isActive ? 1.08 : 1.02,
              }}
              transition={{
                opacity: { duration: reduceMotion ? 0 : FADE_S, ease: 'easeInOut' },
                scale: { duration: AUTOPLAY_MS / 1000 + FADE_S, ease: 'linear' },
              }}
              style={{ zIndex: isActive ? 2 : 1 }}
            />
          );
        })}
        {/* Dark neutral overlay for legibility */}
        <div className="absolute inset-0 z-[3] bg-gradient-to-r from-neutral-900/75 via-neutral-900/55 to-neutral-900/30" />
      </div>

      {/* Prev / Next arrows */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous hero image"
        className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-md transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD600] sm:h-11 sm:w-11"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next hero image"
        className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-md transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD600] sm:h-11 sm:w-11"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Content */}
      <div className="container-church relative z-[5] w-full">
        <div className="max-w-2xl pb-24 pt-12 sm:pb-28 lg:pb-20">
          <div>
            {/* Step 1 — "Welcome to" badge is typed first */}
            <div className="mb-5 flex h-10 items-center">
              {reduceMotion || step > 0 ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 font-serif text-sm font-semibold tracking-wide text-black shadow-sm">
                  <Sparkles className="h-4 w-4 text-[#FFD600]" aria-hidden="true" />
                  {siteSettings.hero_welcome || t('hero.welcome')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 font-serif text-sm font-semibold tracking-wide text-black shadow-sm">
                  <Sparkles className="h-4 w-4 text-[#FFD600]" aria-hidden="true" />
                  <Typewriter
                    options={{
                      autoStart: false,
                      loop: false,
                      delay: 45,
                      cursor: '|',
                    }}
                    onInit={(tw) => {
                      tw.typeString(siteSettings.hero_welcome || t('hero.welcome'))
                        .callFunction(() => scheduleNext(1, 500))
                        .start();
                    }}
                  />
                </span>
              )}
            </div>

            {/* Steps 2 & 3 — the headline types across two lines, then KWANZA */}
            <h1 className="font-serif font-extrabold leading-[1.02] tracking-tight">
              <span className="block min-h-[1.02em] text-4xl text-white sm:text-5xl xl:text-6xl">
                {reduceMotion || step > 1 ? (
                  titleLine1
                ) : step === 1 ? (
                  <Typewriter
                    options={{ autoStart: false, loop: false, delay: 45, cursor: '|' }}
                    onInit={(tw) => {
                      tw.typeString(titleLine1).callFunction(() => scheduleNext(2, 250)).start();
                    }}
                  />
                ) : (
                  ''
                )}
              </span>
              <span className="block min-h-[1.02em] text-6xl text-[#FFD600] sm:text-7xl xl:text-8xl">
                {reduceMotion || step > 2 ? (
                  titleLine2
                ) : step === 2 ? (
                  <Typewriter
                    options={{ autoStart: false, loop: false, delay: 45, cursor: '|' }}
                    onInit={(tw) => {
                      tw.typeString(titleLine2).callFunction(() => scheduleNext(3, 600)).start();
                    }}
                  />
                ) : (
                  ''
                )}
              </span>
            </h1>

            {/* Step 4 — tagline types last */}
            <div className="mt-4 min-h-[3.5em] font-serif text-lg italic leading-snug text-white/90 sm:min-h-[1.5em] sm:text-xl">
              {reduceMotion || done ? (
                siteSettings.hero_tagline || t('hero.tagline')
              ) : step === 3 ? (
                <Typewriter
                  options={{ autoStart: false, loop: false, delay: 40, cursor: '|' }}
                  onInit={(tw) => {
                    tw.typeString(siteSettings.hero_tagline || t('hero.tagline')).callFunction(() => setStep(TYPE_DONE)).start();
                  }}
                />
              ) : (
                ''
              )}
            </div>

            {/* After typing completes — paragraph, then buttons */}
            <div className="mt-4 max-w-lg">
              {(reduceMotion || done) && (
                <motion.p {...reveal(0)} className="text-base leading-relaxed text-white/80 sm:text-lg">
                  {heroSubtitle}
                </motion.p>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {(reduceMotion || done) && (
                <motion.div {...reveal(0.2)} className="flex flex-wrap items-center gap-4">
                  <Link to="/giving">
                    <Button className="rounded-lg bg-[#FFD600] px-7 py-6 text-base font-semibold text-black shadow-md hover:bg-[#E6C000]">
                      <Heart className="mr-2 h-5 w-5" aria-hidden="true" />
                      {t('giving.giveNow') || 'Give Now'}
                    </Button>
                  </Link>
                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-white bg-white px-7 py-3.5 font-semibold text-black transition hover:border-[#FFD600] hover:bg-[#FFD600]"
                  >
                    <Play className="h-5 w-5 fill-current" aria-hidden="true" />
                    {t('hero.watchLive')}
                  </a>
                </motion.div>
              )}
            </div>

            {/* Quick links */}
            <div className="mt-8 min-h-[7rem] sm:min-h-[4.5rem]">
              {(reduceMotion || done) && (
                <motion.nav
                  {...reveal(0.4)}
                  aria-label="Quick links"
                  className="flex max-w-md flex-wrap items-center gap-y-4"
                >
              {quickLinks.map((item, i) => {
                const inner = (
                  <span className="flex w-20 flex-col items-center gap-2 text-center sm:w-24">
                    <item.icon
                      className="h-6 w-6 text-[#FFD600]"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    <span className="text-[11px] font-medium leading-tight text-white sm:text-xs">
                      {item.label}
                    </span>
                  </span>
                );
                const divider =
                  i < quickLinks.length - 1 ? (
                    <span
                      key="divider"
                      aria-hidden="true"
                      className="mx-1 hidden h-10 w-px bg-white/25 sm:block"
                    />
                  ) : null;
                const linkClass =
                  'rounded-lg bg-black p-1.5 transition hover:bg-[#1F1F1F] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD600]';
                return (
                  <span key={item.label} className="flex items-center">
                    {'to' in item && item.to ? (
                      <Link to={item.to} className={linkClass}>
                        {inner}
                      </Link>
                    ) : (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        {inner}
                      </a>
                    )}
                    {divider}
                  </span>
                );
              })}
                </motion.nav>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dots + progress */}
      <div className="absolute inset-x-0 bottom-16 z-10 flex flex-col items-center gap-2 lg:bottom-[4.5rem]">
        <div className="flex items-center gap-2.5" role="tablist" aria-label="Hero slides">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === active}
              aria-label={`Slide ${i + 1} of ${HERO_IMAGES.length}`}
              onClick={() => goTo(i)}
              className={`h-2.5 rounded-full transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${
                i === active
                  ? 'w-7 bg-secondary'
                  : 'w-2.5 bg-background/60 hover:bg-background/85'
              }`}
            />
          ))}
        </div>
        {/* Thin gold progress bar */}
        <div className="h-[3px] w-40 overflow-hidden rounded-full bg-background/15">
          {!reduceMotion && !paused && (
            <motion.div
              key={active}
              className="h-full bg-gradient-gold"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
