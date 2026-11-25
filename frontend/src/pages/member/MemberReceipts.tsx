import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type ReceiptItem = { id: string; receiptNo: string; category: string; paymentMethod?: string | null; amount: string | number; contributedAt: string };

export default function MemberReceipts() {
  const { data, isLoading, error } = useQuery({ queryKey: ['my-receipts'], queryFn: async () => (await api.get('/finance/my-receipts')).data });
  const receipts = data?.receipts || [];

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
        <h1 className="font-sans text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">My Receipts</h1>
        <p className="mt-1 text-sm text-gray-500">Download receipts for your giving</p>
      </div>
      <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <CardHeader><CardTitle className="text-lg">Receipts</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="mt-1 text-sm text-gray-500">Loading...</p> : error ? <p className="text-destructive">Failed to load receipts.</p> : receipts.length === 0 ? <p className="mt-1 text-sm text-gray-500">No receipts yet.</p> : (
            <div className="overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Receipt</TableHead><TableHead>Category</TableHead><TableHead>Method</TableHead><TableHead className="text-right">Amount (TZS)</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {receipts.map((r: ReceiptItem) => (
                    <TableRow key={r.id}>
                      <TableCell>{new Date(r.contributedAt).toLocaleString()}</TableCell>
                      <TableCell className="font-medium">{r.receiptNo}</TableCell>
                      <TableCell>{r.category}</TableCell>
                      <TableCell>{r.paymentMethod || '—'}</TableCell>
                      <TableCell className="text-right font-semibold">{Number(r.amount).toLocaleString()}</TableCell>
                      <TableCell><Button size="sm" variant="outline" onClick={() => download(r.receiptNo)}>Download PDF</Button></TableCell>
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
