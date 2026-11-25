import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SystemHealthMonitoring(){
  const { data, refetch, isFetching } = useQuery({ queryKey:['oversight-health'], queryFn: async()=> (await api.get('/admin/oversight/system/health')).data });
  const items = [
    ['Database Connectivity', data?.databaseConnectivity],
    ['Backend API Status', data?.backendApiStatus],
    ['Server Uptime (s)', data?.uptimeSeconds],
    ['Last Backup', data?.lastBackup?.createdAt ? new Date(data.lastBackup.createdAt).toLocaleString() : (data?.lastBackup || 'None')],
    ['Failed Backups', data?.failedBackups],
    ['Timestamp', data?.timestamp ? new Date(data.timestamp).toLocaleString() : '—'],
  ];
  return <div className="space-y-4"><div className="flex items-center justify-between"><div><h1 className="font-serif text-3xl text-gray-800">System Health Monitoring</h1><p className="text-gray-500">Live health checks from backend/database (no hardcoded values).</p></div><Button variant="outline" onClick={()=>refetch()} disabled={isFetching}>{isFetching?'Refreshing...':'Refresh'}</Button></div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{items.map(([k,v])=>(<Card key={String(k)} className="border-gray-100"><CardContent className="pt-4"><div className="text-xs text-gray-500">{k}</div><div className="text-xl font-semibold">{String(v ?? '—')}</div></CardContent></Card>))}</div>
  </div>;
}
