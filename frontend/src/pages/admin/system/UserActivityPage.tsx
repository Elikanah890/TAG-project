import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function UserActivityPage(){
  const { data=[] } = useQuery({ queryKey:['/admin/user-activity'], queryFn: async()=> (await api.get('/admin/user-activity')).data });
  return <div className="space-y-4"><div><h1 className="font-serif text-3xl text-gray-800">User Activity Monitoring</h1><p className="text-gray-500">Monitor logins and account activity (point 40).</p></div>
    <Card className="border-gray-100"><CardHeader><CardTitle>User Activity</CardTitle></CardHeader><CardContent className="overflow-auto"><Table><TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Status</TableHead><TableHead>Roles</TableHead><TableHead>Last Login</TableHead></TableRow></TableHeader><TableBody>
      {(Array.isArray(data)?data:[]).map((u:any)=>(<TableRow key={u.id}><TableCell>{u.email}</TableCell><TableCell>{u.status}</TableCell><TableCell className="text-xs">{(u.roles||[]).map((r:any)=>r.role?.name).join(', ')}</TableCell><TableCell>{u.lastLoginAt?new Date(u.lastLoginAt).toLocaleString():'Never'}</TableCell></TableRow>))}
    </TableBody></Table></CardContent></Card></div>;
}
