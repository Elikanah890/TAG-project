import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function RolesManagement() {
  const qc = useQueryClient();
  const { data: roles = [] } = useQuery({ queryKey:['/admin/roles'], queryFn: async()=> (await api.get('/admin/roles')).data });
  const { data: perms = [] } = useQuery({ queryKey:['/admin/permissions'], queryFn: async()=> (await api.get('/admin/permissions')).data });
  const [open,setOpen]=useState(false); const [editing,setEditing]=useState<any|null>(null); const [form,setForm]=useState<any>({name:'',description:''});
  const [permOpen,setPermOpen]=useState(false); const [permRole,setPermRole]=useState<any|null>(null); const [selected,setSelected]=useState<string[]>([]);
  const save = useMutation({ mutationFn: async()=> editing ? (await api.put(`/admin/roles/${editing.id}`,form)).data : (await api.post('/admin/roles',form)).data, onSuccess:()=>{toast.success('Saved'); qc.invalidateQueries({queryKey:['/admin/roles']}); setOpen(false);}, onError:(e:any)=>toast.error(e?.response?.data?.message||'Failed') });
  const del = (id:string)=>{ if(!confirm('Delete role?')) return; api.delete(`/admin/roles/${id}`).then(()=>{toast.success('Deleted'); qc.invalidateQueries({queryKey:['/admin/roles']});}).catch((e:any)=>toast.error(e?.response?.data?.message||'Failed')); };
  const savePerms = ()=> api.put(`/admin/roles/${permRole.id}/permissions`, {permissionCodes:selected}).then(()=>{toast.success('Permissions updated'); qc.invalidateQueries({queryKey:['/admin/roles']}); setPermOpen(false);}).catch((e:any)=>toast.error(e?.response?.data?.message||'Failed'));
  return <div className="space-y-4">
    <div className="flex items-center justify-between"><div><h1 className="font-serif text-3xl text-gray-800">Role Management</h1><p className="text-gray-500">Create and manage roles and assign permissions.</p></div><Button className="bg-[#7A1F2B]" onClick={()=>{setEditing(null);setForm({name:'',description:''});setOpen(true);}}>Create Role</Button></div>
    <Card className="border-gray-100"><CardContent className="pt-4 overflow-auto"><Table><TableHeader><TableRow><TableHead>Role</TableHead><TableHead>Description</TableHead><TableHead>Users</TableHead><TableHead>Permissions</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>
      {(Array.isArray(roles)?roles:[]).map((r:any)=>(<TableRow key={r.id}><TableCell className="font-medium">{r.name}</TableCell><TableCell>{r.description||'—'}</TableCell><TableCell>{r._count?.users ?? 0}</TableCell><TableCell className="text-xs max-w-xs truncate">{(r.permissions||[]).map((p:any)=>p.permission?.code).join(', ')||'—'}</TableCell><TableCell className="space-x-1 whitespace-nowrap"><Button size="sm" variant="outline" onClick={()=>{setEditing(r);setForm({name:r.name,description:r.description||''});setOpen(true);}}>Edit</Button><Button size="sm" variant="outline" onClick={()=>{setPermRole(r);setSelected((r.permissions||[]).map((p:any)=>p.permission?.code));setPermOpen(true);}}>Permissions</Button><Button size="sm" variant="destructive" onClick={()=>del(r.id)}>Delete</Button></TableCell></TableRow>))}
    </TableBody></Table></CardContent></Card>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{editing?'Edit Role':'Create Role'}</DialogTitle></DialogHeader><div className="space-y-3"><div><label className="text-sm">Name</label><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div><div><label className="text-sm">Description</label><Input value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})}/></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button><Button className="bg-[#7A1F2B]" onClick={()=>save.mutate()}>Save</Button></div></div></DialogContent></Dialog>
    <Dialog open={permOpen} onOpenChange={setPermOpen}><DialogContent className="max-w-xl"><DialogHeader><DialogTitle>Assign Permissions — {permRole?.name}</DialogTitle></DialogHeader><div className="space-y-2 max-h-80 overflow-auto">{(Array.isArray(perms)?perms:[]).map((p:any)=>(<label key={p.id||p.code} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.includes(p.code)} onChange={e=>setSelected(s=>e.target.checked?[...s,p.code]:s.filter(x=>x!==p.code))}/>{p.code} <span className="text-gray-500">{p.description||''}</span></label>))}{(!perms||perms.length===0) && <p className="text-gray-500 text-sm">No permissions defined yet. Create permissions first.</p>}</div><div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={()=>setPermOpen(false)}>Cancel</Button><Button className="bg-[#7A1F2B]" onClick={savePerms}>Save</Button></div></DialogContent></Dialog>
  </div>;
}
