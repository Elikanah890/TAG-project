import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { PageHeader, SectionCard, LoadingBlock, ErrorBlock } from '@/components/admin/access/AccessUI';
import { Globe, Layout, FileText, Users, Building2, CalendarDays, Mic, CalendarCheck, Newspaper, Quote, HeartHandshake, Phone, Image, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function CmsDashboard() {
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ['cms-pages'], queryFn: async () => (await api.get('/cms/pages')).data });
  const pages = Array.isArray(data) ? data : [];
  const bySlug = new Map(pages.map((p: any) => [p.slug, p]));

  const quickActions = [
    { to: '/cms/homepage', label: 'Homepage', icon: Layout, desc: 'Hero & home content' },
    { to: '/cms/about', label: 'About Page', icon: FileText, desc: 'History, vision, mission' },
    { to: '/cms/leadership', label: 'Leadership', icon: Users, desc: 'Leaders & staff' },
    { to: '/cms/ministries', label: 'Ministries', icon: Building2, desc: 'Church departments' },
    { to: '/cms/schedule', label: 'Schedule', icon: CalendarDays, desc: 'Service times' },
    { to: '/cms/sermons', label: 'Sermons', icon: Mic, desc: 'Messages & media' },
    { to: '/cms/events', label: 'Events', icon: CalendarCheck, desc: 'Upcoming events' },
    { to: '/cms/news', label: 'News', icon: Newspaper, desc: 'Announcements & news' },
    { to: '/cms/testimonials', label: 'Testimonials', icon: Quote, desc: 'Member testimonies' },
    { to: '/cms/giving', label: 'Giving', icon: HeartHandshake, desc: 'Accounts & giving info' },
    { to: '/cms/contact', label: 'Contact', icon: Phone, desc: 'Contact page content' },
    { to: '/cms/media', label: 'Media', icon: Image, desc: 'Photos & files' },
    { to: '/cms/settings', label: 'Site Settings', icon: Settings, desc: 'Global church settings' },
  ];

  if (isLoading) return <LoadingBlock label="Loading CMS dashboard..." />;
  if (isError) return <ErrorBlock message={(error as any)?.response?.data?.message} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Website CMS" title="Website Content Dashboard" description="Manage all public website pages and content. All public pages can be controlled from here." actions={<Button asChild variant="outline"><a href="/" target="_blank" rel="noreferrer"><Globe className="mr-2 h-4 w-4" /> View site</a></Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {quickActions.map((action) => (
          <Link key={action.to} to={action.to} className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#7A1F2B]/10 text-[#7A1F2B]"><action.icon className="h-5 w-5" /></div>
            <div className="min-w-0"><p className="font-medium text-gray-800 group-hover:text-[#7A1F2B]">{action.label}</p><p className="text-xs text-gray-500">{action.desc}</p></div>
          </Link>
        ))}
      </div>
      <SectionCard title="Page Records" description="CMS page records (slug-based content). Published records are used by public pages where integrated.">
        <div className="space-y-2">
          {['home', 'about', 'schedule', 'giving', 'contact'].map((slug) => {
            const p: any = bySlug.get(slug);
            return (
              <div key={slug} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm">
                <div><p className="font-medium text-gray-800">{slug}</p><p className="text-xs text-gray-500">{p?.title || 'Using default content until saved'}</p></div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${p?.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : p ? 'bg-[#C9962B]/10 text-[#A9771F]' : 'bg-gray-100 text-gray-500'}`}>{p?.status || 'DEFAULT'}</span>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
