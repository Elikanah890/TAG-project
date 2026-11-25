import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function FinanceRecord() {
  const { hasRole } = useAuth();
  const canRecord = hasRole('FINANCE_ADMIN'); // separation of duties: SYSTEM_ADMIN read-only
  const [q, setQ] = useState('');
  const [memberId, setMemberId] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [anonymousName, setAnonymousName] = useState('');
  const [category, setCategory] = useState('ZAKA');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('CASH');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [receiptNo, setReceiptNo] = useState<string | null>(null);

  const { data: members = [], isFetching } = useQuery({
    queryKey: ['finance-members', q],
    queryFn: async () => (await api.get('/finance/members', { params: { q } })).data,
  });

  const downloadReceipt = async () => {
    if (!receiptNo) return;
    try {
      const res = await api.get(`/finance/receipts/${receiptNo}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url; a.download = `${receiptNo}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Failed to download receipt'); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canRecord) { toast.error('System Admin cannot record financial transactions'); return; }
    if (!anonymous && !memberId) { toast.error('Select a member or mark as anonymous contribution'); return; }
    setSubmitting(true); setReceiptNo(null);
    try {
      const res = await api.post('/finance/payments', {
        memberId: anonymous ? undefined : memberId,
        anonymousName: anonymous ? anonymousName || undefined : undefined,
        category, amount: Number(amount), method,
        reference: reference || undefined,
        notes: notes || undefined,
      });
      setReceiptNo(res.data.receiptNo);
      toast.success(`Payment recorded: ${res.data.receiptNo}`);
      setAmount(''); setReference(''); setNotes(''); setAnonymousName('');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to record payment');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="font-sans text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Record Payment</h1><p className="text-gray-500">Finance Admin: record member contributions and generate receipt numbers.</p>
        {!canRecord && <Badge className="mt-2 bg-[#C9962B]/20 text-[#7A5A10] border border-[#C9962B]/30">Read-only for System Admin (separation of duties)</Badge>}
      </div>
      <Card className="card-church max-w-3xl">
        <CardHeader><CardTitle className="text-lg">New Contribution</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <fieldset disabled={!canRecord} className="space-y-4 disabled:opacity-70">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Checkbox checked={anonymous} onCheckedChange={(v)=>{ setAnonymous(v===true); if(v===true) setMemberId(''); }} />
                  Anonymous / external contribution (no member record)
                </label>
                {!anonymous ? (
                  <>
                    <Label>Find Member</Label>
                    <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name, member no, phone, WhatsApp, or email" />
                    <Select value={memberId} onValueChange={setMemberId}>
                      <SelectTrigger><SelectValue placeholder={isFetching ? 'Searching...' : 'Select member'} /></SelectTrigger>
                      <SelectContent>
                        {members.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.fullName} {m.memberNo ? `(${m.memberNo})` : ''} {(m.whatsappNumber || m.phone) ? `- ${m.whatsappNumber || m.phone}` : ''}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <div className="space-y-2"><Label>Payer name (optional)</Label><Input value={anonymousName} onChange={e=>setAnonymousName(e.target.value)} placeholder="Anonymous / external payer name" /></div>
                )}
              </div>
              <div className="space-y-2"><Label>Category</Label>
                <Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="ZAKA">ZAKA</SelectItem><SelectItem value="FUNGU_LA_KUMI">FUNGU_LA_KUMI</SelectItem><SelectItem value="SADAKA">SADAKA</SelectItem><SelectItem value="UJENZI">UJENZI</SelectItem><SelectItem value="GENERAL_DONATION">GENERAL_DONATION</SelectItem><SelectItem value="PROJECT">PROJECT</SelectItem><SelectItem value="SPECIAL">SPECIAL</SelectItem>
                </SelectContent></Select>
              </div>
              <div className="space-y-2"><Label>Amount (TZS)</Label><Input type="number" min="1" value={amount} onChange={e=>setAmount(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Method</Label>
                <Select value={method} onValueChange={setMethod}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="CASH">CASH</SelectItem><SelectItem value="MPESA">MPESA</SelectItem><SelectItem value="BANK">BANK</SelectItem>
                </SelectContent></Select>
              </div>
              <div className="space-y-2"><Label>Reference (optional)</Label><Input value={reference} onChange={e=>setReference(e.target.value)} placeholder="Txn ref / note" /></div>
              <div className="space-y-2 sm:col-span-2"><Label>Notes (optional)</Label><Input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Description / note" /></div>
            </div>
            <Button type="submit" className="bg-[#7A1F2B] text-white hover:bg-[#651925]" disabled={submitting || !canRecord}>{submitting ? 'Recording...' : canRecord ? 'Record Payment' : 'Recording Disabled (Read-only)'}</Button>
            </fieldset>
          </form>
          {receiptNo && <div className="mt-4 rounded-md border border-green-300 bg-green-50 p-4 text-green-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><div className="font-medium">Payment recorded successfully</div><div className="text-lg font-mono mt-1">Receipt: {receiptNo}</div></div><Button onClick={downloadReceipt} variant="outline" className="border-green-700 text-green-800 hover:bg-green-100">Download PDF Receipt</Button></div>}
        </CardContent>
      </Card>
    </div>
  );
}
