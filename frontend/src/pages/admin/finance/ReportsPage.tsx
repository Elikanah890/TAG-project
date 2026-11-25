import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader, formatMoney } from '@/components/admin/access/AccessUI';

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('monthly');
  const { data, isLoading } = useQuery({ queryKey: ['/finance/reports'], queryFn: async () => (await api.get('/finance/reports')).data });

  const rows = useMemo(() => {
    const map: Record<Period, any[]> = { daily: data?.byDay || [], weekly: data?.byWeek || [], monthly: data?.byMonth || [], yearly: data?.byYear || [] };
    return map[period] || [];
  }, [data, period]);

  const max = Math.max(1, ...rows.map((r: any) => Number(r.amount || 0)));
  const total = rows.reduce((s: number, r: any) => s + Number(r.amount || 0), 0);

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Financial Accountability" title="Financial Reports" description="Real contribution reports by daily, weekly, monthly, and yearly periods." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="card-church"><CardContent className="pt-5"><p className="text-xs uppercase tracking-wide text-gray-500">Total confirmed income</p><p className="mt-1 text-2xl font-semibold text-gray-900">{formatMoney(data?.summary?.totalIncome || 0)}</p></CardContent></Card>
        <Card className="card-church"><CardContent className="pt-5"><p className="text-xs uppercase tracking-wide text-gray-500">Total recorded expenses</p><p className="mt-1 text-2xl font-semibold text-gray-900">{formatMoney(data?.summary?.totalExpenses || 0)}</p></CardContent></Card>
        <Card className="card-church"><CardContent className="pt-5"><p className="text-xs uppercase tracking-wide text-gray-500">Confirmed contributions</p><p className="mt-1 text-2xl font-semibold text-gray-900">{Number(data?.summary?.contributionCount || 0).toLocaleString()}</p></CardContent></Card>
      </div>

      <Card className="card-church">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle className="text-lg">Contribution report</CardTitle><p className="text-sm text-gray-500">Breakdown by selected period from actual Contribution records.</p></div>
          <div className="flex flex-wrap gap-2">{(['daily','weekly','monthly','yearly'] as Period[]).map((p) => <Button key={p} variant={period===p?'default':'outline'} className={period===p?'bg-[#7A1F2B] text-white hover:bg-[#651925]':''} onClick={() => setPeriod(p)}>{p[0].toUpperCase()+p.slice(1)}</Button>)}</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-gray-100 bg-[#C9962B]/5 px-4 py-3 text-sm"><span className="text-gray-600">Period total ({period}): </span><span className="font-semibold text-gray-900">{formatMoney(total)}</span></div>
          {isLoading ? <p className="text-sm text-gray-500">Loading reports...</p> : rows.length === 0 ? <p className="text-sm text-gray-500">No confirmed contributions for this period.</p> : (
            <div className="space-y-3">
              {rows.map((r: any) => (
                <div key={r.period} className="space-y-1">
                  <div className="flex items-center justify-between text-sm"><span className="font-medium text-gray-800">{r.period}</span><span className="text-gray-600">{formatMoney(r.amount)} · {Number(r.count||0)} txns</span></div>
                  <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full bg-[#7A1F2B]" style={{ width: `${Math.max(3, (Number(r.amount||0)/max)*100)}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="card-church"><CardHeader><CardTitle className="text-lg">Income by category</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Count</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader><TableBody>{(data?.incomeByCategory||[]).map((r:any)=><TableRow key={r.category}><TableCell>{String(r.category).replaceAll('_',' ')}</TableCell><TableCell>{Number(r._count?._all||0)}</TableCell><TableCell className="text-right">{formatMoney(r._sum?.amount||0)}</TableCell></TableRow>)}{!(data?.incomeByCategory||[]).length && <TableRow><TableCell colSpan={3} className="text-sm text-gray-500">No income data.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
        <Card className="card-church"><CardHeader><CardTitle className="text-lg">Recent confirmed contributions</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Member</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader><TableBody>{(data?.recentContributions||[]).slice(0,10).map((r:any)=><TableRow key={r.id}><TableCell className="text-xs">{new Date(r.contributedAt).toLocaleDateString()}</TableCell><TableCell className="text-xs">{r.member?.fullName || r.notes || 'Anonymous/External'}</TableCell><TableCell className="text-xs">{String(r.category).replaceAll('_',' ')}</TableCell><TableCell className="text-right text-xs">{formatMoney(r.amount)}</TableCell></TableRow>)}{!(data?.recentContributions||[]).length && <TableRow><TableCell colSpan={4} className="text-sm text-gray-500">No contributions recorded.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
      </div>
    </div>
  );
}
