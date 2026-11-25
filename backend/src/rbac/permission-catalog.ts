export type PermissionDef = { code: string; module: string; action: string; description: string };

const p = (module: string, action: string, description: string): PermissionDef => ({
  code: `${module}.${action}`,
  module,
  action,
  description,
});

export const PERMISSIONS: PermissionDef[] = [
  // Users
  p('users', 'view', 'View system users'),
  p('users', 'create', 'Create user accounts'),
  p('users', 'edit', 'Edit user accounts'),
  p('users', 'suspend', 'Suspend or activate accounts'),
  p('users', 'assign_roles', 'Assign or revoke user roles'),
  p('users', 'reset_password', 'Reset user passwords'),
  p('users', 'sessions_revoke', 'Revoke user sessions'),

  // Roles
  p('roles', 'view', 'View roles'),
  p('roles', 'create', 'Create custom roles'),
  p('roles', 'edit', 'Edit custom roles'),
  p('roles', 'delete', 'Delete custom roles'),
  p('roles', 'assign_permissions', 'Assign permissions to roles'),
  p('roles', 'assign_system', 'Assign protected system roles'),

  // Permissions
  p('permissions', 'view', 'View permission catalog'),
  p('permissions', 'manage', 'Create, edit or delete permissions'),

  // Audit
  p('audit', 'view', 'View audit logs'),

  // Membership
  p('members', 'view', 'View membership records'),
  p('members', 'create', 'Create membership records'),
  p('members', 'edit', 'Edit membership records'),
  p('members', 'delete', 'Delete membership records'),
  p('members', 'review', 'Review membership registrations'),
  p('members', 'approve', 'Approve membership registrations'),
  p('members', 'reject', 'Reject membership registrations'),
  p('members', 'export', 'Export membership data'),

  // Finance
  p('finance', 'view', 'View financial records'),
  p('finance', 'contributions.create', 'Record contributions'),
  p('finance', 'contributions.edit', 'Edit contributions'),
  p('finance', 'contributions.reverse', 'Reverse contributions'),
  p('finance', 'pledges.create', 'Record pledges'),
  p('finance', 'expenses.create', 'Record expenses'),
  p('finance', 'expenses.edit', 'Edit expenses'),
  p('finance', 'expenses.approve', 'Approve expenses'),
  p('finance', 'budgets.manage', 'Manage budgets'),
  p('finance', 'receipts.view', 'View and download receipts'),
  p('finance', 'reconciliation.manage', 'Reconcile financial records'),
  p('finance', 'reports.view', 'View financial reports'),

  // CMS
  p('cms', 'view', 'View website content'),
  p('cms', 'create', 'Create website content'),
  p('cms', 'edit', 'Edit website content'),
  p('cms', 'publish', 'Publish or unpublish content'),
  p('cms', 'delete', 'Delete website content'),
  p('cms', 'media.manage', 'Manage media library'),

  // Departments
  p('departments', 'view', 'View departments'),
  p('departments', 'create', 'Create departments'),
  p('departments', 'edit', 'Edit departments'),
  p('departments', 'assign_leaders', 'Assign department leaders'),

  // Fellowships
  p('fellowships', 'view', 'View fellowships'),
  p('fellowships', 'create', 'Create fellowships'),
  p('fellowships', 'edit', 'Edit fellowships'),
  p('fellowships', 'assign_leaders', 'Assign fellowship leaders'),

  // Attendance
  p('attendance', 'view', 'View attendance'),
  p('attendance', 'record', 'Record attendance'),
  p('attendance', 'edit', 'Edit attendance records'),
  p('attendance', 'reports.view', 'View attendance reports'),

  // Meetings
  p('meetings', 'view', 'View meetings'),
  p('meetings', 'create', 'Create meetings'),
  p('meetings', 'edit', 'Edit meetings'),

  // Follow-up
  p('followups', 'view', 'View follow-up cases'),
  p('followups', 'create', 'Create follow-up cases'),
  p('followups', 'edit', 'Edit follow-up cases'),

  // Tasks
  p('tasks', 'view', 'View tasks'),
  p('tasks', 'create', 'Create tasks'),
  p('tasks', 'edit', 'Edit tasks'),

  // Reports
  p('reports', 'membership.view', 'View membership reports'),
  p('reports', 'finance.view', 'View finance reports'),
  p('reports', 'departments.view', 'View department reports'),
  p('reports', 'attendance.view', 'View attendance reports'),
  p('reports', 'cms.view', 'View website reports'),
  p('reports', 'system.view', 'View system-wide reports'),

  // System
  p('system', 'settings', 'Manage system settings'),
  p('system', 'security', 'Manage security policies'),
  p('system', 'config', 'Manage administrative configuration'),
  p('system', 'notifications', 'Manage notifications configuration'),
  p('system', 'backup', 'Run and view backups'),
  p('system', 'health', 'View system health'),
  p('system', 'sessions', 'View and manage all sessions'),

  // Member self-service
  p('member.self', 'view', 'View own membership information'),
  p('member.self', 'profile.edit', 'Edit own profile'),
  p('member.self', 'contributions.view', 'View own contributions and receipts'),
  p('member.self', 'pledges.view', 'View own pledges'),
  p('member.self', 'attendance.view', 'View own attendance'),
];

export type RoleDef = {
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
};

const SYSADMIN_PERMISSIONS = [
  'users.view', 'users.create', 'users.edit', 'users.suspend', 'users.assign_roles', 'users.reset_password', 'users.sessions_revoke',
  'roles.view', 'roles.create', 'roles.edit', 'roles.delete', 'roles.assign_permissions', 'roles.assign_system',
  'permissions.view', 'permissions.manage',
  'audit.view',
  'members.view', 'members.export',
  'reports.membership.view', 'reports.finance.view', 'reports.departments.view', 'reports.attendance.view', 'reports.cms.view', 'reports.system.view',
  'departments.view', 'fellowships.view', 'meetings.view', 'attendance.view', 'followups.view', 'tasks.view',
  'system.settings', 'system.security', 'system.config', 'system.notifications', 'system.backup', 'system.health', 'system.sessions',
];

export const ROLES: RoleDef[] = [
  {
    name: 'SYSTEM_ADMIN',
    description: 'System Administrator: central user, role, permission and system configuration authority. Read-only over church operations unless operational permissions are explicitly granted.',
    isSystem: true,
    permissions: SYSADMIN_PERMISSIONS,
  },
  {
    name: 'FINANCE_ADMIN',
    description: 'Finance Administrator: manages authorized financial operations, records, budgets and reports.',
    isSystem: true,
    permissions: [
      'finance.view', 'finance.contributions.create', 'finance.contributions.edit', 'finance.contributions.reverse',
      'finance.pledges.create', 'finance.expenses.create', 'finance.expenses.edit', 'finance.expenses.approve',
      'finance.budgets.manage', 'finance.receipts.view', 'finance.reconciliation.manage', 'finance.reports.view',
      'members.view', 'reports.finance.view',
    ],
  },
  {
    name: 'WEBSITE_ADMIN',
    description: 'Website Administrator: manages public website content, events, media and publishing.',
    isSystem: true,
    permissions: ['cms.view', 'cms.create', 'cms.edit', 'cms.publish', 'cms.delete', 'cms.media.manage', 'reports.cms.view'],
  },
  {
    name: 'CHURCH_SECRETARY',
    description: 'Church Secretary: reviews membership registrations and maintains authorized membership, department, fellowship and activity records.',
    isSystem: true,
    permissions: [
      'members.view', 'members.edit', 'members.review', 'members.approve', 'members.reject', 'members.export',
      'departments.view', 'departments.edit', 'fellowships.view', 'fellowships.edit',
      'meetings.view', 'meetings.create', 'meetings.edit',
      'attendance.view', 'attendance.record', 'attendance.edit',
      'followups.view', 'followups.create', 'followups.edit',
      'tasks.view', 'tasks.create', 'tasks.edit',
      'reports.membership.view', 'reports.attendance.view', 'reports.departments.view',
    ],
  },
  {
    name: 'CHURCH_MEMBER',
    description: 'Church Member: self-service access to own membership, contributions and attendance.',
    isSystem: true,
    permissions: ['member.self.view', 'member.self.profile.edit', 'member.self.contributions.view', 'member.self.pledges.view', 'member.self.attendance.view'],
  },
];

export const PROTECTED_ROLES = new Set(ROLES.map((r) => r.name));
