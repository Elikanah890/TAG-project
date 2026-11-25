import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader, SectionCard, LoadingBlock, ErrorBlock } from '@/components/admin/access/AccessUI';
import { Plus, Save, Trash2 } from 'lucide-react';

type Account = { bank: string; number: string };
type Category = { id: string; titleEn: string; titleSw: string; descriptionEn: string; descriptionSw: string; sectionEn?: string; sectionSw?: string; accounts: Account[] };
const DEFAULT: { introEn: string; introSw: string; categories: Category[] } = {
  introEn: 'Give through the official church accounts below to support offerings, savings, and ministry projects.',
  introSw: 'Toa kupitia akaunti rasmi za kanisa zilizo hapa chini kusaidia sadaka, akiba, na miradi ya huduma.',
  categories: [
    { id: 'sadaka', titleEn: 'Sadaka', titleSw: 'Sadaka', descriptionEn: 'Tithe, offerings, and thanksgiving contributions.', descriptionSw: 'Fungu la kumi, sadaka za kawaida, na sadaka za shukrani.', accounts: [{ bank: 'NBC', number: '022103006312' }, { bank: 'CRDB', number: '01J1018887000' }] },
    { id: 'akiba', titleEn: 'Akiba', titleSw: 'Akiba', descriptionEn: 'Church savings and reserve funds for future ministry needs.', descriptionSw: 'Akiba ya kanisa na fedha za akiba kwa mahitaji ya huduma ya baadaye.', accounts: [{ bank: 'NBC', number: '022101030189' }] },
    { id: 'miradi', sectionEn: 'Church Project', sectionSw: 'Mradi wa Kanisa', titleEn: 'KANISA LA TAG FOREST YA KWANZA MJENGO', titleSw: 'KANISA LA TAG FOREST YA KWANZA MJENGO', descriptionEn: 'Support the church building and development project.', descriptionSw: 'Changia mradi wa ujenzi na maendeleo ya kanisa.', accounts: [{ bank: 'NBC', number: '022103031225' }] },
  ],
};

export default function GivingCms() {
  const qc = useQueryClient();
  const { data: pages = [], isLoading, isError, error, refetch } = useQuery({ queryKey: ['cms-pages'], queryFn: async () => (await api.get('/cms/pages')).data });
  const existing = (Array.isArray(pages) ? pages : []).find((p: any) => p.slug === 'giving');
  const [form, setForm] = useState(DEFAULT);
  useEffect(() => { if (existing?.content && typeof existing.content === 'object') setForm({ ...DEFAULT, ...existing.content, categories: Array.isArray(existing.content.categories) ? existing.content.categories : DEFAULT.categories }); }, [existing?.id]);
  const save = useMutation({
    mutationFn: async (status: string) => (await api.post('/cms/pages', { slug: 'giving', title: 'Giving Page', status, content: form })).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cms-pages'] }); toast.success('Giving page saved'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });
  if (isLoading) return <LoadingBlock label="Loading giving page..." />;
  if (isError) return <ErrorBlock message={(error as any)?.response?.data?.message} onRetry={refetch} />;

  const setCat = (i: number, patch: Partial<Category>) => setForm((p) => ({ ...p, categories: p.categories.map((c, idx) => idx === i ? { ...c, ...patch } : c) }));
  const setAcc = (ci: number, ai: number, patch: Partial<Account>) => setForm((p) => ({ ...p, categories: p.categories.map((c, idx) => idx !== ci ? c : { ...c, accounts: c.accounts.map((a, j) => j === ai ? { ...a, ...patch } : a) }) }));
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Website CMS" title="Giving Page" description="Manage public giving/offering accounts and content." actions={<div className="flex gap-2"><Button variant="outline" onClick={() => save.mutate('DRAFT')} disabled={save.isPending}>Save Draft</Button><Button className="bg-[#7A1F2B] text-white hover:bg-[#651925]" onClick={() => save.mutate('PUBLISHED')} disabled={save.isPending}><Save className="mr-2 h-4 w-4" />Publish</Button></div>} />
      <SectionCard title="Intro" description="Public giving page intro text."><div className="grid gap-4"><Textarea value={form.introEn} onChange={(e) => setForm((p) => ({ ...p, introEn: e.target.value }))} placeholder="Intro EN" /><Textarea value={form.introSw} onChange={(e) => setForm((p) => ({ ...p, introSw: e.target.value }))} placeholder="Intro SW" /></div></SectionCard>
      <SectionCard title="Giving Categories & Accounts" description="Bank accounts shown on the public giving page." actions={<Button variant="outline" size="sm" onClick={() => setForm((p) => ({ ...p, categories: [...p.categories, { id: `cat-${Date.now()}`, titleEn: '', titleSw: '', descriptionEn: '', descriptionSw: '', accounts: [{ bank: '', number: '' }] }] }))}><Plus className="mr-1 h-4 w-4" />Add Category</Button>}>
        <div className="space-y-4">
          {form.categories.map((c, ci) => (
            <div key={ci} className="rounded-xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2"><p className="font-medium text-gray-800">{c.titleEn || `Category ${ci + 1}`}</p><Button variant="ghost" size="sm" onClick={() => setForm((p) => ({ ...p, categories: p.categories.filter((_, i) => i !== ci) }))}><Trash2 className="h-4 w-4 text-rose-600" /></Button></div>
              <div className="grid gap-3 sm:grid-cols-2"><Input value={c.id} onChange={(e) => setCat(ci, { id: e.target.value })} placeholder="id" /><Input value={c.sectionEn || ''} onChange={(e) => setCat(ci, { sectionEn: e.target.value })} placeholder="Section EN (optional)" /><Input value={c.titleEn} onChange={(e) => setCat(ci, { titleEn: e.target.value })} placeholder="Title EN" /><Input value={c.titleSw} onChange={(e) => setCat(ci, { titleSw: e.target.value })} placeholder="Title SW" /><Textarea value={c.descriptionEn} onChange={(e) => setCat(ci, { descriptionEn: e.target.value })} placeholder="Description EN" /><Textarea value={c.descriptionSw} onChange={(e) => setCat(ci, { descriptionSw: e.target.value })} placeholder="Description SW" /></div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Accounts</p>
                {c.accounts.map((a, ai) => (
                  <div key={ai} className="flex gap-2"><Input value={a.bank} onChange={(e) => setAcc(ci, ai, { bank: e.target.value })} placeholder="Bank" /><Input value={a.number} onChange={(e) => setAcc(ci, ai, { number: e.target.value })} placeholder="Account number" /><Button variant="ghost" size="icon" onClick={() => setForm((p) => ({ ...p, categories: p.categories.map((x, i) => i !== ci ? x : { ...x, accounts: x.accounts.filter((_, j) => j !== ai) }) }))}><Trash2 className="h-4 w-4 text-rose-600" /></Button></div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setForm((p) => ({ ...p, categories: p.categories.map((x, i) => i !== ci ? x : { ...x, accounts: [...x.accounts, { bank: '', number: '' }] }) }))}><Plus className="mr-1 h-4 w-4" />Add Account</Button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
