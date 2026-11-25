import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Youtube 
} from 'lucide-react';
import { churchConfig } from '@/lib/churchData';

// Custom icons for WhatsApp and TikTok
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const Footer = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'sw';

  const quickLinks = [
    { path: '/about', label: t('nav.about') },
    { path: '/ministries', label: t('nav.ministries') },
    { path: '/sermons', label: lang === 'sw' ? 'Mahubiri' : 'Sermons' },
    { path: '/giving', label: t('nav.giving') },
    { path: '/contact', label: t('nav.contact') },
  ];

  const connectLinks = [
    { path: '/testimonials', label: t('nav.testimonials') },
    { path: '/schedule', label: t('nav.schedule') },
  ];

  const socialLinks = [
    { href: churchConfig.social.whatsapp, icon: WhatsAppIcon, label: 'WhatsApp' },
    { href: churchConfig.social.youtube, icon: Youtube, label: 'YouTube' },
    { href: churchConfig.social.instagram, icon: Instagram, label: 'Instagram' },
    { href: churchConfig.social.facebook, icon: Facebook, label: 'Facebook' },
    { href: churchConfig.social.tiktok, icon: TikTokIcon, label: 'TikTok' },
  ];

  return (
    <footer className="bg-black text-white">
      <div className="container-church py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Church Info */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
                <img
                  src="/logos/logo.png"
                  alt="Church Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg">{churchConfig.name}</h3>
              </div>
            </Link>
            <p className="text-white/80 mb-6">
              {churchConfig.tagline[lang]}
            </p>
            <div className="space-y-3">
              <a 
                href={`tel:${churchConfig.contact.phone}`}
                className="flex items-center gap-3 text-white/80 hover:text-[#FFD600] transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>{churchConfig.contact.phoneDisplay}</span>
              </a>
              <a 
                href={`mailto:${churchConfig.contact.email}`}
                className="flex items-center gap-3 text-white/80 hover:text-[#FFD600] transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>{churchConfig.contact.email}</span>
              </a>
              <div className="flex items-start gap-3 text-white/80">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>{lang === 'en' ? churchConfig.location.address : churchConfig.location.addressSw}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-6 text-[#FFD600]">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-white/80 hover:text-black transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-6 text-[#FFD600]">{t('footer.connect')}</h4>
            <ul className="space-y-3">
              {connectLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-white/80 hover:text-black transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#FFD600] hover:text-black transition-all"
                  aria-label={social.label}
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-black/10">
        <div className="container-church py-6">
          <p className="text-center text-white/70 text-sm">
            © {new Date().getFullYear()} {churchConfig.name}. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
