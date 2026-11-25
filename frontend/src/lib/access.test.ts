import { describe, it, expect } from 'vitest';
import { canAccessDashboard, dashboardPathForRole, hasAllPermissions, hasAnyPermission, pickActiveRole } from './access';

const dashboards = [
  { role: 'SYSTEM_ADMIN', path: '/admin/dashboard' },
  { role: 'FINANCE_ADMIN', path: '/admin/finance' },
  { role: 'CHURCH_MEMBER', path: '/member/dashboard' },
];

describe('permission helpers', () => {
  it('requires every permission for hasAllPermissions', () => {
    expect(hasAllPermissions(['users.view', 'users.create'], ['users.view'])).toBe(true);
    expect(hasAllPermissions(['users.view'], ['users.view', 'users.create'])).toBe(false);
  });
  it('allows any permission for hasAnyPermission', () => {
    expect(hasAnyPermission(['users.view'], ['users.create', 'users.view'])).toBe(true);
    expect(hasAnyPermission(['users.view'], ['users.create'])).toBe(false);
  });
  it('picks the preferred active role when available', () => {
    expect(pickActiveRole(['FINANCE_ADMIN', 'CHURCH_MEMBER'], dashboards, 'CHURCH_MEMBER')).toBe('CHURCH_MEMBER');
  });
  it('falls back to the first dashboard role', () => {
    expect(pickActiveRole(['CHURCH_MEMBER', 'FINANCE_ADMIN'], dashboards, 'UNKNOWN')).toBe('FINANCE_ADMIN');
  });
  it('maps role to dashboard path and access', () => {
    expect(dashboardPathForRole(dashboards, 'FINANCE_ADMIN')).toBe('/admin/finance');
    expect(dashboardPathForRole(dashboards, 'UNKNOWN_ROLE')).toBeNull();
    expect(canAccessDashboard(dashboards, '/member/dashboard')).toBe(true);
    expect(canAccessDashboard(dashboards, '/admin/users')).toBe(false);
  });
});
