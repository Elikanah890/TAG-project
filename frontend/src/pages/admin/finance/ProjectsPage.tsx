import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

export default function ProjectsPage(){
  const qc = useQueryClient(); const { data=[] } = useQuery({ queryKey:['/admin/projects'], queryFn: async()=> (await api.get('/admin/projects')).data });
  const [form,setForm]=useState<any>({name:'',description:'',targetAmount:'',status:'ACTIVE'});
  const save = useMutation({ mutationFn: async()=> (await api.post('/admin/projects',{...form,targetAmount: form.targetAmount?Number(form.targetAmount):null})).data, onSuccess:()=>{toast.success('Project created'); setForm({name:'',description:'',targetAmount:'',status:'ACTIVE'}); qc.invalidateQueries({queryKey:['/admin/projects']});}, onError:(e:any)=>toast.error(e?.response?.data?.message||'Failed') });
  return <div className="space-y-4"><div><h1 className="font-serif text-3xl text-gray-800">Project Contributions Monitoring</h1><p className="text-gray-500">Monitor contribution projects (point 21).</p></div>
    <Card className="border-gray-100"><CardHeader><CardTitle>Create Project</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-4 gap-3"><Input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><Input placeholder="Target Amount" type="number" value={form.targetAmount} onChange={e=>setForm({...form,targetAmount:e.target.value})}/><Input placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/><Button className="bg-[#7A1F2B]" onClick={()=>save.mutate()}>Create</Button></CardContent></Card>
    <Card className="border-gray-100"><CardHeader><CardTitle>Projects</CardTitle></CardHeader><CardContent className="overflow-auto"><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Target</TableHead><TableHead>Status</TableHead><TableHead>Budgets</TableHead></TableRow></TableHeader><TableBody>{(Array.isArray(data)?data:[]).map((p:any)=>(<TableRow key={p.id}><TableCell>{p.name}</TableCell><TableCell>{p.targetAmount?`TZS ${Number(p.targetAmount).toLocaleString()}`:'—'}</TableCell><TableCell>{p.status}</TableCell><TableCell>{(p.budgets||[]).length}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card></div>;
}
