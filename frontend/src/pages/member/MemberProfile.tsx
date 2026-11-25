import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const EDITABLE = ['phone','address','currentRegion','currentDistrict','currentWard','currentStreet','occupation','employmentStatus','maritalStatus','emergencyContactName','emergencyContactPhone'] as const;

export default function MemberProfile() {
  const qc = useQueryClient();
  const { data: member, isLoading } = useQuery({ queryKey: ['member-me'], queryFn: async () => (await api.get('/members/me')).data });
  const [form, setForm] = useState<Record<string, string>>({});
  useEffect(() => {
    if (member) {
      const f: Record<string, string> = {};
      for (const k of EDITABLE) f[k] = String((member as Record<string, unknown>)[k] ?? '');
      setForm(f);
    }
  }, [member]);

  const save = useMutation({
    mutationFn: async () => (await api.patch('/members/me', form)).data,
    onSuccess: () => { toast.success('Profile updated'); qc.invalidateQueries({ queryKey: ['member-me'] }); },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update profile'),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  if (isLoading) return <p className="mt-1 text-sm text-gray-500">Loading...</p>;
  if (!member) return <Card className="rounded-xl border border-gray-100 bg-white shadow-sm"><CardContent className="py-8 text-center text-gray-500">No member profile is linked to your account yet. Please contact the church office.</CardContent></Card>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Your member record {member.memberNo ? `· ${member.memberNo}` : ''}</p>
      </div>
      <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <CardHeader><CardTitle className="text-lg">Identity (read-only)</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div><p className="text-xs text-gray-800/50">Full Name</p><p className="font-medium">{member.fullName}</p></div>
          <div><p className="text-xs text-gray-800/50">Member No</p><p className="font-medium">{member.memberNo || '—'}</p></div>
          <div><p className="text-xs text-gray-800/50">Membership Status</p><p className="font-medium">{member.membershipStatus}</p></div>
          <div><p className="text-xs text-gray-800/50">Email</p><p className="font-medium">{member.email || '—'}</p></div>
          <div><p className="text-xs text-gray-800/50">Gender</p><p className="font-medium">{member.gender || '—'}</p></div>
          <div><p className="text-xs text-gray-800/50">Baptism</p><p className="font-medium">{member.baptismStatus || '—'}</p></div>
          <div><p className="text-xs text-gray-800/50">Current Position</p><p className="font-medium">{member.currentPosition || '—'}</p></div>
          <div><p className="text-xs text-gray-800/50">Ushemasi</p><p className="font-medium">{member.ushemasi || '—'}</p></div>
          <div><p className="text-xs text-gray-800/50">Time in Church</p><p className="font-medium">{member.timeInChurch || '—'}</p></div>
          <div><p className="text-xs text-gray-800/50">Expected Stay</p><p className="font-medium">{member.expectedStayDuration || '—'}</p></div>
          <div><p className="text-xs text-gray-800/50">Desired Department</p><p className="font-medium">{member.desiredDepartment || member.preferredDepartment || '—'}</p></div>
        </CardContent>
      </Card>
      <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <CardHeader><CardTitle className="text-lg">Contact & Personal Details</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1"><Label htmlFor="p-phone">Phone</Label><Input id="p-phone" value={form.phone ?? ''} onChange={set('phone')} /></div>
          <div className="space-y-1"><Label htmlFor="p-address">Address</Label><Input id="p-address" value={form.address ?? ''} onChange={set('address')} /></div>
          <div className="space-y-1"><Label htmlFor="p-region">Region</Label><Input id="p-region" value={form.currentRegion ?? ''} onChange={set('currentRegion')} /></div>
          <div className="space-y-1"><Label htmlFor="p-district">District</Label><Input id="p-district" value={form.currentDistrict ?? ''} onChange={set('currentDistrict')} /></div>
          <div className="space-y-1"><Label htmlFor="p-ward">Ward</Label><Input id="p-ward" value={form.currentWard ?? ''} onChange={set('currentWard')} /></div>
          <div className="space-y-1"><Label htmlFor="p-street">Street / Mtaa</Label><Input id="p-street" value={form.currentStreet ?? ''} onChange={set('currentStreet')} /></div>
          <div className="space-y-1"><Label htmlFor="p-occupation">Occupation</Label><Input id="p-occupation" value={form.occupation ?? ''} onChange={set('occupation')} /></div>
          <div className="space-y-1"><Label htmlFor="p-employment">Employment Status</Label><Input id="p-employment" value={form.employmentStatus ?? ''} onChange={set('employmentStatus')} /></div>
          <div className="space-y-1"><Label htmlFor="p-marital">Marital Status</Label><Input id="p-marital" value={form.maritalStatus ?? ''} onChange={set('maritalStatus')} /></div>
          <div className="space-y-1"><Label htmlFor="p-ecn">Emergency Contact Name</Label><Input id="p-ecn" value={form.emergencyContactName ?? ''} onChange={set('emergencyContactName')} /></div>
          <div className="space-y-1"><Label htmlFor="p-ecp">Emergency Contact Phone</Label><Input id="p-ecp" value={form.emergencyContactPhone ?? ''} onChange={set('emergencyContactPhone')} /></div>
          <div className="sm:col-span-2 flex justify-end"><Button className="bg-[#7A1F2B] hover:bg-[#7b2a35]" onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? 'Saving...' : 'Save Changes'}</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}
