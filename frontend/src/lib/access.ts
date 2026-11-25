export type DashboardLike = { role: string; path: string };

export function hasAllPermissions(granted: string[] = [], required: string[] = []): boolean {
  if (!required.length) return true;
  const set = new Set(granted);
  return required.every((permission) => set.has(permission));
}

export function hasAnyPermission(granted: string[] = [], required: string[] = []): boolean {
  if (!required.length) return true;
  const set = new Set(granted);
  return required.some((permission) => set.has(permission));
}

export function pickActiveRole(roles: string[], dashboards: DashboardLike[], preferred?: string | null): string | null {
  if (preferred && roles.includes(preferred) && dashboards.some((d) => d.role === preferred)) return preferred;
  const ownedDashboard = dashboards.find((d) => roles.includes(d.role));
  if (ownedDashboard) return ownedDashboard.role;
  return roles[0] || null;
}

export function dashboardPathForRole(dashboards: DashboardLike[], role: string): string | null {
  return dashboards.find((d) => d.role === role)?.path ?? null;
}

export function canAccessDashboard(dashboards: DashboardLike[], path: string): boolean {
  return dashboards.some((d) => d.path === path);
}
