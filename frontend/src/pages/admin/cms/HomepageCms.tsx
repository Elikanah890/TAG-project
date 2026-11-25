import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader, SectionCard, LoadingBlock, ErrorBlock } from '@/components/admin/access/AccessUI';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

type Field = { key: string; label: string; type?: 'textarea'; help?: string };

const SECTIONS: Array<{ title: string; description: string; fields: Field[] }> = [
  {
    title: 'Hero',
    description: 'Main banner shown at the top of the homepage.',
    fields: [
      { key: 'hero_welcome', label: 'Welcome Badge Text' },
      { key: 'hero_title_line1', label: 'Headline Line 1', help: 'Default: T.A.G FOREST YA' },
      { key: 'hero_title_line2', label: 'Headline Line 2', help: 'Default: KWANZA' },
      { key: 'hero_tagline', label: 'Hero Tagline' },
      { key: 'hero_subtitle_en', label: 'Hero Paragraph (English)', type: 'textarea' },
      { key: 'hero_subtitle_sw', label: 'Hero Paragraph (Swahili)', type: 'textarea' },
      { key: 'hero_watch_url', label: 'Watch Live / YouTube URL' },
      {
        key: 'hero_images_json',
        label: 'Hero Images JSON',
        type: 'textarea',
        help: 'Array of image URLs, e.g. ["/hero/hero-1.jpg","/hero/hero-2.jpg"]',
      },
      { key: 'nav_home_label', label: 'Navbar Home Label' },
    ],
  },
  {
    title: 'About Preview',
    description: 'Section shown below the values strip on the homepage.',
    fields: [
      { key: 'home_about_image', label: 'About Image URL' },
      { key: 'home_about_stat_value', label: 'Stat Value', help: 'e.g. 900+' },
      { key: 'home_about_stat_label_en', label: 'Stat Label (English)' },
      { key: 'home_about_stat_label_sw', label: 'Stat Label (Swahili)' },
    ],
  },
  {
    title: 'Values Strip',
    description: 'Four value cards shown under the hero.',
    fields: [
      {
        key: 'home_values_json',
        label: 'Values JSON',
        type: 'textarea',
        help: 'Array of {icon,titleEn,titleSw,descEn,descSw}. Icons: Cross, Shield, Users, HandHeart, Heart, BookOpen, Sparkles',
      },
    ],
  },
  {
    title: 'Giving Banner',
    description: 'Call-to-action banner near the bottom of the homepage.',
    fields: [
      { key: 'giving_banner_title_en', label: 'Title (English)' },
      { key: 'giving_banner_title_sw', label: 'Title (Swahili)' },
      { key: 'giving_banner_desc_en', label: 'Description (English)', type: 'textarea' },
      { key: 'giving_banner_desc_sw', label: 'Description (Swahili)', type: 'textarea' },
    ],
  },
];

const ALL_KEYS = SECTIONS.flatMap((section) => section.fields.map((field) => field.key));

export default function HomepageCms() {
  const qc = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['site-settings-admin'],
    queryFn: async () => (await api.get('/site-settings/admin')).data,
  });
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!data) return;
    const next: Record<string, string> = {};
    for (const key of ALL_KEYS) next[key] = data[key] || '';
    setForm(next);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => (await api.put('/site-settings/admin', form)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-settings-admin'] });
      qc.invalidateQueries({ queryKey: ['site-settings-public'] });
      toast.success('Homepage content saved');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to save homepage content'),
  });

  if (isLoading) return <LoadingBlock label="Loading homepage content..." />;
  if (isError) return <ErrorBlock message={(error as any)?.response?.data?.message} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Website CMS"
        title="Homepage"
        description="Manage every editable section of the homepage. Changes appear on the public site immediately after saving."
        actions={
          <Button
            className="bg-[#7A1F2B] text-white hover:bg-[#651925]"
            onClick={() => save.mutate()}
            disabled={save.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {save.isPending ? 'Saving...' : 'Save Homepage'}
          </Button>
        }
      />
      {SECTIONS.map((section) => (
        <SectionCard key={section.title} title={section.title} description={section.description}>
          <div className="grid gap-4 sm:grid-cols-2">
            {section.fields.map((field) => (
              <div key={field.key} className={field.type === 'textarea' ? 'space-y-2 sm:col-span-2' : 'space-y-2'}>
                <label className="text-sm font-medium text-gray-700">{field.label}</label>
                {field.type === 'textarea' ? (
                  <Textarea
                    value={form[field.key] || ''}
                    onChange={(e) => setForm((previous) => ({ ...previous, [field.key]: e.target.value }))}
                    className="bg-white"
                  />
                ) : (
                  <Input
                    value={form[field.key] || ''}
                    onChange={(e) => setForm((previous) => ({ ...previous, [field.key]: e.target.value }))}
                    className="bg-white"
                  />
                )}
                <p className="text-[11px] text-gray-400">{field.help || field.key}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}
