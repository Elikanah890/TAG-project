import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ministries as staticMinistries } from '@/lib/churchData';
import { resolveMediaUrl } from '@/lib/media';
import LeaderAvatar from '@/components/LeaderAvatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Camera, ImagePlus, Library, Trash2, Upload } from 'lucide-react';

type Leader = { id:string; name:string; title:string; titleSw?:string|null; ministry:string|null; bio:string|null; bioSw?:string|null; imageUrl:string|null; order:number; status:'DRAFT'|'PUBLISHED'|'ARCHIVED'; };
type MediaItem = { id:string; title:string; type:string; url:string; };
type Ministry = { id:string; slug?:string|null; name:string; nameSw?:string|null; };
const EMPTY = { name:'', title:'', titleSw:'', ministry:'', order:0, status:'PUBLISHED' as Leader['status'], bio:'', bioSw:'', imageUrl:'' };
const err=(e:any,f:string)=>e?.response?.data?.message||f;

export default function MinistryLeadersCms(){
  const qc = useQueryClient();
  const [open,setOpen]=useState(false); const [editing,setEditing]=useState<Leader|null>(null); const [form,setForm]=useState({...EMPTY});
  const [pickerOpen,setPickerOpen]=useState(false); const [pickerMode,setPickerMode]=useState<'form'|'row'>('form'); const [rowId,setRowId]=useState<string|null>(null);
  const [filter,setFilter]=useState('all');
  const formFile=useRef<HTMLInputElement>(null); const rowFile=useRef<HTMLInputElement>(null);

  const { data:leadersData, isLoading } = useQuery({ queryKey:['cms-leadership'], queryFn: async()=> (await api.get('/cms/leadership')).data as Leader[] });
  const { data:ministriesData } = useQuery({ queryKey:['cms-ministries'], queryFn: async()=> (await api.get('/cms/ministries')).data as any[] });
  const ministries: Ministry[] = useMemo(()=>{
    const cms = Array.isArray(ministriesData) ? ministriesData : [];
    const base = cms.length ? cms.map(m=>({ id: m.slug || m.id, name:m.name, nameSw:m.nameSw })) : staticMinistries.map(m=>({ id:m.id, name:m.name.en, nameSw:m.name.sw }));
    const dedup = new Map<string,Ministry>(); base.forEach(m=>dedup.set(m.id,m)); return [...dedup.values()];
  },[ministriesData]);
  const ministryLabel=(id?:string|null)=> ministries.find(m=>m.id===id)?.name || id || '—';
  const rows = useMemo(()=> (Array.isArray(leadersData)?leadersData:[]).filter(l=>!!l.ministry), [leadersData]);
  const filtered = filter==='all' ? rows : rows.filter(r=>r.ministry===filter);
  const row = rowId ? rows.find(r=>r.id===rowId)||null : null;
  const { data: mediaData } = useQuery({ queryKey:['cms-media'], queryFn: async()=> (await api.get('/cms/media')).data as MediaItem[], enabled:pickerOpen });
  const imageMedia=(mediaData||[]).filter((m:any)=>(m.type||'IMAGE').toUpperCase()==='IMAGE');

  const invalidate=()=>{ qc.invalidateQueries({queryKey:['cms-leadership']}); qc.invalidateQueries({queryKey:['public-leaders']}); };
  const reset=()=>{ setForm({...EMPTY}); setEditing(null); };
  const startEdit=(r:Leader)=>{ setEditing(r); setForm({name:r.name||'',title:r.title||'',titleSw:r.titleSw||'',ministry:r.ministry||'',order:r.order||0,status:r.status||'PUBLISHED',bio:r.bio||'',bioSw:r.bioSw||'',imageUrl:r.imageUrl||''}); setOpen(true); };

  const save=useMutation({ mutationFn: async()=>{ const payload:any={...form, order:Number(form.order||0), ministry:form.ministry||null, titleSw:form.titleSw||null, bio:form.bio||null, bioSw:form.bioSw||null, imageUrl:form.imageUrl||null, roleType:'MINISTRY_LEADER' }; return editing ? (await api.put(`/cms/leadership/${editing.id}`,payload)).data : (await api.post('/cms/leadership',payload)).data; }, onSuccess:()=>{ toast.success(editing?'Ministry leader updated':'Ministry leader created'); invalidate(); setOpen(false); reset(); }, onError:(e:any)=>toast.error(err(e,'Save failed')) });
  const del=useMutation({ mutationFn: async(r:Leader)=> (await api.delete(`/cms/leadership/${r.id}`)).data, onSuccess:()=>{toast.success('Deleted'); invalidate();}, onError:(e:any)=>toast.error(err(e,'Delete failed')) });
  const setPhoto=useMutation({ mutationFn: async({id,imageUrl}:{id:string;imageUrl:string|null})=> (await api.put(`/cms/leadership/${id}`,{imageUrl})).data, onSuccess:invalidate, onError:(e:any)=>toast.error(err(e,'Photo update failed')) });
  const upload=useMutation({ mutationFn: async({file,mode}:{file:File;mode:'form'|'row'})=>{ const fd=new FormData(); fd.append('file',file); fd.append('title',form.name?`${form.name} - photo`:file.name); fd.append('category','LEADERS'); const media=(await api.post('/cms/media/upload',fd,{headers:{'Content-Type':undefined}})).data as any; return {media,mode}; }, onSuccess:({media,mode})=>{ if(mode==='row'&&rowId) setPhoto.mutate({id:rowId,imageUrl:media.url}); else setForm(p=>({...p,imageUrl:media.url})); qc.invalidateQueries({queryKey:['cms-media']}); toast.success('Photo uploaded'); }, onError:(e:any)=>toast.error(err(e,'Upload failed')) });
  const pick=(url:string)=>{ if(pickerMode==='row'&&rowId) setPhoto.mutate({id:rowId,imageUrl:url}); else setForm(p=>({...p,imageUrl:url})); setPickerOpen(false); };
  const onFile=(e:React.ChangeEvent<HTMLInputElement>,mode:'form'|'row')=>{ const f=e.target.files?.[0]; if(f) upload.mutate({file:f,mode}); e.target.value=''; };

  const groups = useMemo(()=>{ const m=new Map<string,Leader[]>(); filtered.forEach(r=>{ const k=r.ministry||'unassigned'; m.set(k,[...(m.get(k)||[]),r]); }); return [...m.entries()].sort(([a],[b])=>a.localeCompare(b)); },[filtered]);
  const btns=(mode:'form'|'row',click:()=>void,has:boolean,remove:()=>void)=>(<div className="flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" onClick={click} disabled={upload.isPending}><Upload className="mr-2 h-4 w-4"/>Upload</Button><Button type="button" variant="outline" size="sm" onClick={()=>{setPickerMode(mode);setPickerOpen(true);}}><Library className="mr-2 h-4 w-4"/>Media Library</Button>{has && <Button type="button" variant="ghost" size="sm" onClick={remove}><Trash2 className="mr-2 h-4 w-4"/>Remove</Button>}</div>);

  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="font-serif text-2xl md:text-3xl text-gray-800">Ministry Leaders</h1><p className="text-gray-500">Manage leaders for each ministry. These appear under each ministry on the public Ministries page.</p></div>
      <Button className="bg-[#7A1F2B] hover:bg-[#7b2a35]" onClick={()=>{reset(); setOpen(true);}}><ImagePlus className="mr-2 h-4 w-4"/>Add Ministry Leader</Button>
    </div>
    <div className="flex items-center gap-2"><Label>Ministry</Label><Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-64"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Ministries</SelectItem>{ministries.map(m=><SelectItem key={m.id} value={m.id}>{m.name} ({m.id})</SelectItem>)}</SelectContent></Select><span className="text-xs text-gray-500">{rows.length} ministry leaders</span></div>

    {isLoading ? <p className="text-gray-500">Loading...</p> : groups.length===0 ? <Card className="card-church border-gray-100"><CardContent className="py-8 text-center text-gray-500">No ministry leaders yet.</CardContent></Card> : groups.map(([ministry,items])=> (
      <Card key={ministry} className="card-church border-gray-100"><CardHeader className="pb-2"><CardTitle className="text-base">{ministryLabel(ministry)} ({items.length})</CardTitle></CardHeader><CardContent><div className="overflow-auto"><Table><TableHeader><TableRow><TableHead>Photo</TableHead><TableHead>Name</TableHead><TableHead>Title</TableHead><TableHead>Order</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>
        {items.map(r=> <TableRow key={r.id}><TableCell><LeaderAvatar name={r.name} imageUrl={r.imageUrl} className="h-12 w-12 border border-secondary" initialsClassName="text-sm"/></TableCell><TableCell className="font-medium">{r.name}</TableCell><TableCell>{r.title}</TableCell><TableCell>{r.order}</TableCell><TableCell>{r.status}</TableCell><TableCell className="space-x-2 whitespace-nowrap"><Button size="sm" variant="outline" onClick={()=>{setPickerMode('row'); setRowId(r.id);}}><Camera className="mr-1.5 h-3.5 w-3.5"/>Photo</Button><Button size="sm" variant="outline" onClick={()=>startEdit(r)}>Edit</Button><Button size="sm" variant="destructive" onClick={()=>{ if(confirm(`Delete ${r.name}?`)) del.mutate(r); }}>Delete</Button></TableCell></TableRow>)}
      </TableBody></Table></div></CardContent></Card>
    ))}

    <input ref={formFile} type="file" accept="image/*" className="hidden" onChange={e=>onFile(e,'form')} />
    <input ref={rowFile} type="file" accept="image/*" className="hidden" onChange={e=>onFile(e,'row')} />

    <Dialog open={open} onOpenChange={(o)=>{setOpen(o); if(!o) reset();}}><DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing?'Edit Ministry Leader':'Add Ministry Leader'}</DialogTitle></DialogHeader>
      <div className="flex items-center gap-4"><LeaderAvatar name={form.name||'Leader'} imageUrl={form.imageUrl||null} className="h-20 w-20 border-2 border-secondary" initialsClassName="text-xl"/>{btns('form',()=>formFile.current?.click(),!!form.imageUrl,()=>setForm(p=>({...p,imageUrl:''})))}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2"><Label>Name *</Label><Input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
        <div><Label>Title (EN) *</Label><Input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Chairman"/></div>
        <div><Label>Title (SW)</Label><Input value={form.titleSw} onChange={e=>setForm(p=>({...p,titleSw:e.target.value}))} placeholder="Mwenyekiti"/></div>
        <div><Label>Ministry *</Label><Select value={form.ministry} onValueChange={v=>setForm(p=>({...p,ministry:v}))}><SelectTrigger><SelectValue placeholder="Select ministry"/></SelectTrigger><SelectContent>{ministries.map(m=><SelectItem key={m.id} value={m.id}>{m.name} ({m.id})</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Order</Label><Input type="number" value={form.order} onChange={e=>setForm(p=>({...p,order:Number(e.target.value)}))}/></div>
        <div><Label>Status</Label><Select value={form.status} onValueChange={v=>setForm(p=>({...p,status:v as any}))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="PUBLISHED">PUBLISHED</SelectItem><SelectItem value="DRAFT">DRAFT</SelectItem><SelectItem value="ARCHIVED">ARCHIVED</SelectItem></SelectContent></Select></div>
        <div className="sm:col-span-2"><Label>Bio (EN)</Label><Textarea value={form.bio} onChange={e=>setForm(p=>({...p,bio:e.target.value}))}/></div>
        <div className="sm:col-span-2"><Label>Bio (SW)</Label><Textarea value={form.bioSw} onChange={e=>setForm(p=>({...p,bioSw:e.target.value}))}/></div>
      </div>
      <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button><Button className="bg-[#7A1F2B] hover:bg-[#7b2a35]" onClick={()=>save.mutate()} disabled={save.isPending || !form.name.trim() || !form.title.trim() || !form.ministry}>{save.isPending?'Saving...':'Save'}</Button></div>
    </DialogContent></Dialog>

    <Dialog open={!!rowId} onOpenChange={(o)=>{ if(!o) setRowId(null); }}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Photo — {row?.name||'Leader'}</DialogTitle></DialogHeader><div className="flex items-center gap-4"><LeaderAvatar name={row?.name||'Leader'} imageUrl={row?.imageUrl||null} className="h-20 w-20 border-2 border-secondary" initialsClassName="text-xl"/>{btns('row',()=>rowFile.current?.click(),!!row?.imageUrl,()=>rowId && setPhoto.mutate({id:rowId,imageUrl:null}))}</div><div className="flex justify-end pt-2"><Button variant="outline" onClick={()=>setRowId(null)}>Close</Button></div></DialogContent></Dialog>
    <Dialog open={pickerOpen} onOpenChange={setPickerOpen}><DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto"><DialogHeader><DialogTitle>Pick from Media Library</DialogTitle></DialogHeader>{imageMedia.length===0 ? <p className="py-6 text-center text-gray-500">No images in Media Library.</p> : <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">{imageMedia.map((m:any)=> <button key={m.id} type="button" onClick={()=>pick(m.url)} className="group flex flex-col items-center gap-1 rounded-lg border p-2 hover:border-secondary"><img src={resolveMediaUrl(m.url)} alt={m.title} className="h-20 w-20 rounded-lg object-cover"/><span className="line-clamp-2 text-[10px] text-gray-600">{m.title}</span></button>)}</div>}</DialogContent></Dialog>
  </div>;
}
