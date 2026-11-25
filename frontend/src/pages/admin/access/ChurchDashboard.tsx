import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Coins,
  HandCoins,
  HeartHandshake,
  LayoutGrid,
  RefreshCw,
  Users,
  Wallet,
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
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/access/AccessUI';
import { chartColors, statusColor, statusLabel } from '@/lib/oversightMetrics';

type DashboardResponse = {
  generatedAt?: string;
  metrics?: {
    approvedMembers?: number;
    pendingRegistrations?: number;
    totalConfirmedContributions?: number;
    totalRecordedExpenses?: number;
    lastSundayAttendance?: { total: number; firstService: number; secondService: number; date: string } | null;
  };
  actionCenter?: { pendingRegistrations?: number; overdueTasks?: number };
  finance?: {
    contributionsByCategory?: { category: string; amount: number }[];
    recentContributions?: { id: string; date: string; memberName: string; category: string; amount: number }[];
  };
  activities?: { upcomingMeetings?: number; totalDepartments?: number; totalFellowships?: number };
  recentAuditLogs?: { id: string; action: string; actorEmail?: string; entityType?: string; entityId?: string; createdAt: string }[];
};

function money(v: number) {
  return `TSh ${Number(v || 0).toLocaleString()}`;
}

function fmtDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

function fmtDateTime(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

function timeAgo(date?: string) {
  if (!date) return '—';
  const ms = Date.now() - new Date(date).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatAction(action: string) {
  return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function initials(name?: string) {
  const parts = (name || 'Member').trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || 'M') + (parts[1]?.[0] || '');
}

function CardShell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-gray-100 bg-white p-6 shadow-sm ${className}`}>{children}</div>;
}

export default function ChurchDashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<DashboardResponse>({
    queryKey: ['church-dashboard'],
    queryFn: async () => (await api.get('/dashboard/admin')).data,
  });
  const { data: oversight } = useQuery<any>({
    queryKey: ['church-dashboard-oversight'],
    queryFn: async () => (await api.get('/admin/oversight/church-dashboard')).data,
    retry: false,
  });

  if (isLoading) return <LoadingBlock label="Loading church dashboard..." />;
  if (isError) return <ErrorBlock message={(error as any)?.response?.data?.message} onRetry={refetch} />;

  const metrics = data?.metrics || {};
  const pending = Number(metrics.pendingRegistrations || 0);
  const overdue = Number(data?.actionCenter?.overdueTasks || 0);
  const categories = data?.finance?.contributionsByCategory || [];
  const recent = data?.finance?.recentContributions || [];
  const audit = data?.recentAuditLogs || [];
  const activities = data?.activities || {};
  const maxCategory = Math.max(1, ...categories.map((c) => Number(c.amount || 0)));
  const displayName = (user as any)?.fullName || user?.email?.split('@')[0] || 'Pastor';

  const mv = (metric: any) => (metric && typeof metric.value === 'number' ? metric.value : null);
  const statusRows = ((oversight?.membership?.byStatus ?? []) as any[]).map((row) => ({
    name: statusLabel(String(row.status)),
    status: String(row.status),
    value: Number(row.count ?? 0),
  }));
  const financeBars = [
    { name: 'Confirmed income', value: mv(oversight?.finance?.confirmedIncome) ?? 0 },
    { name: 'Recorded expenses', value: mv(oversight?.finance?.recordedExpenses) ?? 0 },
  ];
  const lastSunday = mv(oversight?.attendance?.lastSunday);
  const averageAttendance = mv(oversight?.attendance?.averagePerMeeting);
  const attendanceBars = [
    { name: 'Last Sunday', value: lastSunday ?? 0 },
    { name: 'Avg / meeting', value: averageAttendance ?? 0 },
  ];
  const hasAttendance = lastSunday !== null || averageAttendance !== null;

  const activityCards = [
    { label: 'Upcoming Meetings', value: Number(activities.upcomingMeetings || 0), icon: CalendarDays },
    { label: 'Total Departments', value: Number(activities.totalDepartments || 0), icon: LayoutGrid },
    { label: 'Total Fellowships', value: Number(activities.totalFellowships || 0), icon: HeartHandshake },
  ].filter((c) => c.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#C9962B]">System Administration</p>
          <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Welcome back, Pastor {displayName}</h1>
          <p className="mt-1 text-sm text-gray-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching} className="h-10 rounded-lg border-gray-200">
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <CardShell className={pending > 0 ? 'border-[#C9962B]/50 ring-1 ring-[#C9962B]/20' : ''}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Approved Members</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{Number(metrics.approvedMembers || 0).toLocaleString()}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7A1F2B]/10 text-[#7A1F2B]"><Users className="h-5 w-5" /></div>
          </div>
        </CardShell>

        <CardShell className={pending > 0 ? 'border-[#C9962B]/50 ring-1 ring-[#C9962B]/20' : ''}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Registrations</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{pending.toLocaleString()}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C9962B]/15 text-[#A9771F]"><ClipboardList className="h-5 w-5" /></div>
          </div>
        </CardShell>

        <CardShell>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Confirmed Contributions</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">{money(Number(metrics.totalConfirmedContributions || 0))}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><HandCoins className="h-5 w-5" /></div>
          </div>
        </CardShell>

        <CardShell>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Recorded Expenses</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">{money(Number(metrics.totalRecordedExpenses || 0))}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><Wallet className="h-5 w-5" /></div>
          </div>
        </CardShell>

        <CardShell>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Last Sunday Attendance</p>
              {metrics.lastSundayAttendance ? (
                <>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{Number(metrics.lastSundayAttendance.total || 0).toLocaleString()}</p>
                  <p className="mt-1 text-xs text-gray-500">1st: {metrics.lastSundayAttendance.firstService} • 2nd: {metrics.lastSundayAttendance.secondService}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{fmtDate(metrics.lastSundayAttendance.date)}</p>
                </>
              ) : (
                <p className="mt-3 text-sm font-medium text-gray-500">Not recorded yet</p>
              )}
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C9962B]/15 text-[#A9771F]"><CalendarCheck className="h-5 w-5" /></div>
          </div>
        </CardShell>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <CardShell>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Membership by status</h2>
            <p className="text-sm text-gray-500">All member records</p>
          </div>
          {statusRows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center text-sm text-gray-500">No member records yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusRows} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {statusRows.map((entry) => (
                    <Cell key={entry.status} fill={statusColor[entry.status] ?? chartColors.slate} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => Number(value).toLocaleString()} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardShell>

        <CardShell>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Income vs recorded expenses</h2>
            <p className="text-sm text-gray-500">Read-only oversight totals</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={financeBars} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: any) => money(Number(value))} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                <Cell fill={chartColors.maroon} />
                <Cell fill={chartColors.gold} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardShell>

        <CardShell>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Attendance snapshot</h2>
            <p className="text-sm text-gray-500">Recorded attendance figures</p>
          </div>
          {!hasAttendance ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center text-sm text-gray-500">No attendance recorded yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={attendanceBars} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: any) => Number(value).toLocaleString()} />
                <Bar dataKey="value" fill={chartColors.maroon} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardShell>
      </div>

      {(pending > 0 || overdue > 0) && (
        <CardShell>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Action Center</h2>
              <p className="text-sm text-gray-500">Items that need attention</p>
            </div>
          </div>
          <div className="space-y-3">
            {pending > 0 && (
              <div className="flex flex-col gap-3 rounded-xl border border-[#C9962B]/20 bg-[#C9962B]/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#A9771F] shadow-sm"><ClipboardList className="h-4 w-4" /></div>
                  <div>
                    <p className="font-medium text-gray-900">{pending} registration{pending === 1 ? '' : 's'} awaiting review</p>
                    <p className="text-sm text-gray-500">New membership applications need a decision.</p>
                  </div>
                </div>
                <Button asChild size="sm" className="bg-[#7A1F2B] text-white hover:bg-[#651925]"><Link to="/admin/reports/registrations">Review Now</Link></Button>
              </div>
            )}
            {overdue > 0 && (
              <div className="flex flex-col gap-3 rounded-xl border border-rose-100 bg-rose-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-rose-600 shadow-sm"><Activity className="h-4 w-4" /></div>
                  <div>
                    <p className="font-medium text-gray-900">{overdue} overdue task{overdue === 1 ? '' : 's'}</p>
                    <p className="text-sm text-gray-500">Tasks have passed their due date.</p>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline"><Link to="/admin/reports/tasks">View Tasks</Link></Button>
              </div>
            )}
          </div>
        </CardShell>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <CardShell>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Contributions by Category</h2>
              <p className="text-sm text-gray-500">Confirmed contribution totals</p>
            </div>
            <Link to="/admin/reports/finance" className="text-sm font-medium text-[#7A1F2B] hover:underline inline-flex items-center gap-1">View Full Finance Report <ArrowRight className="h-4 w-4" /></Link>
          </div>
          {categories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center text-sm text-gray-500">No confirmed contributions recorded yet.</div>
          ) : (
            <div className="space-y-4">
              {categories.map((c) => (
                <div key={c.category}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{c.category}</span>
                    <span className="font-semibold text-gray-900">{money(c.amount)}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-[#7A1F2B]" style={{ width: `${Math.max(4, (Number(c.amount || 0) / maxCategory) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardShell>

        <CardShell>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Contributions</h2>
              <p className="text-sm text-gray-500">Last 5 confirmed transactions</p>
            </div>
          </div>
          {recent.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center text-sm text-gray-500">No recent contributions found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Member</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recent.map((r) => (
                    <tr key={r.id}>
                      <td className="py-3 text-gray-600">{fmtDate(r.date)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#7A1F2B]/10 text-[11px] font-semibold text-[#7A1F2B]">{initials(r.memberName)}</span>
                          <span className="font-medium text-gray-800">{r.memberName}</span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-600">{r.category}</td>
                      <td className="py-3 text-right font-semibold text-gray-900">{money(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardShell>
      </div>

      {activityCards.length > 0 && (
        <CardShell>
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Church Activities & Organization</h2>
            <p className="text-sm text-gray-500">Current organization activity</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {activityCards.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#7A1F2B] shadow-sm"><Icon className="h-5 w-5" /></div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{c.value.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{c.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardShell>
      )}

      <CardShell>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-500">Latest administrative actions</p>
          </div>
          <Link to="/admin/audit-logs" className="text-sm font-medium text-[#7A1F2B] hover:underline">View audit logs</Link>
        </div>
        {audit.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center text-sm text-gray-500">No recent administrative activity.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {audit.map((a) => (
              <div key={a.id} className="flex items-start gap-3 py-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#7A1F2B]/10 text-[#7A1F2B]"><CheckCircle2 className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{formatAction(a.action)}</p>
                  <p className="text-xs text-gray-500">{a.actorEmail || 'System'}{a.entityType ? ` · ${a.entityType}` : ''}</p>
                </div>
                <span className="shrink-0 text-xs text-gray-400" title={fmtDateTime(a.createdAt)}>{timeAgo(a.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </CardShell>
    </div>
  );
}
