import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Save, Settings, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader, SectionCard, LoadingBlock, ErrorBlock } from '@/components/admin/access/AccessUI';

const FIELDS: { group: string; description: string; icon: any; fields: { key: string; label: string; placeholder?: string; type?: string }[] }[] = [
  {
    group: 'Church profile',
    description: 'Public identity and contact details used across the portal.',
    icon: Settings,
    fields: [
      { key: 'church.name', label: 'Church name', placeholder: 'T.A.G Forest ya Kwanza' },
      { key: 'church.phone', label: 'Contact phone', placeholder: '+255 …' },
      { key: 'church.email', label: 'Contact email', placeholder: 'name@tagchurch.org' },
      { key: 'church.address', label: 'Address', placeholder: 'Mbeya, Tanzania' },
    ],
  },
  {
    group: 'Security policy',
    description: 'Session and password policy values used to guide enforcement and review.',
    icon: ShieldCheck,
    fields: [
      { key: 'security.sessionTimeoutMinutes', label: 'Session timeout (minutes)', placeholder: '30' },
      { key: 'security.passwordMinLength', label: 'Minimum password length', placeholder: '8' },
      { key: 'security.maxLoginAttempts', label: 'Max failed logins before lockout', placeholder: '10' },
    ],
  },
  {
    group: 'Notifications',
    description: 'Notification channels for church communications.',
    icon: Bell,
    fields: [
      { key: 'notifications.emailEnabled', label: 'Email notifications (true/false)', placeholder: 'false' },
      { key: 'notifications.smsEnabled', label: 'SMS notifications (true/false)', placeholder: 'false' },
    ],
  },
  {
    group: 'Backup policy',
    description: 'Backup retention guidance for operations.',
    icon: ShieldCheck,
    fields: [{ key: 'backup.retentionDays', label: 'Backup retention (days)', placeholder: '30' }],
  },
];

const ALL_KEYS = FIELDS.flatMap((g) => g.fields.map((f) => f.key));

export default function SystemConfiguration() {
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: ['access-settings'], queryFn: async () => (await api.get('/admin/settings')).data });
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings.data) setValues(settings.data);
  }, [settings.data]);

  const changedKeys = useMemo(() => ALL_KEYS.filter((k) => String(values[k] ?? '') !== String(settings.data?.[k] ?? '')), [values, settings.data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload: Record<string, string> = {};
      for (const k of ALL_KEYS) payload[k] = String(values[k] ?? '');
      return (await api.put('/admin/settings', payload)).data;
    },
    onSuccess: () => { toast.success('Configuration saved'); qc.invalidateQueries({ queryKey: ['access-settings'] }); qc.invalidateQueries({ queryKey: ['access-audit-overview'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to save configuration'),
  });

  const extraKeys = Object.keys(settings.data || {}).filter((k) => !ALL_KEYS.includes(k));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System Administration"
        title="System Configuration"
        description="Database-backed configuration. Changes are audited. Secret keys and credentials are never stored or displayed here."
        actions={<Button className="bg-[#7A1F2B] text-white hover:bg-[#651925]" onClick={() => save.mutate()} disabled={save.isPending || changedKeys.length === 0}><Save className="mr-2 h-4 w-4" />{save.isPending ? 'Saving…' : `Save changes${changedKeys.length ? ` (${changedKeys.length})` : ''}`}</Button>}
      />
      {settings.isLoading ? <LoadingBlock /> : settings.isError ? <ErrorBlock onRetry={() => settings.refetch()} /> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {FIELDS.map((group) => (
            <SectionCard key={group.group} title={group.group} description={group.description}>
              <div className="space-y-3">
                {group.fields.map((f) => (
                  <div key={f.key} className="space-y-1.5">
                    <Label className="text-xs text-gray-500">{f.label}</Label>
                    <Input value={values[f.key] ?? ''} placeholder={f.placeholder} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
                    <p className="font-mono text-[10px] text-gray-500">{f.key}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          ))}
          {extraKeys.length ? (
            <SectionCard title="Additional configuration" description="Existing keys not covered by the guided form." className="lg:col-span-2">
              <div className="grid gap-3 md:grid-cols-2">
                {extraKeys.map((k) => (
                  <div key={k} className="space-y-1.5">
                    <Label className="text-xs text-gray-500">{k}</Label>
                    <Input value={values[k] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [k]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}
          <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-[#C9962B]/10 p-4 text-xs text-[#7A5A10]">
            <b>Note:</b> Some policy values are operational guidance stored in the database. Enforcement such as session revocation, permission checks and account suspension is already enforced by the backend. Rotate JWT secrets and production credentials outside the application UI.
          </div>
        </div>
      )}
    </div>
  );
}
