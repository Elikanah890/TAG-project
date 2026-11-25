import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, Info, Search } from 'lucide-react';
import api from '@/lib/api';
import { formatNumber, PageHeader } from '@/components/admin/access/AccessUI';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MEMBER_ACTIONS = ['MEMBER_REGISTERED', 'MEMBER_APPROVED', 'MEMBER_REJECTED', 'MEMBER_PASSWORD_RESET', 'MEMBER_UPDATED'];

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

function actionTone(action: string) {
  if (action.includes('APPROVED')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (action.includes('REJECTED')) return 'bg-rose-50 text-rose-700 border-rose-200';
  if (action.includes('REGISTERED')) return 'bg-[#B38B45]/15 text-[#8a6a33] border-[#B38B45]/30';
  return 'bg-gray-100 text-gray-700 border-gray-200';
}

function describeMetadata(metadata: any): string {
  if (!metadata || typeof metadata !== 'object') return '—';
  const parts: string[] = [];
  if (metadata.fullName) parts.push(String(metadata.fullName));
  if (metadata.memberNo) parts.push(`No. ${metadata.memberNo}`);
  if (metadata.reason) parts.push(`Reason: ${metadata.reason}`);
  if (!parts.length) return '—';
  return parts.join(' · ');
}

export default function MembershipHistory() {
  const [q, setQ] = useState('');
  const { data: audit, isLoading: auditLoading } = useQuery({
    queryKey: ['membership-history-audit'],
    queryFn: async () => (await api.get('/admin/oversight/governance/audit-reports')).data,
  });
  const { data: registrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ['membership-history-registrations'],
    queryFn: async () => (await api.get('/admin/oversight/reports/registrations')).data,
  });

  const events = useMemo(() => {
    const logs: any[] = audit?.logs ?? [];
    return logs.filter((log) => log.entityType === 'Member' || MEMBER_ACTIONS.includes(log.action));
  }, [audit]);

  const approvedDates = useMemo(() => {
    const applications: any[] = registrations?.applications ?? [];
    return applications
      .filter((member) => member.approvedAt)
      .sort((a, b) => new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime());
  }, [registrations]);

  const filteredEvents = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return events;
    return events.filter((log) =>
      [log.action, log.actor?.email, log.entityId, describeMetadata(log.metadata)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [events, q]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Membership"
        title="Membership History"
        description="Traceable membership events from the immutable audit trail, plus the approval dates recorded on member records. History is read-only and cannot be edited."
        actions={<Badge variant="outline" className="border-[#711F32]/20 text-[#711F32]">Read-only oversight</Badge>}
      />

      <Tabs defaultValue="audit" className="space-y-4">
        <TabsList className="bg-[#F4EBDD]/60">
          <TabsTrigger value="audit">Audit trail</TabsTrigger>
          <TabsTrigger value="dates">Recorded approval dates</TabsTrigger>
        </TabsList>

        <TabsContent value="audit">
          <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-4 w-4 text-[#711F32]" /> Membership audit events
                <span className="text-sm font-normal text-gray-400">({formatNumber(filteredEvents.length)})</span>
              </CardTitle>
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search action, actor or member" className="pl-9" />
              </div>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <p className="text-sm text-gray-500">Loading audit trail…</p>
              ) : (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>When</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Member / details</TableHead>
                        <TableHead>Actor</TableHead>
                        <TableHead>Record ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEvents.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap text-sm text-gray-600">{formatDate(log.createdAt)}</TableCell>
                          <TableCell>
                            <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${actionTone(log.action)}`}>
                              {log.action}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-700">{describeMetadata(log.metadata)}</TableCell>
                          <TableCell className="text-sm text-gray-600">{log.actor?.email || 'System'}</TableCell>
                          <TableCell className="font-mono text-xs text-gray-400">{log.entityId || '—'}</TableCell>
                        </TableRow>
                      ))}
                      {filteredEvents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-sm text-gray-500">
                            No membership audit events recorded yet.
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dates">
          <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recorded approval dates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#B38B45]/20 bg-[#F4EBDD]/40 px-3 py-2 text-xs text-gray-600">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#B38B45]" />
                These dates are read directly from each member record (created and approved timestamps). They are not a
                reconstructed event log; use the audit trail for the authoritative event history.
              </div>
              {registrationsLoading ? (
                <p className="text-sm text-gray-500">Loading recorded dates…</p>
              ) : (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Member No</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Approved</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedDates.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium text-gray-800">{member.fullName}</TableCell>
                          <TableCell className="text-sm text-gray-600">{member.memberNo || '—'}</TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-gray-600">{formatDate(member.createdAt)}</TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-gray-600">{formatDate(member.approvedAt)}</TableCell>
                        </TableRow>
                      ))}
                      {approvedDates.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-sm text-gray-500">
                            No approval dates recorded yet.
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
