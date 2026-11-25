import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Building2, CalendarDays, ClipboardCheck, Globe, HeartHandshake, Landmark, Users } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { PageHeader, SectionCard, StatCard, LoadingBlock, ErrorBlock } from '@/components/admin/access/AccessUI';

const REPORTS = [
  { label: 'Membership', path: '/admin/reports/membership', icon: Users, note: 'Membership records and status distribution' },
  { label: 'Registrations', path: '/admin/reports/registrations', icon: ClipboardCheck, note: 'Pending and recent registration activity' },
  { label: 'Finance', path: '/admin/reports/finance', icon: Landmark, note: 'Read-only income, expenses, pledges and trends' },
  { label: 'Departments', path: '/admin/reports/departments', icon: Building2, note: 'Department performance and leadership' },
  { label: 'Fellowships', path: '/admin/reports/fellowships', icon: HeartHandshake, note: 'Fellowship coverage and activity' },
  { label: 'Attendance', path: '/admin/reports/attendance', icon: ClipboardCheck, note: 'Attendance trends and meeting participation' },
  { label: 'Meetings & activities', path: '/admin/reports/meetings', icon: CalendarDays, note: 'Meetings, activities and schedules' },
  { label: 'CMS & website', path: '/admin/reports/cms', icon: Globe, note: 'Content status and publishing activity' },
  { label: 'Participation', path: '/admin/reports/participation', icon: BarChart3, note: 'Member participation indicators' },
];

export default function ChurchWideReports() {
  const overview = useQuery({ queryKey: ['access-oversight-overview'], queryFn: async () => (await api.get('/admin/oversight/dashboard')).data });
  const church = overview.data?.churchOverview || {};
  const staff = overview.data?.staffOperations || {};
  const finance = overview.data?.financialOversight || {};

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Church-Wide Reports"
        title="Read-Only Reporting Hub"
        description="Authorized read-only visibility across church operations. System Administration does not modify operational records from these reports."
        actions={<Button asChild variant="outline"><Link to="/admin/dashboard">Church Dashboard<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>}
      />
      {overview.isLoading ? <LoadingBlock /> : overview.isError ? <ErrorBlock onRetry={() => overview.refetch()} /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Members" value={church.totalMembers ?? '—'} hint={`${church.activeMembers ?? 0} active`} icon={Users} />
            <StatCard label="Confirmed income" value={`TZS ${Number(finance.confirmedIncome || 0).toLocaleString()}`} hint="Read-only" icon={Landmark} tone="success" />
            <StatCard label="Paid expenses" value={`TZS ${Number(finance.paidExpenses || 0).toLocaleString()}`} hint="Recorded expenses" icon={Landmark} tone="warning" />
            <StatCard label="Pending registrations" value={church.pendingRegistrations ?? '—'} icon={ClipboardCheck} />
          </div>
          <SectionCard title="Available reports" description="Each report is read-only and served from live database records.">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {REPORTS.map((r) => (
                <Link key={r.path} to={r.path} className="group flex items-start justify-between rounded-xl border border-gray-100 bg-white/70 p-4 transition hover:border-[#C9962B]/30 hover:bg-[#C9962B]/10">
                  <div className="flex gap-3">
                    <div className="rounded-lg bg-[#C9962B]/10 p-2 text-gray-800"><r.icon className="h-4 w-4" /></div>
                    <div><p className="font-medium text-gray-800">{r.label}</p><p className="mt-0.5 text-xs text-gray-500">{r.note}</p></div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-500 transition group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Organizational oversight" description="Departments, fellowships and leadership coverage.">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-100 bg-white/70 p-4"><p className="text-xs text-gray-500">Departments</p><p className="text-2xl font-semibold text-gray-800">{staff.totalDepartments ?? '—'}</p><p className="text-xs text-gray-500">{staff.departmentsWithoutLeaders ?? 0} without leaders</p></div>
              <div className="rounded-lg border border-gray-100 bg-white/70 p-4"><p className="text-xs text-gray-500">Fellowships</p><p className="text-2xl font-semibold text-gray-800">{staff.totalFellowships ?? '—'}</p></div>
              <div className="rounded-lg border border-gray-100 bg-white/70 p-4"><p className="text-xs text-gray-500">Upcoming meetings</p><p className="text-2xl font-semibold text-gray-800">{staff.upcomingMeetings ?? '—'}</p></div>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}
