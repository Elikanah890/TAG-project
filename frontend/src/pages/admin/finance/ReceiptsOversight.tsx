import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { useAuth } from '@/contexts/AuthContext';

export default function ReceiptsOversight(){
  const { hasRole } = useAuth();
  const isFinanceAdmin = hasRole('FINANCE_ADMIN');
  const { data=[] } = useQuery({ queryKey:['/finance/receipts'], queryFn: async()=> (await api.get('/finance/receipts')).data });
  const rows = Array.isArray(data)?data:[];
  const download = async (receiptNo:string)=>{ const res = await api.get(`/finance/receipts/${receiptNo}/pdf`, { responseType:'blob' }); const url = URL.createObjectURL(res.data); const a=document.createElement('a'); a.href=url; a.download=`${receiptNo}.pdf`; a.click(); URL.revokeObjectURL(url); };
  return <div className="space-y-4"><div><h1 className="font-serif text-3xl text-gray-800">{isFinanceAdmin ? 'Receipts' : 'Receipt Management (View & Verify)'}</h1><p className="text-gray-500">{isFinanceAdmin ? 'Download official contribution receipts from live payment records.' : 'View and verify receipts (point 16). Read-only oversight.'}</p><Badge className="mt-2 bg-[#C9962B]/20 text-[#7A5A10] border border-[#C9962B]/30">{isFinanceAdmin ? 'Read-only history' : 'Verify only · no recording'}</Badge></div>
    <Card className="border-gray-100"><CardHeader><CardTitle>Receipts ({rows.length})</CardTitle></CardHeader><CardContent className="overflow-auto"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Receipt No</TableHead><TableHead>Member</TableHead><TableHead>Category</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader><TableBody>
      {rows.map((r:any)=>(<TableRow key={r.id}><TableCell>{new Date(r.contributedAt).toLocaleString()}</TableCell><TableCell className="font-mono">{r.receiptNo}</TableCell><TableCell>{r.member?.fullName||'—'}</TableCell><TableCell>{r.category}</TableCell><TableCell>TZS {Number(r.amount||0).toLocaleString()}</TableCell><TableCell>{r.status}</TableCell><TableCell><Button size="sm" variant="outline" onClick={()=>download(r.receiptNo)}>View/Download PDF</Button></TableCell></TableRow>))}
    </TableBody></Table></CardContent></Card></div>;
}
