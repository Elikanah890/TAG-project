import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { PageHeader, SectionCard, formatDate } from '@/components/admin/access/AccessUI';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function WhatsAppNotificationsPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ['finance-whatsapp-logs'], queryFn: async () => (await api.get('/finance/whatsapp-logs')).data });
  const rows = Array.isArray(data) ? data : [];
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Invoices & Payments" title="WhatsApp Notifications" description="WhatsApp share actions initiated from finance workflows. Click-to-chat does not confirm delivery." />
      <SectionCard title="Share log" description="Initiated share actions are logged for traceability.">
        {isLoading ? <p className="text-sm text-gray-500">Loading...</p> : (
          <div className="overflow-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Recipient</TableHead><TableHead>Phone</TableHead><TableHead>Invoice</TableHead><TableHead>Status</TableHead><TableHead>Provider</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs whitespace-nowrap">{formatDate(r.createdAt)}</TableCell>
                    <TableCell className="text-xs">{r.recipientName || r.member?.fullName || '—'}</TableCell>
                    <TableCell className="text-xs font-mono">{r.recipientPhone}</TableCell>
                    <TableCell className="text-xs font-mono">{r.invoice?.invoiceNo || r.documentNo || '—'}</TableCell>
                    <TableCell><Badge variant="outline">{String(r.status).replaceAll('_',' ')}</Badge></TableCell>
                    <TableCell className="text-xs">{r.provider || '—'}</TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && <TableRow><TableCell colSpan={6} className="text-sm text-gray-500">No WhatsApp share actions logged yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
