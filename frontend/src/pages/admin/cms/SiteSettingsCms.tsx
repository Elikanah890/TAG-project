import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader, SectionCard, LoadingBlock, ErrorBlock } from '@/components/admin/access/AccessUI';
import { Save } from 'lucide-react';

const FIELDS: Array<{ key: string; label: string; type?: 'textarea'; section: string }> = [
  { section: 'Navigation', key: 'nav_home_label', label: 'Home Label' },
  { section: 'Navigation', key: 'nav_about_label', label: 'About Label' },
  { section: 'Navigation', key: 'nav_leadership_label', label: 'Leadership Label' },
  { section: 'Navigation', key: 'nav_ministries_label', label: 'Ministries Label' },
  { section: 'Navigation', key: 'nav_schedule_label', label: 'Schedule Label' },
  { section: 'Navigation', key: 'nav_news_label', label: 'News Label' },
  { section: 'Navigation', key: 'nav_giving_label', label: 'Giving Label' },
  { section: 'Navigation', key: 'nav_contact_label', label: 'Contact Label' },
  { section: 'Navigation', key: 'nav_testimonials_label', label: 'Testimonials Label' },
  { section: 'Navigation', key: 'nav_register_label', label: 'Register Button Label' },
  { section: 'Navigation', key: 'nav_login_label', label: 'Login Button Label' },
  { section: 'Navigation', key: 'nav_give_label', label: 'Give Now Button Label' },
  { section: 'Church Identity', key: 'church_name', label: 'Church Name' },
  { section: 'Church Identity', key: 'church_short_name', label: 'Short Name' },
  { section: 'Church Identity', key: 'church_tagline_en', label: 'Tagline (English)' },
  { section: 'Church Identity', key: 'church_tagline_sw', label: 'Tagline (Swahili)' },
  { section: 'Church Identity', key: 'church_logo_url', label: 'Logo URL (navbar/footer)' },
  { section: 'Contact', key: 'contact_phone', label: 'Phone' },
  { section: 'Contact', key: 'contact_phone_display', label: 'Phone Display' },
  { section: 'Contact', key: 'contact_email', label: 'Email' },
  { section: 'Contact', key: 'contact_address_en', label: 'Address (English)' },
  { section: 'Contact', key: 'contact_address_sw', label: 'Address (Swahili)' },
  { section: 'Contact', key: 'contact_city', label: 'City' },
  { section: 'Contact', key: 'contact_country', label: 'Country' },
  { section: 'Contact', key: 'office_hours_en', label: 'Office Hours (English)' },
  { section: 'Contact', key: 'office_hours_sw', label: 'Office Hours (Swahili)' },
  { section: 'Contact', key: 'map_embed_url', label: 'Map Embed URL', type: 'textarea' },
  { section: 'Social Links', key: 'social_whatsapp', label: 'WhatsApp URL' },
  { section: 'Social Links', key: 'social_youtube', label: 'YouTube URL' },
  { section: 'Social Links', key: 'social_instagram', label: 'Instagram URL' },
  { section: 'Social Links', key: 'social_facebook', label: 'Facebook URL' },
  { section: 'Social Links', key: 'social_tiktok', label: 'TikTok URL' },
  { section: 'Giving', key: 'giving_church_name', label: 'Giving Church Name' },
  { section: 'Giving', key: 'giving_contact_label_en', label: 'Giving Contact Label (English)' },
  { section: 'Giving', key: 'giving_contact_label_sw', label: 'Giving Contact Label (Swahili)' },
  { section: 'Giving', key: 'giving_contact_phone', label: 'Giving Contact Phone' },
  { section: 'Giving', key: 'giving_note_en', label: 'Giving Note (English)', type: 'textarea' },
  { section: 'Giving', key: 'giving_note_sw', label: 'Giving Note (Swahili)', type: 'textarea' },
  { section: 'Giving', key: 'giving_banner_title_en', label: 'Home Giving Banner Title (EN)' },
  { section: 'Giving', key: 'giving_banner_title_sw', label: 'Home Giving Banner Title (SW)' },
  { section: 'Giving', key: 'giving_banner_desc_en', label: 'Home Giving Banner Desc (EN)', type: 'textarea' },
  { section: 'Giving', key: 'giving_banner_desc_sw', label: 'Home Giving Banner Desc (SW)', type: 'textarea' },
  { section: 'Homepage', key: 'home_about_image', label: 'Home About Image URL' },
  { section: 'Homepage', key: 'home_about_stat_value', label: 'Home About Stat Value' },
  { section: 'Homepage', key: 'home_about_stat_label_en', label: 'Home About Stat Label (EN)' },
  { section: 'Homepage', key: 'home_about_stat_label_sw', label: 'Home About Stat Label (SW)' },
  { section: 'Homepage', key: 'home_values_json', label: 'Home Values JSON (array of {icon,titleEn,titleSw,descEn,descSw})', type: 'textarea' },
  { section: 'Footer', key: 'footer_description_en', label: 'Footer Description (English)', type: 'textarea' },
  { section: 'Footer', key: 'footer_description_sw', label: 'Footer Description (Swahili)', type: 'textarea' },
  { section: 'Footer', key: 'footer_copyright_text', label: 'Footer Copyright Text' },
];

export default function SiteSettingsCms() {
  const qc = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ['site-settings-admin'], queryFn: async () => (await api.get('/site-settings/admin')).data });
  const [form, setForm] = useState<Record<string, string>>({});
  useEffect(() => { if (data) setForm({ ...data }); }, [data]);
  const save = useMutation({
    mutationFn: async () => (await api.put('/site-settings/admin', form)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['site-settings-admin'] }); qc.invalidateQueries({ queryKey: ['site-settings-public'] }); toast.success('Site settings saved'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to save'),
  });
  if (isLoading) return <LoadingBlock label="Loading site settings..." />;
  if (isError) return <ErrorBlock message={(error as any)?.response?.data?.message} onRetry={refetch} />;

  const sections = Array.from(new Set(FIELDS.map((f) => f.section)));
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Website CMS" title="Site Settings" description="Manage global church/contact/social/giving settings used across public pages." actions={<Button className="bg-[#7A1F2B] text-white hover:bg-[#651925]" onClick={() => save.mutate()} disabled={save.isPending}><Save className="mr-2 h-4 w-4" />{save.isPending ? 'Saving...' : 'Save Settings'}</Button>} />
      {sections.map((section) => (
        <SectionCard key={section} title={section} description={`Manage ${section.toLowerCase()} values.`}>
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.filter((f) => f.section === section).map((f) => (
              <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2 space-y-2' : 'space-y-2'}>
                <label className="text-sm font-medium text-gray-700">{f.label}</label>
                {f.type === 'textarea' ? (
                  <Textarea value={form[f.key] || ''} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} className="bg-white" />
                ) : (
                  <Input value={form[f.key] || ''} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} className="bg-white" />
                )}
                <p className="text-[11px] text-gray-400">{f.key}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}
