import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function FinancePledges() {
  const qc = useQueryClient();
  const { hasRole } = useAuth();
  const canRecord = hasRole('FINANCE_ADMIN');
  const [q, setQ] = useState(''); const [memberId, setMemberId] = useState(''); const [amount, setAmount] = useState(''); const [targetDate, setTargetDate] = useState(''); const [notes, setNotes] = useState('');
  const { data: members = [] } = useQuery({ queryKey: ['finance-members', q], queryFn: async () => (await api.get('/finance/members', { params: { q } })).data });
  const { data: pledges = [] } = useQuery({ queryKey: ['finance-pledges'], queryFn: async () => (await api.get('/finance/pledges')).data });
  const mut = useMutation({
    mutationFn: async () => (await api.post('/finance/pledges', { memberId, amount: Number(amount), targetDate: targetDate || undefined, notes: notes || undefined })).data,
    onSuccess: () => { toast.success('Pledge recorded'); setAmount(''); setTargetDate(''); setNotes(''); qc.invalidateQueries({queryKey:['finance-pledges']}); qc.invalidateQueries({queryKey:['dashboard-finance']}); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to record pledge'),
  });
  return (
    <div className="space-y-6">
      <div><h1 className="font-sans text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Pledges (Ahadi)</h1><p className="text-gray-500">Record and view member pledges</p>
        {!canRecord && <Badge className="mt-2 bg-[#C9962B]/20 text-[#7A5A10] border border-[#C9962B]/30">Read-only for System Admin (separation of duties)</Badge>}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="card-church"><CardHeader><CardTitle className="text-lg">Record Pledge</CardTitle></CardHeader><CardContent className="space-y-3">
          <fieldset disabled={!canRecord} className="space-y-3 disabled:opacity-70">
          <div className="space-y-2"><Label>Find Member</Label><Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search member" />
            <Select value={memberId} onValueChange={setMemberId}><SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger><SelectContent>{members.map((m:any)=><SelectItem key={m.id} value={m.id}>{m.fullName} {m.memberNo?`(${m.memberNo})`:''}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid sm:grid-cols-2 gap-3"><div className="space-y-2"><Label>Amount (TZS)</Label><Input type="number" value={amount} onChange={e=>setAmount(e.target.value)} /></div><div className="space-y-2"><Label>Target Date</Label><Input type="date" value={targetDate} onChange={e=>setTargetDate(e.target.value)} /></div></div>
          <div className="space-y-2"><Label>Notes</Label><Input value={notes} onChange={e=>setNotes(e.target.value)} /></div>
          <Button className="bg-[#7A1F2B] text-white hover:bg-[#651925]" onClick={()=>mut.mutate()} disabled={mut.isPending || !memberId || !amount || !canRecord}>{mut.isPending?'Saving...': canRecord ? 'Save Pledge' : 'Recording Disabled'}</Button>
          </fieldset>
        </CardContent></Card>
        <Card className="card-church"><CardHeader><CardTitle className="text-lg">Pledges</CardTitle></CardHeader><CardContent><div className="overflow-auto"><Table><TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Amount</TableHead><TableHead>Target</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{pledges.map((p:any)=><TableRow key={p.id}><TableCell>{p.member?.fullName || p.memberId}</TableCell><TableCell>TZS {Number(p.amount).toLocaleString()}</TableCell><TableCell>{p.targetDate ? new Date(p.targetDate).toLocaleDateString() : '—'}</TableCell><TableCell>{p.status}</TableCell></TableRow>)}{pledges.length===0 && <TableRow><TableCell colSpan={4} className="text-gray-500">No pledges recorded.</TableCell></TableRow>}</TableBody></Table></div></CardContent></Card>
      </div>
    </div>
  );
}
