import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OversightService {
  constructor(private prisma: PrismaService) {}

  private now = () => new Date();
  private startOfMonth(d = new Date()) { return new Date(d.getFullYear(), d.getMonth(), 1); }
  private startOfLastMonth(d = new Date()) { return new Date(d.getFullYear(), d.getMonth()-1, 1); }
  private endOfLastMonth(d = new Date()) { return new Date(d.getFullYear(), d.getMonth(), 0, 23,59,59,999); }
  private daysAgo(n: number) { const d=new Date(); d.setDate(d.getDate()-n); return d; }

  async dashboard(period?: string) {
    const now = this.now();
    const monthStart = this.startOfMonth(now);
    const [
      totalMembers, activeMembers, inactiveMembers, newMembersMonth, pendingRegs,
      totalAdminUsers, activeAdminAccounts,
      totalDepts, activeDepts, deptsNoLeader,
      totalFellowships, upcomingMeetings, overdueTasks, pendingFollowups,
      incomeAgg, expenseAgg, pledgeAgg, incomeByCategory, expenseByCategory, incomeMonthly, expenseMonthly, budgets, projects,
      backupLast, backupFailed, loginSuccess, loginFailed,
      attendanceThisSunday, avgAttendance, attendanceRecent, attendancePrev,
      dbOk
    ] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.member.count({ where: { membershipStatus: 'APPROVED' as any } }),
      this.prisma.member.count({ where: { membershipStatus: { in: ['INACTIVE','REJECTED'] as any } } }),
      this.prisma.member.count({ where: { createdAt: { gte: monthStart } } }),
      this.prisma.member.count({ where: { membershipStatus: { in: ['PENDING','PENDING_REVIEW'] as any } } }),
      this.prisma.user.count({ where: { roles: { some: { role: { name: { not: 'CHURCH_MEMBER' } } } } } }),
      this.prisma.user.count({ where: { status: 'ACTIVE', roles: { some: { role: { name: { not: 'CHURCH_MEMBER' } } } } } }),
      this.prisma.department.count(),
      this.prisma.department.count({ where: { status: 'ACTIVE' } }),
      this.prisma.department.count({ where: { OR: [{ headName: null }, { headName: '' }] } }),
      this.prisma.fellowship.count(),
      this.prisma.meeting.count({ where: { startsAt: { gte: now } } }),
      this.prisma.task.count({ where: { dueDate: { lt: now }, status: { notIn: ['DONE','COMPLETED','CANCELLED'] } } }).catch(()=>0),
      this.prisma.followupCase.count({ where: { status: { in: ['OPEN','PENDING','IN_PROGRESS'] } } }).catch(()=>0),
      this.prisma.contribution.aggregate({ _sum: { amount: true }, where: { status: 'CONFIRMED' as any } }),
      this.prisma.expense.aggregate({ _sum: { amount: true } }),
      this.prisma.pledge.aggregate({ _sum: { amount: true }, _count: true }),
      this.prisma.contribution.groupBy({ by: ['category'], _sum: { amount: true }, where: { status: 'CONFIRMED' as any } }),
      this.prisma.expense.groupBy({ by: ['category'], _sum: { amount: true } }),
      this.prisma.$queryRaw`SELECT to_char(date_trunc('month', "contributedAt"), 'YYYY-MM') as month, COALESCE(SUM(amount),0)::float as amount FROM "Contribution" WHERE status='CONFIRMED' GROUP BY 1 ORDER BY 1 DESC LIMIT 6` as any,
      this.prisma.$queryRaw`SELECT to_char(date_trunc('month', "date"), 'YYYY-MM') as month, COALESCE(SUM(amount),0)::float as amount FROM "Expense" GROUP BY 1 ORDER BY 1 DESC LIMIT 6` as any,
      this.prisma.budget.findMany().catch(()=>[]),
      this.prisma.project.findMany().catch(()=>[]),
      this.prisma.backupLog.findFirst({ where: { status: 'SUCCESS' }, orderBy: { createdAt: 'desc' } }).catch(()=>null),
      this.prisma.backupLog.count({ where: { status: 'FAILED' } }).catch(()=>0),
      this.prisma.auditLog.count({ where: { action: 'LOGIN' } }),
      this.prisma.auditLog.count({ where: { action: { contains: 'LOGIN_FAILED' } } }).catch(()=>0),
      this.sundayAttendanceCount(),
      this.averageAttendance(),
      this.prisma.attendance.count({ where: { createdAt: { gte: this.daysAgo(30) } } }).catch(()=>0),
      this.prisma.attendance.count({ where: { createdAt: { gte: this.daysAgo(60), lt: this.daysAgo(30) } } }).catch(()=>0),
      this.prisma.$queryRaw`SELECT 1`.then(()=>true).catch(()=>false),
    ]);
    const confirmedIncome = Number(incomeAgg._sum.amount||0);
    const paidExpenses = Number(expenseAgg._sum.amount||0);
    const budgetTotal = (budgets as any[]).reduce((s,b)=>s+Number(b.amount||0),0);
    const budgetUsedPct = budgetTotal>0 ? Math.round((paidExpenses/budgetTotal)*100) : null;
    return {
      churchOverview: {
        totalMembers, activeMembers, inactiveMembers, newMembersThisMonth: newMembersMonth,
        pendingRegistrations: pendingRegs, attendanceThisSunday, averageAttendance: avgAttendance,
        membershipGrowth: { thisMonth: newMembersMonth, note: 'New member records created this month (from DB)' }
      },
      staffOperations: {
        totalAdministrativeUsers: totalAdminUsers, activeAdministrativeAccounts: activeAdminAccounts,
        totalDepartments: totalDepts, activeDepartments: activeDepts, departmentsWithoutLeaders: deptsNoLeader,
        totalFellowships, upcomingMeetings, overdueTasks, pendingFollowups
      },
      financialOversight: {
        readOnly: true,
        confirmedIncome, paidExpenses, netCashMovement: confirmedIncome - paidExpenses,
        outstandingPledges: Number(pledgeAgg._sum.amount||0), // pledges are commitments, shown separately not as income
        incomeByCategory: incomeByCategory.map((r:any)=>({category:r.category, amount:Number(r._sum.amount||0)})),
        monthlyIncomeTrend: (incomeMonthly as any[]).reverse(),
        monthlyExpenseTrend: (expenseMonthly as any[]).reverse(),
        budgetUtilization: budgetTotal>0 ? { budgetTotal, paidExpenses, utilizationPercent: budgetUsedPct } : { note: 'No budgets recorded', budgetTotal: 0 },
        pendingFinancialApprovals: 0, // no approval workflow in schema
        financialReconciliationStatus: 'Not configured (no reconciliation ledger in current schema)',
        note: 'Pledges are not counted as received income. Expenses shown are recorded expenses (paid/expenditure records).'
      },
      systemHealth: {
        databaseConnectivity: dbOk ? 'connected' : 'error',
        backendApiStatus: 'running',
        frontendAvailability: 'served separately (check public routes)',
        serverUptimeSeconds: Math.floor(process.uptime()),
        lastSuccessfulBackup: backupLast?.createdAt || null,
        failedBackups: backupFailed,
        failedBackgroundJobs: 0,
        failedLoginAttempts: loginFailed,
        recentSecurityAlerts: loginFailed > 0 ? ['Failed login attempts detected in audit logs'] : [],
        recentAuditEntries: await this.prisma.auditLog.count({ where: { createdAt: { gte: this.daysAgo(7) } } }),
      },
      meta: { generatedAt: now.toISOString(), source: 'live-database' }
    };
  }

  private async sundayAttendanceCount() {
    const now = new Date(); const day = now.getDay(); const diff = day === 0 ? 0 : day; // last Sunday
    const sunday = new Date(now); sunday.setDate(now.getDate()-diff); sunday.setHours(0,0,0,0);
    const monday = new Date(sunday); monday.setDate(sunday.getDate()+1);
    return this.prisma.attendance.count({ where: { createdAt: { gte: sunday, lt: monday }, status: 'PRESENT' } }).catch(()=>0);
  }
  private async averageAttendance() {
    const rows: any[] = await this.prisma.$queryRaw`SELECT "meetingId", COUNT(*)::int as c FROM "Attendance" WHERE status='PRESENT' GROUP BY "meetingId"` as any;
    if (!rows.length) return 0; return Math.round(rows.reduce((s,r)=>s+Number(r.c||0),0)/rows.length);
  }

  private metric(
    value: number | null | undefined,
    options: { hint?: string; unavailableReason?: string; source?: string } = {},
  ) {
    const asOf = this.now().toISOString();
    const source = options.source || 'live-database';
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return {
        value: null,
        state: 'unavailable' as const,
        asOf,
        source,
        ...(options.unavailableReason ? { unavailableReason: options.unavailableReason } : {}),
        ...(options.hint ? { hint: options.hint } : {}),
      };
    }
    const numeric = Number(value);
    return {
      value: numeric,
      state: numeric === 0 ? ('zero' as const) : ('ok' as const),
      asOf,
      source,
      ...(options.hint ? { hint: options.hint } : {}),
    };
  }

  private async lastSundayAttendanceSummary() {
    try {
      const rows: any[] = await this.prisma.$queryRaw`
        SELECT
          COUNT(a.id)::int AS "attendanceCount",
          COUNT(DISTINCT m.id)::int AS "meetingCount"
        FROM "Meeting" m
        LEFT JOIN "Attendance" a ON a."meetingId" = m.id AND a.status = 'PRESENT'
        WHERE (m."startsAt" AT TIME ZONE 'Africa/Dar_es_Salaam')::date =
          ((now() AT TIME ZONE 'Africa/Dar_es_Salaam')::date
            - EXTRACT(DOW FROM (now() AT TIME ZONE 'Africa/Dar_es_Salaam'))::int)
      ` as any;
      return {
        attendanceCount: Number(rows?.[0]?.attendanceCount ?? 0),
        meetingCount: Number(rows?.[0]?.meetingCount ?? 0),
      };
    } catch {
      return { attendanceCount: null, meetingCount: null };
    }
  }

  async churchDashboard() {
    const now = this.now();
    const base = await this.dashboard();
    const [
      memberStatusRows,
      userTotal,
      userActive,
      userSuspended,
      activeSessions,
      taskStatusRows,
      followupTotal,
      followupOverdue,
      websitePages,
      websitePublishedPages,
      websiteAnnouncements,
      websiteEvents,
      websiteSermons,
      websiteMedia,
      recentAudit,
      meetings30d,
      attendanceRecords30d,
      attendanceMeetingCount,
      projectTotal,
      projectActive,
      projectDelayed,
      budgetAgg,
      lastSunday,
    ] = await Promise.all([
      this.prisma.member.groupBy({ by: ['membershipStatus'], _count: { _all: true } }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.refreshToken.count({ where: { revokedAt: null, expiresAt: { gt: now } } }),
      this.prisma.task.groupBy({ by: ['status'], _count: { _all: true } }).catch(() => []),
      this.prisma.followupCase.count().catch(() => 0),
      this.prisma.followupCase.count({ where: { dueDate: { lt: now }, status: { in: ['OPEN', 'PENDING', 'IN_PROGRESS'] } } }).catch(() => 0),
      this.prisma.page.count(),
      this.prisma.page.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.announcement.count(),
      this.prisma.event.count(),
      this.prisma.sermon.count(),
      this.prisma.media.count(),
      this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { actor: { select: { email: true } } } }),
      this.prisma.meeting.count({ where: { startsAt: { gte: this.daysAgo(30) } } }).catch(() => 0),
      this.prisma.attendance.count({ where: { meeting: { startsAt: { gte: this.daysAgo(30) } } } }).catch(() => 0),
      this.prisma.attendance.groupBy({ by: ['meetingId'], _count: { _all: true } }).then((r) => r.length).catch(() => 0),
      this.prisma.project.count().catch(() => 0),
      this.prisma.project.count({ where: { status: 'ACTIVE' } }).catch(() => 0),
      this.prisma.project.count({ where: { status: { in: ['DELAYED', 'ON_HOLD'] } } }).catch(() => 0),
      this.prisma.budget.aggregate({ _sum: { amount: true } }).catch(() => ({ _sum: { amount: 0 } })),
      this.lastSundayAttendanceSummary(),
    ]);

    const overview = base.churchOverview as any;
    const org = base.staffOperations as any;
    const finance = base.financialOversight as any;
    const system = base.systemHealth as any;
    const budgetTotal = Number((budgetAgg as any)?._sum?.amount || 0);
    const expenseTotal = Number(finance.paidExpenses || 0);
    const taskTotal = (taskStatusRows as any[]).reduce((sum, row) => sum + Number(row._count?._all || 0), 0);
    const taskCompleted = (taskStatusRows as any[])
      .filter((row) => ['DONE', 'COMPLETED'].includes(String(row.status).toUpperCase()))
      .reduce((sum, row) => sum + Number(row._count?._all || 0), 0);
    const taskOpen = Math.max(0, taskTotal - taskCompleted - (taskStatusRows as any[])
      .filter((row) => String(row.status).toUpperCase() === 'CANCELLED')
      .reduce((sum, row) => sum + Number(row._count?._all || 0), 0));
    const membershipTotal = Number(overview.totalMembers || 0);
    const approvedMembers = Number(overview.activeMembers || 0);
    const lastSundayMetric = lastSunday.meetingCount === null
      ? this.metric(null, { unavailableReason: 'Attendance could not be calculated from meeting records.' })
      : lastSunday.meetingCount === 0
        ? this.metric(null, { unavailableReason: 'No meeting is recorded for last Sunday.' })
        : this.metric(lastSunday.attendanceCount, { hint: `Across ${lastSunday.meetingCount} meeting(s) recorded last Sunday.` });
    const averageAttendanceMetric = attendanceMeetingCount === 0
      ? this.metric(null, { unavailableReason: 'No attendance records have been captured yet.' })
      : this.metric(overview.averageAttendance, { hint: `Averaged across ${attendanceMeetingCount} meeting(s) with attendance records.` });
    const budgetUtilizationMetric = budgetTotal > 0
      ? this.metric(finance.budgetUtilization?.utilizationPercent ?? null, { hint: 'Recorded expenses as a share of total recorded budgets.' })
      : this.metric(null, { unavailableReason: 'No budgets have been recorded, so utilization cannot be calculated.' });

    const metrics = {
      totalMembers: this.metric(membershipTotal, { hint: 'All member records, including pending applications.' }),
      approvedMembers: this.metric(approvedMembers, { hint: 'Members with APPROVED membership status.' }),
      pendingRegistrations: this.metric(overview.pendingRegistrations, { hint: 'PENDING or PENDING_REVIEW applications.' }),
      newMembersThisMonth: this.metric(overview.newMembersThisMonth, { hint: 'Member records created since the start of this month.' }),
      totalDepartments: this.metric(org.totalDepartments),
      activeDepartments: this.metric(org.activeDepartments),
      departmentsWithoutLeaders: this.metric(org.departmentsWithoutLeaders, { hint: 'Departments with no head recorded.' }),
      totalFellowships: this.metric(org.totalFellowships),
      upcomingMeetings: this.metric(org.upcomingMeetings, { hint: 'Meetings with a start time in the future.' }),
      lastSundayAttendance: lastSundayMetric,
      averageAttendancePerMeeting: averageAttendanceMetric,
      meetingsLast30Days: this.metric(meetings30d),
      attendanceRecordsLast30Days: this.metric(attendanceRecords30d),
      openFollowups: this.metric(org.pendingFollowups, { hint: 'OPEN, PENDING or IN_PROGRESS follow-up cases.' }),
      overdueFollowups: this.metric(followupOverdue, { hint: 'Open follow-up cases past their due date.' }),
      totalFollowups: this.metric(followupTotal),
      overdueTasks: this.metric(org.overdueTasks, { hint: 'Tasks past due that are not done, completed or cancelled.' }),
      openTasks: this.metric(taskOpen),
      completedTasks: this.metric(taskCompleted),
      activeProjects: this.metric(projectActive),
      delayedProjects: this.metric(projectDelayed),
      confirmedIncome: this.metric(finance.confirmedIncome, { hint: 'Confirmed contributions recorded in the database.' }),
      recordedExpenses: this.metric(expenseTotal, { hint: 'All expense records currently in the database.' }),
      netRecordedMovement: this.metric(finance.netCashMovement, { hint: 'Confirmed income minus recorded expenses. This is not a bank balance.' }),
      outstandingPledges: this.metric(finance.outstandingPledges, { hint: 'Pledge commitments, not counted as received income.' }),
      budgetTotal: this.metric(budgetTotal),
      budgetUtilizationPercent: budgetUtilizationMetric,
      totalUsers: this.metric(userTotal),
      activeUsers: this.metric(userActive),
      suspendedUsers: this.metric(userSuspended),
      activeSessions: this.metric(activeSessions, { hint: 'Non-revoked refresh-token sessions that have not expired.' }),
      auditEntriesLast7Days: this.metric(system.recentAuditEntries),
      failedLoginAttempts: this.metric(system.failedLoginAttempts),
      failedBackups: this.metric(system.failedBackups),
      websitePages: this.metric(websitePages),
      publishedWebsitePages: this.metric(websitePublishedPages),
      websiteAnnouncements: this.metric(websiteAnnouncements),
      websiteEvents: this.metric(websiteEvents),
      websiteSermons: this.metric(websiteSermons),
      websiteMedia: this.metric(websiteMedia),
    };

    const alerts: any[] = [];
    if (Number(org.overdueTasks || 0) > 0) alerts.push({ id: 'overdue-tasks', severity: 'high', title: `${org.overdueTasks} overdue task(s)`, description: 'Tasks are past their due date and still open.', href: '/admin/reports/tasks' });
    if (followupOverdue > 0) alerts.push({ id: 'overdue-followups', severity: 'high', title: `${followupOverdue} overdue follow-up(s)`, description: 'Follow-up cases are past their due date.', href: '/admin/reports/followups' });
    if (Number(org.departmentsWithoutLeaders || 0) > 0) alerts.push({ id: 'departments-without-leaders', severity: 'medium', title: `${org.departmentsWithoutLeaders} department(s) without a leader`, description: 'A department head has not been recorded.', href: '/admin/reports/departments' });
    if (Number(overview.pendingRegistrations || 0) > 0) alerts.push({ id: 'pending-registrations', severity: 'medium', title: `${overview.pendingRegistrations} registration(s) awaiting review`, description: 'Applications are waiting for a membership decision.', href: '/admin/reports/registrations' });
    if (Number(system.failedBackups || 0) > 0) alerts.push({ id: 'failed-backups', severity: 'high', title: `${system.failedBackups} failed backup attempt(s)`, description: 'Backup history contains failed runs.', href: '/admin/system-health' });
    if (Number(system.failedLoginAttempts || 0) > 0) alerts.push({ id: 'failed-logins', severity: 'low', title: `${system.failedLoginAttempts} failed login attempt(s)`, description: 'Review access history for unusual activity.', href: '/admin/audit-logs' });

    return {
      generatedAt: now.toISOString(),
      overview: {
        totalMembers: metrics.totalMembers,
        approvedMembers: metrics.approvedMembers,
        pendingRegistrations: metrics.pendingRegistrations,
        newMembersThisMonth: metrics.newMembersThisMonth,
        lastSundayAttendance: metrics.lastSundayAttendance,
        netRecordedMovement: metrics.netRecordedMovement,
      },
      membership: {
        byStatus: (memberStatusRows as any[]).map((row) => ({ status: row.membershipStatus, count: Number(row._count?._all || 0) })),
        total: metrics.totalMembers,
        approved: metrics.approvedMembers,
        pending: metrics.pendingRegistrations,
        newThisMonth: metrics.newMembersThisMonth,
        approvedRate: membershipTotal > 0 ? this.metric(Math.round((approvedMembers / membershipTotal) * 100), { hint: 'Approved members as a share of all member records.' }) : this.metric(null, { unavailableReason: 'No member records exist yet.' }),
      },
      organization: {
        totalDepartments: metrics.totalDepartments,
        activeDepartments: metrics.activeDepartments,
        departmentsWithoutLeaders: metrics.departmentsWithoutLeaders,
        totalFellowships: metrics.totalFellowships,
        upcomingMeetings: metrics.upcomingMeetings,
      },
      attendance: {
        lastSunday: metrics.lastSundayAttendance,
        averagePerMeeting: metrics.averageAttendancePerMeeting,
        meetingsLast30Days: metrics.meetingsLast30Days,
        recordsLast30Days: metrics.attendanceRecordsLast30Days,
      },
      followup: {
        total: metrics.totalFollowups,
        open: metrics.openFollowups,
        overdue: metrics.overdueFollowups,
      },
      tasks: {
        open: metrics.openTasks,
        completed: metrics.completedTasks,
        overdue: metrics.overdueTasks,
      },
      projects: {
        total: this.metric(projectTotal),
        active: metrics.activeProjects,
        delayed: metrics.delayedProjects,
      },
      finance: {
        readOnly: true,
        confirmedIncome: metrics.confirmedIncome,
        recordedExpenses: metrics.recordedExpenses,
        netRecordedMovement: metrics.netRecordedMovement,
        outstandingPledges: metrics.outstandingPledges,
        budgetTotal: metrics.budgetTotal,
        budgetUtilizationPercent: metrics.budgetUtilizationPercent,
        pendingExpenseApprovals: this.metric(null, { unavailableReason: 'The current schema has no expense approval or status workflow.' }),
        availableBalance: this.metric(null, { unavailableReason: 'No reconciled cash or bank balance is recorded in the current schema.' }),
        expenseApprovalStatus: 'not_modeled',
        incomeByCategory: finance.incomeByCategory,
        note: 'Figures are read-only oversight totals. Recorded expenses are all expense records; they are not an approved-expense total. Net recorded movement is not a bank balance.',
      },
      website: {
        pages: metrics.websitePages,
        publishedPages: metrics.publishedWebsitePages,
        announcements: metrics.websiteAnnouncements,
        events: metrics.websiteEvents,
        sermons: metrics.websiteSermons,
        media: metrics.websiteMedia,
      },
      system: {
        totalUsers: metrics.totalUsers,
        activeUsers: metrics.activeUsers,
        suspendedUsers: metrics.suspendedUsers,
        activeSessions: metrics.activeSessions,
        auditEntriesLast7Days: metrics.auditEntriesLast7Days,
        failedLoginAttempts: metrics.failedLoginAttempts,
        failedBackups: metrics.failedBackups,
        databaseConnectivity: system.databaseConnectivity,
        backendApiStatus: system.backendApiStatus,
        uptimeSeconds: system.serverUptimeSeconds,
        lastSuccessfulBackup: system.lastSuccessfulBackup,
      },
      alerts,
      recentAudit: (recentAudit as any[]).map((entry) => ({
        id: entry.id,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        actorEmail: entry.actor?.email || null,
        createdAt: entry.createdAt,
      })),
      meta: {
        generatedAt: now.toISOString(),
        source: 'live-database',
        schemaNotes: [
          'Expense records have no approval status, so pending/approved/rejected totals are unavailable.',
          'No reconciled cash or bank balance exists in the current schema.',
          'Department and fellowship membership links are not modelled, so member breakdowns are not shown.',
        ],
      },
    };
  }

  async insights() {
    const now = this.now();
    const [deptsNoLeader, overdueTasks, pendingFollowups, failedBackups, failedLogins, recentMembersNoFollow, attendanceRecent, attendancePrev, declinedProjects] = await Promise.all([
      this.prisma.department.findMany({ where: { OR:[{headName:null},{headName:''}] } }),
      this.prisma.task.findMany({ where: { dueDate: { lt: now }, status: { notIn: ['DONE','COMPLETED','CANCELLED'] } }, take: 20 }).catch(()=>[]),
      this.prisma.followupCase.count({ where: { status: { in: ['OPEN','PENDING'] } } }).catch(()=>0),
      this.prisma.backupLog.findMany({ where: { status: 'FAILED' }, orderBy: { createdAt: 'desc' }, take: 5 }).catch(()=>[]),
      this.prisma.auditLog.count({ where: { action: { contains: 'LOGIN_FAILED' } } }).catch(()=>0),
      this.prisma.member.count({ where: { membershipStatus: 'APPROVED' as any, createdAt: { gte: this.daysAgo(30) }, followups: { none: {} } } }).catch(()=>0),
      this.prisma.attendance.count({ where: { createdAt: { gte: this.daysAgo(30) } } }).catch(()=>0),
      this.prisma.attendance.count({ where: { createdAt: { gte: this.daysAgo(60), lt: this.daysAgo(30) } } }).catch(()=>0),
      this.prisma.project.findMany({ where: { status: { in: ['DELAYED','ON_HOLD'] } } }).catch(()=>[]),
    ]);
    const insights: any[] = [];
    if (attendancePrev > 0 && attendanceRecent < attendancePrev) insights.push({ title:'Attendance trend declining', description:`Attendance records last 30 days (${attendanceRecent}) are lower than previous 30 days (${attendancePrev}).`, severity:'medium', dateDetected: now.toISOString(), sourceModule:'Attendance', relatedRecord:`recent=${attendanceRecent}, previous=${attendancePrev}`, recommendedResponsibleRole:'Attendance Officers / Department Leaders' });
    if (deptsNoLeader.length) insights.push({ title:'Departments without leaders', description:`${deptsNoLeader.length} department(s) have no leader assigned.`, severity:'medium', dateDetected: now.toISOString(), sourceModule:'Departments', relatedRecord: deptsNoLeader.map(d=>d.name).join(', '), recommendedResponsibleRole:'System Administrator / Church Leadership' });
    if ((overdueTasks as any[]).length) insights.push({ title:'Overdue tasks', description:`${(overdueTasks as any[]).length} task(s) are past due and not completed.`, severity:'high', dateDetected: now.toISOString(), sourceModule:'Tasks', relatedRecord:(overdueTasks as any[]).slice(0,5).map(t=>t.title).join('; '), recommendedResponsibleRole:'Task assignees / Department Leaders' });
    if (recentMembersNoFollow > 0) insights.push({ title:'New members without follow-up', description:`${recentMembersNoFollow} recently approved member(s) (last 30 days) have no follow-up case recorded.`, severity:'medium', dateDetected: now.toISOString(), sourceModule:'Follow-up / Membership', relatedRecord:`count=${recentMembersNoFollow}`, recommendedResponsibleRole:'Follow-up team / Church Secretary' });
    if (failedBackups.length) insights.push({ title:'Failed backups detected', description:`${failedBackups.length} recent backup attempt(s) failed.`, severity:'high', dateDetected: now.toISOString(), sourceModule:'System / Backup', relatedRecord: failedBackups.map(b=>b.createdAt).join(', '), recommendedResponsibleRole:'System Administrator' });
    if (failedLogins > 0) insights.push({ title:'Failed login attempts recorded', description:`${failedLogins} failed login audit entries detected.`, severity:'low', dateDetected: now.toISOString(), sourceModule:'Security / Audit', relatedRecord:`count=${failedLogins}`, recommendedResponsibleRole:'System Administrator' });
    if (pendingFollowups > 0) insights.push({ title:'Pending follow-ups', description:`${pendingFollowups} follow-up case(s) are open/pending.`, severity:'medium', dateDetected: now.toISOString(), sourceModule:'Follow-up', relatedRecord:`count=${pendingFollowups}`, recommendedResponsibleRole:'Follow-up team' });
    if ((declinedProjects as any[]).length) insights.push({ title:'Delayed/on-hold church projects', description:`${(declinedProjects as any[]).length} project(s) marked delayed/on-hold.`, severity:'medium', dateDetected: now.toISOString(), sourceModule:'Projects', relatedRecord:(declinedProjects as any[]).map(p=>p.name).join(', '), recommendedResponsibleRole:'Project coordinators / Leadership' });
    if (!insights.length) insights.push({ title:'No critical issues detected', description:'No threshold-based issues detected from current records.', severity:'info', dateDetected: now.toISOString(), sourceModule:'System-wide', relatedRecord:'N/A', recommendedResponsibleRole:'N/A' });
    return { insights, generatedAt: now.toISOString(), source: 'live-database' };
  }

  // Reports (read-only, sanitized)
  async membershipReport() {
    const [byStatus, members, newByMonth] = await Promise.all([
      this.prisma.member.groupBy({ by: ['membershipStatus'], _count: true }),
      this.prisma.member.findMany({ orderBy: { createdAt: 'desc' }, select: { id:true, memberNo:true, fullName:true, phone:true, email:true, gender:true, membershipStatus:true, joinedAt:true, createdAt:true, preferredDepartment:true, currentDistrict:true, currentRegion:true } }),
      this.prisma.$queryRaw`SELECT to_char(date_trunc('month',"createdAt"),'YYYY-MM') as month, COUNT(*)::int as count FROM "Member" GROUP BY 1 ORDER BY 1 DESC LIMIT 12` as any,
    ]);
    return { byStatus, members, newByMonth: (newByMonth as any[]).reverse(), summary: { total: members.length } };
  }
  async registrationsReport() {
    const [byStatus, apps] = await Promise.all([
      this.prisma.member.groupBy({ by: ['membershipStatus'], _count: true }),
      this.prisma.member.findMany({ orderBy: { createdAt: 'desc' }, select: { id:true, fullName:true, phone:true, email:true, membershipStatus:true, createdAt:true, approvedAt:true, memberNo:true } }),
    ]);
    return { byStatus, applications: apps, totals: { total: apps.length, pending: apps.filter(a=>['PENDING','PENDING_REVIEW'].includes(a.membershipStatus as any)).length, approved: apps.filter(a=>a.membershipStatus==='APPROVED').length, rejected: apps.filter(a=>a.membershipStatus==='REJECTED').length } };
  }
  async financeReport() {
    const [income, expenses, pledges, byCat, expByCat, monthlyIncome, monthlyExpense, budgets] = await Promise.all([
      this.prisma.contribution.findMany({ where: { status: 'CONFIRMED' as any }, orderBy: { contributedAt: 'desc' }, select: { id:true, receiptNo:true, category:true, amount:true, paymentMethod:true, status:true, contributedAt:true, member: { select: { fullName:true, memberNo:true } } } }),
      this.prisma.expense.findMany({ orderBy: { date: 'desc' } }),
      this.prisma.pledge.findMany({ orderBy: { createdAt: 'desc' }, include: { member: { select: { fullName:true, memberNo:true } } } }),
      this.prisma.contribution.groupBy({ by: ['category'], _sum: { amount: true }, where: { status: 'CONFIRMED' as any } }),
      this.prisma.expense.groupBy({ by: ['category'], _sum: { amount: true } }),
      this.prisma.$queryRaw`SELECT to_char(date_trunc('month',"contributedAt"),'YYYY-MM') as month, COALESCE(SUM(amount),0)::float as amount FROM "Contribution" WHERE status='CONFIRMED' GROUP BY 1 ORDER BY 1 DESC LIMIT 12` as any,
      this.prisma.$queryRaw`SELECT to_char(date_trunc('month',"date"),'YYYY-MM') as month, COALESCE(SUM(amount),0)::float as amount FROM "Expense" GROUP BY 1 ORDER BY 1 DESC LIMIT 12` as any,
      this.prisma.budget.findMany().catch(()=>[]),
    ]);
    const confirmedIncome = income.reduce((s,c)=>s+Number(c.amount||0),0);
    const paidExpenses = expenses.reduce((s,e)=>s+Number((e as any).amount||0),0);
    return { readOnly:true, confirmedIncome, paidExpenses, netCashMovement: confirmedIncome-paidExpenses, outstandingPledges: pledges.reduce((s,p)=>s+Number(p.amount||0),0), incomeByCategory: byCat.map(x=>({category:x.category,amount:Number(x._sum.amount||0)})), expensesByCategory: expByCat.map(x=>({category:x.category,amount:Number(x._sum.amount||0)})), monthlyIncomeTrend:(monthlyIncome as any[]).reverse(), monthlyExpenseTrend:(monthlyExpense as any[]).reverse(), budgets, contributions: income, expenses, pledges, note:'Pledges not counted as received income. Read-only overseer view.' };
  }
  async departmentsReport(){ const rows = await this.prisma.department.findMany({ orderBy:{name:'asc'} }); return { departments: rows, summary:{ total: rows.length, withoutLeader: rows.filter(d=>!d.headName).length } }; }
  async fellowshipsReport(){ const rows = await this.prisma.fellowship.findMany({ orderBy:{name:'asc'} }); return { fellowships: rows, summary:{ total: rows.length } }; }
  async meetingsReport(){ const rows = await this.prisma.meeting.findMany({ orderBy:{startsAt:'desc'}, include:{ _count:{select:{attendances:true}} } }); return { meetings: rows, summary:{ total: rows.length, upcoming: rows.filter(m=>new Date(m.startsAt)>this.now()).length } }; }
  async attendanceReport(){ const rows = await this.prisma.attendance.findMany({ orderBy:{createdAt:'desc'}, include:{ meeting:{select:{title:true,startsAt:true,type:true}}, member:{select:{fullName:true,memberNo:true}} }, take: 500 }); return { attendance: rows.map(r=>({id:r.id,status:r.status,createdAt:r.createdAt,meeting:r.meeting, member:r.member, attendeeName: r.fullName||r.member?.fullName||'—'})), summary:{ total: rows.length } }; }
  async followupsReport(){ const rows = await this.prisma.followupCase.findMany({ orderBy:{createdAt:'desc'}, include:{ member:{select:{fullName:true,memberNo:true}} } }).catch(()=>[]); return { followups: rows.map((f:any)=>({id:f.id,subject:f.subject,status:f.status,priority:f.priority,assignedTo:f.assignedTo,dueDate:f.dueDate,createdAt:f.createdAt,member:f.member, hasDescription: !!f.description})), summary:{ total: rows.length, open: rows.filter((f:any)=>['OPEN','PENDING','IN_PROGRESS'].includes(f.status)).length }, note:'Sensitive follow-up note content is restricted in overseer view.' }; }
  async tasksReport(){ const rows = await this.prisma.task.findMany({ orderBy:{createdAt:'desc'} }).catch(()=>[]); return { tasks: rows, summary:{ total: rows.length, overdue: rows.filter((t:any)=>t.dueDate && new Date(t.dueDate)<this.now() && !['DONE','COMPLETED','CANCELLED'].includes(t.status)).length } }; }
  async projectsReport(){ const rows = await this.prisma.project.findMany({ include:{ budgets:true }, orderBy:{createdAt:'desc'} }).catch(()=>[]); return { projects: rows, summary:{ total: rows.length } }; }
  async cmsReport(){ const [pages, announcements, events, sermons, leadership, ministries, media] = await Promise.all([this.prisma.page.count(), this.prisma.announcement.count(), this.prisma.event.count(), this.prisma.sermon.count(), this.prisma.leadership.count(), this.prisma.ministry.count(), this.prisma.media.count()]); return { counts:{ pages, announcements, events, sermons, leadership, ministries, media } }; }
  async participationReport(){ const members = await this.prisma.member.count({ where:{ membershipStatus:'APPROVED' as any } }); const attendees = await this.prisma.attendance.groupBy({ by:['memberId'], where:{ memberId:{ not: null } } }).catch(()=>[]); return { totalApprovedMembers: members, membersWithAttendanceRecords: attendees.length, note:'Authorized church-wide participation summary from attendance records.' }; }

  async orgDepartments(){ return this.departmentsReport(); }
  async orgFellowships(){ return this.fellowshipsReport(); }
  async orgLeadership(){ const depts = await this.prisma.department.findMany(); const fels = await this.prisma.fellowship.findMany(); return { departmentLeadership: depts.map(d=>({name:d.name, leader:d.headName||null, status:d.status})), fellowshipLeadership: fels.map(f=>({name:f.name, leader:f.leaderName||null, status:f.status})) }; }
  async orgMeetings(){ return this.meetingsReport(); }
  async orgPerformance(){ const [depts, meetings, tasks] = await Promise.all([this.departmentsReport(), this.meetingsReport(), this.tasksReport()]); return { departments: depts.summary, meetings: meetings.summary, tasks: tasks.summary }; }
  async orgOutstanding(){ const depts = await this.prisma.department.findMany({ where:{ OR:[{headName:null},{headName:''}] } }); const overdue = await this.prisma.task.findMany({ where:{ dueDate:{lt:this.now()}, status:{ notIn:['DONE','COMPLETED','CANCELLED'] } } }).catch(()=>[]); return { departmentsWithoutLeaders: depts, overdueTasks: overdue }; }

  async auditReports(){ const logs = await this.prisma.auditLog.findMany({ orderBy:{createdAt:'desc'}, take:200, include:{ actor:{select:{email:true}} } }); return { logs }; }
  async administrativeActivity(){ const logs = await this.prisma.auditLog.findMany({ where:{ OR:[{action:{contains:'USER'}},{action:{contains:'ROLE'}},{action:{contains:'PERMISSION'}},{action:{contains:'SETTING'}},{action:{contains:'BACKUP'}}] }, orderBy:{createdAt:'desc'}, take:200, include:{ actor:{select:{email:true}} } }); return { logs }; }
  async financialAccountability(){ const fin = await this.financeReport(); const audits = await this.prisma.auditLog.findMany({ where:{ OR:[{entityType:'Contribution'},{entityType:'Expense'},{entityType:'Pledge'},{action:{contains:'PAYMENT'}},{action:{contains:'CONTRIBUTION'}},{action:{contains:'EXPENSE'}}] }, orderBy:{createdAt:'desc'}, take:100, include:{ actor:{select:{email:true}} } }); return { readOnly:true, summary:{ confirmedIncome: fin.confirmedIncome, paidExpenses: fin.paidExpenses, net: fin.netCashMovement, outstandingPledges: fin.outstandingPledges }, audits }; }
  async accessHistory(){ const logs = await this.prisma.auditLog.findMany({ where:{ action:{ contains:'LOGIN' } }, orderBy:{createdAt:'desc'}, take:200, include:{ actor:{select:{email:true}} } }); return { logs }; }
  async systemWide(){ const d = await this.dashboard(); const i = await this.insights(); return { dashboard: d, insights: i.insights }; }

  async systemHealth(){ const dbOk = await this.prisma.$queryRaw`SELECT 1`.then(()=>true).catch(()=>false); const lastBackup = await this.prisma.backupLog.findFirst({ orderBy:{createdAt:'desc'} }).catch(()=>null); return { databaseConnectivity: dbOk?'connected':'error', backendApiStatus:'running', uptimeSeconds: Math.floor(process.uptime()), lastBackup, failedBackups: await this.prisma.backupLog.count({ where:{status:'FAILED'} }).catch(()=>0), timestamp: new Date().toISOString() }; }

  async userActivityReport(period?: string) {
    const since = period==='30d' ? this.daysAgo(30) : period==='7d' ? this.daysAgo(7) : undefined;
    const whereLogin:any = { action: 'LOGIN' }; if (since) whereLogin.createdAt = { gte: since };
    const [distinct, totalLogins, recentLogins, users] = await Promise.all([
      this.prisma.auditLog.findMany({ where: whereLogin, distinct: ['actorId'], select: { actorId: true } }),
      this.prisma.auditLog.count({ where: whereLogin }),
      this.prisma.auditLog.findMany({ where: whereLogin, orderBy: { createdAt: 'desc' }, take: 100, include: { actor: { select: { email: true } } } }),
      this.prisma.user.findMany({ orderBy: { lastLoginAt: 'desc' }, select: { id:true,email:true,status:true,lastLoginAt:true, roles:{ include:{ role:true } } } }),
    ]);
    return { usersWithLogins: distinct.filter(d=>d.actorId).length, totalLoginEvents: totalLogins, period: period||'all-time', recentLogins, users };
  }
}
