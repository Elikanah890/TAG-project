import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type PledgeItem = { id: string; amount: string | number; status: string; notes?: string | null; targetDate?: string | null; createdAt: string };

export default function MemberPledges() {
  const { data, isLoading, error } = useQuery({ queryKey: ['my-pledges'], queryFn: async () => (await api.get('/finance/my-pledges')).data });
  const pledges = data?.pledges || [];
  const total = data?.totals?.amount || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">My Pledges</h1>
        <p className="mt-1 text-sm text-gray-500">Pledges you have made to the church</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="rounded-xl border border-gray-100 bg-white shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-base">Total Pledged</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-gray-800">TZS {Number(total).toLocaleString()}</div></CardContent></Card>
        <Card className="rounded-xl border border-gray-100 bg-white shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-base">Pledges</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-gray-800">{pledges.length}</div></CardContent></Card>
      </div>
      <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <CardHeader><CardTitle className="text-lg">Pledge History</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="mt-1 text-sm text-gray-500">Loading...</p> : error ? <p className="text-destructive">Failed to load pledges.</p> : pledges.length === 0 ? <p className="mt-1 text-sm text-gray-500">No pledges recorded yet.</p> : (
            <div className="overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Target Date</TableHead><TableHead>Notes</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount (TZS)</TableHead></TableRow></TableHeader>
                <TableBody>
                  {pledges.map((p: PledgeItem) => (
                    <TableRow key={p.id}>
                      <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{p.targetDate ? new Date(p.targetDate).toLocaleDateString() : '—'}</TableCell>
                      <TableCell className="max-w-xs truncate">{p.notes || '—'}</TableCell>
                      <TableCell><Badge variant="outline">{p.status}</Badge></TableCell>
                      <TableCell className="text-right font-semibold">{Number(p.amount).toLocaleString()}</TableCell>
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
