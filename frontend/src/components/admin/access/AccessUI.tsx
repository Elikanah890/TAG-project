import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight, CheckCircle2, Inbox, Info, Loader2, MinusCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">{eyebrow}</p> : null}
        <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm text-gray-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon, tone = 'default' }: { label: string; value: ReactNode; hint?: string; icon?: any; tone?: 'default' | 'success' | 'warning' | 'danger' }) {
  const iconTones: Record<string, string> = {
    default: 'bg-gray-100 text-gray-600',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-[#C9962B]/15 text-[#A9771F]',
    danger: 'bg-rose-50 text-rose-600',
  };
  return (
    <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <CardContent className="flex items-start justify-between gap-3 p-6">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-800">{value}</p>
          {hint ? <p className="mt-1.5 text-xs text-gray-500">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={cn('flex h-11 w-11 items-center justify-center rounded-full', iconTones[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export type MetricState = 'ok' | 'zero' | 'unavailable' | 'error';

export type Metric = {
  value: number | null;
  state: MetricState;
  asOf?: string;
  source?: string;
  hint?: string;
  unavailableReason?: string;
};

export function formatNumber(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString();
}

export function formatMoney(value?: number | null, currency = 'TZS') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

const metricTone: Record<string, { card: string; icon: string; value: string }> = {
  default: { card: 'border-gray-100 bg-white', icon: 'bg-gray-100 text-gray-600', value: 'text-gray-800' },
  success: { card: 'border-gray-100 bg-white', icon: 'bg-emerald-50 text-emerald-600', value: 'text-gray-800' },
  warning: { card: 'border-gray-100 bg-white', icon: 'bg-[#C9962B]/15 text-[#A9771F]', value: 'text-gray-800' },
  danger: { card: 'border-gray-100 bg-white', icon: 'bg-rose-50 text-rose-600', value: 'text-gray-800' },
};

function metricStatus(metric?: Metric) {
  if (!metric || metric.state === 'unavailable') {
    return { label: 'Unavailable', dot: 'bg-[#C9962B]/100', className: 'text-[#A9771F]' };
  }
  if (metric.state === 'error') return { label: 'Error', dot: 'bg-rose-500', className: 'text-rose-800' };
  if (metric.state === 'zero') return { label: 'No records', dot: 'bg-slate-400', className: 'text-slate-600' };
  return { label: 'Live', dot: 'bg-emerald-500', className: 'text-emerald-700' };
}

export function MetricCard({
  label,
  metric,
  icon: Icon,
  to,
  hint,
  tone = 'default',
  format = 'number',
  className,
}: {
  label: string;
  metric?: Metric;
  icon?: any;
  to?: string;
  hint?: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
  format?: 'number' | 'money';
  className?: string;
}) {
  const status = metricStatus(metric);
  const unavailable = !metric || metric.state === 'unavailable' || metric.state === 'error';
  const display = unavailable
    ? 'Unavailable'
    : format === 'money'
      ? formatMoney(metric?.value)
      : formatNumber(metric?.value);
  const detail = unavailable
    ? metric?.unavailableReason || metric?.hint
    : hint || (metric?.state === 'zero' ? 'No records recorded yet.' : metric?.hint);
  const colors = metricTone[tone] || metricTone.default;

  const body = (
    <Card className={cn('group relative h-full rounded-xl border shadow-sm transition-all duration-200', colors.card, to && 'hover:-translate-y-0.5 hover:shadow-md', className)}>
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between">
          {Icon ? (
            <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', colors.icon)}>
              <Icon className="h-5 w-5" />
            </div>
          ) : <span />}
          <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide', status.className)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
            {status.label}
          </span>
        </div>
        <p className="mt-4 text-balance text-sm font-medium leading-tight text-gray-500">{label}</p>
        <p className={cn('mt-1.5 font-bold tracking-tight', unavailable ? 'text-lg leading-tight sm:text-xl' : 'truncate text-2xl sm:text-3xl', colors.value)}>{display}</p>
        {detail ? <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-500">{detail}</p> : null}
        {to ? <span className="mt-auto inline-flex items-center gap-1 pt-3 text-[11px] font-medium text-[#7A1F2B] opacity-0 transition group-hover:opacity-100">View details <ArrowUpRight className="h-3 w-3" /></span> : null}
      </CardContent>
    </Card>
  );

  return to ? (
    <Link to={to} className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1F2B]/30">
      {body}
    </Link>
  ) : body;
}

export function MiniStat({ label, value, hint, tone = 'default' }: { label: string; value: ReactNode; hint?: string; tone?: 'default' | 'success' | 'warning' | 'danger' }) {
  const tones: Record<string, string> = {
    default: 'border-gray-100 bg-white text-gray-800',
    success: 'border-emerald-100 bg-emerald-50/50 text-emerald-950',
    warning: 'border-[#C9962B]/20 bg-[#C9962B]/5 text-[#7A5A10]',
    danger: 'border-rose-100 bg-rose-50/50 text-rose-950',
  };
  return (
    <div className={cn('rounded-xl border p-4 shadow-sm', tones[tone])}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-[11px] leading-snug text-gray-500">{hint}</p> : null}
    </div>
  );
}

export function InfoNote({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warning' | 'success' }) {
  const styles = {
    info: 'border-sky-100 bg-sky-50/50 text-sky-900',
    warning: 'border-[#C9962B]/20 bg-[#C9962B]/5 text-[#7A5A10]',
    success: 'border-emerald-100 bg-emerald-50/50 text-emerald-900',
  };
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'warning' ? AlertTriangle : Info;
  return (
    <div className={cn('flex gap-2 rounded-lg border px-3 py-2.5 text-xs leading-relaxed', styles[tone])}>
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function StateDot({ state }: { state?: MetricState }) {
  if (state === 'ok') return <span className="inline-flex items-center gap-1 text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Live</span>;
  if (state === 'zero') return <span className="inline-flex items-center gap-1 text-slate-600"><span className="h-1.5 w-1.5 rounded-full bg-slate-400" />No records</span>;
  if (state === 'error') return <span className="inline-flex items-center gap-1 text-rose-700"><MinusCircle className="h-3 w-3" />Error</span>;
  return <span className="inline-flex items-center gap-1 text-[#A9771F]"><span className="h-1.5 w-1.5 rounded-full bg-[#C9962B]/100" />Unavailable</span>;
}

export function StatusBadge({ status }: { status?: string | null }) {
  const value = String(status || '').toUpperCase();
  const map: Record<string, string> = {
    ACTIVE: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    SUSPENDED: 'border-rose-200 bg-rose-50 text-rose-800',
    PENDING: 'border-[#C9962B]/20 bg-[#C9962B]/10 text-[#7A5A10]',
    SYSTEM: 'border-[#C9962B]/20 bg-[#C9962B]/15 text-[#374151]',
    CUSTOM: 'border-slate-200 bg-slate-50 text-slate-700',
    INACTIVE: 'border-slate-200 bg-slate-50 text-slate-600',
  };
  return <Badge variant="outline" className={cn('font-semibold', map[value] || '')}>{value || '—'}</Badge>;
}

export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-white py-16 text-sm text-gray-500">
      <Loader2 className="h-4 w-4 animate-spin" /> {label}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-6 text-sm text-rose-900">
      <div className="flex items-center gap-2 font-medium"><AlertTriangle className="h-4 w-4" /> Could not load this data</div>
      <p className="mt-1 text-rose-800/80">{message || 'Check your connection and permissions, then try again.'}</p>
      {onRetry ? <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}><RefreshCw className="mr-2 h-3.5 w-3.5" />Retry</Button> : null}
    </div>
  );
}

export function EmptyBlock({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-200 bg-gray-50/30 px-6 py-14 text-center">
      <div className="mb-3 rounded-full bg-[#7A1F2B]/10 p-3 text-[#7A1F2B]"><Inbox className="h-5 w-5" /></div>
      <p className="font-medium text-gray-800">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function SectionCard({ title, description, actions, children, className }: { title?: string; description?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <Card className={cn('rounded-xl border border-gray-100 bg-white shadow-sm', className)}>
      {(title || actions) && (
        <div className="flex flex-col gap-2 px-6 pb-2 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title ? <h2 className="font-sans text-base font-semibold text-gray-900">{title}</h2> : null}
            {description ? <p className="mt-0.5 text-xs text-gray-500">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      )}
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}

export function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 text-sm">
      <span className="text-gray-500">Page {page} of {totalPages}</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next</Button>
      </div>
    </div>
  );
}

export function formatDate(value?: string | Date | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(value?: string | Date | null) {
  if (!value) return '—';
  const d = new Date(value).getTime();
  if (Number.isNaN(d)) return '—';
  const seconds = Math.floor((Date.now() - d) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
}

export function JsonPreview({ value }: { value: any }) {
  if (value === null || value === undefined) return <span className="text-gray-500">—</span>;
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return <span className="font-mono text-xs text-gray-500">{text.length > 120 ? `${text.slice(0, 120)}…` : text}</span>;
}
