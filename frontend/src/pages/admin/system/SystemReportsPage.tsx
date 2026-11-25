import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SystemReportsPage(){
  const { data } = useQuery({ queryKey:['/admin/reports'], queryFn: async()=> (await api.get('/admin/reports')).data });
  return <div className="space-y-4"><div><h1 className="font-serif text-3xl text-gray-800">Reports Management</h1><p className="text-gray-500">System-wide reporting (point 35).</p></div>
    <div className="grid lg:grid-cols-2 gap-4">
      <Card className="border-gray-100"><CardHeader><CardTitle>Members by Status</CardTitle></CardHeader><CardContent><pre className="text-xs bg-muted/40 p-3 rounded overflow-auto">{JSON.stringify(data?.membersByStatus||[],null,2)}</pre></CardContent></Card>
      <Card className="border-gray-100"><CardHeader><CardTitle>Contributions by Category</CardTitle></CardHeader><CardContent><pre className="text-xs bg-muted/40 p-3 rounded overflow-auto">{JSON.stringify(data?.contributionsByCategory||[],null,2)}</pre></CardContent></Card>
      <Card className="border-gray-100"><CardHeader><CardTitle>Expenses by Category</CardTitle></CardHeader><CardContent><pre className="text-xs bg-muted/40 p-3 rounded overflow-auto">{JSON.stringify(data?.expensesByCategory||[],null,2)}</pre></CardContent></Card>
      <Card className="border-gray-100"><CardHeader><CardTitle>Pledges / Budgets / Projects</CardTitle></CardHeader><CardContent><pre className="text-xs bg-muted/40 p-3 rounded overflow-auto">{JSON.stringify({pledges:data?.pledges,budgets:data?.budgets,projects:data?.projects},null,2)}</pre></CardContent></Card>
    </div>
  </div>;
}
