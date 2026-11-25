import { Injectable } from '@nestjs/common';
import { ExpenseStatus, InvoiceStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type MonthBucket = {
  month: string;
  label: string;
  income: number;
  expenses: number;
};

@Injectable()
export class FinanceDashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview(period?: string, from?: string, to?: string) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfSixMonthWindow = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const selectedPeriod = ['today', 'week', 'month', 'quarter', 'year', 'custom'].includes(String(period)) ? String(period) : 'month';
    let periodStart = new Date(startOfMonth);
    let periodEnd = new Date(startOfNextMonth);
    let periodLabel = 'This month';
    if (selectedPeriod === 'today') {
      periodStart = startOfToday;
      periodEnd = new Date(startOfToday); periodEnd.setDate(periodEnd.getDate() + 1);
      periodLabel = 'Today';
    } else if (selectedPeriod === 'week') {
      const day = startOfToday.getDay();
      const diff = (day + 6) % 7; // Monday start
      periodStart = new Date(startOfToday); periodStart.setDate(periodStart.getDate() - diff);
      periodEnd = new Date(periodStart); periodEnd.setDate(periodEnd.getDate() + 7);
      periodLabel = 'This week';
    } else if (selectedPeriod === 'quarter') {
      const q = Math.floor(now.getMonth() / 3) * 3;
      periodStart = new Date(now.getFullYear(), q, 1);
      periodEnd = new Date(now.getFullYear(), q + 3, 1);
      periodLabel = 'This quarter';
    } else if (selectedPeriod === 'year') {
      periodStart = new Date(now.getFullYear(), 0, 1);
      periodEnd = new Date(now.getFullYear() + 1, 0, 1);
      periodLabel = 'This year';
    } else if (selectedPeriod === 'custom') {
      const f = from ? new Date(from) : startOfMonth;
      const t = to ? new Date(to) : now;
      periodStart = new Date(f.getFullYear(), f.getMonth(), f.getDate());
      periodEnd = new Date(t.getFullYear(), t.getMonth(), t.getDate());
      periodEnd.setDate(periodEnd.getDate() + 1);
      if (isNaN(periodStart.getTime()) || isNaN(periodEnd.getTime()) || periodEnd <= periodStart) {
        periodStart = new Date(startOfMonth); periodEnd = new Date(startOfNextMonth);
      }
      periodLabel = 'Custom range';
    }

    const [
      confirmedIncome,
      monthIncome,
      lastMonthIncome,
      incomeByCategory,
      incomeByMethod,
      monthContributions,
      totalContributions,
      recordedExpenses,
      approvedExpenses,
      pendingExpenses,
      monthExpenses,
      lastMonthExpenses,
      periodIncomeAgg,
      periodExpenseAgg,
      expensesByStatus,
      expensesByCategory,
      pendingApprovals,
      pledgeTotals,
      pledgesByStatus,
      upcomingPledges,
      overduePledges,
      invoices,
      invoicePayments,
      activeCampaigns,
      ujenziCampaign,
      monthlyContributions,
      monthlyExpenses,
      recentContributions,
      recentExpenses,
      accounts,
      zakaMonth,
      sadakaAll,
    ] = await Promise.all([
      this.prisma.contribution.aggregate({ _sum: { amount: true }, where: { status: PaymentStatus.CONFIRMED } }),
      this.prisma.contribution.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.CONFIRMED, contributedAt: { gte: startOfMonth, lt: startOfNextMonth } },
      }),
      this.prisma.contribution.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.CONFIRMED, contributedAt: { gte: startOfLastMonth, lt: startOfMonth } },
      }),
      this.prisma.contribution.groupBy({
        by: ['category'],
        _sum: { amount: true },
        _count: { _all: true },
        where: { status: PaymentStatus.CONFIRMED },
        orderBy: { _sum: { amount: 'desc' } },
      }),
      this.prisma.contribution.groupBy({
        by: ['paymentMethod'],
        _sum: { amount: true },
        _count: { _all: true },
        where: { status: PaymentStatus.CONFIRMED },
        orderBy: { _sum: { amount: 'desc' } },
      }),
      this.prisma.contribution.count({ where: { status: PaymentStatus.CONFIRMED, contributedAt: { gte: startOfMonth, lt: startOfNextMonth } } }),
      this.prisma.contribution.count({ where: { status: PaymentStatus.CONFIRMED } }),
      this.prisma.expense.aggregate({ _sum: { amount: true }, _count: { _all: true } }),
      this.prisma.expense.aggregate({ _sum: { amount: true }, _count: { _all: true }, where: { status: ExpenseStatus.APPROVED } }),
      this.prisma.expense.aggregate({ _sum: { amount: true }, _count: { _all: true }, where: { status: ExpenseStatus.PENDING } }),
      this.prisma.expense.aggregate({
        _sum: { amount: true },
        where: { status: ExpenseStatus.APPROVED, date: { gte: startOfMonth, lt: startOfNextMonth } },
      }),
      this.prisma.expense.aggregate({
        _sum: { amount: true },
        where: { status: ExpenseStatus.APPROVED, date: { gte: startOfLastMonth, lt: startOfMonth } },
      }),
      this.prisma.contribution.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.CONFIRMED, contributedAt: { gte: periodStart, lt: periodEnd } },
      }),
      this.prisma.expense.aggregate({
        _sum: { amount: true },
        where: { status: ExpenseStatus.APPROVED, date: { gte: periodStart, lt: periodEnd } },
      }),
      this.prisma.expense.groupBy({ by: ['status'], _sum: { amount: true }, _count: { _all: true } }),
      this.prisma.expense.groupBy({
        by: ['category'],
        _sum: { amount: true },
        _count: { _all: true },
        where: { status: ExpenseStatus.APPROVED },
        orderBy: { _sum: { amount: 'desc' } },
      }),
      this.prisma.expense.findMany({
        where: { status: ExpenseStatus.PENDING },
        orderBy: { date: 'desc' },
        take: 6,
        include: { recordedBy: { select: { email: true } } },
      }),
      this.prisma.pledge.aggregate({ _sum: { amount: true }, _count: { _all: true } }),
      this.prisma.pledge.groupBy({ by: ['status'], _sum: { amount: true }, _count: { _all: true } }),
      this.prisma.pledge.findMany({
        where: { status: 'PENDING', targetDate: { gte: now } },
        orderBy: { targetDate: 'asc' },
        take: 5,
        include: { member: { select: { fullName: true } } },
      }),
      this.prisma.pledge.count({ where: { status: 'PENDING', targetDate: { lt: now } } }),
      this.prisma.invoice.findMany({
        orderBy: { issueDate: 'desc' },
        include: { member: { select: { fullName: true } } },
      }),
      this.prisma.contribution.groupBy({
        by: ['invoiceId'],
        _sum: { amount: true },
        where: { invoiceId: { not: null }, status: PaymentStatus.CONFIRMED },
      }),
      this.prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      this.prisma.campaign.findFirst({
        where: { OR: [{ category: 'UJENZI' }, { name: { contains: 'ujenzi', mode: 'insensitive' } }] },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contribution.findMany({
        where: { status: PaymentStatus.CONFIRMED, contributedAt: { gte: startOfSixMonthWindow } },
        select: { amount: true, contributedAt: true },
      }),
      this.prisma.expense.findMany({
        where: { status: ExpenseStatus.APPROVED, date: { gte: startOfSixMonthWindow } },
        select: { amount: true, date: true },
      }),
      this.prisma.contribution.findMany({
        orderBy: { contributedAt: 'desc' },
        take: 8,
        include: {
          member: { select: { fullName: true } },
          financialAccount: { select: { name: true } },
          invoice: { select: { invoiceNo: true } },
        },
      }),
      this.prisma.expense.findMany({
        orderBy: { date: 'desc' },
        take: 8,
        include: {
          financialAccount: { select: { name: true } },
          recordedBy: { select: { email: true } },
        },
      }),
      this.prisma.financialAccount.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.contribution.aggregate({
        _sum: { amount: true },
        where: { category: 'ZAKA', status: PaymentStatus.CONFIRMED, contributedAt: { gte: startOfMonth, lt: startOfNextMonth } },
      }),
      this.prisma.contribution.aggregate({
        _sum: { amount: true },
        where: { category: 'SADAKA', status: PaymentStatus.CONFIRMED },
      }),
    ]);

    const ujenziContributions = await this.prisma.contribution.aggregate({
      _sum: { amount: true },
      _count: { _all: true },
      where: ujenziCampaign
        ? {
            status: PaymentStatus.CONFIRMED,
            OR: [{ campaignId: ujenziCampaign.id }, { campaignId: null, category: 'UJENZI' }],
          }
        : { status: PaymentStatus.CONFIRMED, category: 'UJENZI' },
    });

    const totalIncome = Number(confirmedIncome._sum.amount || 0);
    const totalRecordedExpenses = Number(recordedExpenses._sum.amount || 0);
    const totalApprovedExpenses = Number(approvedExpenses._sum.amount || 0);
    const totalPendingExpenses = Number(pendingExpenses._sum.amount || 0);
    const currentMonthIncome = Number(monthIncome._sum.amount || 0);
    const previousMonthIncome = Number(lastMonthIncome._sum.amount || 0);
    const currentMonthExpenses = Number(monthExpenses._sum.amount || 0);
    const periodIncome = Number(periodIncomeAgg._sum.amount || 0);
    const periodExpenses = Number(periodExpenseAgg._sum.amount || 0);
    const periodNet = periodIncome - periodExpenses;
    const previousMonthExpenses = Number(lastMonthExpenses._sum.amount || 0);
    const openingBalance = accounts.reduce((sum, account) => sum + Number(account.openingBalance), 0);

    const invoicePaymentsByInvoice = new Map<string, number>();
    invoicePayments.forEach((row) => {
      if (row.invoiceId) invoicePaymentsByInvoice.set(row.invoiceId, Number(row._sum.amount || 0));
    });

    const invoiceStatusTotals = new Map<string, { count: number; amount: number }>();
    Object.values(InvoiceStatus).forEach((status) => invoiceStatusTotals.set(status, { count: 0, amount: 0 }));

    let totalInvoiced = 0;
    let totalInvoicePaid = 0;
    let totalInvoiceOutstanding = 0;
    let overdueInvoiceCount = 0;
    let overdueInvoiceAmount = 0;

    const invoiceRows = invoices.map((invoice) => {
      const total = Number(invoice.total);
      const paid = invoicePaymentsByInvoice.get(invoice.id) || 0;
      const outstanding = invoice.status === InvoiceStatus.CANCELLED ? 0 : Math.max(total - paid, 0);
      const overdue = Boolean(
        invoice.dueDate &&
          invoice.dueDate < now &&
          invoice.status !== InvoiceStatus.PAID &&
          invoice.status !== InvoiceStatus.CANCELLED,
      );

      totalInvoiced += total;
      totalInvoicePaid += paid;
      totalInvoiceOutstanding += outstanding;
      if (overdue) {
        overdueInvoiceCount += 1;
        overdueInvoiceAmount += outstanding;
      }

      const bucket = invoiceStatusTotals.get(invoice.status) || { count: 0, amount: 0 };
      bucket.count += 1;
      bucket.amount += total;
      invoiceStatusTotals.set(invoice.status, bucket);

      return {
        id: invoice.id,
        invoiceNo: invoice.invoiceNo,
        status: invoice.status,
        recipientName: invoice.recipientName,
        memberName: invoice.member?.fullName || null,
        total,
        paid,
        outstanding,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        overdue,
      };
    });

    const monthBuckets: MonthBucket[] = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return {
        month,
        label: date.toLocaleDateString('en-US', { month: 'short' }),
        income: 0,
        expenses: 0,
      };
    });
    const monthBucketMap = new Map(monthBuckets.map((bucket) => [bucket.month, bucket]));

    monthlyContributions.forEach((contribution) => {
      const date = contribution.contributedAt;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const bucket = monthBucketMap.get(key);
      if (bucket) bucket.income += Number(contribution.amount);
    });

    monthlyExpenses.forEach((expense) => {
      const date = expense.date;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const bucket = monthBucketMap.get(key);
      if (bucket) bucket.expenses += Number(expense.amount);
    });

    const expenseStatusTotals = new Map<string, { count: number; amount: number }>();
    Object.values(ExpenseStatus).forEach((status) => expenseStatusTotals.set(status, { count: 0, amount: 0 }));
    expensesByStatus.forEach((row) => {
      expenseStatusTotals.set(row.status, {
        count: row._count._all,
        amount: Number(row._sum.amount || 0),
      });
    });

    const pledgePending = pledgeTotals._count._all > 0
      ? pledgesByStatus
          .filter((row) => row.status === 'PENDING')
          .reduce((sum, row) => sum + Number(row._sum.amount || 0), 0)
      : 0;

    const ujenziRaised = Number(ujenziContributions._sum.amount || 0);
    const ujenziTarget = Number(ujenziCampaign?.targetAmount || 0);

    const recentTransactions = [
      ...recentContributions.map((contribution) => ({
        id: contribution.id,
        type: 'CONTRIBUTION' as const,
        date: contribution.contributedAt,
        description: `${contribution.category} contribution`,
        category: contribution.category,
        amount: Number(contribution.amount),
        direction: 'IN' as const,
        status: contribution.status,
        reference: contribution.receiptNo,
        party: contribution.member?.fullName || 'External / anonymous',
        account: contribution.financialAccount?.name || null,
        invoiceNo: contribution.invoice?.invoiceNo || null,
      })),
      ...recentExpenses.map((expense) => ({
        id: expense.id,
        type: 'EXPENSE' as const,
        date: expense.date,
        description: expense.description,
        category: expense.category,
        amount: Number(expense.amount),
        direction: 'OUT' as const,
        status: expense.status,
        reference: null,
        party: expense.recordedBy?.email || 'Church expense',
        account: expense.financialAccount?.name || null,
        invoiceNo: null,
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);

    const kpis = {
        confirmedIncome: { label: 'Confirmed Income', value: totalIncome, state: totalContributions > 0 ? 'ok' : 'zero', basis: 'CONFIRMED_CONTRIBUTIONS', period: 'lifetime' },
        expensesPaid: { label: 'Expenses Paid', value: totalApprovedExpenses, state: approvedExpenses._count._all > 0 ? 'ok' : 'zero', basis: 'APPROVED_EXPENSES', period: 'lifetime', note: 'Based on approved expense records; disbursement/payment status is not separately tracked.' },
        availableBalance: { label: 'Available Balance', value: openingBalance + totalIncome - totalApprovedExpenses, state: 'ok', basis: 'OPENING_PLUS_CONFIRMED_INCOME_MINUS_APPROVED_EXPENSES', period: 'current', note: 'Calculated from recorded account opening balances, confirmed income, and approved expenses. Not a reconciled bank balance.' },
        outstandingInvoices: { label: 'Outstanding Invoices', value: totalInvoiceOutstanding, state: invoices.length > 0 ? 'ok' : 'zero', basis: 'INVOICE_TOTAL_MINUS_CONFIRMED_LINKED_PAYMENTS', period: 'current' },
        outstandingPledges: { label: 'Outstanding Pledges', value: pledgePending, state: pledgeTotals._count._all > 0 ? 'ok' : 'zero', basis: 'PENDING_PLEDGE_AMOUNT', period: 'current', note: 'Pending pledge commitments; not counted as income until confirmed contributions are recorded.' },
        pendingApprovals: { label: 'Pending Approvals', value: pendingExpenses._count._all, state: pendingExpenses._count._all > 0 ? 'warning' : 'ok', basis: 'PENDING_EXPENSE_COUNT', period: 'current', amount: totalPendingExpenses },
        incomeThisPeriod: { label: `Income (${periodLabel})`, value: periodIncome, state: periodIncome > 0 ? 'ok' : 'zero', basis: 'CONFIRMED_CONTRIBUTIONS_IN_PERIOD', period: selectedPeriod, periodLabel, from: periodStart.toISOString(), to: periodEnd.toISOString() },
        netThisPeriod: { label: `Net (${periodLabel})`, value: periodNet, state: (periodIncome > 0 || periodExpenses > 0) ? 'ok' : 'zero', basis: 'PERIOD_CONFIRMED_INCOME_MINUS_APPROVED_EXPENSES', period: selectedPeriod, periodLabel, from: periodStart.toISOString(), to: periodEnd.toISOString(), income: periodIncome, expenses: periodExpenses },
      };

    return {
      generatedAt: now.toISOString(),
      period: { selected: selectedPeriod, label: periodLabel, from: periodStart.toISOString(), to: periodEnd.toISOString() },
      kpis,
      financialStats: {
        confirmedIncome: totalIncome,
        approvedExpenses: totalApprovedExpenses,
        pendingExpenses: totalPendingExpenses,
        recordedExpenses: totalRecordedExpenses,
        netPosition: totalIncome - totalApprovedExpenses,
        cashPosition: openingBalance + totalIncome - totalApprovedExpenses,
        openingBalance,
        invoicesOutstanding: totalInvoiceOutstanding,
        pendingApprovals: pendingExpenses._count._all,
        activeCampaigns,
        totalPledges: Number(pledgeTotals._sum.amount || 0),
        monthIncome: currentMonthIncome,
        monthExpenses: currentMonthExpenses,
        monthNet: currentMonthIncome - currentMonthExpenses,
        incomeChangePercent:
          previousMonthIncome > 0
            ? Number((((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100).toFixed(1))
            : null,
      },
      monthlyTrend: monthBuckets,
      contributions: {
        total: totalIncome,
        count: totalContributions,
        monthTotal: currentMonthIncome,
        monthCount: monthContributions,
        lastMonthTotal: previousMonthIncome,
        byCategory: incomeByCategory.map((row) => ({
          category: row.category,
          amount: Number(row._sum.amount || 0),
          count: row._count._all,
        })),
        byMethod: incomeByMethod.map((row) => ({
          method: row.paymentMethod || 'Unspecified',
          amount: Number(row._sum.amount || 0),
          count: row._count._all,
        })),
      },
      expenses: {
        total: totalRecordedExpenses,
        approvedTotal: totalApprovedExpenses,
        pendingTotal: totalPendingExpenses,
        periodApprovedTotal: periodExpenses,
        periodNet,
        byStatus: Array.from(expenseStatusTotals.entries()).map(([status, value]) => ({
          status,
          count: value.count,
          amount: value.amount,
        })),
        byCategory: expensesByCategory.map((row) => ({
          category: row.category,
          amount: Number(row._sum.amount || 0),
          count: row._count._all,
        })),
        pendingApprovals: pendingApprovals.map((expense) => ({
          id: expense.id,
          description: expense.description,
          category: expense.category,
          amount: Number(expense.amount),
          date: expense.date,
          recordedBy: expense.recordedBy?.email || null,
        })),
      },
      invoices: {
        totalInvoiced,
        totalPaid: totalInvoicePaid,
        totalOutstanding: totalInvoiceOutstanding,
        overdueCount: overdueInvoiceCount,
        overdueAmount: overdueInvoiceAmount,
        byStatus: Array.from(invoiceStatusTotals.entries()).map(([status, value]) => ({
          status,
          count: value.count,
          amount: value.amount,
        })),
        recent: invoiceRows.slice(0, 6),
      },
      pledges: {
        total: Number(pledgeTotals._sum.amount || 0),
        count: pledgeTotals._count._all,
        pending: pledgePending,
        overdueCount: overduePledges,
        byStatus: pledgesByStatus.map((row) => ({
          status: row.status,
          amount: Number(row._sum.amount || 0),
          count: row._count._all,
        })),
        upcoming: upcomingPledges.map((pledge) => ({
          id: pledge.id,
          memberName: pledge.member.fullName,
          amount: Number(pledge.amount),
          targetDate: pledge.targetDate,
          status: pledge.status,
        })),
      },
      ujenzi: {
        campaignId: ujenziCampaign?.id || null,
        name: ujenziCampaign?.name || 'Ujenzi',
        raised: ujenziRaised,
        target: ujenziTarget,
        progressPercent: ujenziTarget > 0 ? Math.min(100, Math.round((ujenziRaised / ujenziTarget) * 100)) : null,
        count: ujenziContributions._count._all,
        status: ujenziCampaign?.status || 'ACTIVE',
      },
      recentTransactions,
      accounts: accounts.map((account) => ({
        id: account.id,
        name: account.name,
        type: account.type,
        status: account.status,
        openingBalance: Number(account.openingBalance),
      })),
      // Older fields retained for existing consumers.
      zakaThisMonth: Number(zakaMonth._sum.amount || 0),
      totalSadaka: Number(sadakaAll._sum.amount || 0),
      totalExpenses: totalRecordedExpenses,
      totalPledges: Number(pledgeTotals._sum.amount || 0),
      totalIncome,
      incomeByCategory: incomeByCategory.map((row) => ({
        category: row.category,
        amount: Number(row._sum.amount || 0),
      })),
      expensesByCategory: expensesByCategory.map((row) => ({
        category: row.category,
        amount: Number(row._sum.amount || 0),
      })),
    };
  }
}
