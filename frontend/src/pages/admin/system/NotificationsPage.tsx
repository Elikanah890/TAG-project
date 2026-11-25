import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function NotificationsPage(){
  const qc = useQueryClient(); const { data=[] } = useQuery({ queryKey:['/admin/notifications'], queryFn: async()=> (await api.get('/admin/notifications')).data });
  const [form,setForm]=useState({title:'',message:'',audience:'ALL',type:'INFO'});
  const save = useMutation({ mutationFn: async()=> (await api.post('/admin/notifications', form)).data, onSuccess:()=>{toast.success('Notification created'); setForm({title:'',message:'',audience:'ALL',type:'INFO'}); qc.invalidateQueries({queryKey:['/admin/notifications']});}, onError:(e:any)=>toast.error(e?.response?.data?.message||'Failed') });
  return <div className="space-y-4"><div><h1 className="font-serif text-3xl text-gray-800">Notification Management</h1><p className="text-gray-500">System-wide notifications (point 34).</p></div>
    <Card className="border-gray-100"><CardHeader><CardTitle>Create Notification</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 gap-3"><Input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><select className="border rounded px-3 py-2" value={form.audience} onChange={e=>setForm({...form,audience:e.target.value})}><option>ALL</option><option>STAFF</option><option>MEMBERS</option><option>ADMINS</option></select><Textarea className="sm:col-span-2" placeholder="Message" value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/><div><Button className="bg-[#7A1F2B]" onClick={()=>save.mutate()}>Send/Create</Button></div></CardContent></Card>
    <Card className="border-gray-100"><CardHeader><CardTitle>Notifications ({Array.isArray(data)?data.length:0})</CardTitle></CardHeader><CardContent className="space-y-2">{(Array.isArray(data)?data:[]).map((n:any)=>(<div key={n.id} className="border rounded p-3"><div className="font-medium">{n.title} <span className="text-xs text-gray-500">· {n.audience} · {n.type}</span></div><div className="text-sm text-gray-500">{n.message}</div><div className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</div></div>))}{(!data||data.length===0)&&<p className="text-gray-500">No notifications.</p>}</CardContent></Card>
  </div>;
}
