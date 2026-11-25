import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, DatabaseBackup, HardDrive, RefreshCw, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  EmptyBlock,
  ErrorBlock,
  InfoNote,
  LoadingBlock,
  PageHeader,
  SectionCard,
  StatCard,
  formatDate,
  timeAgo,
} from '@/components/admin/access/AccessUI';

export default function Backups() {
  const queryClient = useQueryClient();
  const backups = useQuery({ queryKey: ['access-backups'], queryFn: async () => (await api.get('/admin/system/backups')).data });
  const rows = Array.isArray(backups.data) ? backups.data : [];
  const successes = rows.filter((backup: any) => backup.status === 'SUCCESS');
  const failures = rows.filter((backup: any) => backup.status === 'FAILED');
  const latest = successes[0] || rows[0] || null;

  const requestBackup = useMutation({
    mutationFn: async () => (await api.post('/admin/system/backup')).data,
    onSuccess: () => {
      toast.success('Backup run recorded');
      queryClient.invalidateQueries({ queryKey: ['access-backups'] });
      queryClient.invalidateQueries({ queryKey: ['church-dashboard'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Could not record the backup request'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System Administration"
        title="Backups"
        description="Run pg_dump on the application server and review recorded backup outcomes. A successful record reflects pg_dump's exit status, not a tested restore."
        actions={
          <>
            <Button variant="outline" onClick={() => backups.refetch()} disabled={backups.isFetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${backups.isFetching ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button className="bg-[#7A1F2B] text-white hover:bg-[#651925]" onClick={() => requestBackup.mutate()} disabled={requestBackup.isPending}>
              <DatabaseBackup className="mr-2 h-4 w-4" />{requestBackup.isPending ? 'Running pg_dump…' : 'Run backup now'}
            </Button>
          </>
        }
      />

      {backups.isLoading ? <LoadingBlock label="Loading backup history…" /> : backups.isError ? <ErrorBlock onRetry={() => backups.refetch()} /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Recorded attempts" value={rows.length} icon={HardDrive} />
            <StatCard label="Successful records" value={successes.length} icon={CheckCircle2} tone="success" />
            <StatCard label="Failed records" value={failures.length} icon={ShieldAlert} tone={failures.length ? 'danger' : 'default'} />
            <StatCard
              label="Latest record"
              value={latest ? timeAgo(latest.createdAt) : 'None'}
              hint={latest ? formatDate(latest.createdAt) : 'No backup records yet'}
              icon={DatabaseBackup}
              tone={latest?.status === 'FAILED' ? 'warning' : 'default'}
            />
          </div>

          <InfoNote>
            Backups run <code>pg_dump</code> against the configured PostgreSQL database and record the outcome here. A SUCCESS record means pg_dump exited successfully; it does not prove restorability. Test restores separately and keep off-server copies.
          </InfoNote>

          <SectionCard title="Backup history" description="Recorded backup attempts from the database">
            {rows.length === 0 ? (
              <EmptyBlock title="No backup records" description="Recorded backup requests will appear here." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#C9962B]/10 hover:bg-[#C9962B]/10">
                      <TableHead>Requested</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((backup: any) => (
                      <TableRow key={backup.id}>
                        <TableCell>
                          <p className="text-xs font-medium text-gray-800">{formatDate(backup.createdAt)}</p>
                          <p className="text-[11px] text-gray-500">{timeAgo(backup.createdAt)}</p>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            backup.status === 'SUCCESS'
                              ? 'border-emerald-300 bg-emerald-100 text-emerald-950'
                              : backup.status === 'FAILED'
                                ? 'border-rose-300 bg-rose-100 text-rose-950'
                                : 'border-[#C9962B]/30 bg-[#C9962B]/15 text-[#7A5A10]'
                          }`}>
                            {backup.status === 'FAILED' ? <AlertTriangle className="h-3 w-3" /> : null}
                            {backup.status}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[240px] truncate text-xs text-gray-500" title={backup.location || ''}>{backup.location || '—'}</TableCell>
                        <TableCell className="max-w-[360px] text-xs text-gray-500">{backup.notes || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
