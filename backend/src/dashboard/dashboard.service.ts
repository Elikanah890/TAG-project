import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MembershipStatus, PaymentStatus } from '@prisma/client';
import { FinanceDashboardService } from './finance-dashboard.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private financeDashboard: FinanceDashboardService,
  ) {}

  async finance(period?: string, from?: string, to?: string) {
    return this.financeDashboard.getOverview(period, from, to);
  }

  async admin() {
    const [
      totalMembers,
      pendingMembers,
      approvedMembers,
      contributionsAgg,
      incomeByCategory,
      expensesAgg,
      recentContributions,
      recentAudit,
      latestSundayAttendance,
      upcomingMeetings,
      totalDepartments,
      totalFellowships,
      overdueTasks,
    ] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.member.count({ where: { membershipStatus: { in: [MembershipStatus.PENDING, MembershipStatus.PENDING_REVIEW] } } }),
      this.prisma.member.count({ where: { membershipStatus: MembershipStatus.APPROVED } }),
      this.prisma.contribution.aggregate({ _sum: { amount: true }, where: { status: PaymentStatus.CONFIRMED } }),
      this.prisma.contribution.groupBy({ by: ['category'], _sum: { amount: true }, where: { status: PaymentStatus.CONFIRMED } }),
      this.prisma.expense.aggregate({ _sum: { amount: true } }),
      this.prisma.contribution.findMany({
        where: { status: PaymentStatus.CONFIRMED },
        orderBy: { contributedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          contributedAt: true,
          amount: true,
          category: true,
          member: { select: { fullName: true } },
        },
      }),
      this.prisma.auditLog.findMany({
        where: { NOT: { action: { contains: 'LOGIN' } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { actor: { select: { email: true } } },
      }),
      this.prisma.sundayAttendance.findFirst({ orderBy: { date: 'desc' } }).catch(() => null),
      this.prisma.meeting.count({ where: { startsAt: { gte: new Date() } } }).catch(() => 0),
      this.prisma.department.count().catch(() => 0),
      this.prisma.fellowship.count().catch(() => 0),
      this.prisma.task.count({
        where: { dueDate: { lt: new Date() }, status: { notIn: ['DONE', 'COMPLETED', 'CANCELLED'] } },
      }).catch(() => 0),
    ]);

    const totalConfirmedContributions = Number(contributionsAgg._sum.amount || 0);
    const totalRecordedExpenses = Number(expensesAgg._sum.amount || 0);

    return {
      generatedAt: new Date().toISOString(),
      metrics: {
        approvedMembers,
        pendingRegistrations: pendingMembers,
        totalMembers,
        totalConfirmedContributions,
        totalRecordedExpenses,
        lastSundayAttendance: latestSundayAttendance
          ? {
              total: latestSundayAttendance.totalCount,
              firstService: latestSundayAttendance.firstServiceCount,
              secondService: latestSundayAttendance.secondServiceCount,
              date: latestSundayAttendance.date,
            }
          : null,
      },
      actionCenter: {
        pendingRegistrations: pendingMembers,
        overdueTasks,
      },
      finance: {
        contributionsByCategory: incomeByCategory.map((b) => ({
          category: b.category,
          amount: Number(b._sum.amount || 0),
        })),
        recentContributions: recentContributions.map((c) => ({
          id: c.id,
          date: c.contributedAt,
          memberName: c.member?.fullName || '—',
          category: c.category,
          amount: Number(c.amount || 0),
        })),
      },
      activities: {
        upcomingMeetings,
        totalDepartments,
        totalFellowships,
      },
      recentAuditLogs: recentAudit.map((log) => ({
        id: log.id,
        action: log.action,
        actorEmail: log.actor?.email || 'System',
        entityType: log.entityType,
        entityId: log.entityId,
        createdAt: log.createdAt,
      })),
    };
  }

  async secretary() {
    const pending = await this.prisma.member.count({ where: { membershipStatus: { in: [MembershipStatus.PENDING, MembershipStatus.PENDING_REVIEW] } } });
    return { pendingApplications: pending };
  }
}
