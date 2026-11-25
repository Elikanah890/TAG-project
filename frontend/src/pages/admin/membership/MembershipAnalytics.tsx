import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Info, UserPlus, Users } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '@/lib/api';
import { formatNumber, PageHeader, StatCard } from '@/components/admin/access/AccessUI';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { chartColors, monthLabel, statusColor, statusLabel } from '@/lib/oversightMetrics';

type Period = '30' | '90' | '180' | '365' | 'all';

const periods: { key: Period; label: string }[] = [
  { key: '30', label: 'Last 30 days' },
  { key: '90', label: 'Last 90 days' },
  { key: '180', label: 'Last 6 months' },
  { key: '365', label: 'Last 12 months' },
  { key: 'all', label: 'All time' },
];

const genderColors = [chartColors.maroon, chartColors.gold, chartColors.slate, chartColors.sky];

function cutoffFor(period: Period): number | null {
  if (period === 'all') return null;
  const days = Number(period);
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

function monthKey(value: string | Date): string {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export default function MembershipAnalytics() {
  const [period, setPeriod] = useState<Period>('365');
  const { data, isLoading } = useQuery({
    queryKey: ['membership-analytics-report'],
    queryFn: async () => (await api.get('/admin/oversight/reports/membership')).data,
  });

  const members: any[] = data?.members ?? [];

  const filtered = useMemo(() => {
    const cutoff = cutoffFor(period);
    if (cutoff === null) return members;
    return members.filter((member) => new Date(member.createdAt).getTime() >= cutoff);
  }, [members, period]);

  const monthly = useMemo(() => {
    const buckets = new Map<string, number>();
    filtered.forEach((member) => {
      const key = monthKey(member.createdAt);
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    });
    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month: monthLabel(month), count }));
  }, [filtered]);

  const statusMix = useMemo(() => {
    const buckets = new Map<string, number>();
    filtered.forEach((member) => {
      buckets.set(member.membershipStatus, (buckets.get(member.membershipStatus) ?? 0) + 1);
    });
    return Array.from(buckets.entries()).map(([status, value]) => ({
      status,
      name: statusLabel(status),
      value,
    }));
  }, [filtered]);

  const genderMix = useMemo(() => {
    const buckets = new Map<string, number>();
    filtered.forEach((member) => {
      const key = member.gender ? statusLabel(String(member.gender)) : 'Not recorded';
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    });
    return Array.from(buckets.entries()).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const topRegions = useMemo(() => {
    const buckets = new Map<string, number>();
    filtered.forEach((member) => {
      const key = member.currentRegion || member.currentDistrict || 'Not recorded';
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    });
    return Array.from(buckets.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }, [filtered]);

  const approvedInPeriod = filtered.filter((member) => member.membershipStatus === 'APPROVED').length;
  const pendingInPeriod = filtered.filter((member) => ['PENDING', 'PENDING_REVIEW'].includes(member.membershipStatus)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Membership"
        title="Membership Analytics"
        description="Read-only analysis of membership records over time. Figures are derived from recorded member data; no events are inferred beyond the dates stored on each record."
        actions={<Badge variant="outline" className="border-[#711F32]/20 text-[#711F32]">Read-only oversight</Badge>}
      />

      <div className="flex flex-wrap gap-2">
        {periods.map((option) => (
          <Button
            key={option.key}
            type="button"
            size="sm"
            variant={period === option.key ? 'default' : 'outline'}
            onClick={() => setPeriod(option.key)}
            className={period === option.key ? 'bg-[#711F32] hover:bg-[#5d1a2a]' : 'border-gray-200'}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <CardContent className="p-6 text-sm text-gray-500">Loading analytics…</CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Records in period" value={formatNumber(filtered.length)} hint="Member records created within the selected period." icon={UserPlus} />
            <StatCard label="Approved in period" value={formatNumber(approvedInPeriod)} hint="Records in period currently marked APPROVED." icon={Users} tone="success" />
            <StatCard label="Pending in period" value={formatNumber(pendingInPeriod)} hint="Records in period awaiting a decision." icon={BarChart3} tone="warning" />
            <StatCard label="Total records" value={formatNumber(members.length)} hint="All member records in the database." icon={Users} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">New registrations by month</CardTitle>
              </CardHeader>
              <CardContent>
                {monthly.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">No records in this period.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={monthly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: any) => [formatNumber(Number(value)), 'New records']} />
                      <Bar dataKey="count" fill={chartColors.maroon} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Status mix in period</CardTitle>
              </CardHeader>
              <CardContent>
                {statusMix.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">No records in this period.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={statusMix} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                        {statusMix.map((entry) => (
                          <Cell key={entry.status} fill={statusColor[entry.status] ?? chartColors.slate} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatNumber(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Gender distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {genderMix.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">No records in this period.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={genderMix} dataKey="value" nameKey="name" outerRadius={100} label>
                        {genderMix.map((entry, index) => (
                          <Cell key={entry.name} fill={genderColors[index % genderColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatNumber(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Top regions / districts</CardTitle>
              </CardHeader>
              <CardContent>
                {topRegions.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">No records in this period.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={topRegions} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: any) => [formatNumber(Number(value)), 'Members']} />
                      <Bar dataKey="count" fill={chartColors.gold} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
            <CardContent className="flex items-start gap-3 p-4 text-sm text-gray-600">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#B38B45]" />
              <p>
                This view analyses member records only. Applications are not the same as approved members, and no
                attendance, giving or department history is inferred from member records. Operational membership
                decisions remain with the Church Secretary.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
