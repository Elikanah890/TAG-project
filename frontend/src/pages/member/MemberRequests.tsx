import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

type RequestItem = { id: string; createdAt: string; subject: string; status: string; response?: string | null };

export default function MemberRequests() {
  const qc = useQueryClient();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const { data: requests = [], isLoading } = useQuery({ queryKey: ['my-requests'], queryFn: async () => (await api.get('/members/requests')).data });

  const create = useMutation({
    mutationFn: async () => (await api.post('/members/requests', { subject, message })).data,
    onSuccess: () => { toast.success('Request submitted'); setSubject(''); setMessage(''); qc.invalidateQueries({ queryKey: ['my-requests'] }); },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to submit request'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">My Requests</h1>
        <p className="mt-1 text-sm text-gray-500">Send a request to the church office (e.g. certificate, prayer, care)</p>
      </div>
      <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <CardHeader><CardTitle className="text-lg">New Request</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1"><Label htmlFor="req-subject">Subject *</Label><Input id="req-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Baptism certificate" /></div>
          <div className="space-y-1"><Label htmlFor="req-message">Message *</Label><Textarea id="req-message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your request..." /></div>
          <div className="flex justify-end"><Button className="bg-[#7A1F2B] hover:bg-[#7b2a35]" onClick={() => create.mutate()} disabled={create.isPending || !subject.trim() || !message.trim()}>{create.isPending ? 'Submitting...' : 'Submit Request'}</Button></div>
        </CardContent>
      </Card>
      <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <CardHeader><CardTitle className="text-lg">My Requests</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="mt-1 text-sm text-gray-500">Loading...</p> : requests.length === 0 ? <p className="mt-1 text-sm text-gray-500">No requests yet.</p> : (
            <div className="overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead>Response</TableHead></TableRow></TableHeader>
                <TableBody>
                  {requests.map((r: RequestItem) => (
                    <TableRow key={r.id}>
                      <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{r.subject}</TableCell>
                      <TableCell><Badge variant="outline">{r.status}</Badge></TableCell>
                      <TableCell className="max-w-xs">{r.response || '—'}</TableCell>
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
