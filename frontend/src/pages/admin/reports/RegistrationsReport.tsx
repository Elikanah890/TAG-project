import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function RegistrationsReport(){
  const { data, isLoading } = useQuery({ queryKey:['r-registrations'], queryFn: async()=> (await api.get('/admin/oversight/reports/registrations')).data });
  const apps = data?.applications||[]; const t = data?.totals||{};
  return <div className="space-y-4">
    <div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-900 px-4 py-2 font-semibold">READ-ONLY REPORT</div>
    <div><h1 className="font-serif text-3xl text-gray-800">Registrations Report</h1><p className="text-gray-500">Overseer view of membership applications. System Administrator cannot approve, reject or modify applications.</p></div>
    {isLoading? <p>Loading...</p> : <>
      <div className="grid sm:grid-cols-4 gap-3"><K t="Total Applications" v={t.total}/><K t="Pending" v={t.pending}/><K t="Approved" v={t.approved}/><K t="Rejected" v={t.rejected}/></div>
      <Card className="border-gray-100"><CardHeader><CardTitle>Applications ({apps.length})</CardTitle></CardHeader><CardContent className="overflow-auto"><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Email</TableHead><TableHead>Status</TableHead><TableHead>Applied</TableHead><TableHead>Approved</TableHead><TableHead>Member No</TableHead></TableRow></TableHeader><TableBody>{apps.map((a:any)=>(<TableRow key={a.id}><TableCell>{a.fullName}</TableCell><TableCell>{a.phone||'—'}</TableCell><TableCell>{a.email||'—'}</TableCell><TableCell>{a.membershipStatus}</TableCell><TableCell>{new Date(a.createdAt).toLocaleString()}</TableCell><TableCell>{a.approvedAt?new Date(a.approvedAt).toLocaleString():'—'}</TableCell><TableCell>{a.memberNo||'—'}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
      <div className="text-sm text-[#7A5A10] bg-[#C9962B]/10 border border-gray-100 rounded p-3">No Approve/Reject controls: approval and rejection remain with the authorized membership workflow (Church Secretary). Backend enforces 403 for unauthorized operational writes.</div>
    </>}
  </div>;
}
function K({t,v}:{t:string;v:any}){ return <Card className="border-gray-100"><CardContent className="pt-4"><div className="text-xs text-gray-500">{t}</div><div className="text-xl font-semibold">{v??'—'}</div></CardContent></Card>; }
