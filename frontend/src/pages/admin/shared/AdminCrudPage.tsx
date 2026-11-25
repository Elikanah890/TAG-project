import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export type Field = { key: string; label: string; type?: 'text'|'textarea'|'date'|'number'|'select'; options?: string[]; placeholder?: string; required?: boolean };
export type Col = { key: string; label: string; render?: (row:any)=>any };

export default function AdminCrudPage({ title, description, endpoint, fields, columns, createLabel='Create', idKey='id' }:{
  title:string; description?:string; endpoint:string; fields:Field[]; columns:Col[]; createLabel?:string; idKey?:string;
}) {
  const qc = useQueryClient();
  const [open,setOpen]=useState(false);
  const [editing,setEditing]=useState<any|null>(null);
  const [form,setForm]=useState<any>({});
  const { data=[], isLoading } = useQuery({ queryKey:[endpoint], queryFn: async()=> (await api.get(endpoint)).data });
  const reset=()=>{ setForm({}); setEditing(null); };
  const save = useMutation({
    mutationFn: async()=>{
      const payload:any={...form}; for(const f of fields){ if(f.type==='number' && payload[f.key]!=='' && payload[f.key]!=null) payload[f.key]=Number(payload[f.key]); }
      if(editing) return (await api.put(`${endpoint}/${editing[idKey]}`, payload)).data;
      return (await api.post(endpoint, payload)).data;
    },
    onSuccess:()=>{ toast.success(editing?'Updated':'Created'); qc.invalidateQueries({queryKey:[endpoint]}); setOpen(false); reset(); },
    onError:(e:any)=>toast.error(e?.response?.data?.message||'Save failed')
  });
  const del = useMutation({
    mutationFn: async(row:any)=> (await api.delete(`${endpoint}/${row[idKey]}`)).data,
    onSuccess:()=>{ toast.success('Deleted'); qc.invalidateQueries({queryKey:[endpoint]}); },
    onError:(e:any)=>toast.error(e?.response?.data?.message||'Delete failed')
  });
  const startEdit=(row:any)=>{ setEditing(row); const f:any={}; fields.forEach(x=>f[x.key]=row[x.key] ?? ''); setForm(f); setOpen(true); };
  const startCreate=()=>{ reset(); const f:any={}; fields.forEach(x=>f[x.key]=''); setForm(f); setOpen(true); };
  const rows = Array.isArray(data) ? data : (data?.data||data?.items||[]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-serif text-2xl md:text-3xl text-gray-800">{title}</h1>{description && <p className="text-gray-500">{description}</p>}</div><Button className="bg-[#7A1F2B] hover:bg-[#7b2a35]" onClick={startCreate}>{createLabel}</Button></div>
      <Card className="card-church border-gray-100"><CardHeader className="pb-2"><CardTitle className="text-base">Records ({rows.length})</CardTitle></CardHeader><CardContent>
        {isLoading ? <p className="text-gray-500">Loading...</p> : rows.length===0 ? <p className="text-gray-500">No records yet.</p> : (
          <div className="overflow-auto"><Table><TableHeader><TableRow>{columns.map(c=><TableHead key={c.key}>{c.label}</TableHead>)}<TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>
            {rows.map((r:any,idx:number)=>(<TableRow key={r[idKey]||idx}>{columns.map(c=><TableCell key={c.key}>{c.render?c.render(r):fmt(r[c.key])}</TableCell>)}<TableCell className="space-x-2 whitespace-nowrap"><Button size="sm" variant="outline" onClick={()=>startEdit(r)}>Edit</Button><Button size="sm" variant="destructive" onClick={()=>{ if(confirm('Delete this record?')) del.mutate(r); }}>Delete</Button></TableCell></TableRow>))}
          </TableBody></Table></div>
        )}
      </CardContent></Card>

      <Dialog open={open} onOpenChange={(o)=>{setOpen(o); if(!o) reset();}}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing?'Edit':'Create'} {title}</DialogTitle></DialogHeader>
          <div className="grid sm:grid-cols-2 gap-3">
            {fields.map(f=>(
              <div key={f.key} className={f.type==='textarea'?'sm:col-span-2':''}>
                <label className="text-sm font-medium mb-1 block">{f.label}{f.required?' *':''}</label>
                {f.type==='textarea' ? <Textarea value={form[f.key]??''} onChange={e=>setForm((p:any)=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder}/> :
                 f.type==='select' ? (
                  <Select value={String(form[f.key]??'')} onValueChange={v=>setForm((p:any)=>({...p,[f.key]:v}))}><SelectTrigger><SelectValue placeholder={f.placeholder||'Select'} /></SelectTrigger><SelectContent>{(f.options||[]).map(o=><SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>
                 ) : <Input type={f.type==='number'?'number':(f.type==='date'?'datetime-local':'text')} value={fmtInput(form[f.key], f.type)} onChange={e=>setForm((p:any)=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder}/>} 
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button><Button className="bg-[#7A1F2B] hover:bg-[#7b2a35]" onClick={()=>save.mutate()} disabled={save.isPending}>{save.isPending?'Saving...':'Save'}</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function fmt(v:any){ if(v==null||v==='') return '—'; if(typeof v==='string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return new Date(v).toLocaleString(); if(typeof v==='object') return JSON.stringify(v).slice(0,80); return String(v); }
function fmtInput(v:any,type?:string){ if(v==null) return ''; if(type==='date' && typeof v==='string'){ try{ const d=new Date(v); if(!isNaN(d.getTime())) return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);}catch{} } return v; }
