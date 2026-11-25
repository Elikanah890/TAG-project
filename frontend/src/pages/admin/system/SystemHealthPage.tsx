import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SystemHealthPage({ title='Database Operations Monitoring', point='42. Database Operations Monitoring / 44. System-wide Operations Monitoring' }:{title?:string;point?:string}){
  const { data, refetch, isFetching } = useQuery({ queryKey:['/admin/system/health'], queryFn: async()=> (await api.get('/admin/system/health')).data });
  return <div className="space-y-4"><div><h1 className="font-serif text-3xl text-gray-800">{title}</h1><p className="text-gray-500">{point}. Live health, uptime, counts.</p></div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <K k="Status" v={data?.status||'—'} /><K k="Database" v={data?.database||'—'} /><K k="Uptime (s)" v={data?.uptimeSeconds??'—'} /><K k="Users" v={data?.counts?.users??'—'} />
      <K k="Active Users" v={data?.counts?.activeUsers??'—'} /><K k="Members" v={data?.counts?.members??'—'} /><K k="Pending Members" v={data?.counts?.pending??'—'} /><K k="Audit Logs" v={data?.counts?.auditLogs??'—'} />
    </div>
    <Card className="border-gray-100"><CardHeader><CardTitle>Raw Health Payload</CardTitle></CardHeader><CardContent><pre className="text-xs bg-muted/40 p-3 rounded overflow-auto">{JSON.stringify(data,null,2)}</pre><button className="mt-3 text-sm underline" onClick={()=>refetch()}>{isFetching?'Refreshing...':'Refresh'}</button></CardContent></Card>
  </div>;
}
function K({k,v}:{k:string,v:any}){ return <Card className="border-gray-100"><CardContent className="pt-4"><div className="text-xs text-gray-500">{k}</div><div className="text-xl font-semibold text-gray-800">{String(v)}</div></CardContent></Card>; }
