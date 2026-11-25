import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
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

type Leader = {
  id: string; name: string; title: string; titleSw?: string | null; ministry: string | null; bio: string | null; bioSw?: string | null;
  imageUrl: string | null; phone?: string | null; email?: string | null; order: number; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured?: boolean; roleType?: string | null;
};
type MediaItem = { id: string; title: string; type: string; url: string; category: string | null };

const EMPTY = { name:'', title:'', titleSw:'', roleType:'SENIOR_PASTOR', order:0, status:'PUBLISHED' as Leader['status'], bio:'', bioSw:'', imageUrl:'', phone:'', email:'', featured:false, ministry:'' };
const roleLabel = (v?: string|null) => ({ SENIOR_PASTOR:'Senior Pastor', ASSISTANT_PASTOR:'Assistant Pastor', CHURCH_LEADER:'Church Leader', STAFF:'Staff' } as any)[v || ''] || v || 'Church Leader';
const err = (e:any,f:string)=>e?.response?.data?.message || f;

export default function ChurchLeadershipCms(){
  const qc = useQueryClient();
  const [open,setOpen]=useState(false); const [editing,setEditing]=useState<Leader|null>(null);
  const [form,setForm]=useState({ ...EMPTY });
  const [pickerOpen,setPickerOpen]=useState(false); const [pickerMode,setPickerMode]=useState<'form'|'row'>('form'); const [rowId,setRowId]=useState<string|null>(null);
  const formFile=useRef<HTMLInputElement>(null); const rowFile=useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({ queryKey:['cms-leadership'], queryFn: async()=> (await api.get('/cms/leadership')).data as Leader[] });
  const rows = useMemo(()=> (Array.isArray(data)?data:[]).filter(l => !l.ministry), [data]); // church leaders only
  const row = rowId ? rows.find(r=>r.id===rowId) ?? null : null;
  const { data: mediaData } = useQuery({ queryKey:['cms-media'], queryFn: async()=> (await api.get('/cms/media')).data as MediaItem[], enabled: pickerOpen });
  const imageMedia = (mediaData||[]).filter(m => (m.type||'IMAGE').toUpperCase()==='IMAGE');

  const invalidate=()=>{ qc.invalidateQueries({queryKey:['cms-leadership']}); qc.invalidateQueries({queryKey:['public-leaders']}); };
  const reset=()=>{ setForm({ ...EMPTY }); setEditing(null); };
  const startEdit=(r:Leader)=>{ setEditing(r); setForm({ name:r.name||'', title:r.title||'', titleSw:r.titleSw||'', roleType:r.roleType||'CHURCH_LEADER', order:r.order||0, status:r.status||'PUBLISHED', bio:r.bio||'', bioSw:r.bioSw||'', imageUrl:r.imageUrl||'', phone:r.phone||'', email:r.email||'', featured:!!r.featured, ministry:'' }); setOpen(true); };

  const save = useMutation({ mutationFn: async()=>{
    const payload:any = { ...form, ministry:null, order:Number(form.order||0), titleSw:form.titleSw||null, bio:form.bio||null, bioSw:form.bioSw||null, imageUrl:form.imageUrl||null, phone:form.phone||null, email:form.email||null, featured:!!form.featured, roleType:form.roleType||'CHURCH_LEADER' };
    return editing ? (await api.put(`/cms/leadership/${editing.id}`, payload)).data : (await api.post('/cms/leadership', payload)).data;
  }, onSuccess:()=>{ toast.success(editing?'Church leader updated':'Church leader created'); invalidate(); setOpen(false); reset(); }, onError:(e:any)=>toast.error(err(e,'Save failed')) });

  const del = useMutation({ mutationFn: async(r:Leader)=> (await api.delete(`/cms/leadership/${r.id}`)).data, onSuccess:()=>{ toast.success('Deleted'); invalidate(); }, onError:(e:any)=>toast.error(err(e,'Delete failed')) });
  const setPhoto = useMutation({ mutationFn: async({id,imageUrl}:{id:string;imageUrl:string|null})=> (await api.put(`/cms/leadership/${id}`, {imageUrl})).data, onSuccess:invalidate, onError:(e:any)=>toast.error(err(e,'Photo update failed')) });
  const upload = useMutation({ mutationFn: async({file,mode}:{file:File;mode:'form'|'row'})=>{
    const fd=new FormData(); fd.append('file',file); fd.append('title', form.name?`${form.name} - photo`:file.name); fd.append('category','LEADERS');
    const media=(await api.post('/cms/media/upload', fd, { headers:{'Content-Type':undefined} })).data as MediaItem; return {media,mode};
  }, onSuccess:({media,mode})=>{ if(mode==='row' && rowId){ setPhoto.mutate({id:rowId,imageUrl:media.url}); } else setForm(p=>({...p,imageUrl:media.url})); qc.invalidateQueries({queryKey:['cms-media']}); toast.success('Photo uploaded'); }, onError:(e:any)=>toast.error(err(e,'Upload failed')) });

  const pick=(url:string)=>{ if(pickerMode==='row' && rowId) setPhoto.mutate({id:rowId,imageUrl:url}); else setForm(p=>({...p,imageUrl:url})); setPickerOpen(false); };
  const onFile=(e:React.ChangeEvent<HTMLInputElement>,mode:'form'|'row')=>{ const f=e.target.files?.[0]; if(f) upload.mutate({file:f,mode}); e.target.value=''; };
  const photoBtns=(mode:'form'|'row', click:()=>void, has:boolean, remove:()=>void)=> (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" onClick={click} disabled={upload.isPending}><Upload className="mr-2 h-4 w-4"/>Upload</Button>
      <Button type="button" variant="outline" size="sm" onClick={()=>{setPickerMode(mode); setPickerOpen(true);}}><Library className="mr-2 h-4 w-4"/>Media Library</Button>
      {has && <Button type="button" variant="ghost" size="sm" onClick={remove}><Trash2 className="mr-2 h-4 w-4"/>Remove</Button>}
    </div>
  );

  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-gray-800">Church Leadership</h1>
        <p className="text-gray-500">Manage main church leaders shown on the public Leadership page (Senior Pastor, Assistant Pastor, etc.). Ministry leaders are managed in Ministries & Leaders.</p>
      </div>
      <Button className="bg-[#7A1F2B] hover:bg-[#7b2a35]" onClick={()=>{reset(); setOpen(true);}}><ImagePlus className="mr-2 h-4 w-4"/>Add Church Leader</Button>
    </div>

    <Card className="card-church border-gray-100"><CardHeader className="pb-2"><CardTitle className="text-base">Church Leaders ({rows.length})</CardTitle></CardHeader><CardContent>
      {isLoading ? <p className="text-gray-500">Loading...</p> : rows.length===0 ? <p className="text-gray-500">No church leaders yet. Add Senior/Assistant Pastor or church leaders here.</p> : (
        <div className="overflow-auto"><Table><TableHeader><TableRow><TableHead>Photo</TableHead><TableHead>Name</TableHead><TableHead>Title</TableHead><TableHead>Role Type</TableHead><TableHead>Order</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>
          {rows.map(r=> <TableRow key={r.id}>
            <TableCell><LeaderAvatar name={r.name} imageUrl={r.imageUrl} className="h-12 w-12 border border-secondary" initialsClassName="text-sm"/></TableCell>
            <TableCell className="font-medium">{r.name}</TableCell><TableCell>{r.title}</TableCell><TableCell>{roleLabel(r.roleType)}</TableCell><TableCell>{r.order}</TableCell><TableCell>{r.status}</TableCell>
            <TableCell className="space-x-2 whitespace-nowrap">
              <Button size="sm" variant="outline" onClick={()=>{setPickerMode('row'); setRowId(r.id);}}><Camera className="mr-1.5 h-3.5 w-3.5"/>Photo</Button>
              <Button size="sm" variant="outline" onClick={()=>startEdit(r)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={()=>{ if(confirm(`Delete ${r.name}?`)) del.mutate(r); }}>Delete</Button>
            </TableCell>
          </TableRow>)}
        </TableBody></Table></div>
      )}
    </CardContent></Card>

    <input ref={formFile} type="file" accept="image/*" className="hidden" onChange={e=>onFile(e,'form')} />
    <input ref={rowFile} type="file" accept="image/*" className="hidden" onChange={e=>onFile(e,'row')} />

    <Dialog open={open} onOpenChange={(o)=>{setOpen(o); if(!o) reset();}}><DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing?'Edit Church Leader':'Add Church Leader'}</DialogTitle></DialogHeader>
      <div className="flex items-center gap-4"><LeaderAvatar name={form.name||'Leader'} imageUrl={form.imageUrl||null} className="h-20 w-20 border-2 border-secondary" initialsClassName="text-xl"/>{photoBtns('form', ()=>formFile.current?.click(), !!form.imageUrl, ()=>setForm(p=>({...p,imageUrl:''})))}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2"><Label>Name *</Label><Input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
        <div><Label>Title (EN) *</Label><Input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Senior Pastor"/></div>
        <div><Label>Title (SW)</Label><Input value={form.titleSw} onChange={e=>setForm(p=>({...p,titleSw:e.target.value}))} placeholder="Mchungaji Mkuu"/></div>
        <div><Label>Role Type</Label><Select value={form.roleType} onValueChange={v=>setForm(p=>({...p,roleType:v}))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="SENIOR_PASTOR">Senior Pastor</SelectItem><SelectItem value="ASSISTANT_PASTOR">Assistant Pastor</SelectItem><SelectItem value="CHURCH_LEADER">Church Leader</SelectItem><SelectItem value="STAFF">Staff</SelectItem></SelectContent></Select></div>
        <div><Label>Order</Label><Input type="number" value={form.order} onChange={e=>setForm(p=>({...p,order:Number(e.target.value)}))}/></div>
        <div><Label>Phone</Label><Input value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}/></div>
        <div><Label>Email</Label><Input value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/></div>
        <div><Label>Status</Label><Select value={form.status} onValueChange={v=>setForm(p=>({...p,status:v as any}))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="PUBLISHED">PUBLISHED</SelectItem><SelectItem value="DRAFT">DRAFT</SelectItem><SelectItem value="ARCHIVED">ARCHIVED</SelectItem></SelectContent></Select></div>
        <div className="flex items-center gap-2 sm:col-span-2"><input id="featured" type="checkbox" checked={!!form.featured} onChange={e=>setForm(p=>({...p,featured:e.target.checked}))}/><Label htmlFor="featured">Featured</Label></div>
        <div className="sm:col-span-2"><Label>Bio (EN)</Label><Textarea value={form.bio} onChange={e=>setForm(p=>({...p,bio:e.target.value}))}/></div>
        <div className="sm:col-span-2"><Label>Bio (SW)</Label><Textarea value={form.bioSw} onChange={e=>setForm(p=>({...p,bioSw:e.target.value}))}/></div>
      </div>
      <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button><Button className="bg-[#7A1F2B] hover:bg-[#7b2a35]" onClick={()=>save.mutate()} disabled={save.isPending || !form.name.trim() || !form.title.trim()}>{save.isPending?'Saving...':'Save'}</Button></div>
    </DialogContent></Dialog>

    <Dialog open={!!rowId} onOpenChange={(o)=>{ if(!o) setRowId(null); }}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Photo — {row?.name||'Leader'}</DialogTitle></DialogHeader><div className="flex items-center gap-4"><LeaderAvatar name={row?.name||'Leader'} imageUrl={row?.imageUrl||null} className="h-20 w-20 border-2 border-secondary" initialsClassName="text-xl"/>{photoBtns('row', ()=>rowFile.current?.click(), !!row?.imageUrl, ()=>rowId && setPhoto.mutate({id:rowId,imageUrl:null}))}</div><div className="flex justify-end pt-2"><Button variant="outline" onClick={()=>setRowId(null)}>Close</Button></div></DialogContent></Dialog>

    <Dialog open={pickerOpen} onOpenChange={setPickerOpen}><DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto"><DialogHeader><DialogTitle>Pick from Media Library</DialogTitle></DialogHeader>{imageMedia.length===0 ? <p className="py-6 text-center text-gray-500">No images in Media Library.</p> : <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">{imageMedia.map(m=> <button key={m.id} type="button" onClick={()=>pick(m.url)} className="group flex flex-col items-center gap-1 rounded-lg border p-2 hover:border-secondary"><img src={resolveMediaUrl(m.url)} alt={m.title} className="h-20 w-20 rounded-lg object-cover"/><span className="line-clamp-2 text-[10px] text-gray-600">{m.title}</span></button>)}</div>}</DialogContent></Dialog>
  </div>;
}
