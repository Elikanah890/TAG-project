import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const keys = [
  ['church.name','Church Name'],['church.address','Church Address'],['church.phone','Church Phone'],['church.email','Church Email'],
  ['system.timezone','Timezone'],['system.locale','Locale'],['system.maintenance_mode','Maintenance Mode (true/false)']
];
export default function SettingsPage(){
  const qc = useQueryClient();
  const { data={} } = useQuery({ queryKey:['/admin/settings'], queryFn: async()=> (await api.get('/admin/settings')).data });
  const [form,setForm]=useState<any>({});
  useEffect(()=>{ setForm(data||{}); },[data]);
  const save = useMutation({ mutationFn: async()=> (await api.put('/admin/settings', form)).data, onSuccess:()=>{toast.success('Settings saved (audited)'); qc.invalidateQueries({queryKey:['/admin/settings']});}, onError:(e:any)=>toast.error(e?.response?.data?.message||'Failed') });
  return <div className="space-y-4"><div><h1 className="font-serif text-3xl text-gray-800">System Settings Management</h1><p className="text-gray-500">Church info and system configuration (points 37, 39).</p></div>
    <Card className="border-gray-100"><CardHeader><CardTitle>Configuration</CardTitle></CardHeader><CardContent className="space-y-3 max-w-2xl">{keys.map(([k,label])=> (<div key={k}><label className="text-sm">{label} <span className="text-gray-500">({k})</span></label><Input value={form[k]||''} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>))}
      <Button className="bg-[#7A1F2B]" onClick={()=>save.mutate()}>Save Settings</Button>
    </CardContent></Card></div>;
}
