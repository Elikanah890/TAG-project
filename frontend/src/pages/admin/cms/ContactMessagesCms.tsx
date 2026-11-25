import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

export default function ContactMessagesCms(){
  const qc = useQueryClient();
  const { data=[], isLoading } = useQuery({ queryKey:['cms-contact-messages'], queryFn: async()=> (await api.get('/cms/contact-messages')).data });
  const update = useMutation({ mutationFn: async({id,status}:{id:string;status:string})=> (await api.put(`/cms/contact-messages/${id}`,{status})).data, onSuccess:()=>{qc.invalidateQueries({queryKey:['cms-contact-messages']}); toast.success('Updated');} });
  const del = useMutation({ mutationFn: async(id:string)=> (await api.delete(`/cms/contact-messages/${id}`)).data, onSuccess:()=>{qc.invalidateQueries({queryKey:['cms-contact-messages']}); toast.success('Deleted');} });
  const rows = Array.isArray(data)?data:[];
  return <div className="space-y-4"><div><h1 className="font-serif text-3xl text-gray-800">Contact Messages</h1><p className="text-gray-500">Messages submitted from the public Contact page.</p></div>
    <Card className="border-gray-100"><CardHeader><CardTitle>Messages ({rows.length})</CardTitle></CardHeader><CardContent>
      {isLoading ? <p>Loading...</p> : rows.length===0 ? <p className="text-gray-500">No messages yet.</p> : <div className="overflow-auto"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Name</TableHead><TableHead>Contact</TableHead><TableHead>Subject</TableHead><TableHead>Message</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>
        {rows.map((r:any)=>(<TableRow key={r.id}><TableCell>{r.createdAt?new Date(r.createdAt).toLocaleString():'—'}</TableCell><TableCell>{r.name}</TableCell><TableCell><div className="text-xs">{r.email||'—'}<br/>{r.phone||''}</div></TableCell><TableCell>{r.subject||'—'}</TableCell><TableCell className="max-w-md whitespace-pre-wrap text-sm">{r.message}</TableCell><TableCell>{r.status}</TableCell><TableCell className="space-x-2 whitespace-nowrap"><Button size="sm" variant="outline" onClick={()=>update.mutate({id:r.id,status:r.status==='NEW'?'READ':'NEW'})}>{r.status==='NEW'?'Mark Read':'Mark New'}</Button><Button size="sm" variant="destructive" onClick={()=>{if(confirm('Delete message?')) del.mutate(r.id);}}>Delete</Button></TableCell></TableRow>))}
      </TableBody></Table></div>}
    </CardContent></Card></div>;
}
