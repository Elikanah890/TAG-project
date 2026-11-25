import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const keys=[['security.password_min_length','Password Min Length'],['security.session_timeout_minutes','Session Timeout (min)'],['security.require_strong_passwords','Require Strong Passwords (true/false)'],['security.max_login_attempts','Max Login Attempts'],['security.audit_sensitive_actions','Audit Sensitive Actions (true/false)']];
export default function SecurityPage(){
  const qc = useQueryClient(); const { data={} } = useQuery({ queryKey:['/admin/settings'], queryFn: async()=> (await api.get('/admin/settings')).data }); const [form,setForm]=useState<any>({});
  useEffect(()=>{ setForm(data||{}); },[data]);
  const save = useMutation({ mutationFn: async()=> (await api.put('/admin/settings', form)).data, onSuccess:()=>{toast.success('Security policies saved (audited)'); qc.invalidateQueries({queryKey:['/admin/settings']});}, onError:(e:any)=>toast.error(e?.response?.data?.message||'Failed') });
  return <div className="space-y-4"><div><h1 className="font-serif text-3xl text-gray-800">Security Settings Management</h1><p className="text-gray-500">Security policies and controls (point 38). Changes are audited.</p></div>
    <Card className="border-gray-100"><CardHeader><CardTitle>Security Policies</CardTitle></CardHeader><CardContent className="space-y-3 max-w-2xl">{keys.map(([k,label])=> (<div key={k}><label className="text-sm">{label} <span className="text-gray-500">({k})</span></label><Input value={form[k]||''} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>))}
      <div className="text-sm bg-[#C9962B]/10 border border-gray-100 rounded p-2">Separation of duties enforced: System Admin has finance oversight (read-only) and cannot record financial transactions. Pastoral confidential records remain isolated to authorized roles.</div>
      <Button className="bg-[#7A1F2B]" onClick={()=>save.mutate()}>Save Policies</Button>
    </CardContent></Card></div>;
}
