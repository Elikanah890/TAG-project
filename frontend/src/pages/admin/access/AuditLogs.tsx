import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSearch, RefreshCw, Search } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock, formatDate, JsonPreview, StatusBadge } from '@/components/admin/access/AccessUI';

export default function AuditLogs() {
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('ALL');
  const [limit, setLimit] = useState('100');
  const logs = useQuery({
    queryKey: ['access-audit-logs', action, entityType, limit],
    queryFn: async () => (await api.get('/admin/audit-logs', { params: { action: action || undefined, entityType: entityType === 'ALL' ? undefined : entityType, limit } })).data,
  });
  const rows = logs.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Governance & Accountability"
        title="System Audit Logs"
        description="Immutable application audit trail for authentication, user, role, permission, session and system changes."
        actions={<Button variant="outline" onClick={() => logs.refetch()} disabled={logs.isFetching}><RefreshCw className={`mr-2 h-4 w-4 ${logs.isFetching ? 'animate-spin' : ''}`} />Refresh</Button>}
      />
      <Card className="border-gray-100 bg-white/80">
        <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_200px_160px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input className="pl-9" placeholder="Filter by action (e.g. LOGIN, USER_ROLES_UPDATED)" value={action} onChange={(e) => setAction(e.target.value)} />
          </div>
          <Select value={entityType} onValueChange={setEntityType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All entities</SelectItem>
              {['User', 'Role', 'Permission', 'RefreshToken', 'SystemConfig', 'BackupLog', 'Notification', 'Budget', 'Project'].map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={limit} onValueChange={setLimit}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="50">Last 50</SelectItem><SelectItem value="100">Last 100</SelectItem><SelectItem value="250">Last 250</SelectItem><SelectItem value="500">Last 500</SelectItem></SelectContent>
          </Select>
        </CardContent>
      </Card>
      <Card className="border-gray-100 bg-white/80">
        <CardContent className="p-0">
          {logs.isLoading ? <div className="p-4"><LoadingBlock /></div> : logs.isError ? <div className="p-4"><ErrorBlock onRetry={() => logs.refetch()} /></div> : rows.length === 0 ? <div className="p-4"><EmptyBlock title="No audit entries match these filters" /></div> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="bg-[#C9962B]/10 hover:bg-[#C9962B]/10"><TableHead>Time</TableHead><TableHead>Actor</TableHead><TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>Metadata</TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.map((entry: any) => (
                    <TableRow key={entry.id}>
                      <TableCell className="whitespace-nowrap text-xs text-gray-500">{formatDate(entry.createdAt)}</TableCell>
                      <TableCell className="text-xs">{entry.actor?.email || 'system'}</TableCell>
                      <TableCell><div className="flex items-center gap-2"><FileSearch className="h-3.5 w-3.5 text-[#A9771F]" /><span className="text-xs font-medium text-gray-800">{entry.action}</span></div></TableCell>
                      <TableCell className="text-xs text-gray-500">{entry.entityType}{entry.entityId ? ` · ${String(entry.entityId).slice(0, 10)}…` : ''}</TableCell>
                      <TableCell className="max-w-[320px]"><JsonPreview value={entry.metadata} /></TableCell>
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
