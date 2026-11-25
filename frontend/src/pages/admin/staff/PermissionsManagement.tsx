import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function PermissionsManagement() {
  const qc = useQueryClient();
  const { data: perms = [] } = useQuery({ queryKey:['/admin/permissions'], queryFn: async()=> (await api.get('/admin/permissions')).data });
  const [open,setOpen]=useState(false); const [editing,setEditing]=useState<any|null>(null); const [form,setForm]=useState<any>({code:'',description:''});
  const save = useMutation({ mutationFn: async()=> editing ? (await api.put(`/admin/permissions/${editing.id}`,form)).data : (await api.post('/admin/permissions',form)).data, onSuccess:()=>{toast.success('Saved'); qc.invalidateQueries({queryKey:['/admin/permissions']}); setOpen(false);}, onError:(e:any)=>toast.error(e?.response?.data?.message||'Failed') });
  const del = (id:string)=>{ if(!confirm('Delete permission?')) return; api.delete(`/admin/permissions/${id}`).then(()=>{toast.success('Deleted'); qc.invalidateQueries({queryKey:['/admin/permissions']});}).catch((e:any)=>toast.error(e?.response?.data?.message||'Failed')); };
  return <div className="space-y-4">
    <div className="flex items-center justify-between"><div><h1 className="font-serif text-3xl text-gray-800">Permission Management</h1><p className="text-gray-500">Define system permissions and use them in role assignment.</p></div><Button className="bg-[#7A1F2B]" onClick={()=>{setEditing(null);setForm({code:'',description:''});setOpen(true);}}>Create Permission</Button></div>
    <Card className="border-gray-100"><CardContent className="pt-4 overflow-auto"><Table><TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Description</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>
      {(Array.isArray(perms)?perms:[]).map((p:any)=>(<TableRow key={p.id}><TableCell className="font-mono text-sm">{p.code}</TableCell><TableCell>{p.description||'—'}</TableCell><TableCell className="space-x-1"><Button size="sm" variant="outline" onClick={()=>{setEditing(p);setForm({code:p.code,description:p.description||''});setOpen(true);}}>Edit</Button><Button size="sm" variant="destructive" onClick={()=>del(p.id)}>Delete</Button></TableCell></TableRow>))}
    </TableBody></Table></CardContent></Card>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{editing?'Edit Permission':'Create Permission'}</DialogTitle></DialogHeader><div className="space-y-3"><div><label className="text-sm">Code</label><Input value={form.code} onChange={e=>setForm({...form,code:e.target.value})} placeholder="e.g. MEMBERS_VIEW"/></div><div><label className="text-sm">Description</label><Input value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})}/></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button><Button className="bg-[#7A1F2B]" onClick={()=>save.mutate()}>Save</Button></div></div></DialogContent></Dialog>
  </div>;
}
