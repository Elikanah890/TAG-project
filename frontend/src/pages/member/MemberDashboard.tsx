import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PageHeader, SectionCard } from '@/components/admin/access/AccessUI';
import { KPICard } from '@/components/dashboard/KPICard';
import { Banknote, User, ArrowRight, ReceiptText, HeartHandshake } from 'lucide-react';

export default function MemberDashboard() {
  const { user } = useAuth();
  const name = user?.member?.fullName || user?.email || 'Member';

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Member Portal"
        title={`Welcome, ${name}`}
        description={`Member No: ${user?.member?.memberNo || '—'} · View your records and church activity.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KPICard
          label="Account status"
          value={user?.status || 'ACTIVE'}
          hint="Your member account is in good standing"
          icon={User}
          tone="success"
        />
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:col-span-2 xl:col-span-2">
          <p className="text-sm font-medium text-gray-500">Email</p>
          <p className="mt-2 text-lg font-semibold text-gray-800 break-all">{user?.email}</p>
          <p className="mt-1 text-xs text-gray-500">Signed in member account</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard
          title="My Contributions"
          description="Your giving history and records"
          actions={<Link to="/member/contributions" className="text-xs font-medium text-[#7A1F2B] hover:underline inline-flex items-center gap-1">View all <ArrowRight className="h-3.5 w-3.5" /></Link>}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7A1F2B]/10 text-[#7A1F2B]">
                <Banknote className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Giving history</p>
                <p className="text-sm text-gray-500">Zaka, Sadaka, Fungu la Kumi, and more.</p>
              </div>
            </div>
            <Button asChild className="bg-[#7A1F2B] text-white hover:bg-[#651925] shrink-0">
              <Link to="/member/contributions">View History</Link>
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Quick links" description="Access your member records">
          <div className="space-y-2">
            {[
              { to: '/member/receipts', label: 'My Receipts', icon: ReceiptText, desc: 'Download giving receipts' },
              { to: '/member/pledges', label: 'My Pledges', icon: HeartHandshake, desc: 'View pledge commitments' },
              { to: '/member/profile', label: 'My Profile', icon: User, desc: 'Update your information' },
            ].map((item) => (
              <Link key={item.to} to={item.to} className="group flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition-all hover:bg-gray-50 hover:border-gray-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 group-hover:bg-[#7A1F2B]/10 group-hover:text-[#7A1F2B]">
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#7A1F2B]" />
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
