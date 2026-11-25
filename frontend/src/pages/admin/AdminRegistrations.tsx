import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function AdminRegistrations() {
  const { hasRole } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const canManageWorkflow = hasRole('CHURCH_SECRETARY');

  const load = async () => {
    setLoading(true);
    try { const res = await api.get('/members/pending'); setRows(res.data); }
    catch (e: any) { toast.error(e?.response?.data?.message || 'Failed to load registrations'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    setApproving(true);
    try {
      const res = await api.post(`/members/${id}/approve`);
      toast.success(`Member approved: ${res.data.memberNo}`);
      setSelected(null);
      load();
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Approval failed'); }
    finally { setApproving(false); }
  };

  const reject = async (id: string) => {
    const reason = window.prompt('Reason for rejection (optional):') || undefined;
    setRejecting(true);
    try {
      await api.post(`/members/${id}/reject`, { reason });
      toast.success('Member application rejected');
      setSelected(null);
      load();
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Rejection failed'); }
    finally { setRejecting(false); }
  };

  const generatePassword = async (id: string) => {
    setResetting(true);
    try {
      const res = await api.post(`/members/${id}/reset-password`);
      setTempPassword(res.data.temporaryPassword);
      toast.success(`Temporary password generated for ${res.data.email}`);
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed to generate password'); }
    finally { setResetting(false); }
  };

  return (
    <div className="space-y-4">
      <div><h1 className="font-sans text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Membership Registrations</h1><p className="mt-1 text-sm text-gray-500">Church Secretary workflow: review pending applications, approve/reject, and generate/reset member passwords. Actions are authorized and audited.</p></div>
      <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <CardHeader><CardTitle className="text-lg">Pending Applications</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="mt-1 text-sm text-gray-500">Loading...</p> : rows.length === 0 ? <p className="mt-1 text-sm text-gray-500">No pending registrations.</p> : (
            <div className="overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Full Name</TableHead><TableHead>Phone</TableHead><TableHead>Email</TableHead><TableHead>Status</TableHead><TableHead>Applied</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.fullName}</TableCell>
                      <TableCell>{m.phone || '—'}</TableCell>
                      <TableCell>{m.email || '—'}</TableCell>
                      <TableCell><Badge variant="outline" className="border-[#C9962B]/30 bg-[#C9962B]/10 font-semibold text-[#7A5A10]">{m.membershipStatus}</Badge></TableCell>
                      <TableCell>{new Date(m.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell><Button size="sm" variant="outline" onClick={()=>{setSelected(m); setTempPassword(null);}}>View</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o)=>{ if(!o){setSelected(null); setTempPassword(null);} }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-serif text-[#7A1F2B]">Registration Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  ['Full Name', selected.fullName],
                  ['Gender', selected.gender],
                  ['DOB', selected.dateOfBirth ? new Date(selected.dateOfBirth).toLocaleDateString() : ''],
                  ['Phone', selected.phone],
                  ['Email', selected.email],
                  ['Marital Status', selected.maritalStatus],
                  ['Origin', [selected.originDistrict, selected.originRegion].filter(Boolean).join(', ')],
                  ['Current Location', [selected.currentStreet, selected.currentWard, selected.currentDistrict, selected.currentRegion].filter(Boolean).join(', ')],
                  ['Employment', selected.employmentStatus],
                  ['Occupation', selected.occupation],
                  ['Emergency Contact', [selected.emergencyContactName, selected.emergencyContactPhone].filter(Boolean).join(' - ')],
                  ['Current Position', selected.currentPosition],
                  ['Ushemasi', selected.ushemasi],
                  ['Time in Church', selected.timeInChurch],
                  ['Expected Stay Duration', selected.expectedStayDuration],
                  ['Baptism Status', selected.baptismStatus],
                  ['Desired Department', selected.desiredDepartment || selected.preferredDepartment],
                  ['Membership Status', selected.membershipStatus],
                  ['Member No', selected.memberNo],
                  ['User Email', selected.user?.email],
                ].map(([k, v]) => (
                  <div key={String(k)}>
                    <div className="text-gray-500">{k}</div>
                    <div className="font-medium text-gray-800 break-words">{String(v || '—')}</div>
                  </div>
                ))}
              </div>
              <div className="pt-2 flex flex-wrap gap-2 items-center">
                {canManageWorkflow && (
                  <Button className="bg-[#7A1F2B] text-white hover:bg-[#651925]" onClick={()=>approve(selected.id)} disabled={approving || selected.membershipStatus==='APPROVED'}>
                    {approving ? 'Approving...' : 'Approve Member'}
                  </Button>
                )}
                {canManageWorkflow && selected.membershipStatus !== 'REJECTED' && selected.membershipStatus !== 'APPROVED' && (
                  <Button variant="destructive" onClick={()=>reject(selected.id)} disabled={rejecting}>{rejecting ? 'Rejecting...' : 'Reject Application'}</Button>
                )}
                {canManageWorkflow && (
                  <Button variant="outline" onClick={()=>generatePassword(selected.id)} disabled={resetting || !selected.userId}>
                    {resetting ? 'Generating...' : 'Generate Password'}
                  </Button>
                )}
                {!selected.userId && <span className="text-xs text-gray-500">Approve first to create a linked user account.</span>}
                {!canManageWorkflow && <span className="text-xs text-[#A9771F]">Read-only access: operational approval/rejection is performed by authorized Church Secretary.</span>}
              </div>
              {tempPassword && (
                <div className="rounded-md border border-[#C9962B]/30 bg-[#C9962B]/10 p-3 text-[#7A5A10]">
                  <div className="font-medium">Temporary Password (share securely with member):</div>
                  <div className="text-lg font-mono mt-1">{tempPassword}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
