import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { History, RefreshCw, ShieldCheck, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader, SectionCard, StatCard, StatusBadge, LoadingBlock, ErrorBlock, EmptyBlock, formatDate } from '@/components/admin/access/AccessUI';

export default function RoleAssignment() {
  const qc = useQueryClient();
  const [userId, setUserId] = useState('');
  const [action, setAction] = useState<'assign' | 'revoke'>('assign');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [historyAction, setHistoryAction] = useState('ALL');
  const [historyRole, setHistoryRole] = useState('ALL');

  const users = useQuery({ queryKey: ['access-users-picker'], queryFn: async () => (await api.get('/admin/users?page=1&pageSize=100&status=ACTIVE')).data });
  const roles = useQuery({ queryKey: ['access-roles'], queryFn: async () => (await api.get('/admin/roles')).data });
  const history = useQuery({
    queryKey: ['access-role-history', historyAction, historyRole],
    queryFn: async () => (await api.get('/admin/role-assignments', { params: { limit: 200, action: historyAction === 'ALL' ? undefined : historyAction, roleId: historyRole === 'ALL' ? undefined : historyRole } })).data,
  });

  const userRows = users.data?.data || [];
  const roleRows = roles.data || [];
  const selectedUser = userRows.find((u: any) => u.id === userId);
  const currentRoles = (selectedUser?.roles || []).map((r: any) => r.role?.name);
  const historyRows = history.data || [];

  const mutation = useMutation({
    mutationFn: async () => (await api.patch(`/admin/users/${userId}/roles`, { [action]: selectedRoles, reason: reason || undefined })).data,
    onSuccess: () => {
      toast.success(`Roles ${action === 'assign' ? 'assigned' : 'revoked'} successfully`);
      setSelectedRoles([]);
      setReason('');
      qc.invalidateQueries({ queryKey: ['access-role-history'] });
      qc.invalidateQueries({ queryKey: ['access-users-picker'] });
      qc.invalidateQueries({ queryKey: ['access-users'] });
      qc.invalidateQueries({ queryKey: ['access-users-summary'] });
      qc.invalidateQueries({ queryKey: ['access-audit-overview'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Role update failed'),
  });

  const availableRoles = useMemo(() => roleRows.filter((r: any) => action === 'assign' ? !currentRoles.includes(r.name) : currentRoles.includes(r.name)), [roleRows, action, currentRoles]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Access Control"
        title="Role Assignment"
        description="Assign or revoke multiple roles with a recorded reason. Role changes take effect immediately and are written to assignment history and the audit log."
        actions={<Button variant="outline" onClick={() => history.refetch()} disabled={history.isFetching}><RefreshCw className={`mr-2 h-4 w-4 ${history.isFetching ? 'animate-spin' : ''}`} />Refresh history</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Assignments recorded" value={historyRows.length} icon={History} />
        <StatCard label="Assignments" value={historyRows.filter((h: any) => h.action === 'ASSIGN').length} icon={ShieldCheck} tone="success" />
        <StatCard label="Revocations" value={historyRows.filter((h: any) => h.action === 'REVOKE').length} icon={UserCog} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <SectionCard title="Assign or revoke" description="Select a user, choose roles and record a reason" className="lg:col-span-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>User</Label>
              <Select value={userId} onValueChange={(v) => { setUserId(v); setSelectedRoles([]); }}>
                <SelectTrigger><SelectValue placeholder="Select a user" /></SelectTrigger>
                <SelectContent>
                  {userRows.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.email}{u.member?.fullName ? ` · ${u.member.fullName}` : ''}</SelectItem>)}
                </SelectContent>
              </Select>
              {selectedUser ? (
                <div className="rounded-lg border border-gray-100 bg-[#C9962B]/5 p-3 text-xs">
                  <p className="font-medium text-gray-800">Current roles</p>
                  <div className="mt-1 flex flex-wrap gap-1">{currentRoles.length ? currentRoles.map((r: string) => <span key={r} className="rounded-full border border-gray-100 bg-white px-2 py-0.5">{r}</span>) : <span className="text-gray-500">No roles</span>}</div>
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Action</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant={action === 'assign' ? 'default' : 'outline'} className={action === 'assign' ? 'bg-[#7A1F2B]' : ''} onClick={() => { setAction('assign'); setSelectedRoles([]); }}>Assign</Button>
                <Button type="button" variant={action === 'revoke' ? 'default' : 'outline'} className={action === 'revoke' ? 'bg-[#7A1F2B]' : ''} onClick={() => { setAction('revoke'); setSelectedRoles([]); }}>Revoke</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Roles</Label>
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-gray-100 p-2">
                {!userId ? <p className="p-2 text-xs text-gray-500">Select a user first.</p> : availableRoles.length === 0 ? <p className="p-2 text-xs text-gray-500">No roles available for this action.</p> : availableRoles.map((r: any) => {
                  const on = selectedRoles.includes(r.name);
                  return (
                    <label key={r.id} className="flex cursor-pointer items-start gap-2 rounded px-2 py-1 text-sm hover:bg-[#C9962B]/10">
                      <input type="checkbox" className="mt-1" checked={on} onChange={() => setSelectedRoles((s) => on ? s.filter((x) => x !== r.name) : [...s, r.name])} />
                      <span><span className="block font-medium text-gray-800">{r.name}</span><span className="block text-[11px] text-gray-500">{r.isSystem ? 'System role' : 'Custom role'}</span></span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2"><Label>Reason</Label><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Appointed as department leader" /></div>
            <Button className="w-full bg-[#7A1F2B] text-white hover:bg-[#651925]" disabled={!userId || !selectedRoles.length || mutation.isPending} onClick={() => mutation.mutate()}>
              {mutation.isPending ? 'Saving…' : `${action === 'assign' ? 'Assign' : 'Revoke'} ${selectedRoles.length} role(s)`}
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Assignment history" description="Immutable record of role changes" className="lg:col-span-3" actions={
          <div className="flex gap-2">
            <Select value={historyAction} onValueChange={setHistoryAction}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="ALL">All actions</SelectItem><SelectItem value="ASSIGN">Assigned</SelectItem><SelectItem value="REVOKE">Revoked</SelectItem></SelectContent>
            </Select>
            <Select value={historyRole} onValueChange={setHistoryRole}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="ALL">All roles</SelectItem>{roleRows.map((r: any) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        }>
          {history.isLoading ? <LoadingBlock /> : history.isError ? <ErrorBlock onRetry={() => history.refetch()} /> : historyRows.length === 0 ? <EmptyBlock title="No role assignment history yet" /> : (
            <div className="max-h-[520px] overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>When</TableHead><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Action</TableHead><TableHead>By</TableHead><TableHead>Reason</TableHead></TableRow></TableHeader>
                <TableBody>
                  {historyRows.map((h: any) => (
                    <TableRow key={h.id}>
                      <TableCell className="whitespace-nowrap text-xs text-gray-500">{formatDate(h.createdAt)}</TableCell>
                      <TableCell className="text-xs">{h.user?.email || '—'}</TableCell>
                      <TableCell className="text-xs font-medium text-gray-800">{h.roleName}</TableCell>
                      <TableCell><StatusBadge status={h.action === 'ASSIGN' ? 'ACTIVE' : 'SUSPENDED'} /></TableCell>
                      <TableCell className="text-xs">{h.actor?.email || 'system'}</TableCell>
                      <TableCell className="max-w-[180px] truncate text-xs text-gray-500">{h.reason || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
