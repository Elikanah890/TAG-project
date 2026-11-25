import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

export default function AttendancePage(){
  const qc = useQueryClient();
  const { data: meetings=[] } = useQuery({ queryKey:['/operations/meetings'], queryFn: async()=> (await api.get('/operations/meetings')).data });
  const { data: rows=[] } = useQuery({ queryKey:['/operations/attendance'], queryFn: async()=> (await api.get('/operations/attendance')).data });
  const [form,setForm]=useState<any>({meetingId:'',fullName:'',status:'PRESENT',notes:''});
  const save = useMutation({ mutationFn: async()=> (await api.post('/operations/attendance', form)).data, onSuccess:()=>{toast.success('Attendance recorded'); qc.invalidateQueries({queryKey:['/operations/attendance']}); setForm((p:any)=>({...p,fullName:'',notes:''}));}, onError:(e:any)=>toast.error(e?.response?.data?.message||'Failed') });
  const del = (id:string)=>{ if(!confirm('Delete record?')) return; api.delete(`/operations/attendance/${id}`).then(()=>{toast.success('Deleted'); qc.invalidateQueries({queryKey:['/operations/attendance']});}); };
  return <div className="space-y-4"><div><h1 className="font-serif text-3xl text-gray-800">Attendance Management</h1><p className="text-gray-500">Record and monitor attendance for meetings (point 23).</p></div>
    <Card className="border-gray-100"><CardHeader><CardTitle>Record Attendance</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-4 gap-3">
      <div><label className="text-sm">Meeting</label><select className="w-full border rounded px-3 py-2" value={form.meetingId} onChange={e=>setForm({...form,meetingId:e.target.value})}><option value="">Select meeting</option>{(Array.isArray(meetings)?meetings:[]).map((m:any)=><option key={m.id} value={m.id}>{m.title} — {new Date(m.startsAt).toLocaleDateString()}</option>)}</select></div>
      <div><label className="text-sm">Name</label><Input value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} placeholder="Attendee name"/></div>
      <div><label className="text-sm">Status</label><select className="w-full border rounded px-3 py-2" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>PRESENT</option><option>ABSENT</option><option>EXCUSED</option></select></div>
      <div className="flex items-end"><Button className="bg-[#7A1F2B] w-full" onClick={()=>save.mutate()} disabled={!form.meetingId || save.isPending}>Record</Button></div>
    </CardContent></Card>
    <Card className="border-gray-100"><CardHeader><CardTitle>Attendance Records ({Array.isArray(rows)?rows.length:0})</CardTitle></CardHeader><CardContent className="overflow-auto"><Table><TableHeader><TableRow><TableHead>Meeting</TableHead><TableHead>Person</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead></TableHead></TableRow></TableHeader><TableBody>
      {(Array.isArray(rows)?rows:[]).map((r:any)=>(<TableRow key={r.id}><TableCell>{r.meeting?.title||'—'}</TableCell><TableCell>{r.fullName||r.member?.fullName||'—'}</TableCell><TableCell>{r.status}</TableCell><TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell><TableCell><Button size="sm" variant="destructive" onClick={()=>del(r.id)}>Delete</Button></TableCell></TableRow>))}
    </TableBody></Table></CardContent></Card>
  </div>;
}
