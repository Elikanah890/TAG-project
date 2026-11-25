import { useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Download, Search, UserRound } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/admin/access/AccessUI';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const PAGE_SIZE = 12;

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
}

function statusTone(status: string) {
  if (status === 'APPROVED') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'PENDING' || status === 'PENDING_REVIEW') return 'border-[#B38B45]/30 bg-[#B38B45]/15 text-[#8a6a33]';
  if (status === 'REJECTED') return 'border-rose-200 bg-rose-50 text-rose-700';
  return 'border-gray-200 bg-gray-100 text-gray-700';
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 truncate text-sm text-gray-800">{value || '—'}</dd>
    </div>
  );
}

function exportCsv(rows: any[]) {
  const headers = ['Member No', 'Full Name', 'Gender', 'Phone', 'Email', 'Department', 'Status'];
  const lines = [headers.join(',')];
  rows.forEach((member) => {
    const values = [
      member.memberNo,
      member.fullName,
      member.gender,
      member.phone,
      (member as any).whatsappNumber,
      member.email,
      member.preferredDepartment,
      member.membershipStatus,
    ].map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`);
    lines.push(values.join(','));
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `members-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function MembersDirectory() {
  const { hasPermission } = useAuth();
  const [q, setQ] = useState('');
  const [gender, setGender] = useState('all');
  const [department, setDepartment] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members-all'],
    queryFn: async () => (await api.get('/members')).data,
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['member-detail', selectedId],
    queryFn: async () => (await api.get(`/members/${selectedId}`)).data,
    enabled: Boolean(selectedId),
  });

  const genders = useMemo(
    () => Array.from(new Set(members.map((member: any) => member.gender).filter(Boolean))) as string[],
    [members],
  );
  const departments = useMemo(
    () => Array.from(new Set(members.map((member: any) => member.preferredDepartment).filter(Boolean))) as string[],
    [members],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return members.filter((member: any) => {
      const matchesTerm = !term || [member.fullName, member.memberNo, member.phone, (member as any).whatsappNumber, member.email].join(' ').toLowerCase().includes(term);
      const matchesGender = gender === 'all' || member.gender === gender;
      const matchesDepartment = department === 'all' || member.preferredDepartment === department;
      return matchesTerm && matchesGender && matchesDepartment;
    });
  }, [members, q, gender, department]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Membership"
        title="Members Directory"
        description="Approved church members with contact details and profile records. Read-only; membership decisions remain with the Church Secretary."
        actions={
          hasPermission('members.export') ? (
            <Button variant="outline" size="sm" className="border-gray-200" onClick={() => exportCsv(filtered)} disabled={filtered.length === 0}>
              <Download className="mr-1.5 h-4 w-4" /> Export CSV
            </Button>
          ) : null
        }
      />

      <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-lg">
              Members <span className="text-sm font-normal text-gray-400">({filtered.length})</span>
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={q}
                  onChange={(event) => { setQ(event.target.value); resetPage(); }}
                  placeholder="Search name, member no, phone, WhatsApp, email"
                  className="w-full pl-9 sm:w-72"
                />
              </div>
              <select
                value={gender}
                onChange={(event) => { setGender(event.target.value); resetPage(); }}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                aria-label="Filter by gender"
              >
                <option value="all">All genders</option>
                {genders.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <select
                value={department}
                onChange={(event) => { setDepartment(event.target.value); resetPage(); }}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                aria-label="Filter by department"
              >
                <option value="all">All departments</option>
                {departments.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading members…</p>
          ) : (
            <>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member No</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.map((member: any) => (
                      <TableRow
                        key={member.id}
                        className="cursor-pointer hover:bg-[#F4EBDD]/40"
                        onClick={() => setSelectedId(member.id)}
                      >
                        <TableCell className="font-medium text-gray-700">{member.memberNo || '—'}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-2 font-medium text-gray-800">
                            <UserRound className="h-4 w-4 text-gray-300" /> {member.fullName}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{member.gender || '—'}</TableCell>
                        <TableCell className="text-sm text-gray-600">{member.phone || '—'}</TableCell>
                        <TableCell className="text-sm text-gray-600">{member.email || '—'}</TableCell>
                        <TableCell className="text-sm text-gray-600">{member.preferredDepartment || '—'}</TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${statusTone(member.membershipStatus)}`}>
                            {member.membershipStatus}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {paged.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-sm text-gray-500">No members match the current filters.</TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
                <p className="text-xs text-gray-500">
                  Page {currentPage} of {pageCount} · showing {paged.length} of {filtered.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-gray-200" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-200" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}>
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Sheet open={Boolean(selectedId)} onOpenChange={(open) => { if (!open) setSelectedId(null); }}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-[#711F32]" />
              {detail?.fullName || 'Member profile'}
            </SheetTitle>
            <SheetDescription>
              {detail?.memberNo ? `Member No. ${detail.memberNo}` : 'Read-only member record'}
            </SheetDescription>
          </SheetHeader>

          {detailLoading ? (
            <p className="mt-6 text-sm text-gray-500">Loading profile…</p>
          ) : detail ? (
            <div className="mt-6 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusTone(detail.membershipStatus)}`}>
                  {detail.membershipStatus}
                </span>
                {detail.user?.status ? <Badge variant="outline" className="border-gray-200">Account: {detail.user.status}</Badge> : null}
              </div>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Identity & contact</h3>
                <dl className="grid grid-cols-2 gap-3">
                  <Field label="Full name" value={detail.fullName} />
                  <Field label="Gender" value={detail.gender} />
                  <Field label="Phone" value={detail.phone} />
                  <Field label="WhatsApp" value={detail.whatsappNumber || '—'} />
                  <Field label="Email" value={detail.email} />
                  <Field label="Date of birth" value={formatDate(detail.dateOfBirth)} />
                  <Field label="Marital status" value={detail.maritalStatus} />
                  <Field label="Occupation" value={detail.occupation} />
                  <Field label="Employment" value={detail.employmentStatus} />
                </dl>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Church life</h3>
                <dl className="grid grid-cols-2 gap-3">
                  <Field label="Baptism" value={detail.baptismStatus} />
                  <Field label="Preferred department" value={detail.preferredDepartment} />
                  <Field label="Desired department" value={detail.desiredDepartment} />
                  <Field label="Current position" value={detail.currentPosition} />
                  <Field label="Ushemasi" value={detail.ushemasi} />
                  <Field label="Time in church" value={detail.timeInChurch} />
                  <Field label="Joined" value={formatDate(detail.joinedAt)} />
                  <Field label="Approved" value={formatDate(detail.approvedAt)} />
                </dl>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Location</h3>
                <dl className="grid grid-cols-2 gap-3">
                  <Field label="Origin region" value={detail.originRegion} />
                  <Field label="Origin district" value={detail.originDistrict} />
                  <Field label="Current region" value={detail.currentRegion} />
                  <Field label="Current district" value={detail.currentDistrict} />
                  <Field label="Ward" value={detail.currentWard} />
                  <Field label="Street" value={detail.currentStreet} />
                </dl>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Emergency contact</h3>
                <dl className="grid grid-cols-2 gap-3">
                  <Field label="Name" value={detail.emergencyContactName} />
                  <Field label="Phone" value={detail.emergencyContactPhone} />
                </dl>
              </section>

              {detail.user ? (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Portal account</h3>
                  <dl className="grid grid-cols-2 gap-3">
                    <Field label="Email" value={detail.user.email} />
                    <Field label="Status" value={detail.user.status} />
                    <Field label="Last login" value={detail.user.lastLoginAt ? new Date(detail.user.lastLoginAt).toLocaleString() : '—'} />
                    <Field label="Created" value={formatDate(detail.user.createdAt)} />
                  </dl>
                </section>
              ) : null}
            </div>
          ) : (
            <p className="mt-6 text-sm text-gray-500">Unable to load this member profile.</p>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
