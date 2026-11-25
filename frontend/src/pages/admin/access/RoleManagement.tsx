import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, Plus, RefreshCw, ShieldCheck, Users, KeyRound, Power, Trash2, Eye, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageHeader, StatCard, StatusBadge, LoadingBlock, ErrorBlock, EmptyBlock, formatDate } from '@/components/admin/access/AccessUI';

export default function RoleManagement() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editRole, setEditRole] = useState<any | null>(null);
  const [permRole, setPermRole] = useState<any | null>(null);
  const [permSelection, setPermSelection] = useState<string[]>([]);
  const [permSearch, setPermSearch] = useState('');
  const [usersRole, setUsersRole] = useState<any | null>(null);
  const [deleteRole, setDeleteRole] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const roles = useQuery({ queryKey: ['access-roles'], queryFn: async () => (await api.get('/admin/roles')).data });
  const catalog = useQuery({ queryKey: ['access-permission-catalog'], queryFn: async () => (await api.get('/admin/permissions')).data });
  const roleUsers = useQuery({ queryKey: ['access-role-users', usersRole?.id], enabled: !!usersRole?.id, queryFn: async () => (await api.get(`/admin/roles/${usersRole.id}/users`)).data });

  const rows = roles.data || [];
  const systemCount = rows.filter((r: any) => r.isSystem).length;
  const customCount = rows.length - systemCount;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['access-roles'] });
    qc.invalidateQueries({ queryKey: ['access-permission-catalog'] });
    qc.invalidateQueries({ queryKey: ['access-users-summary'] });
  };

  const createRole = useMutation({
    mutationFn: async () => (await api.post('/admin/roles', form)).data,
    onSuccess: () => { toast.success('Role created'); setCreateOpen(false); setForm({ name: '', description: '' }); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create role'),
  });

  const updateRole = useMutation({
    mutationFn: async () => (await api.patch(`/admin/roles/${editRole?.id}`, { name: editRole.isSystem ? undefined : form.name, description: form.description })).data,
    onSuccess: () => { toast.success('Role updated'); setEditRole(null); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to update role'),
  });

  const setStatus = useMutation({
    mutationFn: async ({ role, isActive }: { role: any; isActive: boolean }) => (await api.patch(`/admin/roles/${role.id}/status`, { isActive })).data,
    onSuccess: (_d, v) => { toast.success(v.isActive ? 'Role activated' : 'Role deactivated'); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to change role status'),
  });

  const removeRole = useMutation({
    mutationFn: async (role: any) => (await api.delete(`/admin/roles/${role.id}`)).data,
    onSuccess: () => { toast.success('Role deleted'); setDeleteRole(null); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to delete role'),
  });

  const savePermissions = useMutation({
    mutationFn: async () => (await api.put(`/admin/roles/${permRole?.id}/permissions`, { permissionCodes: permSelection })).data,
    onSuccess: () => { toast.success('Role permissions saved'); setPermRole(null); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to save permissions'),
  });

  const openPermissions = (role: any) => {
    setPermRole(role);
    setPermSelection((role.permissions || []).map((rp: any) => rp.permission?.code));
    setPermSearch('');
  };

  const grouped = useMemo(() => {
    const groups = catalog.data?.grouped || {};
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [catalog.data]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Access Control"
        title="Roles"
        description="Roles are stored in the database and carry explicit permissions. System roles are protected from deletion; custom roles can be created and tuned."
        actions={<>
          <Button variant="outline" onClick={() => roles.refetch()} disabled={roles.isFetching}><RefreshCw className={`mr-2 h-4 w-4 ${roles.isFetching ? 'animate-spin' : ''}`} />Refresh</Button>
          <Button className="bg-[#7A1F2B] text-white hover:bg-[#651925]" onClick={() => { setForm({ name: '', description: '' }); setCreateOpen(true); }}><Plus className="mr-2 h-4 w-4" />Create role</Button>
        </>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total roles" value={rows.length} icon={ShieldCheck} />
        <StatCard label="System roles" value={systemCount} hint="Protected from deletion" icon={KeyRound} tone="success" />
        <StatCard label="Custom roles" value={customCount} hint="Created by administrators" icon={Users} />
      </div>

      <Card className="border-gray-100 bg-white/80">
        <CardContent className="p-0">
          {roles.isLoading ? <div className="p-4"><LoadingBlock /></div> : roles.isError ? <div className="p-4"><ErrorBlock onRetry={() => roles.refetch()} /></div> : rows.length === 0 ? <div className="p-4"><EmptyBlock title="No roles found" /></div> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#C9962B]/10 hover:bg-[#C9962B]/10">
                    <TableHead>Role</TableHead><TableHead>Description</TableHead><TableHead>Type</TableHead><TableHead>Users</TableHead><TableHead>Permissions</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r: any) => (
                    <TableRow key={r.id} className="hover:bg-[#C9962B]/5">
                      <TableCell className="font-medium text-gray-800">{r.name}</TableCell>
                      <TableCell className="max-w-xs text-sm text-gray-500">{r.description || '—'}</TableCell>
                      <TableCell><StatusBadge status={r.isSystem ? 'SYSTEM' : 'CUSTOM'} /></TableCell>
                      <TableCell className="text-sm">{r._count?.users ?? 0}</TableCell>
                      <TableCell className="text-sm">{r.permissions?.length ?? 0}</TableCell>
                      <TableCell><StatusBadge status={r.isActive ? 'ACTIVE' : 'INACTIVE'} /></TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>{r.name}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openPermissions(r)}><KeyRound className="mr-2 h-4 w-4" />Manage permissions</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setUsersRole(r); }}><Eye className="mr-2 h-4 w-4" />View users</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setEditRole(r); setForm({ name: r.name, description: r.description || '' }); }}><Pencil className="mr-2 h-4 w-4" />Edit role</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatus.mutate({ role: r, isActive: !r.isActive })} disabled={r.name === 'SYSTEM_ADMIN' && r.isActive}><Power className="mr-2 h-4 w-4" />{r.isActive ? 'Deactivate' : 'Activate'}</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-rose-700" disabled={r.isSystem} onClick={() => setDeleteRole(r)}><Trash2 className="mr-2 h-4 w-4" />Delete role</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create custom role</DialogTitle><DialogDescription>Use uppercase letters, numbers and underscores. Permissions are assigned separately.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Role name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })} placeholder="e.g. YOUTH_COORDINATOR" /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What this role is responsible for" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button className="bg-[#7A1F2B]" onClick={() => createRole.mutate()} disabled={createRole.isPending || form.name.length < 3}>Create role</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!editRole} onOpenChange={(o) => !o && setEditRole(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit role</DialogTitle><DialogDescription>{editRole?.isSystem ? 'System role names are protected; only the description can be edited.' : 'Edit the role name and description.'}</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Role name</Label><Input value={form.name} disabled={editRole?.isSystem} onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })} /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditRole(null)}>Cancel</Button><Button className="bg-[#7A1F2B]" onClick={() => updateRole.mutate()} disabled={updateRole.isPending}>Save changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions */}
      <Dialog open={!!permRole} onOpenChange={(o) => !o && setPermRole(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Permissions · {permRole?.name}</DialogTitle>
            <DialogDescription>Select the permissions this role grants. Changes are audited and enforced by the backend on every request.</DialogDescription>
          </DialogHeader>
          <Input placeholder="Search permissions…" value={permSearch} onChange={(e) => setPermSearch(e.target.value)} />
          <div className="max-h-[55vh] space-y-4 overflow-y-auto pr-1">
            {grouped.map(([module, perms]: any) => {
              const visible = perms.filter((p: any) => !permSearch || p.code.toLowerCase().includes(permSearch.toLowerCase()) || (p.description || '').toLowerCase().includes(permSearch.toLowerCase()));
              if (!visible.length) return null;
              return (
                <div key={module} className="rounded-lg border border-gray-100 bg-white/70 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#7A5A10]/70">{module}</p>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {visible.map((p: any) => {
                      const on = permSelection.includes(p.code);
                      return (
                        <label key={p.code} className="flex cursor-pointer items-start gap-2 rounded px-1 py-1 text-sm hover:bg-[#C9962B]/10">
                          <input type="checkbox" className="mt-1" checked={on} onChange={() => setPermSelection((s) => on ? s.filter((c) => c !== p.code) : [...s, p.code])} />
                          <span><span className="block font-mono text-xs text-gray-800">{p.code}</span><span className="block text-[11px] text-gray-500">{p.description}</span></span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <span className="mr-auto text-xs text-gray-500">{permSelection.length} selected</span>
            <Button variant="outline" onClick={() => setPermRole(null)}>Cancel</Button>
            <Button className="bg-[#7A1F2B]" onClick={() => savePermissions.mutate()} disabled={savePermissions.isPending}>Save permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role users */}
      <Dialog open={!!usersRole} onOpenChange={(o) => !o && setUsersRole(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Users with {usersRole?.name}</DialogTitle><DialogDescription>{(usersRole?._count?.users ?? 0)} user(s) assigned.</DialogDescription></DialogHeader>
          {roleUsers.isLoading ? <LoadingBlock /> : roleUsers.isError ? <ErrorBlock onRetry={() => roleUsers.refetch()} /> : (roleUsers.data || []).length === 0 ? <p className="text-sm text-gray-500">No users assigned to this role.</p> : (
            <div className="max-h-[50vh] divide-y divide-gray-100 overflow-y-auto">
              {roleUsers.data.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between py-2 text-sm">
                  <div><p className="font-medium text-gray-800">{u.email}</p><p className="text-xs text-gray-500">{u.member?.fullName || '—'}</p></div>
                  <StatusBadge status={u.status} />
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteRole} onOpenChange={(o) => !o && setDeleteRole(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete {deleteRole?.name}?</DialogTitle><DialogDescription>This permanently deletes the custom role. Users must be removed from it first. This action is audited.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteRole(null)}>Cancel</Button><Button variant="destructive" onClick={() => removeRole.mutate(deleteRole)} disabled={removeRole.isPending}>Delete role</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
