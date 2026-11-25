import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Clock,
  FileWarning,
  Landmark,
  PiggyBank,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  EmptyBlock,
  ErrorBlock,
  InfoNote,
  LoadingBlock,
  MetricCard,
  PageHeader,
  SectionCard,
  formatDate,
  formatMoney,
  formatNumber,
} from '@/components/admin/access/AccessUI';
import { cn } from '@/lib/utils';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const PIE_COLORS = ['#7A1F2B', '#C9962B', '#2B2B2B', '#A9771F', '#B9853F', '#D8CDBB'];
const PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'quarter', label: 'This quarter' },
  { value: 'year', label: 'This year' },
  { value: 'custom', label: 'Custom range' },
] as const;

function pieData(rows: { category: string; amount: number | string }[]) {
  return (rows || []).slice(0, 6).map((row) => ({
    name: String(row.category).replaceAll('_', ' '),
    value: Number(row.amount || 0),
  }));
}

type Metric = { value: number | null; state: 'ok' | 'zero' | 'unavailable' | 'error'; hint?: string };

function metric(value: number | null | undefined, hint?: string, zeroIsOk = false): Metric {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return { value: null, state: 'unavailable', hint };
  const n = Number(value);
  return { value: n, state: n === 0 && !zeroIsOk ? 'zero' : 'ok', hint };
}

function statusClass(status?: string | null) {
  const value = String(status || '').toUpperCase();
  if (['PAID', 'APPROVED', 'CONFIRMED', 'SENT', 'DELIVERED', 'READ', 'ACTIVE'].includes(value)) return 'border-emerald-100 bg-emerald-50 text-emerald-700';
  if (['OVERDUE', 'REJECTED', 'FAILED', 'REVERSED'].includes(value)) return 'border-rose-100 bg-rose-50 text-rose-700';
  if (['CANCELLED', 'INACTIVE'].includes(value)) return 'border-gray-200 bg-gray-50 text-gray-600';
  return 'border-[#C9962B]/20 bg-[#C9962B]/10 text-[#7A5A10]';
}

function StatusPill({ status }: { status?: string | null }) {
  return <Badge variant="outline" className={cn('whitespace-nowrap font-semibold', statusClass(status))}>{String(status || 'UNKNOWN').replaceAll('_', ' ')}</Badge>;
}

export default function FinanceDashboard() {
  const [period, setPeriod] = useState('month');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const queryParams = useMemo(() => {
    const p = new URLSearchParams({ period });
    if (period === 'custom') {
      if (from) p.set('from', from);
      if (to) p.set('to', to);
    }
    return p.toString();
  }, [period, from, to]);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboard-finance', queryParams],
    queryFn: async () => (await api.get(`/dashboard/finance?${queryParams}`)).data,
  });

  if (isLoading) return <LoadingBlock label="Loading live finance records…" />;
  if (isError) return <ErrorBlock message={(error as any)?.response?.data?.message} onRetry={refetch} />;

  const stats = data?.financialStats || {};
  const kpis = data?.kpis || {};
  const periodMeta = data?.period || { label: 'This month', selected: period };
  const contributions = data?.contributions || { byCategory: [], byMethod: [] };
  const expenses = data?.expenses || { byStatus: [], byCategory: [], pendingApprovals: [] };
  const invoices = data?.invoices || { byStatus: [], recent: [] };
  const pledges = data?.pledges || { byStatus: [], upcoming: [] };
  const ujenzi = data?.ujenzi || {};
  const recentTransactions = data?.recentTransactions || [];
  const monthlyTrend = data?.monthlyTrend || [];
  const accounts = data?.accounts || [];
  const incomeMax = Math.max(1, ...contributions.byCategory.map((row: any) => Number(row.amount || 0)));
  const expenseMax = Math.max(1, ...expenses.byCategory.map((row: any) => Number(row.amount || 0)));
  const totalApprovedExpenses = Number(expenses.approvedTotal || 0);
  const paymentMixTotal = contributions.byMethod.reduce((sum: number, row: any) => sum + Number(row.amount || 0), 0);
  const hasMonthlyMovement = monthlyTrend.some((row: any) => Number(row.income || 0) > 0 || Number(row.expenses || 0) > 0);

  const periodIncome = Number(kpis.incomeThisPeriod?.value ?? stats.monthIncome ?? 0);
  const periodExpenses = Number(kpis.netThisPeriod?.expenses ?? stats.monthExpenses ?? 0);
  const periodNet = Number(kpis.netThisPeriod?.value ?? stats.monthNet ?? 0);
  const periodLabel = kpis.incomeThisPeriod?.periodLabel || periodMeta.label || 'This month';

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Financial Management"
        title="Finance Dashboard"
        description="Live finance KPIs from recorded contributions, approved expenses, invoices, pledges, and configured accounts."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/admin/finance/expenses"><ClipboardCheck className="mr-2 h-4 w-4" /> Expenses</Link>
            </Button>
            <Button asChild className="bg-[#7A1F2B] text-white hover:bg-[#651925]">
              <Link to="/admin/finance/record"><Wallet className="mr-2 h-4 w-4" /> Record payment</Link>
            </Button>
          </>
        }
      />

      <SectionCard title="Dashboard period" description="Period filters apply to period KPIs and trend comparisons. Outstanding invoices, current balances, and pending approvals remain current-state values.">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="w-full lg:w-56">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Period</p>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
              <SelectContent>
                {PERIODS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {period === 'custom' ? (
            <>
              <div className="w-full lg:w-44">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">From</p>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="w-full lg:w-44">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">To</p>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </>
          ) : null}
          <div className="flex items-center gap-2 text-xs text-gray-500 lg:ml-auto">
            {isFetching ? <span>Updating…</span> : <span>Updated {formatDate(data?.generatedAt)}</span>}
            <Button variant="ghost" size="sm" onClick={() => refetch()}>Refresh</Button>
          </div>
        </div>
      </SectionCard>

      <InfoNote>
        Confirmed income includes confirmed contribution records only. Expenses Paid uses approved expense records; disbursement/payment status is not separately tracked. Available Balance is calculated from opening balances, confirmed income, and approved expenses — not a reconciled bank balance. Unpaid invoices and pledges are receivables/commitments, not income.
      </InfoNote>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Confirmed Income" metric={metric(kpis.confirmedIncome?.value ?? stats.confirmedIncome, 'All confirmed contribution records (lifetime)')} icon={TrendingUp} tone="success" format="money" />
        <MetricCard label="Expenses Paid" metric={metric(kpis.expensesPaid?.value ?? stats.approvedExpenses, kpis.expensesPaid?.note || 'Approved expense records')} icon={TrendingDown} tone="warning" format="money" />
        <MetricCard label="Available Balance" metric={metric(kpis.availableBalance?.value ?? stats.cashPosition, kpis.availableBalance?.note || 'Calculated position, not reconciled bank balance')} icon={Landmark} tone="default" format="money" />
        <MetricCard label="Outstanding Invoices" metric={metric(kpis.outstandingInvoices?.value ?? invoices.totalOutstanding, 'Unpaid invoice balance from recorded invoices')} icon={ReceiptText} tone="warning" format="money" />
        <MetricCard label="Outstanding Pledges" metric={metric(kpis.outstandingPledges?.value ?? pledges.pending, kpis.outstandingPledges?.note || 'Pending pledge commitments, not income')} icon={PiggyBank} tone="default" format="money" />
        <MetricCard label="Pending Approvals" metric={metric(kpis.pendingApprovals?.value ?? stats.pendingApprovals, `${formatMoney(kpis.pendingApprovals?.amount ?? stats.pendingExpenses)} awaiting decision`)} icon={ClipboardCheck} tone={Number(kpis.pendingApprovals?.value ?? stats.pendingApprovals) > 0 ? 'warning' : 'success'} />
        <MetricCard label={`Income (${periodLabel})`} metric={metric(periodIncome, `Confirmed contributions in ${periodLabel.toLowerCase()}`)} icon={Banknote} tone="success" format="money" />
        <MetricCard label={`Net (${periodLabel})`} metric={metric(periodNet, `Confirmed income minus approved expenses in ${periodLabel.toLowerCase()}`, true)} icon={periodNet >= 0 ? TrendingUp : TrendingDown} tone={periodNet >= 0 ? 'success' : 'danger'} format="money" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Income vs expenses" description={`Period view: ${periodLabel}. Trend chart shows last 6 months.`}>
          {hasMonthlyMovement ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7A1F2B" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#7A1F2B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9962B" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#C9962B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
                  <Tooltip formatter={(value: any) => formatMoney(Number(value))} />
                  <Legend />
                  <Area type="monotone" dataKey="income" name="Confirmed income" stroke="#7A1F2B" fill="url(#incomeFill)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" name="Approved expenses" stroke="#C9962B" fill="url(#expenseFill)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyBlock title="No monthly movement" description="Confirmed contributions and approved expenses will appear here once recorded." />}
          <div className="mt-3 grid gap-2 sm:grid-cols-3 text-xs">
            <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3"><p className="text-gray-500">Income ({periodLabel})</p><p className="mt-1 font-semibold text-gray-800">{formatMoney(periodIncome)}</p></div>
            <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3"><p className="text-gray-500">Expenses ({periodLabel})</p><p className="mt-1 font-semibold text-gray-800">{formatMoney(periodExpenses)}</p></div>
            <div className={cn('rounded-lg border p-3', periodNet >= 0 ? 'border-emerald-100 bg-emerald-50/40' : 'border-rose-100 bg-rose-50/40')}><p className="text-gray-500">Net ({periodLabel})</p><p className={cn('mt-1 font-semibold', periodNet >= 0 ? 'text-emerald-700' : 'text-rose-700')}>{formatMoney(periodNet)}</p></div>
          </div>
        </SectionCard>

        <SectionCard title="Income by category" description="Confirmed contribution distribution">
          {contributions.byCategory.length ? (
            <div className="grid gap-4 md:grid-cols-[180px_1fr] items-center">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData(contributions.byCategory)} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={2}>
                      {pieData(contributions.byCategory).map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatMoney(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {contributions.byCategory.slice(0, 6).map((row: any, i: number) => (
                  <div key={row.category}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-2 truncate text-gray-600"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />{String(row.category).replaceAll('_', ' ')}</span>
                      <span className="font-medium text-gray-800">{formatMoney(row.amount)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full" style={{ width: `${Math.max(2, (Number(row.amount) / incomeMax) * 100)}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} /></div>
                  </div>
                ))}
              </div>
            </div>
          ) : <EmptyBlock title="No income categories" description="Confirmed contributions will appear by category." />}
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Expenses and approvals" description="Approved expenditure by category and items awaiting decision" actions={<Link to="/admin/finance/expenses" className="text-xs font-medium text-[#7A1F2B] hover:underline">Open expenses</Link>}>
          <div className="grid gap-2 sm:grid-cols-3">
            {expenses.byStatus.map((row: any) => (
              <div key={row.status} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                <StatusPill status={row.status} />
                <p className="mt-2 text-lg font-bold text-gray-800">{formatMoney(row.amount)}</p>
                <p className="text-[11px] text-gray-500">{formatNumber(row.count)} record(s)</p>
              </div>
            ))}
          </div>
          {expenses.byCategory.length ? (
            <div className="mt-4 space-y-3">
              {expenses.byCategory.slice(0, 5).map((row: any) => (
                <div key={row.category}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-gray-500">{String(row.category).replaceAll('_', ' ')}</span>
                    <span className="font-medium text-gray-700">{formatMoney(row.amount)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-[#C9962B]" style={{ width: `${Math.max(2, (Number(row.amount) / expenseMax) * 100)}%` }} /></div>
                </div>
              ))}
            </div>
          ) : <p className="mt-4 text-xs text-gray-500">No approved expenses recorded yet.</p>}
          <div className="mt-4 border-t border-gray-100 pt-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">Pending approval</p>
            {expenses.pendingApprovals.length ? (
              <div className="space-y-2">
                {expenses.pendingApprovals.map((row: any) => (
                  <div key={row.id} className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-xs">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-800">{row.description}</p>
                      <p className="text-gray-500">{row.category} · {formatDate(row.date)}</p>
                    </div>
                    <span className="shrink-0 font-semibold text-gray-800">{formatMoney(row.amount)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-gray-500">No expenses are waiting for approval.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Invoices and pledges" description="Current receivables and outstanding commitments (not period-filtered income)">
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3"><p className="text-[10px] uppercase tracking-wide text-gray-400">Invoiced</p><p className="mt-1 text-lg font-bold text-gray-800">{formatMoney(invoices.totalInvoiced)}</p></div>
            <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3"><p className="text-[10px] uppercase tracking-wide text-gray-400">Paid</p><p className="mt-1 text-lg font-bold text-emerald-700">{formatMoney(invoices.totalPaid)}</p></div>
            <div className={cn('rounded-lg border p-3', Number(invoices.overdueCount || 0) > 0 ? 'border-rose-100 bg-rose-50/50' : 'border-gray-100 bg-gray-50/50')}><p className="text-[10px] uppercase tracking-wide text-gray-400">Outstanding</p><p className="mt-1 text-lg font-bold text-gray-800">{formatMoney(invoices.totalOutstanding)}</p></div>
          </div>
          {invoices.recent.length ? (
            <div className="mt-3 overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Recipient</TableHead><TableHead className="text-right">Outstanding</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {invoices.recent.slice(0, 4).map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs">{row.invoiceNo}</TableCell>
                      <TableCell className="max-w-[150px] truncate text-xs">{row.recipientName}</TableCell>
                      <TableCell className="text-right text-xs font-medium">{formatMoney(row.outstanding)}</TableCell>
                      <TableCell><StatusPill status={row.overdue ? 'OVERDUE' : row.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : <p className="mt-3 text-xs text-gray-500">No invoices recorded yet.</p>}
          <div className="mt-4 grid gap-3 border-t border-gray-100 pt-3 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">Pledges</p>
              <p className="mt-1 text-xl font-bold text-gray-800">{formatMoney(pledges.total)}</p>
              <p className="text-[11px] text-gray-500">{formatNumber(pledges.count)} pledge(s) · {formatMoney(pledges.pending)} pending commitment</p>
              {Number(pledges.overdueCount || 0) > 0 ? <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-700"><AlertTriangle className="h-3 w-3" /> {pledges.overdueCount} past target date</p> : null}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">Upcoming pledges</p>
              {pledges.upcoming.length ? (
                <div className="mt-1 space-y-1.5">
                  {pledges.upcoming.slice(0, 3).map((row: any) => (
                    <div key={row.id} className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="truncate text-gray-500">{row.memberName}</span>
                      <span className="shrink-0 font-medium text-gray-700">{formatMoney(row.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="mt-1 text-[11px] text-gray-500">No upcoming pledge dates.</p>}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.6fr]">
        <SectionCard title="Ujenzi fund" description="Recorded building-fund contributions">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">{ujenzi.status || 'ACTIVE'}</p>
              <p className="mt-1 font-serif text-lg text-gray-800">{ujenzi.name || 'Ujenzi'}</p>
            </div>
            <div className="rounded-lg bg-[#C9962B]/10 p-2 text-[#A9771F]"><Building2 className="h-5 w-5" /></div>
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-800">{formatMoney(ujenzi.raised)}</p>
          <p className="text-[11px] text-gray-500">Raised from {formatNumber(ujenzi.count)} confirmed contribution(s)</p>
          {Number(ujenzi.target || 0) > 0 ? (
            <>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#C9962B]/15"><div className="h-full rounded-full bg-gradient-to-r from-[#7A1F2B] to-[#C9962B]" style={{ width: `${ujenzi.progressPercent || 0}%` }} /></div>
              <div className="mt-1.5 flex items-center justify-between text-[11px]"><span className="text-gray-500">Target {formatMoney(ujenzi.target)}</span><strong className="text-gray-800">{ujenzi.progressPercent || 0}%</strong></div>
            </>
          ) : <InfoNote tone="warning">No Ujenzi target is configured. The amount shown is actual recorded contributions, not progress against a goal.</InfoNote>}
        </SectionCard>

        <SectionCard title="Recent finance transactions" description="Latest recorded contributions and expenses">
          {recentTransactions.length ? (
            <div className="overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead><TableHead>Party</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {recentTransactions.map((row: any) => (
                    <TableRow key={`${row.type}-${row.id}`}>
                      <TableCell className="whitespace-nowrap text-xs text-gray-500">{formatDate(row.date)}</TableCell>
                      <TableCell><span className={cn('inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold', row.direction === 'IN' ? 'bg-emerald-50 text-emerald-800' : 'bg-[#C9962B]/10 text-[#7A5A10]')}>{row.direction === 'IN' ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}{row.type === 'CONTRIBUTION' ? 'Income' : 'Expense'}</span></TableCell>
                      <TableCell className="max-w-[190px] truncate text-xs"><span className="font-medium text-gray-800">{String(row.description || '').replaceAll('_', ' ')}</span>{row.reference ? <span className="ml-1 font-mono text-[10px] text-gray-500">{row.reference}</span> : null}</TableCell>
                      <TableCell className="max-w-[160px] truncate text-xs text-gray-500">{row.party}</TableCell>
                      <TableCell className={cn('whitespace-nowrap text-right text-xs font-semibold', row.direction === 'IN' ? 'text-emerald-800' : 'text-[#7A5A10]')}>{row.direction === 'IN' ? '+' : '−'}{formatMoney(row.amount)}</TableCell>
                      <TableCell><StatusPill status={row.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : <EmptyBlock title="No transactions recorded" description="Confirmed contributions and expenses will appear here as they are recorded." />}
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <SectionCard title="Expense concentration" description="Approved spending by category (lifetime recorded)">
          {expenses.byCategory.length ? (
            <div className="space-y-3">
              {expenses.byCategory.map((row: any) => (
                <div key={row.category} className="grid grid-cols-[minmax(90px,150px)_1fr_auto] items-center gap-3 text-xs">
                  <span className="truncate text-gray-500">{String(row.category).replaceAll('_', ' ')}</span>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#C9962B]/15"><div className="h-full rounded-full bg-[#7A1F2B]" style={{ width: `${Math.max(2, (Number(row.amount) / expenseMax) * 100)}%` }} /></div>
                  <span className="tabular-nums font-medium text-gray-800">{formatMoney(row.amount)}</span>
                </div>
              ))}
              <p className="pt-1 text-[11px] text-gray-500">Total approved expenses: {formatMoney(totalApprovedExpenses)}</p>
            </div>
          ) : <p className="text-sm text-gray-500">No approved expense categories recorded yet.</p>}
        </SectionCard>

        <SectionCard title="Accounts and data source" description="Configured accounts and reporting basis">
          <div className="space-y-2">
            {accounts.length ? accounts.map((account: any) => (
              <div key={account.id} className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2 text-xs">
                <div className="min-w-0"><p className="truncate font-medium text-gray-800">{account.name}</p><p className="text-[10px] text-gray-500">{String(account.type).replaceAll('_', ' ')} · {account.status}</p></div>
                <span className="shrink-0 tabular-nums text-gray-500">{formatMoney(account.openingBalance)}</span>
              </div>
            )) : <p className="text-xs text-gray-500">No financial accounts configured.</p>}
          </div>
          <div className="mt-3 border-t border-gray-100 pt-3 text-[11px] leading-relaxed text-gray-500">
            <p className="flex items-start gap-1.5"><FileWarning className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Invoice paid/outstanding are derived from linked confirmed contributions. Pledges are commitments until confirmed contributions are recorded.</p>
            <p className="mt-1">Generated: {formatDate(data?.generatedAt)}</p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
