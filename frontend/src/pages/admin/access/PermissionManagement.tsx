import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { KeyRound, Plus, RefreshCw, Search, ShieldCheck, Trash2, Pencil, Layers, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageHeader, StatCard, StatusBadge, LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/admin/access/AccessUI';

export default function PermissionManagement() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<any | null>(null);
  const [form, setForm] = useState({ code: '', description: '' });

  const catalog = useQuery({ queryKey: ['access-permission-catalog'], queryFn: async () => (await api.get('/admin/permissions')).data });
  const roles = useQuery({ queryKey: ['access-roles'], queryFn: async () => (await api.get('/admin/roles')).data });

  const permissions = catalog.data?.permissions || [];
  const grouped = catalog.data?.grouped || {};
  const modules = Object.keys(grouped).sort();
  const systemCount = permissions.filter((p: any) => p.isSystem).length;
  const customCount = permissions.length - systemCount;

  const usage = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const role of roles.data || []) {
      for (const rp of role.permissions || []) {
        const code = rp.permission?.code;
        if (!code) continue;
        map[code] = map[code] || [];
        map[code].push(role.name);
      }
    }
    return map;
  }, [roles.data]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['access-permission-catalog'] });
    qc.invalidateQueries({ queryKey: ['access-roles'] });
  };

  const createPermission = useMutation({
    mutationFn: async () => (await api.post('/admin/permissions', form)).data,
    onSuccess: () => { toast.success('Permission created'); setCreateOpen(false); setForm({ code: '', description: '' }); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create permission'),
  });

  const updatePermission = useMutation({
    mutationFn: async () => (await api.patch(`/admin/permissions/${editing?.id}`, { description: form.description })).data,
    onSuccess: () => { toast.success('Permission updated'); setEditing(null); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to update permission'),
  });

  const deletePermission = useMutation({
    mutationFn: async (p: any) => (await api.delete(`/admin/permissions/${p.id}`)).data,
    onSuccess: () => { toast.success('Permission deleted'); setDeleting(null); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to delete permission'),
  });

  const q = search.trim().toLowerCase();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Access Control"
        title="Permission Catalogue"
        description="Granular module permissions enforced by the backend. Assign permissions to roles from Role Management."
        actions={<>
          <Button asChild variant="outline"><Link to="/admin/roles"><ShieldCheck className="mr-2 h-4 w-4" />Manage role permissions<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          <Button variant="outline" onClick={() => catalog.refetch()} disabled={catalog.isFetching}><RefreshCw className={`mr-2 h-4 w-4 ${catalog.isFetching ? 'animate-spin' : ''}`} />Refresh</Button>
          <Button className="bg-[#7A1F2B] text-white hover:bg-[#651925]" onClick={() => { setForm({ code: '', description: '' }); setCreateOpen(true); }}><Plus className="mr-2 h-4 w-4" />Custom permission</Button>
        </>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Permissions" value={permissions.length} icon={KeyRound} />
        <StatCard label="Modules" value={modules.length} icon={Layers} tone="success" />
        <StatCard label="Custom permissions" value={customCount} hint={`${systemCount} system-protected`} icon={ShieldCheck} />
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input className="pl-9" placeholder="Search permission code or description" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {catalog.isLoading ? <LoadingBlock /> : catalog.isError ? <ErrorBlock onRetry={() => catalog.refetch()} /> : (
        <div className="space-y-4">
          {modules.map((module) => {
            const items = (grouped[module] || []).filter((p: any) => !q || p.code.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
            if (!items.length) return null;
            return (
              <Card key={module} className="border-gray-100 bg-white/80">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-serif text-lg capitalize text-gray-800">{module.replace(/_/g, ' ')}</h2>
                    <span className="text-xs text-gray-500">{items.length} permission(s)</span>
                  </div>
                  <div className="grid gap-2 lg:grid-cols-2">
                    {items.map((p: any) => (
                      <div key={p.id} className="rounded-lg border border-gray-100 bg-white/70 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <code className="text-xs font-semibold text-gray-800">{p.code}</code>
                            <p className="mt-0.5 text-xs text-gray-500">{p.description || 'No description'}</p>
                          </div>
                          <StatusBadge status={p.isSystem ? 'SYSTEM' : 'CUSTOM'} />
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1">
                          {(usage[p.code] || []).length === 0 ? <span className="text-[11px] text-gray-500">Not assigned to any role</span> : usage[p.code].map((r) => <span key={r} className="rounded-full border border-gray-100 bg-[#C9962B]/10 px-2 py-0.5 text-[10px] text-[#7A5A10]">{r}</span>)}
                        </div>
                        {!p.isSystem ? (
                          <div className="mt-2 flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { setEditing(p); setForm({ code: p.code, description: p.description || '' }); }}><Pencil className="mr-1 h-3.5 w-3.5" />Edit</Button>
                            <Button size="sm" variant="outline" className="text-rose-700" onClick={() => setDeleting(p)}><Trash2 className="mr-1 h-3.5 w-3.5" />Delete</Button>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {permissions.length === 0 ? <EmptyBlock title="No permissions in the catalogue" /> : null}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create custom permission</DialogTitle><DialogDescription>Use module.action format, for example <code>reports.youth.view</code>. System permissions cannot be modified.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Permission code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toLowerCase() })} placeholder="module.action" /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button className="bg-[#7A1F2B]" onClick={() => createPermission.mutate()} disabled={createPermission.isPending || !form.code.includes('.')}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit permission</DialogTitle><DialogDescription>{editing?.code}</DialogDescription></DialogHeader>
          <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button className="bg-[#7A1F2B]" onClick={() => updatePermission.mutate()} disabled={updatePermission.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete {deleting?.code}?</DialogTitle><DialogDescription>This removes the custom permission from all roles. The action is audited.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button><Button variant="destructive" onClick={() => deletePermission.mutate(deleting)} disabled={deletePermission.isPending}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
