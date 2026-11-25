import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader, SectionCard, LoadingBlock, ErrorBlock } from '@/components/admin/access/AccessUI';
import { Plus, Save, Trash2 } from 'lucide-react';

type Service = { nameEn: string; nameSw: string; timeEn: string; timeSw: string };
type Day = { day: string; dayEn: string; daySw: string; services: Service[] };
const DEFAULT: { days: Day[]; specialNoteEn: string; specialNoteSw: string } = {
  days: [
    { day: 'sunday', dayEn: 'Sunday', daySw: 'Jumapili', services: [{ nameEn: 'Main Worship Service', nameSw: 'Ibada Kuu', timeEn: '7:00 AM - 10:30, second service 11:00-1:00 PM', timeSw: 'Saa 1 asubuhi - Saa 4:30 asubuhi, Ibada ya pili 5:00 -7:00Mchana' }] },
    { day: 'monday', dayEn: 'Monday', daySw: 'Jumatatu', services: [{ nameEn: "CA's Youth Meeting", nameSw: 'Mkutano wa Vijana CA\'s', timeEn: '6:30 PM - 8:00 PM', timeSw: 'Saa 12:30 - Saa 2 Usiku' }] },
    { day: 'tuesday', dayEn: 'Tuesday', daySw: 'Jumanne', services: [{ nameEn: 'Discipleship - Maandiko', nameSw: 'Mafundisho ya Maandiko', timeEn: '10:30 PM - 12:30 AM', timeSw: 'Saa 4:30- Saa 6:30 Usiku' }] },
    { day: 'wednesday', dayEn: 'Wednesday', daySw: 'Jumatano', services: [{ nameEn: "WWK - Women's Ministry", nameSw: 'WWK - Huduma ya Wanawake', timeEn: '10:30 PM', timeSw: 'Saa 2:30 Usiku' }] },
    { day: 'thursday', dayEn: 'Thursday', daySw: 'Alhamisi', services: [{ nameEn: "WWK - Women's Ministry", nameSw: 'WWK - Huduma ya Wanawake', timeEn: '10:00 PM', timeSw: 'Saa 4 Usiku' }] },
    { day: 'friday', dayEn: 'Friday', daySw: 'Ijumaa', services: [{ nameEn: 'Discipleship - Maandiko', nameSw: 'Mafundisho ya Maandiko', timeEn: '10:30 PM - 12:00 AM', timeSw: 'Saa 4:30 - Saa 6:30 Usiku' }] },
    { day: 'saturday', dayEn: 'Saturday', daySw: 'Jumamosi', services: [{ nameEn: 'Preparations & Rehearsals', nameSw: 'Maandalizi na Mazoezi', timeEn: 'Various', timeSw: 'Mbalimbali' }] },
  ],
  specialNoteEn: 'For special services, revivals, and conferences, please check our News & Events page or follow us on social media for announcements.',
  specialNoteSw: 'Kwa ibada maalum, uamsho, na mikutano, tafadhali angalia ukurasa wetu wa Habari & Matukio au tufuate kwenye mitandao ya kijamii kwa matangazo.',
};

export default function ScheduleCms() {
  const qc = useQueryClient();
  const { data: pages = [], isLoading, isError, error, refetch } = useQuery({ queryKey: ['cms-pages'], queryFn: async () => (await api.get('/cms/pages')).data });
  const existing = (Array.isArray(pages) ? pages : []).find((p: any) => p.slug === 'schedule');
  const [form, setForm] = useState(DEFAULT);
  useEffect(() => { if (existing?.content && typeof existing.content === 'object') setForm({ ...DEFAULT, ...existing.content, days: Array.isArray(existing.content.days) ? existing.content.days : DEFAULT.days }); }, [existing?.id]);
  const save = useMutation({
    mutationFn: async (status: string) => (await api.post('/cms/pages', { slug: 'schedule', title: 'Schedule Page', status, content: form })).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cms-pages'] }); toast.success('Schedule saved'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });
  if (isLoading) return <LoadingBlock label="Loading schedule..." />;
  if (isError) return <ErrorBlock message={(error as any)?.response?.data?.message} onRetry={refetch} />;

  const setDay = (idx: number, patch: Partial<Day>) => setForm((p) => ({ ...p, days: p.days.map((d, i) => i === idx ? { ...d, ...patch } : d) }));
  const setSvc = (dIdx: number, sIdx: number, patch: Partial<Service>) => setForm((p) => ({ ...p, days: p.days.map((d, i) => i !== dIdx ? d : { ...d, services: d.services.map((s, j) => j === sIdx ? { ...s, ...patch } : s) }) }));
  const addDay = () => setForm((p) => ({ ...p, days: [...p.days, { day: 'new-day', dayEn: 'New Day', daySw: 'Siku Mpya', services: [{ nameEn: '', nameSw: '', timeEn: '', timeSw: '' }] }] }));
  const removeDay = (idx: number) => setForm((p) => ({ ...p, days: p.days.filter((_, i) => i !== idx) }));
  const addSvc = (dIdx: number) => setForm((p) => ({ ...p, days: p.days.map((d, i) => i !== dIdx ? d : { ...d, services: [...d.services, { nameEn: '', nameSw: '', timeEn: '', timeSw: '' }] }) }));
  const removeSvc = (dIdx: number, sIdx: number) => setForm((p) => ({ ...p, days: p.days.map((d, i) => i !== dIdx ? d : { ...d, services: d.services.filter((_, j) => j !== sIdx) }) }));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Website CMS" title="Schedule / Services" description="Manage public service schedule. All days and services shown here appear on the public Schedule page." actions={<div className="flex gap-2"><Button variant="outline" onClick={() => save.mutate('DRAFT')} disabled={save.isPending}>Save Draft</Button><Button className="bg-[#7A1F2B] text-white hover:bg-[#651925]" onClick={() => save.mutate('PUBLISHED')} disabled={save.isPending}><Save className="mr-2 h-4 w-4" />Publish</Button></div>} />
      <SectionCard title="Service Schedule" description="Edit days and services." actions={<Button variant="outline" size="sm" onClick={addDay}><Plus className="mr-1 h-4 w-4" />Add Day</Button>}>
        <div className="space-y-4">
          {form.days.map((d, di) => (
            <div key={di} className="rounded-xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2"><p className="font-medium text-gray-800">{d.dayEn || `Day ${di + 1}`}</p><Button variant="ghost" size="sm" onClick={() => removeDay(di)}><Trash2 className="h-4 w-4 text-rose-600" /></Button></div>
              <div className="grid gap-3 sm:grid-cols-3"><Input value={d.day} onChange={(e) => setDay(di, { day: e.target.value })} placeholder="day key" /><Input value={d.dayEn} onChange={(e) => setDay(di, { dayEn: e.target.value })} placeholder="Day (EN)" /><Input value={d.daySw} onChange={(e) => setDay(di, { daySw: e.target.value })} placeholder="Day (SW)" /></div>
              {d.services.map((s, si) => (
                <div key={si} className="grid gap-2 sm:grid-cols-4 rounded-lg bg-gray-50 p-3">
                  <Input value={s.nameEn} onChange={(e) => setSvc(di, si, { nameEn: e.target.value })} placeholder="Service name EN" />
                  <Input value={s.nameSw} onChange={(e) => setSvc(di, si, { nameSw: e.target.value })} placeholder="Service name SW" />
                  <Input value={s.timeEn} onChange={(e) => setSvc(di, si, { timeEn: e.target.value })} placeholder="Time EN" />
                  <div className="flex gap-2"><Input value={s.timeSw} onChange={(e) => setSvc(di, si, { timeSw: e.target.value })} placeholder="Time SW" /><Button variant="ghost" size="icon" onClick={() => removeSvc(di, si)}><Trash2 className="h-4 w-4 text-rose-600" /></Button></div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => addSvc(di)}><Plus className="mr-1 h-4 w-4" />Add Service</Button>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Special Note" description="Shown below schedule on public page.">
        <div className="grid gap-4"><Textarea value={form.specialNoteEn} onChange={(e) => setForm((p) => ({ ...p, specialNoteEn: e.target.value }))} placeholder="English note" /><Textarea value={form.specialNoteSw} onChange={(e) => setForm((p) => ({ ...p, specialNoteSw: e.target.value }))} placeholder="Swahili note" /></div>
      </SectionCard>
    </div>
  );
}
