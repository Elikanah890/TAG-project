import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AccountStatus(){
  const qc = useQueryClient();
  const { data=[] } = useQuery({ queryKey:['/admin/users'], queryFn: async()=> (await api.get('/admin/users')).data });
  const mut = useMutation({ mutationFn: async({id,action}:{id:string,action:'activate'|'suspend'})=> (await api.post(`/admin/users/${id}/${action}`)).data, onSuccess:()=>{toast.success('Account status updated'); qc.invalidateQueries({queryKey:['/admin/users']});}, onError:(e:any)=>toast.error(e?.response?.data?.message||'Failed') });
  return <div className="space-y-4"><div><h1 className="font-serif text-3xl text-gray-800">Account Status</h1><p className="text-gray-500">Activate/deactivate administrative and user accounts (own SYSTEM_ADMIN operation, audited).</p></div>
    <Card className="border-gray-100"><CardHeader><CardTitle>Accounts</CardTitle></CardHeader><CardContent className="overflow-auto"><Table><TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Status</TableHead><TableHead>Roles</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{(Array.isArray(data)?data:[]).map((u:any)=>(<TableRow key={u.id}><TableCell>{u.email}</TableCell><TableCell>{u.status}</TableCell><TableCell className="text-xs">{(u.roles||[]).map((r:any)=>r.role?.name).join(', ')}</TableCell><TableCell className="space-x-2"><Button size="sm" variant="outline" onClick={()=>mut.mutate({id:u.id,action:'activate'})}>Activate</Button><Button size="sm" variant="destructive" onClick={()=>mut.mutate({id:u.id,action:'suspend'})}>Suspend</Button></TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
  </div>;
}
