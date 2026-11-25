import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { churchConfig } from '@/lib/churchData';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const nextLang = i18n.resolvedLanguage === 'en' || i18n.language === 'en' ? 'sw' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const { data: siteSettings = {} } = useQuery({
    queryKey: ['site-settings-public'],
    queryFn: async () => (await api.get('/site-settings/public')).data,
    staleTime: 0,
  });

  const navLinks = [
    { path: '/', label: siteSettings.nav_home_label || t('nav.home') },
    { path: '/about', label: t('nav.about') },
    { path: '/leadership', label: t('nav.leadership') },
    { path: '/ministries', label: t('nav.ministries') },
    { path: '/schedule', label: t('nav.schedule') },
    { path: '/news', label: t('nav.news') },
    { path: '/giving', label: t('nav.giving') },
    { path: '/contact', label: t('nav.contact') },
  ];

  const moreLinks = [
    { path: '/sermons', label: i18n.language === 'sw' ? 'Mahubiri' : 'Sermons' },
    { path: '/testimonials', label: t('nav.testimonials') },
    { path: '/register', label: 'Register' },
  ];

  const brandWords = churchConfig.shortName.split(' ');

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur-md transition-shadow duration-300 ${
        isScrolled ? 'shadow-sm' : 'shadow-none'
      }`}
    >
      <nav className="container-church">
        <div className="flex h-16 items-center justify-between gap-3 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-full sm:h-9 sm:w-9 lg:h-10 lg:w-10">
              <img
                src="/logos/logo.png"
                alt="Church Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="block shrink-0">
              <h1 className="font-serif text-[10px] font-bold uppercase leading-[1.15] tracking-wide text-black sm:text-[11px] lg:text-xs">
                <span className="block">{brandWords.slice(0, 2).join(' ')}</span>
                <span className="block">{brandWords.slice(2).join(' ')}</span>
              </h1>
              <p className="mt-0.5 hidden text-[9px] uppercase tracking-[0.18em] text-black/50 min-[400px]:block">Church</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex 2xl:gap-1">
            {navLinks.slice(0, 8).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`whitespace-nowrap rounded-md px-2 py-2 text-xs font-medium transition-colors 2xl:px-3 2xl:text-sm ${
                  isActive(link.path)
                    ? 'text-black bg-[#FFD600]/25 font-semibold'
                    : 'text-black/70 hover:text-black hover:bg-black/5'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-2 text-xs font-medium text-black/70 hover:bg-black/5 hover:text-black 2xl:px-3 2xl:text-sm">
                More <ChevronDown className="w-4 h-4" />
              </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {[...navLinks.slice(8), ...moreLinks].map((link) => (
                  <DropdownMenuItem key={link.path} asChild>
                    <Link to={link.path} className="w-full">
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Actions */}
          <div className="flex shrink-0 items-center gap-1.5">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2 text-xs 2xl:text-sm"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{i18n.resolvedLanguage === 'en' || i18n.language === 'en' ? 'SW' : 'EN'}</span>
            </Button>

            <Link to="/login" className="hidden md:block">
              <Button variant="ghost" size="sm" className="px-2 text-xs 2xl:text-sm">Login</Button>
            </Link>
            <Link to="/register" className="hidden md:block">
              <Button variant="outline" size="sm" className="whitespace-nowrap border-black/20 px-3 text-xs hover:bg-black hover:text-white 2xl:text-sm">Register</Button>
            </Link>
            {/* Give Button */}
            <Link to="/giving" className="hidden sm:block">
              <Button className="whitespace-nowrap rounded-lg bg-[#FFD600] px-4 text-xs font-semibold text-black shadow-sm hover:bg-[#E6C000] 2xl:text-sm">
                {t('giving.giveNow')}
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="xl:hidden p-2 rounded-md text-black hover:bg-muted"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? (i18n.resolvedLanguage === 'en' || i18n.language === 'en' ? 'Close menu' : 'Funga menyu') : (i18n.resolvedLanguage === 'en' || i18n.language === 'en' ? 'Open menu' : 'Fungua menyu')}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden overflow-hidden border-t border-border bg-background/95 backdrop-blur-md shadow-soft"
            >
              <div className="py-4 space-y-1 border-t border-border max-h-[75vh] overflow-y-auto">
                {[...navLinks, ...moreLinks].map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 text-base font-medium rounded-md transition-colors ${
                      isActive(link.path)
                        ? 'text-black bg-[#FFD600]/25 font-semibold'
                        : 'text-black/70 hover:text-black hover:bg-black/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 px-4">
                  <Link to="/giving" onClick={() => setIsOpen(false)}>
                    <Button className="w-full rounded-lg bg-[#FFD600] font-semibold text-black hover:bg-[#E6C000]">
                      {t('giving.giveNow')}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Navbar;
