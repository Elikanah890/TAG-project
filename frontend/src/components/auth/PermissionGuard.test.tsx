import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PermissionGuard from './PermissionGuard';

const { authState } = vi.hoisted(() => ({
  authState: {
    user: { id: 'u1', email: 'admin@test', roles: ['SYSTEM_ADMIN'], status: 'ACTIVE' } as any,
    loading: false,
    hasRole: vi.fn(),
    hasPermission: vi.fn(),
    hasAnyPermission: vi.fn(),
  },
}));

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => authState }));
vi.mock('@/pages/AccessDenied', () => ({ default: () => <div>DENIED</div> }));

function renderGuard(permissions: string[]) {
  return render(
    <MemoryRouter>
      <PermissionGuard permissions={permissions}>
        <div>ALLOWED</div>
      </PermissionGuard>
    </MemoryRouter>,
  );
}

describe('PermissionGuard', () => {
  beforeEach(() => {
    authState.loading = false;
    authState.hasPermission.mockReset();
    authState.hasAnyPermission.mockReset();
  });

  it('renders children when the permission is granted', () => {
    authState.hasPermission.mockReturnValue(true);
    renderGuard(['users.view']);
    expect(screen.getByText('ALLOWED')).toBeInTheDocument();
  });

  it('renders access denied when the permission is missing', () => {
    authState.hasPermission.mockReturnValue(false);
    renderGuard(['users.view']);
    expect(screen.getByText('DENIED')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', () => {
    authState.user = null;
    render(
      <MemoryRouter initialEntries={['/admin/users']}>
        <Routes>
          <Route path="/login" element={<div>LOGIN</div>} />
          <Route path="/admin/users" element={<PermissionGuard permissions={['users.view']}><div>ALLOWED</div></PermissionGuard>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('LOGIN')).toBeInTheDocument();
  });

  it('shows loading while the session is loading', () => {
    authState.user = null;
    authState.loading = true;
    renderGuard(['users.view']);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
