import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { PageHeader, SectionCard, MetricCard, LoadingBlock, ErrorBlock } from '@/components/admin/access/AccessUI';
import { ClipboardList, Users, ArrowRight, CalendarCheck } from 'lucide-react';

export default function SecretaryDashboard() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard-secretary'],
    queryFn: async () => (await api.get('/dashboard/secretary')).data,
  });

  if (isLoading) return <LoadingBlock label="Loading secretary dashboard..." />;
  if (isError) return <ErrorBlock message={(error as any)?.response?.data?.message} onRetry={refetch} />;

  const pending = Number(data?.pendingApplications ?? 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Church Secretary"
        title="Secretary Dashboard"
        description="Membership applications and secretary workflow overview."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="border-[#C9962B]/30 text-[#7A5A10] hover:bg-[#C9962B]/10">
              <Link to="/admin/secretary/attendance"><CalendarCheck className="mr-2 h-4 w-4" /> Record Sunday Attendance</Link>
            </Button>
            <Button asChild className="bg-[#7A1F2B] text-white hover:bg-[#651925]">
              <Link to="/admin/registrations"><ClipboardList className="mr-2 h-4 w-4" /> Review applications</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Pending Applications"
          metric={{ value: pending, state: pending === 0 ? 'zero' : 'ok', hint: pending === 0 ? 'No applications waiting for review' : 'Applications awaiting decision' }}
          icon={Users}
          tone={pending > 0 ? 'warning' : 'success'}
          to="/admin/registrations"
        />
      </div>

      <SectionCard
        title="Registration workflow"
        description="Review and process pending membership applications"
        actions={<Link to="/admin/registrations" className="text-xs font-medium text-[#7A1F2B] hover:underline inline-flex items-center gap-1">Open registrations <ArrowRight className="h-3.5 w-3.5" /></Link>}
      >
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Applications waiting for review</p>
              <p className="mt-1 text-3xl font-bold text-gray-800">{pending}</p>
              <p className="mt-1 text-sm text-gray-500">
                {pending > 0 ? 'Review applications to approve or reject new member registrations.' : 'All caught up — no pending applications right now.'}
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <Link to="/admin/registrations">Go to registrations</Link>
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Sunday attendance"
        description="Record weekly service headcount for church oversight"
        actions={<Link to="/admin/secretary/attendance" className="text-xs font-medium text-[#7A1F2B] hover:underline inline-flex items-center gap-1">Open attendance <ArrowRight className="h-3.5 w-3.5" /></Link>}
      >
        <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Weekly service record</p>
            <p className="mt-1 text-sm text-gray-500">Capture first and second service counts every Sunday.</p>
          </div>
          <Button asChild className="bg-[#7A1F2B] text-white hover:bg-[#651925]">
            <Link to="/admin/secretary/attendance"><CalendarCheck className="mr-2 h-4 w-4" /> Record Sunday Attendance</Link>
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
