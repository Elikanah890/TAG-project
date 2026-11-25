import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function MembershipReport(){
  const { data, isLoading, error, refetch } = useQuery({ queryKey:['r-membership'], queryFn: async()=> (await api.get('/admin/oversight/reports/membership')).data });
  const members = data?.members||[];
  return <div className="space-y-4">
    <div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-900 px-4 py-2 font-semibold">READ-ONLY REPORT</div>
    <div><h1 className="font-serif text-3xl text-gray-800">Membership Reports</h1><p className="text-gray-500">Authorized church-wide membership records from live database (read-only). Confidential/private fields are not exposed in overseer view.</p></div>
    {isLoading? <p>Loading...</p> : error? <p className="text-red-600">Failed to load. <button className="underline" onClick={()=>refetch()}>Retry</button></p> : <>
      <div className="grid sm:grid-cols-4 gap-3">{(data?.byStatus||[]).map((s:any)=>(<Card key={s.membershipStatus} className="border-gray-100"><CardContent className="pt-4"><div className="text-xs text-gray-500">{s.membershipStatus}</div><div className="text-xl font-semibold">{s._count}</div></CardContent></Card>))}</div>
      <Card className="border-gray-100"><CardHeader><CardTitle>Members ({members.length})</CardTitle></CardHeader><CardContent className="overflow-auto"><Table><TableHeader><TableRow><TableHead>Member No</TableHead><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Email</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead><TableHead>Created</TableHead></TableRow></TableHeader><TableBody>{members.map((m:any)=>(<TableRow key={m.id}><TableCell>{m.memberNo||'—'}</TableCell><TableCell>{m.fullName}</TableCell><TableCell>{m.phone||'—'}</TableCell><TableCell>{m.email||'—'}</TableCell><TableCell>{m.membershipStatus}</TableCell><TableCell>{m.joinedAt?new Date(m.joinedAt).toLocaleDateString():'—'}</TableCell><TableCell>{new Date(m.createdAt).toLocaleDateString()}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
    </>}
  </div>;
}
