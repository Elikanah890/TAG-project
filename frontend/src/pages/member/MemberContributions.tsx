import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function MemberContributions() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-contributions'],
    queryFn: async () => (await api.get('/finance/my-contributions')).data,
  });
  const contributions = data?.contributions || [];
  const total = data?.totals?.amount || 0;

  const download = async (receiptNo: string) => {
    try {
      const res = await api.get(`/finance/receipts/${receiptNo}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url; a.download = `${receiptNo}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Failed to download receipt'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">My Contributions</h1>
        <p className="mt-1 text-sm text-gray-500">Your personal giving history</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="rounded-xl border border-gray-100 bg-white shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-base">Total Contributions</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-gray-800">TZS {Number(total).toLocaleString()}</div></CardContent></Card>
        <Card className="rounded-xl border border-gray-100 bg-white shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-base">Records</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-gray-800">{contributions.length}</div></CardContent></Card>
      </div>
      <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <CardHeader><CardTitle className="text-lg">Giving History</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="mt-1 text-sm text-gray-500">Loading...</p> : error ? <p className="text-destructive">Failed to load contributions.</p> : contributions.length === 0 ? <p className="mt-1 text-sm text-gray-500">No contributions recorded yet.</p> : (
            <div className="overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Receipt</TableHead><TableHead>Category</TableHead><TableHead>Method</TableHead><TableHead className="text-right">Amount (TZS)</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {contributions.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell>{new Date(c.contributedAt).toLocaleString()}</TableCell>
                      <TableCell className="font-medium">{c.receiptNo || '—'}</TableCell>
                      <TableCell>{c.category}</TableCell>
                      <TableCell>{c.paymentMethod || '—'}</TableCell>
                      <TableCell className="text-right font-semibold">{Number(c.amount).toLocaleString()}</TableCell>
                      <TableCell>{c.receiptNo && <Button size="sm" variant="outline" onClick={()=>download(c.receiptNo)}>Download PDF</Button>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
