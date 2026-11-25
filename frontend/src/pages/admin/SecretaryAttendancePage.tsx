import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Save } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader, LoadingBlock, ErrorBlock } from '@/components/admin/access/AccessUI';
import { toast } from 'sonner';

function lastSundayIso() {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function fmtDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

export default function SecretaryAttendancePage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ date: lastSundayIso(), firstServiceCount: '', secondServiceCount: '' });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['sunday-attendance'],
    queryFn: async () => (await api.get('/attendance/sunday')).data,
  });

  const rows = Array.isArray(data) ? data : [];

  const total = useMemo(() => {
    const a = Number(form.firstServiceCount || 0);
    const b = Number(form.secondServiceCount || 0);
    return a + b;
  }, [form.firstServiceCount, form.secondServiceCount]);

  const save = useMutation({
    mutationFn: async () =>
      (
        await api.post('/attendance/sunday', {
          date: form.date,
          firstServiceCount: Number(form.firstServiceCount || 0),
          secondServiceCount: Number(form.secondServiceCount || 0),
        })
      ).data,
    onSuccess: () => {
      toast.success('Sunday attendance saved');
      qc.invalidateQueries({ queryKey: ['sunday-attendance'] });
      qc.invalidateQueries({ queryKey: ['church-dashboard'] });
      qc.invalidateQueries({ queryKey: ['dashboard-secretary'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to save attendance'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Church Secretary"
        title="Sunday Service Attendance"
        description="Record headcount for first and second services. Totals are saved for church oversight."
      />

      <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7A1F2B]/10 text-[#7A1F2B]"><CalendarDays className="h-4 w-4" /></span>
            Record Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-2 xl:col-span-1">
            <Label>Sunday Date</Label>
            <Input type="date" className="h-11 rounded-xl border-gray-200 bg-gray-50/80" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>First Service Count</Label>
            <Input type="number" min={0} className="h-11 rounded-xl border-gray-200 bg-gray-50/80" value={form.firstServiceCount} onChange={(e) => setForm((p) => ({ ...p, firstServiceCount: e.target.value }))} placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label>Second Service Count</Label>
            <Input type="number" min={0} className="h-11 rounded-xl border-gray-200 bg-gray-50/80" value={form.secondServiceCount} onChange={(e) => setForm((p) => ({ ...p, secondServiceCount: e.target.value }))} placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label>Total</Label>
            <div className="flex h-11 items-center rounded-xl border border-gray-200 bg-[#FAF6F0] px-3 font-semibold text-[#7A1F2B]">{total}</div>
          </div>
          <div className="flex items-end">
            <Button
              className="h-11 w-full rounded-xl bg-[#7A1F2B] text-white hover:bg-[#651925]"
              disabled={!form.date || save.isPending}
              onClick={() => save.mutate()}
            >
              <Save className="mr-2 h-4 w-4" /> {save.isPending ? 'Saving...' : 'Save Attendance'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <CardHeader><CardTitle className="text-lg text-gray-900">Recent Sunday Attendance</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <LoadingBlock label="Loading attendance records..." /> : isError ? <ErrorBlock message={(error as any)?.response?.data?.message} onRetry={refetch} /> : rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center text-sm text-gray-500">No Sunday attendance recorded yet.</div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>1st Service</TableHead>
                    <TableHead>2nd Service</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Recorded By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium text-gray-900">{fmtDate(r.date)}</TableCell>
                      <TableCell>{r.firstServiceCount}</TableCell>
                      <TableCell>{r.secondServiceCount}</TableCell>
                      <TableCell className="font-semibold text-[#7A1F2B]">{r.totalCount}</TableCell>
                      <TableCell className="text-gray-500">{r.recordedBy?.email || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
