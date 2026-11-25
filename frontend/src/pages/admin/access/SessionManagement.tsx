import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, Monitor, RefreshCw, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader, StatCard, LoadingBlock, ErrorBlock, EmptyBlock, formatDate, timeAgo } from '@/components/admin/access/AccessUI';

export default function SessionManagement() {
  const qc = useQueryClient();
  const sessions = useQuery({ queryKey: ['access-sessions'], queryFn: async () => (await api.get('/admin/sessions?limit=200')).data });
  const rows = sessions.data || [];
  const users = new Set(rows.map((s: any) => s.userId)).size;

  const revoke = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/admin/sessions/${id}`)).data,
    onSuccess: () => { toast.success('Session revoked'); qc.invalidateQueries({ queryKey: ['access-sessions'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to revoke session'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Session Management"
        title="Active Sessions"
        description="Refresh-token sessions across all accounts. Revoking a session forces that device to re-authenticate. Access tokens are short-lived and permissions are re-checked server-side on every request."
        actions={<Button variant="outline" onClick={() => sessions.refetch()} disabled={sessions.isFetching}><RefreshCw className={`mr-2 h-4 w-4 ${sessions.isFetching ? 'animate-spin' : ''}`} />Refresh</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active sessions" value={rows.length} icon={Monitor} />
        <StatCard label="Distinct users" value={users} icon={ShieldCheck} tone="success" />
        <StatCard label="Expiring in 24h" value={rows.filter((s: any) => new Date(s.expiresAt).getTime() - Date.now() < 86400000).length} icon={LogOut} tone="warning" />
      </div>
      <Card className="border-gray-100 bg-white/80">
        <CardContent className="p-0">
          {sessions.isLoading ? <div className="p-4"><LoadingBlock /></div> : sessions.isError ? <div className="p-4"><ErrorBlock onRetry={() => sessions.refetch()} /></div> : rows.length === 0 ? <div className="p-4"><EmptyBlock title="No active sessions" description="Sessions appear here after users sign in." /></div> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="bg-[#C9962B]/10 hover:bg-[#C9962B]/10"><TableHead>User</TableHead><TableHead>IP</TableHead><TableHead>Device</TableHead><TableHead>Created</TableHead><TableHead>Last used</TableHead><TableHead>Expires</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-sm font-medium text-gray-800">{s.user?.email || s.userId}</TableCell>
                      <TableCell className="text-xs text-gray-500">{s.ip || '—'}</TableCell>
                      <TableCell className="max-w-[240px] truncate text-xs text-gray-500" title={s.userAgent || ''}>{s.userAgent || 'Unknown device'}</TableCell>
                      <TableCell className="text-xs text-gray-500">{formatDate(s.createdAt)}</TableCell>
                      <TableCell className="text-xs text-gray-500">{timeAgo(s.lastUsedAt)}</TableCell>
                      <TableCell className="text-xs text-gray-500">{formatDate(s.expiresAt)}</TableCell>
                      <TableCell className="text-right"><Button size="sm" variant="outline" className="text-rose-700" onClick={() => revoke.mutate(s.id)}><LogOut className="mr-1 h-3.5 w-3.5" />Revoke</Button></TableCell>
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
