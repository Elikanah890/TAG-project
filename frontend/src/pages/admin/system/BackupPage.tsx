import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

export default function BackupPage(){
  const qc = useQueryClient(); const { data=[] } = useQuery({ queryKey:['/admin/system/backups'], queryFn: async()=> (await api.get('/admin/system/backups')).data });
  const run = useMutation({ mutationFn: async()=> (await api.post('/admin/system/backup')).data, onSuccess:(d)=>{toast.success(`Backup ${d.status}`); qc.invalidateQueries({queryKey:['/admin/system/backups']});}, onError:(e:any)=>toast.error(e?.response?.data?.message||'Failed') });
  return <div className="space-y-4"><div className="flex items-center justify-between"><div><h1 className="font-serif text-3xl text-gray-800">Backup & Recovery Management</h1><p className="text-gray-500">Trigger and track database backups (point 43). Actions are audited.</p></div><Button className="bg-[#7A1F2B]" onClick={()=>run.mutate()} disabled={run.isPending}>{run.isPending?'Running...':'Trigger Backup'}</Button></div>
    <Card className="border-gray-100"><CardHeader><CardTitle>Backup Logs</CardTitle></CardHeader><CardContent className="overflow-auto"><Table><TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Location</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader><TableBody>
      {(Array.isArray(data)?data:[]).map((b:any)=>(<TableRow key={b.id}><TableCell>{new Date(b.createdAt).toLocaleString()}</TableCell><TableCell>{b.type}</TableCell><TableCell>{b.status}</TableCell><TableCell className="text-xs max-w-xs truncate">{b.location||'—'}</TableCell><TableCell className="text-xs">{b.notes||'—'}</TableCell></TableRow>))}
    </TableBody></Table></CardContent></Card></div>;
}
