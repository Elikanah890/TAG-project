import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ministries } from '@/lib/churchData';
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
  id: string;
  name: string;
  title: string;
  ministry: string | null;
  bio: string | null;
  imageUrl: string | null;
  order: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  titleSw?: string | null;
  bioSw?: string | null;
  featured?: boolean;
  roleType?: string | null;
};

type MediaItem = { id: string; title: string; type: string; url: string; category: string | null };

const EMPTY_FORM = { name: '', title: '', titleSw: '', ministry: '', order: 0, status: 'PUBLISHED' as Leader['status'], bio: '', bioSw: '', imageUrl: '', featured: false, roleType: 'LEADER' };

const ministryOptions = ministries.map((m) => ({ id: m.id, label: m.name.en }));
const ministryLabel = (id?: string | null) => ministryOptions.find((m) => m.id === id)?.label || id || '—';

const errorMessage = (e: unknown, fallback: string): string => {
  if (e && typeof e === 'object') {
    const res = (e as { response?: { data?: { message?: string } } }).response;
    if (res?.data?.message) return res.data.message;
  }
  return fallback;
};

export default function LeadersCms() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<'form' | 'row'>('form');
  const [rowPhotoId, setRowPhotoId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Leader | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [ministryFilter, setMinistryFilter] = useState<string>('all');
  const formFileRef = useRef<HTMLInputElement>(null);
  const rowFileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['cms-leadership'],
    queryFn: async () => (await api.get('/cms/leadership')).data as Leader[],
  });
  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const rowPhoto = rowPhotoId ? rows.find((r) => r.id === rowPhotoId) ?? null : null;

  const { data: mediaData } = useQuery({
    queryKey: ['cms-media'],
    queryFn: async () => (await api.get('/cms/media')).data as MediaItem[],
    enabled: pickerOpen,
  });
  const imageMedia = (mediaData ?? []).filter((m) => (m.type || 'IMAGE').toUpperCase() === 'IMAGE');

  const reset = () => { setForm({ ...EMPTY_FORM }); setEditing(null); };
  const startCreate = () => { reset(); setOpen(true); };
  const startEdit = (row: Leader) => {
    setEditing(row);
    setForm({
      name: row.name ?? '',
      title: row.title ?? '',
      titleSw: row.titleSw ?? '',
      ministry: row.ministry ?? '',
      order: row.order ?? 0,
      status: row.status ?? 'PUBLISHED',
      bio: row.bio ?? '',
      bioSw: row.bioSw ?? '',
      imageUrl: row.imageUrl ?? '',
      featured: !!row.featured,
      roleType: row.roleType ?? 'LEADER',
    });
    setOpen(true);
  };

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['cms-leadership'] });
    qc.invalidateQueries({ queryKey: ['public-leaders'] });
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        order: Number(form.order || 0),
        ministry: form.ministry || null,
        titleSw: form.titleSw || null,
        bio: form.bio || null,
        bioSw: form.bioSw || null,
        imageUrl: form.imageUrl || null,
        featured: !!form.featured,
        roleType: form.roleType || 'LEADER',
      };
      if (editing) return (await api.put(`/cms/leadership/${editing.id}`, payload)).data;
      return (await api.post('/cms/leadership', payload)).data;
    },
    onSuccess: () => {
      toast.success(editing ? 'Leader updated' : 'Leader created');
      invalidate();
      setOpen(false);
      reset();
    },
    onError: (e: unknown) => toast.error(errorMessage(e, 'Save failed')),
  });

  const del = useMutation({
    mutationFn: async (row: Leader) => (await api.delete(`/cms/leadership/${row.id}`)).data,
    onSuccess: () => { toast.success('Leader deleted'); invalidate(); },
    onError: (e: unknown) => toast.error(errorMessage(e, 'Delete failed')),
  });

  const setPhoto = useMutation({
    mutationFn: async ({ id, imageUrl }: { id: string; imageUrl: string | null }) =>
      (await api.put(`/cms/leadership/${id}`, { imageUrl })).data,
    onSuccess: () => { invalidate(); },
    onError: (e: unknown) => toast.error(errorMessage(e, 'Could not update photo')),
  });

  const upload = useMutation({
    mutationFn: async ({ file, mode }: { file: File; mode: 'form' | 'row' }) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', form.name ? `${form.name} - profile photo` : file.name);
      fd.append('category', 'LEADERS');
      const media = (await api.post('/cms/media/upload', fd, { headers: { 'Content-Type': undefined } })).data as MediaItem;
      return { media, mode };
    },
    onSuccess: ({ media, mode }) => {
      if (mode === 'row' && rowPhotoId) {
        setPhoto.mutate({ id: rowPhotoId, imageUrl: media.url });
        toast.success('Photo uploaded');
      } else {
        setForm((p) => ({ ...p, imageUrl: media.url }));
        toast.success('Photo uploaded to Media Library');
      }
      qc.invalidateQueries({ queryKey: ['cms-media'] });
    },
    onError: (e: unknown) => toast.error(errorMessage(e, 'Upload failed')),
  });

  const pickMedia = (url: string) => {
    if (pickerMode === 'row' && rowPhotoId) {
      setPhoto.mutate({ id: rowPhotoId, imageUrl: url });
      toast.success('Photo updated');
    } else {
      setForm((p) => ({ ...p, imageUrl: url }));
    }
    setPickerOpen(false);
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>, mode: 'form' | 'row') => {
    const file = e.target.files?.[0];
    if (file) upload.mutate({ file, mode });
    e.target.value = '';
  };

  const grouped = useMemo(() => {
    const map = new Map<string, Leader[]>();
    for (const row of rows) {
      const key = row.ministry || 'unassigned';
      if (ministryFilter !== 'all' && key !== ministryFilter) continue;
      const list = map.get(key) ?? [];
      list.push(row);
      map.set(key, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [rows, ministryFilter]);

  const photoButtons = (mode: 'form' | 'row', onUploadClick: () => void, showRemove: boolean, onRemove: () => void) => (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={onUploadClick} disabled={upload.isPending}>
        <Upload className="mr-2 h-4 w-4" aria-hidden="true" />{upload.isPending ? 'Uploading...' : 'Upload Photo'}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => { setPickerMode(mode); setPickerOpen(true); }}>
        <Library className="mr-2 h-4 w-4" aria-hidden="true" />Media Library
      </Button>
      {showRemove && (
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />Remove Photo
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-gray-800">Ministry Leaders</h1>
          <p className="text-gray-500">Manage leader names, titles and photos shown on the public Ministries page.</p>
        </div>
        <Button className="bg-[#7A1F2B] hover:bg-[#7b2a35]" onClick={startCreate}>
          <ImagePlus className="mr-2 h-4 w-4" aria-hidden="true" /> Add New Leader
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor="ministry-filter" className="text-sm font-medium text-gray-600">Ministry</Label>
        <Select value={ministryFilter} onValueChange={setMinistryFilter}>
          <SelectTrigger id="ministry-filter" className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ministries</SelectItem>
            {ministryOptions.map((m) => <SelectItem key={m.id} value={m.id}>{m.label} ({m.id})</SelectItem>)}
            <SelectItem value="unassigned">Unassigned</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-gray-800/50">{rows.length} leader{rows.length === 1 ? '' : 's'} total</span>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : grouped.length === 0 ? (
        <Card className="card-church border-gray-100"><CardContent className="py-8 text-center text-gray-500">No leaders in this ministry yet. Click “+ Add New Leader” to create one.</CardContent></Card>
      ) : (
        grouped.map(([ministry, leaders]) => (
          <Card key={ministry} className="card-church border-gray-100">
            <CardHeader className="pb-2"><CardTitle className="text-base">{ministry === 'unassigned' ? 'Unassigned' : ministryLabel(ministry)} ({leaders.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Photo</TableHead><TableHead>Name</TableHead><TableHead>Title</TableHead><TableHead>Order</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {leaders.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <LeaderAvatar name={row.name} imageUrl={row.imageUrl} className="h-12 w-12 border border-secondary" initialsClassName="text-sm" />
                        </TableCell>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell>{row.title}</TableCell>
                        <TableCell>{row.order}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell className="space-x-2 whitespace-nowrap">
                          <Button size="sm" variant="outline" onClick={() => { setPickerMode('row'); setRowPhotoId(row.id); }}>
                            <Camera className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Photo
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => startEdit(row)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => { if (confirm(`Delete ${row.name}?`)) del.mutate(row); }}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <input ref={formFileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" aria-label="Upload profile photo" onChange={(e) => onPickFile(e, 'form')} />
      <input ref={rowFileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" aria-label="Upload leader photo" onChange={(e) => onPickFile(e, 'row')} />

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Leader' : 'Add New Leader'}</DialogTitle></DialogHeader>

          <div className="flex items-center gap-4">
            <LeaderAvatar name={form.name || 'New Leader'} imageUrl={form.imageUrl || null} className="h-20 w-20 border-2 border-secondary" initialsClassName="text-xl" />
            {photoButtons('form', () => formFileRef.current?.click(), !!form.imageUrl, () => setForm((p) => ({ ...p, imageUrl: '' })))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="leader-name">Name *</Label>
              <Input id="leader-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Ambonisye Fungo" />
            </div>
            <div>
              <Label htmlFor="leader-title">Title / Role (EN) *</Label>
              <Input id="leader-title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Chairman" />
            </div>
            <div>
              <Label htmlFor="leader-title-sw">Title / Role (SW)</Label>
              <Input id="leader-title-sw" value={form.titleSw} onChange={(e) => setForm((p) => ({ ...p, titleSw: e.target.value }))} placeholder="e.g. Mwenyekiti" />
            </div>
            <div>
              <Label htmlFor="leader-ministry">Ministry</Label>
              <Select value={form.ministry} onValueChange={(v) => setForm((p) => ({ ...p, ministry: v }))}>
                <SelectTrigger id="leader-ministry"><SelectValue placeholder="Select ministry" /></SelectTrigger>
                <SelectContent>
                  {ministryOptions.map((m) => <SelectItem key={m.id} value={m.id}>{m.label} ({m.id})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="leader-role-type">Role Type</Label>
              <Select value={form.roleType} onValueChange={(v) => setForm((p) => ({ ...p, roleType: v }))}>
                <SelectTrigger id="leader-role-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LEADER">LEADER</SelectItem>
                  <SelectItem value="SENIOR_PASTOR">SENIOR_PASTOR</SelectItem>
                  <SelectItem value="ASSISTANT_PASTOR">ASSISTANT_PASTOR</SelectItem>
                  <SelectItem value="STAFF">STAFF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="leader-order">Order</Label>
              <Input id="leader-order" type="number" min={0} value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))} />
            </div>
            <div>
              <Label htmlFor="leader-status">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as Leader['status'] }))}>
                <SelectTrigger id="leader-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                  <SelectItem value="DRAFT">DRAFT</SelectItem>
                  <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input id="leader-featured" type="checkbox" checked={!!form.featured} onChange={(e)=>setForm((p)=>({...p,featured:e.target.checked}))} />
              <Label htmlFor="leader-featured">Featured on Home/Leadership highlights</Label>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="leader-bio">Bio (EN)</Label>
              <Textarea id="leader-bio" value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Short bio (optional)" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="leader-bio-sw">Bio (SW)</Label>
              <Textarea id="leader-bio-sw" value={form.bioSw} onChange={(e) => setForm((p) => ({ ...p, bioSw: e.target.value }))} placeholder="Wasifu mfupi (hiari)" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="bg-[#7A1F2B] hover:bg-[#7b2a35]" onClick={() => save.mutate()} disabled={save.isPending || !form.name.trim() || !form.title.trim()}>
              {save.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rowPhotoId} onOpenChange={(o) => { if (!o) setRowPhotoId(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Photo — {rowPhoto?.name ?? 'Leader'}</DialogTitle></DialogHeader>
          <div className="flex items-center gap-4">
            <LeaderAvatar name={rowPhoto?.name ?? 'Leader'} imageUrl={rowPhoto?.imageUrl ?? null} className="h-20 w-20 border-2 border-secondary" initialsClassName="text-xl" />
            {photoButtons('row', () => rowFileRef.current?.click(), !!rowPhoto?.imageUrl, () => rowPhotoId && setPhoto.mutate({ id: rowPhotoId, imageUrl: null }))}
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setRowPhotoId(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Pick from Media Library</DialogTitle></DialogHeader>
          {imageMedia.length === 0 ? (
            <p className="py-6 text-center text-gray-500">No images in the Media Library yet. Upload one first.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {imageMedia.map((media) => (
                <button
                  key={media.id}
                  type="button"
                  onClick={() => pickMedia(media.url)}
                  className="group flex flex-col items-center gap-1 rounded-lg border border-border p-2 text-center transition hover:border-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                >
                  <img src={resolveMediaUrl(media.url)} alt={media.title} loading="lazy" className="h-20 w-20 rounded-lg object-cover" />
                  <span className="line-clamp-2 text-[10px] text-gray-600 group-hover:text-gray-800">{media.title}</span>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
