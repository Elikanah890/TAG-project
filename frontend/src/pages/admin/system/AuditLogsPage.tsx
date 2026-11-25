import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AuditLogsPage(){
  const { data=[] } = useQuery({ queryKey:['/admin/audit-logs'], queryFn: async()=> (await api.get('/admin/audit-logs?limit=200')).data });
  const rows = Array.isArray(data)?data:[];
  return <div className="space-y-4"><div><h1 className="font-serif text-3xl text-gray-800">Audit Logs</h1><p className="text-gray-500">All system activities (point 36). Sensitive actions are recorded.</p></div>
    <Card className="border-gray-100"><CardHeader><CardTitle>Recent Audit Entries ({rows.length})</CardTitle></CardHeader><CardContent className="overflow-auto"><Table><TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>Actor</TableHead><TableHead>Metadata</TableHead></TableRow></TableHeader><TableBody>
      {rows.map((l:any)=>(<TableRow key={l.id}><TableCell className="whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</TableCell><TableCell className="font-medium">{l.action}</TableCell><TableCell>{l.entityType}{l.entityId?` · ${String(l.entityId).slice(0,8)}`:''}</TableCell><TableCell>{l.actor?.email||'system'}</TableCell><TableCell className="text-xs max-w-md truncate">{l.metadata?JSON.stringify(l.metadata):'—'}</TableCell></TableRow>))}
    </TableBody></Table></CardContent></Card>
  </div>;
}
