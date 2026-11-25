import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function CategoryOversight({ category, title, point }: { category: string; title: string; point: string }){
  const { data=[] } = useQuery({ queryKey:['/finance/payments',category], queryFn: async()=> (await api.get('/finance/payments')).data });
  const rows = (Array.isArray(data)?data:[]).filter((r:any)=>r.category===category);
  const total = rows.reduce((s:number,r:any)=>s+Number(r.amount||0),0);
  return <div className="space-y-4"><div><h1 className="font-serif text-3xl text-gray-800">{title}</h1><p className="text-gray-500">{point} — read-only oversight.</p><Badge className="mt-2 bg-[#C9962B]/20 text-[#7A5A10] border border-[#C9962B]/30">Read-only (no recording)</Badge></div>
    <Card className="border-gray-100"><CardContent className="pt-4 text-sm">Records: <b>{rows.length}</b> · Total: <b>TZS {total.toLocaleString()}</b></CardContent></Card>
    <Card className="border-gray-100"><CardHeader><CardTitle>Records</CardTitle></CardHeader><CardContent className="overflow-auto"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Receipt</TableHead><TableHead>Member</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
      {rows.map((r:any)=>(<TableRow key={r.id}><TableCell>{new Date(r.contributedAt).toLocaleString()}</TableCell><TableCell>{r.receiptNo||'—'}</TableCell><TableCell>{r.member?.fullName||'—'}</TableCell><TableCell>TZS {Number(r.amount||0).toLocaleString()}</TableCell><TableCell>{r.paymentMethod||'—'}</TableCell><TableCell>{r.status}</TableCell></TableRow>))}
      {rows.length===0 && <TableRow><TableCell colSpan={6} className="text-gray-500">No records.</TableCell></TableRow>}
    </TableBody></Table></CardContent></Card></div>;
}
