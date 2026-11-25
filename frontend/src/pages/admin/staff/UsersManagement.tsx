import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const ALL_ROLES = ['SYSTEM_ADMIN','FINANCE_ADMIN','WEBSITE_ADMIN','CHURCH_SECRETARY','CHURCH_MEMBER'];

export default function UsersManagement() {
  const qc = useQueryClient();
  const { data: users = [], isLoading } = useQuery({ queryKey:['/admin/users'], queryFn: async()=> (await api.get('/admin/users')).data });
  const [open,setOpen]=useState(false); const [form,setForm]=useState<any>({email:'',phone:'',status:'ACTIVE',roles:['CHURCH_SECRETARY'],password:''}); const [editing,setEditing]=useState<any|null>(null); const [temp,setTemp]=useState<string|null>(null);
  const save = useMutation({
    mutationFn: async()=> editing ? (await api.put(`/admin/users/${editing.id}`, form)).data : (await api.post('/admin/users', form)).data,
    onSuccess:(d:any)=>{ toast.success(editing?'User updated':'User created'); if(d?.temporaryPassword) setTemp(d.temporaryPassword); qc.invalidateQueries({queryKey:['/admin/users']}); if(editing){setOpen(false); setEditing(null);} },
    onError:(e:any)=>toast.error(e?.response?.data?.message||'Failed')
  });
  const action = (path:string,msg:string)=> api.post(path).then(()=>{toast.success(msg); qc.invalidateQueries({queryKey:['/admin/users']});}).catch((e:any)=>toast.error(e?.response?.data?.message||'Failed'));
  const resetPw = (id:string)=> { const pw = prompt('Enter new password (leave blank to auto-generate temporary password):') ?? ''; if (pw === null) return; api.post(`/admin/users/${id}/reset-password`, pw ? {password:pw} : {}).then((r)=>{setTemp(r.data.temporaryPassword || (r.data.passwordSet ? 'Password set by admin' : null)); toast.success(r.data.passwordSet ? 'Password updated' : 'Password reset');}).catch((e:any)=>toast.error(e?.response?.data?.message||'Failed')); };
  const toggleRole=(r:string)=> setForm((p:any)=>({...p, roles: p.roles.includes(r)? p.roles.filter((x:string)=>x!==r): [...p.roles,r]}));
  const startEdit=(u:any)=>{ setEditing(u); setForm({email:u.email, phone:u.phone||'', status:u.status, roles:(u.roles||[]).map((x:any)=>x.role?.name), password:''}); setTemp(null); setOpen(true); };
  const startCreate=()=>{ setEditing(null); setForm({email:'',phone:'',status:'ACTIVE',roles:['CHURCH_SECRETARY'],password:''}); setTemp(null); setOpen(true); };
  return <div className="space-y-4">
    <div className="flex items-center justify-between"><div><h1 className="font-serif text-3xl text-gray-800">User Account Management</h1><p className="text-gray-500">Create staff, manage accounts, reset passwords, suspend/activate, assign multiple roles.</p></div><Button className="bg-[#7A1F2B]" onClick={startCreate}>Create Staff User</Button></div>
    <Card className="border-gray-100"><CardHeader><CardTitle>All Users ({Array.isArray(users)?users.length:0})</CardTitle></CardHeader><CardContent className="overflow-auto">
      {isLoading? <p>Loading...</p> : <Table><TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Status</TableHead><TableHead>Roles</TableHead><TableHead>Last Login</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>
        {(Array.isArray(users)?users:[]).map((u:any)=>(<TableRow key={u.id}><TableCell>{u.email}</TableCell><TableCell><Badge variant={u.status==='ACTIVE'?'default':'secondary'}>{u.status}</Badge></TableCell><TableCell className="text-xs">{(u.roles||[]).map((r:any)=>r.role?.name).join(', ')||'—'}</TableCell><TableCell>{u.lastLoginAt?new Date(u.lastLoginAt).toLocaleString():'—'}</TableCell><TableCell className="space-x-1 whitespace-nowrap"><Button size="sm" variant="outline" onClick={()=>startEdit(u)}>Edit</Button><Button size="sm" variant="outline" onClick={()=>resetPw(u.id)}>Reset/Set PW</Button>{u.status==='ACTIVE'?<Button size="sm" variant="destructive" onClick={()=>action(`/admin/users/${u.id}/suspend`,'Suspended')}>Suspend</Button>:<Button size="sm" onClick={()=>action(`/admin/users/${u.id}/activate`,'Activated')}>Activate</Button>}</TableCell></TableRow>))}
      </TableBody></Table>}
    </CardContent></Card>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing?'Edit User':'Create Staff User'}</DialogTitle></DialogHeader>
      <div className="space-y-3"><div><label className="text-sm">Email</label><Input value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
      <div><label className="text-sm">Phone</label><Input value={form.phone||''} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
      <div><label className="text-sm">Status</label><select className="w-full border rounded px-3 py-2" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>ACTIVE</option><option>SUSPENDED</option><option>PENDING</option></select></div>
      <div><label className="text-sm">Password (leave blank to auto-generate on create)</label><Input type="text" value={form.password||''} onChange={e=>setForm({...form,password:e.target.value})}/></div>
      <div><label className="text-sm font-medium">Assign Roles</label><div className="flex flex-wrap gap-2 mt-1">{ALL_ROLES.map(r=><button key={r} type="button" onClick={()=>toggleRole(r)} className={`px-2 py-1 text-xs rounded border ${form.roles.includes(r)?'bg-[#7A1F2B] text-white border-black':'border-border'}`}>{r}</button>)}</div></div>
      {temp && <div className="p-2 bg-[#C9962B]/10 border border-[#C9962B]/30 rounded text-sm"><b>Temporary Password:</b> <span className="font-mono">{temp}</span></div>}
      <div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setOpen(false)}>Close</Button><Button className="bg-[#7A1F2B]" onClick={()=>save.mutate()} disabled={save.isPending}>{save.isPending?'Saving...':'Save'}</Button></div></div>
    </DialogContent></Dialog>
  </div>;
}
