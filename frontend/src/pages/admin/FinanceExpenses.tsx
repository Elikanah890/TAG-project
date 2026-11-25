import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function FinanceExpenses() {
  const qc = useQueryClient();
  const { hasRole } = useAuth();
  const canRecord = hasRole('FINANCE_ADMIN');
  const [description, setDescription] = useState(''); const [category, setCategory] = useState(''); const [amount, setAmount] = useState(''); const [date, setDate] = useState('');
  const { data: expenses = [] } = useQuery({ queryKey: ['finance-expenses'], queryFn: async () => (await api.get('/finance/expenses')).data });
  const mut = useMutation({
    mutationFn: async () => (await api.post('/finance/expenses', { description, category, amount: Number(amount), date: date || undefined })).data,
    onSuccess: () => { toast.success('Expense recorded'); setDescription(''); setCategory(''); setAmount(''); setDate(''); qc.invalidateQueries({queryKey:['finance-expenses']}); qc.invalidateQueries({queryKey:['dashboard-finance']}); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to record expense'),
  });
  return (
    <div className="space-y-6">
      <div><h1 className="font-sans text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Expenses (Matumizi)</h1><p className="text-gray-500">Record and view expenses</p>
        {!canRecord && <Badge className="mt-2 bg-[#C9962B]/20 text-[#7A5A10] border border-[#C9962B]/30">Read-only for System Admin (separation of duties)</Badge>}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="card-church"><CardHeader><CardTitle className="text-lg">Record Expense</CardTitle></CardHeader><CardContent className="space-y-3">
          <fieldset disabled={!canRecord} className="space-y-3 disabled:opacity-70">
          <div className="space-y-2"><Label>Description</Label><Input value={description} onChange={e=>setDescription(e.target.value)} /></div>
          <div className="grid sm:grid-cols-2 gap-3"><div className="space-y-2"><Label>Category</Label><Input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Utilities, Transport..." /></div><div className="space-y-2"><Label>Amount (TZS)</Label><Input type="number" value={amount} onChange={e=>setAmount(e.target.value)} /></div></div>
          <div className="space-y-2"><Label>Date</Label><Input type="date" value={date} onChange={e=>setDate(e.target.value)} /></div>
          <Button className="bg-[#7A1F2B] text-white hover:bg-[#651925]" onClick={()=>mut.mutate()} disabled={mut.isPending || !description || !category || !amount || !canRecord}>{mut.isPending?'Saving...': canRecord ? 'Save Expense' : 'Recording Disabled'}</Button>
          </fieldset>
        </CardContent></Card>
        <Card className="card-church"><CardHeader><CardTitle className="text-lg">Expenses</CardTitle></CardHeader><CardContent><div className="overflow-auto"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Category</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader><TableBody>{expenses.map((e:any)=><TableRow key={e.id}><TableCell>{new Date(e.date).toLocaleDateString()}</TableCell><TableCell>{e.description}</TableCell><TableCell>{e.category}</TableCell><TableCell>TZS {Number(e.amount).toLocaleString()}</TableCell></TableRow>)}{expenses.length===0 && <TableRow><TableCell colSpan={4} className="text-gray-500">No expenses recorded.</TableCell></TableRow>}</TableBody></Table></div></CardContent></Card>
      </div>
    </div>
  );
}
