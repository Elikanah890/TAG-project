import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, MonitorSmartphone, RefreshCw, Search, UserCheck, Users } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  formatDate,
  timeAgo,
} from '@/components/admin/access/AccessUI';

export default function UserActivity() {
  const [query, setQuery] = useState('');
  const users = useQuery({ queryKey: ['access-user-activity'], queryFn: async () => (await api.get('/admin/user-activity')).data });
  const sessions = useQuery({ queryKey: ['access-sessions'], queryFn: async () => (await api.get('/admin/sessions?limit=200')).data });
  const rows = Array.isArray(users.data) ? users.data : [];
  const activeSessions = Array.isArray(sessions.data) ? sessions.data : [];

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((user: any) => {
      const roleNames = (user.roles || []).map((role: any) => role.role?.name || '').join(' ').toLowerCase();
      return String(user.email || '').toLowerCase().includes(term) || roleNames.includes(term) || String(user.status || '').toLowerCase().includes(term);
    });
  }, [rows, query]);

  const active = rows.filter((user: any) => user.status === 'ACTIVE').length;
  const neverLoggedIn = rows.filter((user: any) => !user.lastLoginAt).length;
  const loading = users.isLoading || sessions.isLoading;
  const isError = users.isError || sessions.isError;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System Administration"
        title="User Activity"
        description="Account status, role membership, last sign-in and active sessions from live audit and session records."
        actions={
          <Button variant="outline" onClick={() => { users.refetch(); sessions.refetch(); }} disabled={users.isFetching || sessions.isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${users.isFetching || sessions.isFetching ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        }
      />

      {loading ? <LoadingBlock label="Loading user activity…" /> : isError ? (
        <ErrorBlock onRetry={() => { users.refetch(); sessions.refetch(); }} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="User accounts" value={rows.length} icon={Users} hint="All recorded accounts" />
            <StatCard label="Active accounts" value={active} icon={UserCheck} tone="success" hint={`${rows.length - active} inactive or suspended`} />
            <StatCard label="Never signed in" value={neverLoggedIn} icon={Activity} tone={neverLoggedIn ? 'warning' : 'default'} hint="No login timestamp recorded" />
            <StatCard label="Active sessions" value={activeSessions.length} icon={MonitorSmartphone} hint="Non-revoked, unexpired sessions" />
          </div>

          <SectionCard
            title="Account activity"
            description="Most recent known sign-in per account. Audit history is available in Audit Logs."
            actions={
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search email, role or status" className="pl-8" aria-label="Search user activity" />
              </div>
            }
          >
            {filtered.length === 0 ? (
              <EmptyBlock title="No matching accounts" description={query ? 'Try a different email, role or status.' : 'Accounts will appear here once users are created.'} />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#C9962B]/10 hover:bg-[#C9962B]/10">
                      <TableHead>Account</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Last sign-in</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Sessions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((user: any) => {
                      const userSessions = activeSessions.filter((session: any) => session.userId === user.id);
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <p className="text-sm font-medium text-gray-800">{user.email}</p>
                            <p className="text-xs text-gray-500">{user.id}</p>
                          </TableCell>
                          <TableCell><StatusBadge status={user.status} /></TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(user.roles || []).map((role: any) => (
                                <span key={role.role?.id || role.role?.name} className="rounded-full border border-gray-100 bg-[#C9962B]/10 px-2 py-0.5 text-[10px] font-medium text-[#7A5A10]">
                                  {role.role?.name || 'Unknown role'}
                                </span>
                              ))}
                              {!user.roles?.length ? <span className="text-xs text-gray-500">No roles</span> : null}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-xs text-gray-800">{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}</p>
                            {user.lastLoginAt ? <p className="text-[11px] text-gray-500">{timeAgo(user.lastLoginAt)}</p> : null}
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">{formatDate(user.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <span className={userSessions.length ? 'font-semibold text-gray-800' : 'text-gray-500'}>{userSessions.length}</span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
