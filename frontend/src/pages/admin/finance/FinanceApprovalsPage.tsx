import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { PageHeader, SectionCard, formatDate, formatMoney } from '@/components/admin/access/AccessUI';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function FinanceApprovalsPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ['finance-expenses'], queryFn: async () => (await api.get('/finance/expenses')).data.catch(()=>[]) });
  const pending = (Array.isArray(data)?data:[]).filter((e:any)=>String(e.status).toUpperCase()==='PENDING');
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Financial Accountability" title="Approvals" description="Pending financial actions requiring authorized review." />
      <SectionCard title="Pending expense approvals" description="Real expense records with PENDING status. Approval workflow endpoints can be extended without changing history.">
        {isLoading ? <p className="text-sm text-gray-500">Loading...</p> : (
          <div className="overflow-auto"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {pending.map((e:any)=><TableRow key={e.id}><TableCell className="text-xs">{formatDate(e.date||e.createdAt)}</TableCell><TableCell className="text-xs">{e.description}</TableCell><TableCell className="text-xs">{e.category}</TableCell><TableCell className="text-xs text-right">{formatMoney(e.amount)}</TableCell><TableCell><Badge variant="outline">{e.status}</Badge></TableCell></TableRow>)}
              {pending.length===0 && <TableRow><TableCell colSpan={5} className="text-sm text-gray-500">No pending approvals.</TableCell></TableRow>}
            </TableBody></Table></div>
        )}
      </SectionCard>
    </div>
  );
}
