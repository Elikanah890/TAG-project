export type DashboardDef = {
  role: string;
  path: string;
  label: string;
  description: string;
};

/**
 * Canonical dashboard catalog. Only roles listed here have a dedicated dashboard.
 * The frontend never decides which dashboards a user may open; the backend
 * computes this list from the user's active database role assignments.
 */
export const DASHBOARDS: DashboardDef[] = [
  { role: 'SYSTEM_ADMIN', path: '/admin/dashboard', label: 'System Administration', description: 'Users, roles, permissions, sessions and system configuration' },
  { role: 'FINANCE_ADMIN', path: '/admin/finance', label: 'Finance Administration', description: 'Contributions, pledges, expenses, budgets and reports' },
  { role: 'WEBSITE_ADMIN', path: '/cms/dashboard', label: 'Website Administration', description: 'Website content, media and publishing' },
  { role: 'CHURCH_SECRETARY', path: '/admin/secretary', label: 'Church Secretary', description: 'Membership registrations, records, activities and follow-up' },
  { role: 'CHURCH_MEMBER', path: '/member/dashboard', label: 'Member Portal', description: 'Personal membership, contributions and receipts' },
];

export function dashboardsForRoles(roles: string[]): DashboardDef[] {
  const set = new Set(roles);
  return DASHBOARDS.filter((d) => set.has(d.role));
}

export function defaultDashboardForRoles(roles: string[]): string | null {
  const dashboards = dashboardsForRoles(roles);
  return dashboards.length ? dashboards[0].path : null;
}
