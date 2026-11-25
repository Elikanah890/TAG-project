import { API_ORIGIN } from '@/lib/api';

export const resolveMediaUrl = (url?: string | null): string => {
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url;
  const normalized = url.startsWith('/') ? url : `/${url}`;
  // Backend-served uploads/media need API origin; frontend public assets (e.g. /logos, /hero) do not.
  if (normalized.startsWith('/uploads/')) return `${API_ORIGIN}${normalized}`;
  // Public logo filenames are lowercase in /public/logos on case-sensitive filesystems.
  if (normalized.toLowerCase().startsWith('/logos/')) {
    const lower = normalized.toLowerCase();
    const logoAliases: Record<string, string> = {
      '/logos/youth.png': '/logos/cas.png',
      '/logos/ca.png': '/logos/cas.png',
      '/logos/wato.png': '/logos/children.png',
      '/logos/watoto.png': '/logos/children.png',
    };
    return logoAliases[lower] || lower;
  }
  return normalized;
};
