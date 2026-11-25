import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { PageHeader, SectionCard, formatDate } from '@/components/admin/access/AccessUI';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function FinanceAuditTrailPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ['finance-audit-trail'], queryFn: async () => (await api.get('/finance/audit-trail')).data.catch(()=>[]) });
  const rows = Array.isArray(data) ? data : [];
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Financial Accountability" title="Financial Audit Trail" description="Traceable financial actions recorded in audit logs." />
      <SectionCard title="Recent financial audit events" description="Actor, action, entity, and timestamp from real audit records.">
        {isLoading ? <p className="text-sm text-gray-500">Loading...</p> : (
          <div className="overflow-auto"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>Actor</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((r: any) => <TableRow key={r.id}><TableCell className="text-xs whitespace-nowrap">{formatDate(r.createdAt)}</TableCell><TableCell className="text-xs font-medium">{String(r.action).replaceAll('_',' ')}</TableCell><TableCell className="text-xs">{r.entityType}{r.entityId ? ` (${String(r.entityId).slice(0,8)})` : ''}</TableCell><TableCell className="text-xs">{r.actor?.email || '—'}</TableCell></TableRow>)}
              {rows.length === 0 && <TableRow><TableCell colSpan={4} className="text-sm text-gray-500">No financial audit events found.</TableCell></TableRow>}
            </TableBody></Table></div>
        )}
      </SectionCard>
    </div>
  );
}
