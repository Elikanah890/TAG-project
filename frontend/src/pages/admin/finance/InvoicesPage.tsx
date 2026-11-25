import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FilePlus2, FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { EmptyBlock, PageHeader, SectionCard, formatDate, formatMoney } from '@/components/admin/access/AccessUI';
import { cn } from '@/lib/utils';

const CATEGORIES = ['ZAKA', 'FUNGU_LA_KUMI', 'SADAKA', 'UJENZI', 'GENERAL_DONATION', 'PROJECT', 'SPECIAL'];

function statusClass(status?: string) {
  const value = String(status || '').toUpperCase();
  if (['PAID'].includes(value)) return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (['PARTIALLY_PAID', 'ISSUED', 'SENT'].includes(value)) return 'border-gray-100 bg-[#C9962B]/10 text-[#7A5A10]';
  if (['OVERDUE', 'CANCELLED'].includes(value)) return 'border-rose-200 bg-rose-50 text-rose-800';
  return 'border-slate-200 bg-slate-50 text-slate-700';
}

type Item = { description: string; amount: string };

export default function InvoicesPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [memberId, setMemberId] = useState('');
  const [memberWa, setMemberWa] = useState('');
  const [recipientMode, setRecipientMode] = useState<'member' | 'adhoc'>('member');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientWhatsapp, setRecipientWhatsapp] = useState('');
  const [category, setCategory] = useState('UJENZI');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'ISSUED'>('ISSUED');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState('');
  const [items, setItems] = useState<Item[]>([{ description: '', amount: '' }]);

  const invoices = useQuery({ queryKey: ['finance-invoices'], queryFn: async () => (await api.get('/finance/invoices')).data });
  const members = useQuery({ queryKey: ['finance-members', q], queryFn: async () => (await api.get('/finance/members', { params: { q } })).data });
  const selectedMember = (members.data || []).find((m: any) => m.id === memberId);
  const saveMemberWa = async () => {
    if (!memberId) return;
    try {
      await api.patch(`/members/${memberId}/finance-contact`, { whatsappNumber: memberWa || undefined });
      toast.success('Member WhatsApp updated');
      qc.invalidateQueries({ queryKey: ['finance-members'] });
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed to update WhatsApp'); }
  };

  const create = useMutation({
    mutationFn: async () => {
      const payload: any = {
        status,
        dueDate: dueDate || undefined,
        category,
        title: title || undefined,
        notes: notes || undefined,
        paymentInstructions: paymentInstructions || undefined,
        items: items.map((item) => ({ description: item.description.trim(), amount: Number(item.amount) })),
      };
      if (recipientMode === 'member') payload.memberId = memberId;
      else {
        payload.recipientName = recipientName;
        payload.recipientEmail = recipientEmail || undefined;
        payload.recipientPhone = recipientPhone || undefined;
        payload.recipientWhatsapp = recipientWhatsapp || recipientPhone || undefined;
      }
      return (await api.post('/finance/invoices', payload)).data;
    },
    onSuccess: (data: any) => {
      const invoice = Array.isArray(data?.invoices) ? data.invoices[0] : data;
      toast.success(`Invoice ${invoice?.invoiceNo || ''} created`);
      setItems([{ description: '', amount: '' }]);
      setMemberId(''); setRecipientName(''); setRecipientEmail(''); setRecipientPhone(''); setRecipientWhatsapp('');       setDueDate(''); setNotes(''); setTitle(''); setPaymentInstructions('');
      qc.invalidateQueries({ queryKey: ['finance-invoices'] });
      qc.invalidateQueries({ queryKey: ['dashboard-finance'] });
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to create invoice');
    },
  });

  const rows = Array.isArray(invoices.data) ? invoices.data : [];
  const total = useMemo(() => items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0), [items]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recipientMode === 'member' && !memberId) return toast.error('Select a member');
    if (recipientMode === 'adhoc' && !recipientName.trim()) return toast.error('Recipient name is required for unregistered/ad-hoc invoice');
    if (!items.length || items.some((i) => !i.description.trim() || !(Number(i.amount) > 0))) return toast.error('Add at least one valid line item');
    create.mutate();
  };

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Income & Receipts" title="Invoices" description="Create member or external invoices, track partial payments, and download official PDF invoices." />

      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <SectionCard title="Create invoice" description="Line items are required. The invoice total is calculated automatically.">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setRecipientMode('member')} className={cn('rounded-lg border px-3 py-2 text-sm font-medium transition', recipientMode === 'member' ? 'border-black bg-[#C9962B]/20 text-gray-800' : 'border-gray-100 text-gray-500 hover:bg-[#C9962B]/10')}>Registered member</button>
              <button type="button" onClick={() => setRecipientMode('adhoc')} className={cn('rounded-lg border px-3 py-2 text-sm font-medium transition', recipientMode === 'adhoc' ? 'border-black bg-[#C9962B]/20 text-gray-800' : 'border-gray-100 text-gray-500 hover:bg-[#C9962B]/10')}>Unregistered / Ad-hoc name</button>
            </div>

            {recipientMode === 'member' ? (
              <div className="space-y-2">
                <Label>Find registered member</Label>
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, member no, phone, WhatsApp, or email" />
                <div className="rounded-lg border border-gray-100 bg-white max-h-52 overflow-auto">
                  {members.isFetching ? <p className="p-3 text-xs text-gray-500">Searching...</p> : (members.data || []).length === 0 ? <p className="p-3 text-xs text-gray-500">No approved members found.</p> : (members.data || []).map((m: any) => (
                    <button type="button" key={m.id} onClick={() => { setMemberId(m.id); setMemberWa(m.whatsappNumber || m.phone || ''); }} className={cn('w-full text-left px-3 py-2 text-sm border-b last:border-b-0 hover:bg-[#C9962B]/10', memberId === m.id ? 'bg-[#C9962B]/15 font-medium' : '')}>
                      <div>{m.fullName} {m.memberNo ? <span className="text-gray-500">({m.memberNo})</span> : null}</div>
                      <div className="text-xs text-gray-500">{m.whatsappNumber || m.phone || 'No phone'} {m.email ? `· ${m.email}` : ''}</div>
                    </button>
                  ))}
                </div>
                {selectedMember ? (
                  <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-3 space-y-2">
                    <p className="text-xs text-gray-500">Selected: <span className="font-medium text-gray-800">{selectedMember.fullName}</span> {selectedMember.memberNo ? `(${selectedMember.memberNo})` : ''}</p>
                    <Label className="text-xs">WhatsApp number (for invoice sharing)</Label>
                    <div className="flex gap-2">
                      <Input value={memberWa} onChange={(e)=>setMemberWa(e.target.value)} placeholder="+2557..." />
                      <Button type="button" variant="outline" onClick={saveMemberWa}>Save</Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2"><Label>Recipient name (not registered / not approved)</Label><Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Enter full name as record" /></div>
                <div className="space-y-2"><Label>Email (optional)</Label><Input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} /></div>
                <div className="space-y-2"><Label>Phone (optional)</Label><Input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="+2557..." /></div>
                <div className="space-y-2 sm:col-span-2"><Label>WhatsApp number (optional)</Label><Input value={recipientWhatsapp} onChange={(e) => setRecipientWhatsapp(e.target.value)} placeholder="+2557... (used for WhatsApp sharing)" /></div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2"><Label>Category</Label>
                <Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c.replaceAll('_', ' ')}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-2"><Label>Status</Label>
                <Select value={status} onValueChange={(v: any) => setStatus(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ISSUED">Issued</SelectItem><SelectItem value="DRAFT">Draft</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2 sm:col-span-2"><Label>Invoice title (optional)</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Church Contribution / Ujenzi" /></div>
              <div className="space-y-2 sm:col-span-2"><Label>Due date (optional)</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between"><Label>Line items</Label><Button type="button" variant="outline" size="sm" onClick={() => setItems([...items, { description: '', amount: '' }])}><Plus className="mr-1 h-3.5 w-3.5" />Add item</Button></div>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_130px_auto] gap-2">
                    <Input placeholder="Description" value={item.description} onChange={(e) => setItems(items.map((it, i) => i === idx ? { ...it, description: e.target.value } : it))} />
                    <Input type="number" min="1" placeholder="Amount" value={item.amount} onChange={(e) => setItems(items.map((it, i) => i === idx ? { ...it, amount: e.target.value } : it))} />
                    <Button type="button" variant="ghost" size="icon" disabled={items.length === 1} onClick={() => setItems(items.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-[#C9962B]/10 px-3 py-2 text-sm"><span className="text-[#7A5A10]">Invoice total</span><span className="font-semibold text-gray-800">{formatMoney(total)}</span></div>
            </div>

            <div className="space-y-2"><Label>Payment instructions (optional)</Label><Textarea value={paymentInstructions} onChange={(e) => setPaymentInstructions(e.target.value)} placeholder="Bank/mobile money details, reference instructions..." /></div>
            <div className="space-y-2"><Label>Notes (optional)</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Purpose or internal note" /></div>

            <Button type="submit" className="w-full bg-[#7A1F2B] text-white hover:bg-[#651925]" disabled={create.isPending}>
              <FilePlus2 className="mr-2 h-4 w-4" />{create.isPending ? 'Creating invoice…' : 'Create invoice'}
            </Button>
          </form>
        </SectionCard>

        <SectionCard title="Invoice register" description="Live invoices with recorded payments and outstanding balances.">
          {invoices.isLoading ? <p className="text-sm text-gray-500">Loading invoices…</p> : rows.length ? (
            <div className="overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Recipient</TableHead><TableHead>Due</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Outstanding</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.map((inv: any) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-xs">{inv.invoiceNo}</TableCell>
                      <TableCell className="max-w-[180px] truncate text-xs">{inv.recipientName || inv.member?.fullName || '—'}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-gray-500">{inv.dueDate ? formatDate(inv.dueDate) : '—'}</TableCell>
                      <TableCell className="text-right text-xs font-medium">{formatMoney(inv.total)}</TableCell>
                      <TableCell className="text-right text-xs font-medium">{formatMoney(inv.outstandingAmount)}</TableCell>
                      <TableCell><Badge variant="outline" className={cn('font-semibold', statusClass(inv.status))}>{String(inv.status).replaceAll('_', ' ')}</Badge></TableCell>
                      <TableCell className="text-right"><Button asChild variant="ghost" size="sm"><Link to={`/admin/finance/invoices/${inv.id}`}><FileText className="mr-1 h-3.5 w-3.5" />Open</Link></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyBlock title="No invoices yet" description="Create an invoice to track amounts due, record partial payments, and generate receipts." />
          )}
        </SectionCard>
      </div>
    </div>
  );
}
