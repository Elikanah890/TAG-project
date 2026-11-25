import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, Database, HardDrive, RefreshCw, Server, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader, SectionCard, StatCard, LoadingBlock, ErrorBlock, StatusBadge, formatDate, timeAgo } from '@/components/admin/access/AccessUI';

export default function SystemHealth() {
  const qc = useQueryClient();
  const health = useQuery({ queryKey: ['access-health'], queryFn: async () => (await api.get('/admin/system/health')).data });
  const backups = useQuery({ queryKey: ['access-backups'], queryFn: async () => (await api.get('/admin/system/backups')).data });
  const oversight = useQuery({ queryKey: ['access-oversight-overview'], queryFn: async () => (await api.get('/admin/oversight/dashboard')).data });

  const runBackup = useMutation({
    mutationFn: async () => (await api.post('/admin/system/backup')).data,
    onSuccess: () => { toast.success('Backup triggered'); qc.invalidateQueries({ queryKey: ['access-backups'] }); qc.invalidateQueries({ queryKey: ['access-health'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Backup failed'),
  });

  const sysHealth = oversight.data?.systemHealth || {};
  const rows = backups.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System Administration"
        title="System Health"
        description="Live database connectivity, API uptime, backup status and security signals."
        actions={<>
          <Button variant="outline" onClick={() => { health.refetch(); backups.refetch(); }} disabled={health.isFetching}><RefreshCw className={`mr-2 h-4 w-4 ${health.isFetching ? 'animate-spin' : ''}`} />Refresh</Button>
          <Button className="bg-[#7A1F2B] text-white hover:bg-[#651925]" onClick={() => runBackup.mutate()} disabled={runBackup.isPending}><HardDrive className="mr-2 h-4 w-4" />{runBackup.isPending ? 'Starting…' : 'Run backup'}</Button>
        </>}
      />
      {health.isLoading ? <LoadingBlock /> : health.isError ? <ErrorBlock onRetry={() => health.refetch()} /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Database" value={<span className="capitalize">{health.data?.database || 'unknown'}</span>} icon={Database} tone={health.data?.database === 'connected' ? 'success' : 'danger'} />
          <StatCard label="API status" value={<span className="capitalize">{health.data?.status || 'unknown'}</span>} icon={Server} tone={health.data?.status === 'healthy' ? 'success' : 'warning'} />
          <StatCard label="Uptime" value={`${Math.floor((health.data?.uptimeSeconds || 0) / 60)}m`} icon={Activity} />
          <StatCard label="Failed logins" value={sysHealth.failedLoginAttempts ?? 0} hint="Recorded in audit logs" icon={ShieldAlert} tone={sysHealth.failedLoginAttempts ? 'warning' : 'default'} />
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Operational counts" description="Live database totals" className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-100 bg-white/70 p-4"><p className="text-xs text-gray-500">Users</p><p className="text-2xl font-semibold text-gray-800">{health.data?.counts?.users ?? '—'}</p></div>
            <div className="rounded-lg border border-gray-100 bg-white/70 p-4"><p className="text-xs text-gray-500">Active users</p><p className="text-2xl font-semibold text-gray-800">{health.data?.counts?.activeUsers ?? '—'}</p></div>
            <div className="rounded-lg border border-gray-100 bg-white/70 p-4"><p className="text-xs text-gray-500">Members</p><p className="text-2xl font-semibold text-gray-800">{health.data?.counts?.members ?? '—'}</p></div>
            <div className="rounded-lg border border-gray-100 bg-white/70 p-4"><p className="text-xs text-gray-500">Audit entries</p><p className="text-2xl font-semibold text-gray-800">{health.data?.counts?.auditLogs ?? '—'}</p></div>
            <div className="rounded-lg border border-gray-100 bg-white/70 p-4"><p className="text-xs text-gray-500">Last backup</p><p className="text-sm font-semibold text-gray-800">{sysHealth.lastSuccessfulBackup ? timeAgo(sysHealth.lastSuccessfulBackup) : 'None'}</p></div>
            <div className="rounded-lg border border-gray-100 bg-white/70 p-4"><p className="text-xs text-gray-500">Failed backups</p><p className="text-2xl font-semibold text-gray-800">{sysHealth.failedBackups ?? 0}</p></div>
          </div>
        </SectionCard>
        <SectionCard title="Security signals" description="From live audit records">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between"><span className="text-gray-500">Failed logins</span><StatusBadge status={(sysHealth.failedLoginAttempts || 0) > 0 ? 'SUSPENDED' : 'ACTIVE'} /></div>
            <div className="flex items-center justify-between"><span className="text-gray-500">Recent audit entries (7d)</span><span className="font-medium text-gray-800">{sysHealth.recentAuditEntries ?? '—'}</span></div>
            <div className="flex items-center justify-between"><span className="text-gray-500">Failed background jobs</span><span className="font-medium text-gray-800">{sysHealth.failedBackgroundJobs ?? 0}</span></div>
            {(sysHealth.recentSecurityAlerts || []).map((a: string) => <p key={a} className="rounded-md border border-gray-100 bg-[#C9962B]/10 p-2 text-xs text-[#7A5A10]">{a}</p>)}
          </div>
        </SectionCard>
      </div>
      <SectionCard title="Backup history" description="Recorded backup attempts">
        {backups.isLoading ? <LoadingBlock /> : backups.isError ? <ErrorBlock onRetry={() => backups.refetch()} /> : rows.length === 0 ? <p className="text-sm text-gray-500">No backups recorded yet.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Started</TableHead><TableHead>Status</TableHead><TableHead>Location</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((b: any) => (
                <TableRow key={b.id}>
                  <TableCell className="text-xs text-gray-500">{formatDate(b.createdAt)}</TableCell>
                  <TableCell><StatusBadge status={b.status === 'SUCCESS' ? 'ACTIVE' : 'SUSPENDED'} /></TableCell>
                  <TableCell className="max-w-[220px] truncate text-xs text-gray-500">{b.location || '—'}</TableCell>
                  <TableCell className="max-w-[320px] truncate text-xs text-gray-500">{b.notes || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </div>
  );
}
