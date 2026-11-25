import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { PageHeader, SectionCard, formatMoney } from '@/components/admin/access/AccessUI';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function FinanceAccountsPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ['finance-accounts'], queryFn: async () => (await api.get('/finance/accounts')).data.catch(()=>[]) });
  const rows = Array.isArray(data) ? data : [];
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Expenses & Planning" title="Accounts & Funds" description="Financial accounts and fund balances from live records." />
      <SectionCard title="Accounts" description="Configured financial accounts. Transfers should be recorded as transfers, not income.">
        {isLoading ? <p className="text-sm text-gray-500">Loading...</p> : (
          <div className="overflow-auto"><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Provider</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Opening balance</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((a: any) => <TableRow key={a.id}><TableCell className="font-medium">{a.name}</TableCell><TableCell>{a.type}</TableCell><TableCell>{a.provider || '—'}</TableCell><TableCell>{a.status}</TableCell><TableCell className="text-right">{formatMoney(a.openingBalance)}</TableCell></TableRow>)}
              {rows.length === 0 && <TableRow><TableCell colSpan={5} className="text-sm text-gray-500">No accounts found.</TableCell></TableRow>}
            </TableBody></Table></div>
        )}
      </SectionCard>
    </div>
  );
}
