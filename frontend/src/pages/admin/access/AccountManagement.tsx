import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, CheckCircle2, KeyRound, LogOut, RefreshCw, ShieldAlert, UserCheck, UserX, Users } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader, StatCard, StatusBadge, LoadingBlock, ErrorBlock, EmptyBlock, formatDate, timeAgo } from '@/components/admin/access/AccessUI';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AccountManagement() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('ALL');
  const [resetInfo, setResetInfo] = useState<any | null>(null);

  const users = useQuery({
    queryKey: ['access-accounts', status],
    queryFn: async () => (await api.get('/admin/users', { params: { status: status === 'ALL' ? undefined : status, page: 1, pageSize: 100 } })).data,
  });

  const rows = users.data?.data || [];
  const counts = users.data?.counts?.byStatus || [];
  const byStatus = (s: string) => counts.find((c: any) => c.status === s)?.count ?? 0;
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['access-accounts'] });
    qc.invalidateQueries({ queryKey: ['access-users'] });
    qc.invalidateQueries({ queryKey: ['access-users-summary'] });
  };

  const action = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'suspend' | 'activate' }) => (await api.post(`/admin/users/${id}/${action}`)).data,
    onSuccess: (_d, v) => { toast.success(v.action === 'suspend' ? 'Account suspended' : 'Account activated'); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Action failed'),
  });

  const resetPassword = useMutation({
    mutationFn: async (id: string) => (await api.post(`/admin/users/${id}/reset-password`)).data,
    onSuccess: (data: any) => { setResetInfo(data); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Reset failed'),
  });

  const revokeSessions = useMutation({
    mutationFn: async (id: string) => (await api.post(`/admin/users/${id}/sessions/revoke-all`)).data,
    onSuccess: (data: any) => { toast.success(`Revoked ${data?.revoked ?? 0} session(s)`); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to revoke sessions'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account Management"
        title="Account Status"
        description="Review active, suspended and pending accounts. Suspension revokes all active sessions immediately and is enforced on every API request."
        actions={<Button variant="outline" onClick={() => users.refetch()} disabled={users.isFetching}><RefreshCw className={`mr-2 h-4 w-4 ${users.isFetching ? 'animate-spin' : ''}`} />Refresh</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="All accounts" value={users.data?.meta?.total ?? 0} icon={Users} />
        <StatCard label="Active" value={byStatus('ACTIVE')} icon={UserCheck} tone="success" />
        <StatCard label="Suspended" value={byStatus('SUSPENDED')} icon={UserX} tone={byStatus('SUSPENDED') ? 'danger' : 'default'} />
        <StatCard label="Pending" value={byStatus('PENDING')} icon={ShieldAlert} tone={byStatus('PENDING') ? 'warning' : 'default'} />
      </div>

      <Tabs value={status} onValueChange={setStatus}>
        <TabsList className="grid w-full max-w-xl grid-cols-4">
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="ACTIVE">Active</TabsTrigger>
          <TabsTrigger value="SUSPENDED">Suspended</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="border-gray-100 bg-white/80">
        <CardContent className="p-0">
          {users.isLoading ? <div className="p-4"><LoadingBlock /></div> : users.isError ? <div className="p-4"><ErrorBlock onRetry={() => users.refetch()} /></div> : rows.length === 0 ? <div className="p-4"><EmptyBlock title="No accounts in this state" /></div> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="bg-[#C9962B]/10 hover:bg-[#C9962B]/10"><TableHead>User</TableHead><TableHead>Roles</TableHead><TableHead>Status</TableHead><TableHead>Last login</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.map((u: any) => (
                    <TableRow key={u.id}>
                      <TableCell><p className="font-medium text-gray-800">{u.email}</p><p className="text-xs text-gray-500">{u.member?.fullName || '—'}</p></TableCell>
                      <TableCell className="text-xs">{(u.roles || []).map((r: any) => r.role?.name).join(', ') || '—'}</TableCell>
                      <TableCell><StatusBadge status={u.status} /></TableCell>
                      <TableCell className="text-xs text-gray-500">{u.lastLoginAt ? timeAgo(u.lastLoginAt) : 'Never'}</TableCell>
                      <TableCell className="text-xs text-gray-500">{formatDate(u.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap justify-end gap-1">
                          {u.status === 'ACTIVE' ? (
                            <Button size="sm" variant="outline" className="text-rose-700" onClick={() => action.mutate({ id: u.id, action: 'suspend' })}><Ban className="mr-1 h-3.5 w-3.5" />Suspend</Button>
                          ) : (
                            <Button size="sm" variant="outline" className="text-emerald-700" onClick={() => action.mutate({ id: u.id, action: 'activate' })}><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Activate</Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => resetPassword.mutate(u.id)}><KeyRound className="mr-1 h-3.5 w-3.5" />Reset</Button>
                          <Button size="sm" variant="outline" onClick={() => revokeSessions.mutate(u.id)}><LogOut className="mr-1 h-3.5 w-3.5" />Sessions</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!resetInfo} onOpenChange={(o) => !o && setResetInfo(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Temporary password</DialogTitle><DialogDescription>Share securely with {resetInfo?.email}. Sessions were revoked.</DialogDescription></DialogHeader>
          <div className="rounded-lg border border-gray-100 bg-[#C9962B]/10 p-4 text-center"><code className="text-lg font-semibold text-gray-800">{resetInfo?.temporaryPassword}</code></div>
          <DialogFooter><Button className="bg-[#7A1F2B]" onClick={() => setResetInfo(null)}>Done</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
