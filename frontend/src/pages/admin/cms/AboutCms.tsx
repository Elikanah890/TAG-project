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
  historyEn: 'TAG Forest Ya Kwanza is a vibrant church family in Mbeya, Tanzania, committed to worship, discipleship, and community transformation.',
  historySw: 'TAG Forest Ya Kwanza ni familia ya kanisa yenye uhai jijini Mbeya, Tanzania, iliyojitoa katika ibada, ufuatiliaji, na mabadiliko ya jamii.',
  visionEn: 'To be a Christ-centered church transforming lives and communities.',
  visionSw: 'Kuwa kanisa linalomzingatia Kristo linalobadilisha maisha na jamii.',
  missionEn: 'To worship God, make disciples, and serve our community with love.',
  missionSw: 'Kumwabudu Mungu, kufanya wanafunzi, na kuitumikia jamii yetu kwa upendo.',
  valuesEn: 'Faith, Love, Integrity, Service, Unity',
  valuesSw: 'Imani, Upendo, Uadilifu, Utumishi, Umoja',
  pastorName: '', pastorRoleEn: 'Senior Pastor', pastorRoleSw: 'Mchungaji Kiongozi',
  pastorMessageEn: '', pastorMessageSw: '',
  statementFaithEn: '', statementFaithSw: '',
};

export default function AboutCms() {
  const qc = useQueryClient();
  const { data: pages = [], isLoading, isError, error, refetch } = useQuery({ queryKey: ['cms-pages'], queryFn: async () => (await api.get('/cms/pages')).data });
  const existing = (Array.isArray(pages) ? pages : []).find((p: any) => p.slug === 'about');
  const [form, setForm] = useState(DEFAULT);
  useEffect(() => { if (existing?.content && typeof existing.content === 'object') setForm({ ...DEFAULT, ...existing.content }); }, [existing?.id]);
  const save = useMutation({
    mutationFn: async (status: string) => (await api.post('/cms/pages', { slug: 'about', title: 'About Page', status, content: form })).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cms-pages'] }); toast.success('About page saved'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });
  if (isLoading) return <LoadingBlock label="Loading About page..." />;
  if (isError) return <ErrorBlock message={(error as any)?.response?.data?.message} onRetry={refetch} />;
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Website CMS" title="About Page" description="Manage public About page content. Existing public content is shown as defaults until you save." actions={<div className="flex gap-2"><Button variant="outline" onClick={() => save.mutate('DRAFT')} disabled={save.isPending}>Save Draft</Button><Button className="bg-[#7A1F2B] text-white hover:bg-[#651925]" onClick={() => save.mutate('PUBLISHED')} disabled={save.isPending}><Save className="mr-2 h-4 w-4" />Publish</Button></div>} />
      <SectionCard title="History / About" description="Main about content shown on the public About page.">
        <div className="grid gap-4">
          <div className="space-y-2"><label className="text-sm font-medium">History (English)</label><Textarea value={form.historyEn} onChange={(e) => set('historyEn', e.target.value)} className="min-h-[120px]" /></div>
          <div className="space-y-2"><label className="text-sm font-medium">History (Swahili)</label><Textarea value={form.historySw} onChange={(e) => set('historySw', e.target.value)} className="min-h-[120px]" /></div>
        </div>
      </SectionCard>
      <SectionCard title="Vision, Mission & Values" description="Core statements displayed on About page.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><label className="text-sm font-medium">Vision (EN)</label><Textarea value={form.visionEn} onChange={(e) => set('visionEn', e.target.value)} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Vision (SW)</label><Textarea value={form.visionSw} onChange={(e) => set('visionSw', e.target.value)} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Mission (EN)</label><Textarea value={form.missionEn} onChange={(e) => set('missionEn', e.target.value)} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Mission (SW)</label><Textarea value={form.missionSw} onChange={(e) => set('missionSw', e.target.value)} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Values (EN, comma-separated)</label><Input value={form.valuesEn} onChange={(e) => set('valuesEn', e.target.value)} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Values (SW, comma-separated)</label><Input value={form.valuesSw} onChange={(e) => set('valuesSw', e.target.value)} /></div>
        </div>
      </SectionCard>
      <SectionCard title="Pastoral Message" description="Pastor name and message shown on About page.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><label className="text-sm font-medium">Pastor Name</label><Input value={form.pastorName} onChange={(e)=>set('pastorName',e.target.value)} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Role (EN)</label><Input value={form.pastorRoleEn} onChange={(e)=>set('pastorRoleEn',e.target.value)} /></div>
          <div className="space-y-2 sm:col-span-2"><label className="text-sm font-medium">Role (SW)</label><Input value={form.pastorRoleSw} onChange={(e)=>set('pastorRoleSw',e.target.value)} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Message (EN)</label><Textarea value={form.pastorMessageEn} onChange={(e)=>set('pastorMessageEn',e.target.value)} className="min-h-[120px]" /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Message (SW)</label><Textarea value={form.pastorMessageSw} onChange={(e)=>set('pastorMessageSw',e.target.value)} className="min-h-[120px]" /></div>
        </div>
      </SectionCard>
      <SectionCard title="Statement of Faith" description="Full statement of faith content. Leave empty to keep current default text.">
        <div className="grid gap-4">
          <div className="space-y-2"><label className="text-sm font-medium">Statement of Faith (EN)</label><Textarea value={form.statementFaithEn} onChange={(e)=>set('statementFaithEn',e.target.value)} className="min-h-[220px]" /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Statement of Faith (SW)</label><Textarea value={form.statementFaithSw} onChange={(e)=>set('statementFaithSw',e.target.value)} className="min-h-[220px]" /></div>
        </div>
      </SectionCard>
    </div>
  );
}
