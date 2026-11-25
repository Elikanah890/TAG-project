import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BarChart3,
  Building2,
  PiggyBank,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  FileText,
  Globe2,
  HardDrive,
  HeartHandshake,
  History,
  LayoutDashboard,
  Library,
  ListChecks,
  MonitorSmartphone,
  Newspaper,
  Quote,
  Receipt,
  ReceiptText,
  Settings,
  ShieldCheck,
  UserCheck,
  UserCog,
  Users,
  UsersRound,
  Wallet,
} from 'lucide-react';

export type AdminNavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  roles?: string[];
  permission?: string;
};

export type AdminNavGroup = {
  title: string;
  code: string;
  roles?: string[];
  items: AdminNavItem[];
};

export const adminNavigation: AdminNavGroup[] = [
  {
    title: 'Dashboard',
    code: 'dashboard',
    roles: ['SYSTEM_ADMIN'],
    items: [
      { label: 'Church Dashboard', to: '/admin/dashboard', icon: LayoutDashboard, permission: 'reports.system.view' },
    ],
  },
  {
    title: 'Membership',
    code: 'membership',
    roles: ['SYSTEM_ADMIN'],
    items: [
      { label: 'Membership Overview', to: '/admin/membership', icon: Users, permission: 'reports.membership.view' },
      { label: 'Members Directory', to: '/admin/members', icon: UserCheck, permission: 'members.view' },
      { label: 'Registration Applications', to: '/admin/reports/registrations', icon: ClipboardList, permission: 'members.view' },
      { label: 'Membership Analytics', to: '/admin/membership/analytics', icon: BarChart3, permission: 'reports.membership.view' },
      { label: 'Pastoral Follow-Up', to: '/admin/reports/followups', icon: HeartHandshake, permission: 'reports.system.view' },
      { label: 'Membership Reports', to: '/admin/reports/membership', icon: FileText, permission: 'reports.membership.view' },
      { label: 'Membership History', to: '/admin/membership/history', icon: History, permission: 'audit.view' },
    ],
  },
  {
    title: 'Church Operations',
    code: 'operations',
    roles: ['SYSTEM_ADMIN'],
    items: [
      { label: 'Departments & Fellowships', to: '/admin/operations/org', icon: Building2, permission: 'reports.departments.view' },
      { label: 'Attendance & Meetings', to: '/admin/operations/attendance-meetings', icon: CalendarCheck, permission: 'reports.attendance.view' },
      { label: 'Tasks & Projects', to: '/admin/operations/tasks-projects', icon: ListChecks, permission: 'reports.system.view' },
    ],
  },
  {
    title: 'Financial Oversight',
    code: 'finance',
    roles: ['SYSTEM_ADMIN'],
    items: [
      { label: 'Finance & Transactions', to: '/admin/reports/finance', icon: Wallet, permission: 'reports.finance.view' },
      { label: 'Financial Accountability', to: '/admin/governance/financial-accountability', icon: ShieldCheck, permission: 'reports.finance.view' },
    ],
  },
  {
    title: 'System & Users',
    code: 'system-users',
    roles: ['SYSTEM_ADMIN'],
    items: [
      { label: 'Users / Staff Accounts', to: '/admin/users', icon: UserCog, permission: 'users.view' },
      { label: 'Roles & Permissions', to: '/admin/access/roles', icon: ShieldCheck, permission: 'roles.view' },
      { label: 'Activity & Audit', to: '/admin/access/activity', icon: Activity, permission: 'audit.view' },
      { label: 'Settings', to: '/admin/system-config', icon: Settings, permission: 'system.settings' },
      { label: 'Website Reports', to: '/admin/reports/cms', icon: Globe2, permission: 'reports.cms.view' },
    ],
  },
  {
    title: 'Advanced System',
    code: 'advanced-system',
    roles: ['SYSTEM_ADMIN'],
    items: [
      { label: 'Active Sessions', to: '/admin/sessions', icon: MonitorSmartphone, permission: 'system.sessions' },
      { label: 'System Health', to: '/admin/system-health', icon: Activity, permission: 'system.health' },
      { label: 'Backups & Recovery', to: '/admin/backups', icon: HardDrive, permission: 'system.backup' },
    ],
  },
  {
    title: 'Secretary Operations',
    code: 'secretary',
    roles: ['CHURCH_SECRETARY'],
    items: [
      { label: 'Secretary Dashboard', to: '/admin/secretary', icon: LayoutDashboard },
      { label: 'Pending Registrations', to: '/admin/registrations', icon: UserCheck },
      { label: 'Membership Directory', to: '/admin/members', icon: Users },
      { label: 'Departments', to: '/admin/departments', icon: Building2 },
      { label: 'Fellowships', to: '/admin/fellowships', icon: HeartHandshake },
      { label: 'Meetings', to: '/admin/meetings', icon: CalendarDays },
      { label: 'Attendance', to: '/admin/attendance', icon: CalendarCheck },
      { label: 'Sunday Attendance', to: '/admin/secretary/attendance', icon: CalendarCheck },
      { label: 'Follow-Up', to: '/admin/followups', icon: ListChecks },
      { label: 'Tasks', to: '/admin/tasks', icon: FileText },
    ],
  },
  {
    title: 'Finance Dashboard',
    code: 'finance-overview',
    roles: ['FINANCE_ADMIN'],
    items: [
      { label: 'Finance Dashboard', to: '/admin/finance', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Income & Contributions',
    code: 'finance-income',
    roles: ['FINANCE_ADMIN'],
    items: [
      { label: 'Contributions & Income', to: '/admin/finance/record', icon: Wallet },
      { label: 'Member Contributions', to: '/admin/finance/contributions', icon: Users },
      { label: 'Contribution History', to: '/admin/finance/contributions', icon: Receipt },
      { label: 'Receipts', to: '/admin/finance/receipts', icon: ReceiptText },
      { label: 'Pledges & Commitments', to: '/admin/finance/pledges', icon: HeartHandshake },
    ],
  },
  {
    title: 'Invoices & Payments',
    code: 'finance-invoices',
    roles: ['FINANCE_ADMIN'],
    items: [
      { label: 'Create Invoice', to: '/admin/finance/invoices', icon: FileText },
      { label: 'Invoice Management', to: '/admin/finance/invoices', icon: ClipboardList },
      { label: 'Payment Tracking', to: '/admin/finance/contributions', icon: Receipt },
      { label: 'WhatsApp Notifications', to: '/admin/finance/whatsapp', icon: Activity },
    ],
  },
  {
    title: 'Expenses & Planning',
    code: 'finance-expenses',
    roles: ['FINANCE_ADMIN'],
    items: [
      { label: 'Expenses', to: '/admin/finance/expenses', icon: Wallet },
      { label: 'Budgets', to: '/admin/finance/budgets', icon: PiggyBank },
      { label: 'Accounts & Funds', to: '/admin/finance/accounts', icon: Building2 },
    ],
  },
  {
    title: 'Financial Accountability',
    code: 'finance-accountability',
    roles: ['FINANCE_ADMIN'],
    items: [
      { label: 'Approvals', to: '/admin/finance/approvals', icon: ShieldCheck },
      { label: 'Reconciliation', to: '/admin/finance/reconciliation', icon: Activity },
      { label: 'Finance Reports', to: '/admin/finance/reports', icon: BarChart3 },
      { label: 'Financial Audit Trail', to: '/admin/finance/audit', icon: History },
    ],
  },
  {
    title: 'Settings',
    code: 'finance-settings',
    roles: ['FINANCE_ADMIN'],
    items: [
      { label: 'Finance Settings', to: '/admin/finance/settings', icon: Settings },
    ],
  },
  {
    title: 'Website Management',
    code: 'website-ops',
    roles: ['WEBSITE_ADMIN'],
    items: [
      { label: 'CMS Dashboard', to: '/cms/dashboard', icon: Globe2 },
      { label: 'Homepage', to: '/cms/homepage', icon: LayoutDashboard },
      { label: 'About Page', to: '/cms/about', icon: FileText },
      { label: 'Church Leadership', to: '/cms/leadership', icon: UsersRound },
      { label: 'Ministries', to: '/cms/ministries', icon: Building2 },
      { label: 'Ministry Leaders', to: '/cms/ministry-leaders', icon: UsersRound },
      { label: 'Schedule / Services', to: '/cms/schedule', icon: CalendarDays },
      { label: 'Events', to: '/cms/events', icon: CalendarCheck },
      { label: 'News & Announcements', to: '/cms/news', icon: Newspaper },
      { label: 'Testimonials', to: '/cms/testimonials', icon: Quote },
      { label: 'Giving', to: '/cms/giving', icon: HeartHandshake },
      { label: 'Contact Page', to: '/cms/contact', icon: Globe2 },
      { label: 'Contact Messages', to: '/cms/contact-messages', icon: FileText },
      { label: 'Media Library', to: '/cms/media', icon: Library },
      { label: 'Site Settings', to: '/cms/settings', icon: Settings },
    ],
  },
];

export function findNavigationItem(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  let best: { group: AdminNavGroup; item: AdminNavItem } | null = null;
  for (const group of adminNavigation) {
    for (const item of group.items) {
      if (item.to === normalized) return { group, item };
      if (normalized.startsWith(`${item.to}/`) && (!best || item.to.length > best.item.to.length)) {
        best = { group, item };
      }
    }
  }
  return best;
}
