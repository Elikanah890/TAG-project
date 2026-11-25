import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarCheck,
  ClipboardList,
  HeartHandshake,
  History,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
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
import { formatMoney, formatNumber, PageHeader, StatCard } from '@/components/admin/access/AccessUI';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  chartColors,
  metricUnavailable,
  metricValue,
  monthLabel,
  statusColor,
  statusLabel,
} from '@/lib/oversightMetrics';

const quickLinks = [
  { label: 'Members Directory', to: '/admin/members', icon: UserCheck, hint: 'Browse approved members and profiles.' },
  { label: 'Registration Applications', to: '/admin/reports/registrations', icon: ClipboardList, hint: 'Review pending membership applications.' },
  { label: 'Membership Analytics', to: '/admin/membership/analytics', icon: BarChart3, hint: 'Trends, distribution and growth.' },
  { label: 'Pastoral Follow-Up', to: '/admin/reports/followups', icon: HeartHandshake, hint: 'Open and overdue follow-up cases.' },
  { label: 'Membership History', to: '/admin/membership/history', icon: History, hint: 'Audit trail of membership events.' },
];

export default function MembershipOverview() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['membership-overview-dashboard'],
    queryFn: async () => (await api.get('/admin/oversight/church-dashboard')).data,
  });
  const { data: report } = useQuery({
    queryKey: ['membership-overview-report'],
    queryFn: async () => (await api.get('/admin/oversight/reports/membership')).data,
  });

  const overview = dashboard?.overview ?? {};
  const membership = dashboard?.membership ?? {};
  const alerts: any[] = dashboard?.alerts ?? [];

  const byStatus = (membership.byStatus ?? []).map((row: any) => ({
    name: statusLabel(String(row.status)),
    status: String(row.status),
    value: Number(row.count ?? 0),
  }));
  const trend = (report?.newByMonth ?? []).map((row: any) => ({
    month: monthLabel(String(row.month)),
    count: Number(row.count ?? 0),
  }));

  const approvedRate = metricValue(membership.approvedRate);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Membership"
        title="Membership Overview"
        description="Read-only oversight of the church membership: totals, registration flow, status distribution and growth trends. Operational approval remains with the Church Secretary."
        actions={<Badge variant="outline" className="border-[#711F32]/20 text-[#711F32]">Read-only oversight</Badge>}
      />

      {isLoading ? (
        <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <CardContent className="p-6 text-sm text-gray-500">Loading membership overview…</CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Total members" value={formatNumber(metricValue(overview.totalMembers))} hint="All member records, including pending applications." icon={Users} />
            <StatCard label="Approved members" value={formatNumber(metricValue(overview.approvedMembers))} hint="Members with APPROVED status." icon={UserCheck} tone="success" />
            <StatCard label="Pending registrations" value={formatNumber(metricValue(overview.pendingRegistrations))} hint="Awaiting a membership decision." icon={ClipboardList} tone="warning" />
            <StatCard label="New this month" value={formatNumber(metricValue(overview.newMembersThisMonth))} hint="Records created since the start of the month." icon={UserPlus} />
            <StatCard label="Approval rate" value={metricUnavailable(membership.approvedRate) ? '—' : `${approvedRate}%`} hint="Approved members as a share of all records." icon={BarChart3} />
            <StatCard label="Last Sunday attendance" value={metricUnavailable(overview.lastSundayAttendance) ? '—' : formatNumber(metricValue(overview.lastSundayAttendance))} hint={overview.lastSundayAttendance?.hint || 'Attendance captured for the latest Sunday.'} icon={CalendarCheck} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Membership by status</CardTitle>
              </CardHeader>
              <CardContent>
                {byStatus.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">No member records yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                        {byStatus.map((entry: any) => (
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
                <CardTitle className="text-lg">New registrations by month</CardTitle>
              </CardHeader>
              <CardContent>
                {trend.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">No registration records yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={trend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: any) => [formatNumber(Number(value)), 'New records']} />
                      <Bar dataKey="count" fill={chartColors.gold} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="rounded-xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-4 w-4 text-[#B38B45]" /> Attention needed
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <p className="text-sm text-gray-500">No outstanding membership or oversight alerts.</p>
                ) : (
                  <ul className="space-y-2">
                    {alerts.map((alert) => (
                      <li key={alert.id} className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{alert.title}</p>
                          <p className="text-xs text-gray-500">{alert.description}</p>
                        </div>
                        {alert.href ? (
                          <Link to={alert.href} className="shrink-0 text-xs font-medium text-[#711F32] hover:underline">
                            Review
                          </Link>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Membership finance snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Confirmed income</span>
                  <span className="font-semibold text-gray-800">{formatMoney(metricValue(dashboard?.finance?.confirmedIncome))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Outstanding pledges</span>
                  <span className="font-semibold text-gray-800">{formatMoney(metricValue(dashboard?.finance?.outstandingPledges))}</span>
                </div>
                <p className="text-xs text-gray-500">Read-only oversight totals. Pledges are commitments, not received income.</p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group flex items-start gap-3 rounded-lg border border-gray-100 px-4 py-3 transition hover:border-[#711F32]/30 hover:bg-[#F4EBDD]/40"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#711F32]/10 text-[#711F32]">
                    <link.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 text-sm font-semibold text-gray-800">
                      {link.label}
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                    </span>
                    <span className="block text-xs text-gray-500">{link.hint}</span>
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
