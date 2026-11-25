import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader, SectionCard, LoadingBlock, ErrorBlock } from '@/components/admin/access/AccessUI';
import { Save } from 'lucide-react';

const DEFAULT = {
  titleEn: 'Contact Us', titleSw: 'Wasiliana Nasi',
  subtitleEn: "We're here and ready to connect with you.", subtitleSw: 'Tuko hapa kwa ajili yako, wasiliana nasi.',
  formTitleEn: 'Send us a Message', formTitleSw: 'Tutumie Ujumbe',
  addressLabelEn: 'Address', addressLabelSw: 'Anwani',
  addressValueEn: 'T.A.G Forest Ya Kwanza Church, Forest, Mbeya, Tanzania', addressValueSw: 'Kanisa T.A.G Forest Ya Kwanza, Forest, Mbeya, Tanzania',
  phoneLabelEn: 'Phone', phoneLabelSw: 'Simu',
  emailLabelEn: 'Email', emailLabelSw: 'Barua Pepe',
  hoursLabelEn: 'Office Hours', hoursLabelSw: 'Saa za Ofisi',
  mapNoteEn: 'Map showing the approximate location of the church in Forest, Mbeya.',
  mapNoteSw: 'Ramani inayoonyesha takriban eneo la kanisa Forest, Mbeya.',
};

export default function ContactCms() {
  const qc = useQueryClient();
  const { data: pages = [], isLoading, isError, error, refetch } = useQuery({ queryKey: ['cms-pages'], queryFn: async () => (await api.get('/cms/pages')).data });
  const existing = (Array.isArray(pages) ? pages : []).find((p: any) => p.slug === 'contact');
  const [form, setForm] = useState(DEFAULT);
  useEffect(() => { if (existing?.content && typeof existing.content === 'object') setForm({ ...DEFAULT, ...existing.content }); }, [existing?.id]);
  const save = useMutation({
    mutationFn: async (status: string) => (await api.post('/cms/pages', { slug: 'contact', title: 'Contact Page', status, content: form })).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cms-pages'] }); toast.success('Contact page saved'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });
  if (isLoading) return <LoadingBlock label="Loading contact page..." />;
  if (isError) return <ErrorBlock message={(error as any)?.response?.data?.message} onRetry={refetch} />;
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const field = (k: keyof typeof DEFAULT, label: string, area = false) => (
    <div className="space-y-2"><label className="text-sm font-medium">{label}</label>{area ? <Textarea value={form[k]} onChange={(e) => set(k, e.target.value)} /> : <Input value={form[k]} onChange={(e) => set(k, e.target.value)} />}</div>
  );
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Website CMS" title="Contact Page" description="Manage public contact page content. Phone/email/hours also use Site Settings when set." actions={<div className="flex gap-2"><Button variant="outline" onClick={() => save.mutate('DRAFT')} disabled={save.isPending}>Save Draft</Button><Button className="bg-[#7A1F2B] text-white hover:bg-[#651925]" onClick={() => save.mutate('PUBLISHED')} disabled={save.isPending}><Save className="mr-2 h-4 w-4" />Publish</Button></div>} />
      <SectionCard title="Headings & Labels" description="Public Contact page text."><div className="grid gap-4 sm:grid-cols-2">{field('titleEn','Title EN')}{field('titleSw','Title SW')}{field('subtitleEn','Subtitle EN',true)}{field('subtitleSw','Subtitle SW',true)}{field('formTitleEn','Form Title EN')}{field('formTitleSw','Form Title SW')}</div></SectionCard>
      <SectionCard title="Contact Details" description="Labels and address text."><div className="grid gap-4 sm:grid-cols-2">{field('addressLabelEn','Address Label EN')}{field('addressLabelSw','Address Label SW')}{field('addressValueEn','Address Value EN',true)}{field('addressValueSw','Address Value SW',true)}{field('phoneLabelEn','Phone Label EN')}{field('phoneLabelSw','Phone Label SW')}{field('emailLabelEn','Email Label EN')}{field('emailLabelSw','Email Label SW')}{field('hoursLabelEn','Hours Label EN')}{field('hoursLabelSw','Hours Label SW')}</div></SectionCard>
      <SectionCard title="Map Note" description="Text below the map."><div className="grid gap-4 sm:grid-cols-2">{field('mapNoteEn','Map Note EN',true)}{field('mapNoteSw','Map Note SW',true)}</div></SectionCard>
    </div>
  );
}
