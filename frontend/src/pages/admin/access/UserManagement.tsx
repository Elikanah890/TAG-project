import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { MoreHorizontal, Search, UserPlus, RefreshCw, KeyRound, Ban, CheckCircle2, LogOut, ShieldCheck, Eye, Pencil, Copy } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader, StatCard, StatusBadge, LoadingBlock, ErrorBlock, EmptyBlock, Pagination, formatDate, timeAgo, JsonPreview } from '@/components/admin/access/AccessUI';
import { Users, UserCheck, UserX, ShieldAlert } from 'lucide-react';

type UserRow = any;

function useDebounced<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function RoleBadges({ roles }: { roles: any[] }) {
  if (!roles?.length) return <span className="text-xs text-gray-500">No roles</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((ur: any) => (
        <span key={ur.role?.id || ur.role?.name} className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${ur.role?.isSystem ? 'border-gray-100 bg-[#C9962B]/15 text-[#374151]' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
          {ur.role?.name}
        </span>
      ))}
    </div>
  );
}

export default function UserManagement() {
  const qc = useQueryClient();
  const { user: me } = useAuth();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const dq = useDebounced(q);
  const [status, setStatus] = useState('ALL');
  const [role, setRole] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [detailId, setDetailId] = useState<string | null>(null);
  const [roleTarget, setRoleTarget] = useState<UserRow | null>(null);
  const [roleSelection, setRoleSelection] = useState<string[]>([]);
  const [roleReason, setRoleReason] = useState('');
  const [resetInfo, setResetInfo] = useState<{ email: string; temporaryPassword?: string; passwordSet?: boolean } | null>(null);
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [createOpen, setCreateOpen] = useState(params.get('new') === '1');
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [form, setForm] = useState<any>({ email: '', phone: '', status: 'ACTIVE', roles: ['CHURCH_MEMBER'], password: '' });

  useEffect(() => { setPage(1); }, [dq, status, role]);
  useEffect(() => { if (params.get('new') === '1') { setCreateOpen(true); params.delete('new'); setParams(params, { replace: true }); } }, [params, setParams]);

  const users = useQuery({
    queryKey: ['access-users', dq, status, role, page],
    queryFn: async () => (await api.get('/admin/users', { params: { q: dq || undefined, status: status === 'ALL' ? undefined : status, role: role === 'ALL' ? undefined : role, page, pageSize } })).data,
  });
  const roles = useQuery({ queryKey: ['access-roles'], queryFn: async () => (await api.get('/admin/roles')).data });
  const detail = useQuery({ queryKey: ['access-user-detail', detailId], enabled: !!detailId, queryFn: async () => (await api.get(`/admin/users/${detailId}`)).data });

  const counts = users.data?.counts?.byStatus || [];
  const byStatus = (s: string) => counts.find((c: any) => c.status === s)?.count ?? 0;
  const rows: UserRow[] = users.data?.data || [];
  const roleOptions = roles.data || [];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['access-users'] });
    qc.invalidateQueries({ queryKey: ['access-users-summary'] });
    qc.invalidateQueries({ queryKey: ['access-user-detail'] });
    qc.invalidateQueries({ queryKey: ['access-audit-overview'] });
  };

  const createUser = useMutation({
    mutationFn: async () => (await api.post('/admin/users', { email: form.email, phone: form.phone || undefined, status: form.status, roles: form.roles, password: form.password || undefined })).data,
    onSuccess: (data: any) => {
      toast.success('User account created');
      if (data?.temporaryPassword) setResetInfo({ email: data?.user?.email || form.email, temporaryPassword: data.temporaryPassword });
      setCreateOpen(false);
      setForm({ email: '', phone: '', status: 'ACTIVE', roles: ['CHURCH_MEMBER'], password: '' });
      invalidate();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create user'),
  });

  const updateUser = useMutation({
    mutationFn: async () => (await api.patch(`/admin/users/${editing?.id}`, { email: form.email, phone: form.phone || null })).data,
    onSuccess: () => { toast.success('User updated'); setEditing(null); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to update user'),
  });

  const assignRoles = useMutation({
    mutationFn: async () => {
      const current = (roleTarget?.roles || []).map((r: any) => r.role?.name);
      const assign = roleSelection.filter((r) => !current.includes(r));
      const revoke = current.filter((r: string) => !roleSelection.includes(r));
      return (await api.patch(`/admin/users/${roleTarget?.id}/roles`, { assign, revoke, reason: roleReason || undefined })).data;
    },
    onSuccess: () => { toast.success('Roles updated'); setRoleTarget(null); setRoleReason(''); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to update roles'),
  });

  const statusAction = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'suspend' | 'activate' }) => (await api.post(`/admin/users/${id}/${action}`)).data,
    onSuccess: (_d, vars) => { toast.success(vars.action === 'suspend' ? 'Account suspended' : 'Account activated'); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Action failed'),
  });

  const resetPassword = useMutation({
    mutationFn: async ({ id, password }: { id: string; password?: string }) => (await api.post(`/admin/users/${id}/reset-password`, password ? { password } : {})).data,
    onSuccess: (data: any) => {
      setResetInfo({ email: data.email, temporaryPassword: data.temporaryPassword, passwordSet: !!data.passwordSet });
      setResetTarget(null); setResetPasswordValue('');
      toast.success(data.passwordSet ? 'Password updated by administrator.' : 'Temporary password generated. Share it securely.');
      invalidate();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Reset failed'),
  });

  const revokeSessions = useMutation({
    mutationFn: async (id: string) => (await api.post(`/admin/users/${id}/sessions/revoke-all`)).data,
    onSuccess: (data: any) => { toast.success(`Revoked ${data?.revoked ?? 0} session(s)`); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to revoke sessions'),
  });

  const openRoles = (u: UserRow) => {
    setRoleTarget(u);
    setRoleSelection((u.roles || []).map((r: any) => r.role?.name));
    setRoleReason('');
  };

  const openEdit = (u: UserRow) => { setEditing(u); setForm({ email: u.email, phone: u.phone || '', status: u.status, roles: [], password: '' }); };

  const totalUsers = users.data?.meta?.total ?? 0;
  const activeCount = byStatus('ACTIVE');
  const suspendedCount = byStatus('SUSPENDED');
  const pendingCount = byStatus('PENDING');
  const isSelf = (u: UserRow) => u?.id === me?.id;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="User Management"
        title="System Users"
        description="Create accounts, assign roles, control account status, reset credentials, revoke sessions and review per-user activity. Every change is audited."
        actions={
          <>
            <Button variant="outline" onClick={() => users.refetch()} disabled={users.isFetching}><RefreshCw className={`mr-2 h-4 w-4 ${users.isFetching ? 'animate-spin' : ''}`} />Refresh</Button>
            <Button className="bg-[#7A1F2B] text-white hover:bg-[#651925]" onClick={() => setCreateOpen(true)}><UserPlus className="mr-2 h-4 w-4" />Create user</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={totalUsers} icon={Users} />
        <StatCard label="Active" value={activeCount} icon={UserCheck} tone="success" />
        <StatCard label="Suspended" value={suspendedCount} icon={UserX} tone={suspendedCount ? 'danger' : 'default'} />
        <StatCard label="Pending" value={pendingCount} icon={ShieldAlert} tone={pendingCount ? 'warning' : 'default'} />
      </div>

      <Card className="border-gray-100 bg-white/80">
        <CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_220px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input className="pl-9" placeholder="Search by email, phone, member name or member number" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All roles</SelectItem>
                {roleOptions.map((r: any) => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="ghost" onClick={() => { setQ(''); setStatus('ALL'); setRole('ALL'); }}>Clear</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-100 bg-white/80">
        <CardContent className="p-0">
          {users.isLoading ? <div className="p-4"><LoadingBlock /></div> : users.isError ? <div className="p-4"><ErrorBlock onRetry={() => users.refetch()} /></div> : rows.length === 0 ? (
            <div className="p-4"><EmptyBlock title="No users match these filters" description="Adjust the search or filters, or create a new account." action={<Button onClick={() => setCreateOpen(true)}><UserPlus className="mr-2 h-4 w-4" />Create user</Button>} /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#C9962B]/10 hover:bg-[#C9962B]/10">
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Assigned roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last login</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((u) => (
                    <TableRow key={u.id} className="hover:bg-[#C9962B]/5">
                      <TableCell>
                        <button className="text-left" onClick={() => setDetailId(u.id)}>
                          <div className="font-medium text-gray-800 hover:underline">{u.member?.fullName || u.email}</div>
                          <div className="text-xs text-gray-500">{u.email}{u.member?.memberNo ? ` · ${u.member.memberNo}` : ''}</div>
                        </button>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{u.phone || u.member?.phone || '—'}</TableCell>
                      <TableCell><RoleBadges roles={u.roles} /></TableCell>
                      <TableCell><StatusBadge status={u.status} /></TableCell>
                      <TableCell className="text-sm text-gray-500">{u.lastLoginAt ? timeAgo(u.lastLoginAt) : 'Never'}</TableCell>
                      <TableCell className="text-sm text-gray-500">{formatDate(u.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>{u.email}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setDetailId(u.id)}><Eye className="mr-2 h-4 w-4" />View details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(u)}><Pencil className="mr-2 h-4 w-4" />Edit account</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openRoles(u)} disabled={isSelf(u)}><ShieldCheck className="mr-2 h-4 w-4" />Assign roles</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setResetTarget(u); setResetPasswordValue(''); }}><KeyRound className="mr-2 h-4 w-4" />Reset / Set password</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => revokeSessions.mutate(u.id)}><LogOut className="mr-2 h-4 w-4" />Revoke sessions</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {u.status === 'ACTIVE' ? (
                              <DropdownMenuItem className="text-rose-700" onClick={() => statusAction.mutate({ id: u.id, action: 'suspend' })} disabled={isSelf(u)}><Ban className="mr-2 h-4 w-4" />Suspend account</DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-emerald-700" onClick={() => statusAction.mutate({ id: u.id, action: 'activate' })}><CheckCircle2 className="mr-2 h-4 w-4" />Activate account</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="px-4 pb-4"><Pagination page={page} totalPages={users.data?.meta?.totalPages || 1} onPage={setPage} /></div>
        </CardContent>
      </Card>

      {/* Create user */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create user account</DialogTitle>
            <DialogDescription>Accounts are stored in the database with hashed passwords. Leave the password blank to auto-generate a temporary one.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label>Email *</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@tagchurch.org" /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+255…" /></div>
            <div className="space-y-2">
              <Label>Account status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="PENDING">Pending</SelectItem><SelectItem value="SUSPENDED">Suspended</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2"><Label>Password (optional)</Label><Input type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 8 chars, upper + lower + number" /></div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Roles</Label>
              <div className="flex flex-wrap gap-2">
                {roleOptions.map((r: any) => {
                  const on = form.roles.includes(r.name);
                  return (
                    <button key={r.id} type="button" onClick={() => setForm({ ...form, roles: on ? form.roles.filter((x: string) => x !== r.name) : [...form.roles, r.name] })}
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${on ? 'border-black bg-[#7A1F2B] text-white' : 'border-gray-100 bg-white text-gray-800'}`}>
                      {r.name}{r.isSystem ? '' : ' · custom'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button className="bg-[#7A1F2B]" onClick={() => createUser.mutate()} disabled={createUser.isPending || !form.email}>{createUser.isPending ? 'Creating…' : 'Create account'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit user */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit account</DialogTitle><DialogDescription>Update contact details. Role and status changes are audited separately.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button className="bg-[#7A1F2B]" onClick={() => updateUser.mutate()} disabled={updateUser.isPending}>Save changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign roles */}
      <Dialog open={!!roleTarget} onOpenChange={(o) => !o && setRoleTarget(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Assign roles</DialogTitle><DialogDescription>{roleTarget?.email} — users may hold multiple roles. Role changes take effect immediately and are recorded in history.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {roleOptions.map((r: any) => {
                const on = roleSelection.includes(r.name);
                return (
                  <label key={r.id} className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm ${on ? 'border-black/20 bg-[#C9962B]/20' : 'border-gray-100 bg-white'}`}>
                    <input type="checkbox" className="mt-1" checked={on} onChange={() => setRoleSelection((s) => on ? s.filter((x) => x !== r.name) : [...s, r.name])} />
                    <span><span className="block font-medium text-gray-800">{r.name}</span><span className="block text-xs text-gray-500">{r.description || (r.isSystem ? 'System role' : 'Custom role')}</span></span>
                  </label>
                );
              })}
            </div>
            <div className="space-y-2"><Label>Reason (recorded in history)</Label><Input value={roleReason} onChange={(e) => setRoleReason(e.target.value)} placeholder="e.g. Assigned finance duties" /></div>
            {roleTarget && isSelf(roleTarget) ? <p className="rounded-md border border-gray-100 bg-[#C9962B]/10 p-3 text-xs text-[#7A5A10]">You cannot grant yourself additional roles. Ask another System Administrator.</p> : null}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setRoleTarget(null)}>Cancel</Button><Button className="bg-[#7A1F2B]" onClick={() => assignRoles.mutate()} disabled={assignRoles.isPending}>Save roles</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset/set password */}
      <Dialog open={!!resetTarget} onOpenChange={(o) => { if (!o) { setResetTarget(null); setResetPasswordValue(''); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Reset / Set password</DialogTitle><DialogDescription>{resetTarget?.email}. Leave blank to generate a temporary password, or enter a new password to set it directly.</DialogDescription></DialogHeader>
          <div className="space-y-2">
            <Label>New password (optional)</Label>
            <Input type="password" autoComplete="new-password" value={resetPasswordValue} onChange={(e)=>setResetPasswordValue(e.target.value)} placeholder="Min 8 chars, upper + lower + number" />
            <p className="text-xs text-gray-500">All active sessions will be revoked after reset.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setResetTarget(null); setResetPasswordValue(''); }}>Cancel</Button>
            <Button className="bg-[#7A1F2B]" disabled={resetPassword.isPending || !resetTarget} onClick={() => resetTarget && resetPassword.mutate({ id: resetTarget.id, password: resetPasswordValue || undefined })}>{resetPassword.isPending ? 'Saving…' : (resetPasswordValue ? 'Set password' : 'Generate temporary')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password result */}
      <Dialog open={!!resetInfo} onOpenChange={(o) => !o && setResetInfo(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{resetInfo?.passwordSet ? 'Password updated' : 'Temporary password'}</DialogTitle><DialogDescription>{resetInfo?.email}. All existing sessions were revoked.</DialogDescription></DialogHeader>
          {resetInfo?.temporaryPassword ? (
            <div className="rounded-lg border border-gray-100 bg-[#C9962B]/10 p-4">
              <p className="text-xs uppercase tracking-wide text-[#A9771F]/70">Temporary password</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <code className="text-lg font-semibold text-gray-800">{resetInfo?.temporaryPassword}</code>
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard?.writeText(resetInfo?.temporaryPassword || ''); toast.success('Copied'); }}><Copy className="h-4 w-4" /></Button>
              </div>
              <p className="mt-2 text-xs text-gray-500">User should change this password after signing in.</p>
            </div>
          ) : <p className="text-sm text-gray-600">The password was set by the administrator. The user can sign in with the new password immediately.</p>}
          <DialogFooter><Button className="bg-[#7A1F2B]" onClick={() => setResetInfo(null)}>Done</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail sheet */}
      <Sheet open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{detail.data?.user?.member?.fullName || detail.data?.user?.email || 'User details'}</SheetTitle>
            <SheetDescription>{detail.data?.user?.email}</SheetDescription>
          </SheetHeader>
          {detail.isLoading ? <div className="mt-4"><LoadingBlock /></div> : detail.isError ? <div className="mt-4"><ErrorBlock onRetry={() => detail.refetch()} /></div> : (
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={detail.data?.user?.status} />
                {(detail.data?.user?.roles || []).map((ur: any) => <span key={ur.role?.id || ur.role?.name} className="rounded-full border border-gray-100 bg-[#C9962B]/10 px-2 py-0.5 text-xs text-[#7A5A10]">{ur.role?.name}</span>)}
              </div>
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="roles">Roles</TabsTrigger>
                  <TabsTrigger value="sessions">Sessions</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-3 pt-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-gray-500">Phone</p><p className="font-medium">{detail.data?.user?.phone || '—'}</p></div>
                    <div><p className="text-xs text-gray-500">Member no</p><p className="font-medium">{detail.data?.user?.member?.memberNo || '—'}</p></div>
                    <div><p className="text-xs text-gray-500">Created</p><p className="font-medium">{formatDate(detail.data?.user?.createdAt)}</p></div>
                    <div><p className="text-xs text-gray-500">Last login</p><p className="font-medium">{detail.data?.user?.lastLoginAt ? formatDate(detail.data.user.lastLoginAt) : 'Never'}</p></div>
                    <div><p className="text-xs text-gray-500">Effective permissions</p><p className="font-medium">{detail.data?.access?.permissions?.length ?? 0}</p></div>
                    <div><p className="text-xs text-gray-500">Scopes</p><p className="font-medium">{detail.data?.access?.scopes?.length ?? 0}</p></div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => openRoles(detail.data?.user)} disabled={isSelf(detail.data?.user)}><ShieldCheck className="mr-2 h-4 w-4" />Assign roles</Button>
                    <Button size="sm" variant="outline" onClick={() => { setResetTarget(detail.data?.user); setResetPasswordValue(''); }}><KeyRound className="mr-2 h-4 w-4" />Reset / Set password</Button>
                    <Button size="sm" variant="outline" onClick={() => revokeSessions.mutate(detail.data?.user?.id)}><LogOut className="mr-2 h-4 w-4" />Revoke sessions</Button>
                  </div>
                </TabsContent>
                <TabsContent value="roles" className="pt-3">
                  <div className="space-y-2">
                    {(detail.data?.user?.roles || []).map((ur: any) => (
                      <div key={ur.role?.id} className="rounded-lg border border-gray-100 bg-white p-3">
                        <div className="flex items-center justify-between"><p className="font-medium text-gray-800">{ur.role?.name}</p><StatusBadge status={ur.role?.isSystem ? 'SYSTEM' : 'CUSTOM'} /></div>
                        <p className="mt-1 text-xs text-gray-500">Assigned {formatDate(ur.assignedAt)}</p>
                      </div>
                    ))}
                    {(detail.data?.roleHistory || []).slice(0, 8).map((h: any) => (
                      <div key={h.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-[#C9962B]/5 px-3 py-2 text-xs">
                        <span><b>{h.action}</b> {h.roleName}{h.reason ? ` · ${h.reason}` : ''}</span>
                        <span className="text-gray-500">{formatDate(h.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="sessions" className="space-y-2 pt-3">
                  {(detail.data?.sessions || []).length === 0 ? <p className="text-sm text-gray-500">No active sessions.</p> : detail.data.sessions.map((s: any) => (
                    <div key={s.id} className="rounded-lg border border-gray-100 bg-white p-3 text-xs">
                      <p className="font-medium text-gray-800">{s.ip || 'unknown IP'}</p>
                      <p className="text-gray-500">{s.userAgent || 'Unknown device'}</p>
                      <p className="mt-1 text-gray-500">Created {formatDate(s.createdAt)} · expires {formatDate(s.expiresAt)}</p>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => revokeSessions.mutate(detail.data?.user?.id)}>Revoke all sessions</Button>
                </TabsContent>
                <TabsContent value="activity" className="pt-3">
                  <div className="divide-y divide-gray-100">
                    {(detail.data?.activity || []).length === 0 ? <p className="text-sm text-gray-500">No activity recorded.</p> : detail.data.activity.map((a: any) => (
                      <div key={a.id} className="py-2 text-xs">
                        <p className="font-medium text-gray-800">{a.action}</p>
                        <p className="text-gray-500">{a.actor?.email || 'system'} · {formatDate(a.createdAt)}</p>
                        <JsonPreview value={a.metadata} />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
