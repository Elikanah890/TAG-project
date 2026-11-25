import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function HomepageCms(){
  const qc = useQueryClient();
  const { data: publicSettings={} } = useQuery({ queryKey:['site-settings-public'], queryFn: async()=> (await api.get('/site-settings/public')).data });
  const [form,setForm]=useState<any>({ nav_home_label:'', hero_welcome:'', hero_tagline:'', hero_images_json:'' });
  const filled = { nav_home_label: form.nav_home_label || publicSettings.nav_home_label || '', hero_welcome: form.hero_welcome || publicSettings.hero_welcome || '', hero_tagline: form.hero_tagline || publicSettings.hero_tagline || '', hero_images_json: form.hero_images_json || publicSettings.hero_images_json || '' };
  const save = useMutation({ mutationFn: async()=> (await api.put('/site-settings/admin', filled)).data, onSuccess:()=>{toast.success('Homepage updated (audited)'); qc.invalidateQueries({queryKey:['site-settings-public']});}, onError:(e:any)=>toast.error(e?.response?.data?.message||'Failed') });
  const publishHome = useMutation({ mutationFn: async()=> (await api.post('/cms/pages', { slug:'home', title:'Homepage', status:'PUBLISHED', content:{ hero: filled } })).data, onSuccess:()=>toast.success('Homepage page published'), onError:(e:any)=>toast.error(e?.response?.data?.message||'Failed') });
  return <div className="space-y-4"><div><h1 className="font-serif text-3xl text-gray-800">Homepage Management</h1><p className="text-gray-500">Manage homepage/site hero content (points 26, 27). Changes are audited.</p></div>
    <Card className="border-gray-100"><CardHeader><CardTitle>Homepage Content</CardTitle></CardHeader><CardContent className="space-y-3 max-w-2xl">
      <div><label className="text-sm">Navbar Home Label</label><Input value={filled.nav_home_label} onChange={e=>setForm({...form,nav_home_label:e.target.value})}/></div>
      <div><label className="text-sm">Hero Welcome Text</label><Input value={filled.hero_welcome} onChange={e=>setForm({...form,hero_welcome:e.target.value})}/></div>
      <div><label className="text-sm">Hero Tagline</label><Input value={filled.hero_tagline} onChange={e=>setForm({...form,hero_tagline:e.target.value})}/></div>
      <div><label className="text-sm">Hero Images JSON (array of URLs)</label><Input value={filled.hero_images_json} onChange={e=>setForm({...form,hero_images_json:e.target.value})} placeholder='["/hero/hero-1.jpg","/hero/hero-2.jpg"]'/></div>
      <div className="flex gap-2"><Button className="bg-[#7A1F2B]" onClick={()=>save.mutate()}>Save Changes</Button><Button variant="outline" onClick={()=>publishHome.mutate()}>Publish Homepage Record</Button></div>
      <div className="text-xs text-gray-500">Live public settings feed Navbar/Hero immediately via API.</div>
    </CardContent></Card>
  </div>;
}
