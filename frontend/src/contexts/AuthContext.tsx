import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { clearSession } from '@/lib/api';
import { canAccessDashboard as canAccessDashboardPath, dashboardPathForRole, hasAllPermissions, hasAnyPermission as hasAnyGrantedPermission, pickActiveRole } from '@/lib/access';

export type DashboardDef = { role: string; path: string; label: string; description: string };

export type AuthUser = {
  id: string;
  email: string;
  phone?: string | null;
  status: string;
  mustChangePassword?: boolean;
  roles: string[];
  permissions?: string[];
  dashboards?: DashboardDef[];
  defaultDashboard?: string | null;
  scopes?: { scopeType: string; scopeId: string }[];
  member?: any;
  lastLoginAt?: string | null;
};

export type LoginSession = {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
  permissions: string[];
  dashboards: DashboardDef[];
  defaultDashboard: string | null;
  scopes: { scopeType: string; scopeId: string }[];
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  permissions: string[];
  dashboards: DashboardDef[];
  activeRole: string | null;
  activeDashboard: DashboardDef | null;
  login: (email: string, password: string) => Promise<LoginSession>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  hasRole: (...roles: string[]) => boolean;
  hasPermission: (...permissions: string[]) => boolean;
  hasAnyPermission: (...permissions: string[]) => boolean;
  canAccessDashboard: (path: string) => boolean;
  switchRole: (role: string) => Promise<string | null>;
  reloadSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [permissions, setPermissions] = useState<string[]>([]);
  const [dashboards, setDashboards] = useState<DashboardDef[]>([]);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((data: any, preferredRole?: string | null) => {
    const roles: string[] = data?.roles || data?.user?.roles || [];
    const perms: string[] = data?.permissions || [];
    const boards: DashboardDef[] = data?.dashboards || [];
    const nextUser: AuthUser = {
      ...(data?.user || data),
      roles,
      permissions: perms,
      dashboards: boards,
      defaultDashboard: data?.defaultDashboard ?? null,
      scopes: data?.scopes || [],
    };
    setUser(nextUser);
    setPermissions(perms);
    setDashboards(boards);
    const stored = preferredRole ?? localStorage.getItem('activeRole');
    const role = pickActiveRole(roles, boards, stored);
    setActiveRole(role);
    if (role) localStorage.setItem('activeRole', role);
  }, []);

  const resetState = useCallback(() => {
    setUser(null);
    setToken(null);
    setPermissions([]);
    setDashboards([]);
    setActiveRole(null);
  }, []);

  const reloadSession = useCallback(async () => {
    const stored = localStorage.getItem('token');
    if (!stored) {
      resetState();
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      applySession(res.data);
    } catch {
      clearSession();
      resetState();
    } finally {
      setLoading(false);
    }
  }, [applySession, resetState]);

  useEffect(() => {
    reloadSession();
  }, [reloadSession]);

  useEffect(() => {
    const onLogout = () => {
      resetState();
      setLoading(false);
    };
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, [resetState]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;
      localStorage.setItem('token', data.accessToken);
      localStorage.removeItem('activeRole');
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      setToken(data.accessToken);
      applySession(data);
      return data as LoginSession;
    },
    [applySession],
  );

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      api.post('/auth/logout', { refreshToken }).catch(() => undefined);
    }
    clearSession();
    resetState();
  }, [resetState]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await api.post('/auth/change-password', { currentPassword, newPassword });
    clearSession();
    resetState();
  }, [resetState]);

  const hasRole = useCallback((...roles: string[]) => !!user && roles.some((r) => user.roles.includes(r)), [user]);

  const hasPermission = useCallback(
    (...required: string[]) => !!user && hasAllPermissions(permissions, required),
    [user, permissions],
  );

  const hasAnyPermission = useCallback(
    (...required: string[]) => !!user && hasAnyGrantedPermission(permissions, required),
    [user, permissions],
  );

  const canAccessDashboard = useCallback((path: string) => canAccessDashboardPath(dashboards, path), [dashboards]);

  const switchRole = useCallback(
    async (role: string) => {
      if (!user?.roles.includes(role)) return null;
      const targetPath = dashboardPathForRole(dashboards, role);
      if (!targetPath) return null;
      // Re-validate against the server: roles may have been revoked.
      try {
        const res = await api.get('/auth/me');
        const freshRoles: string[] = res.data?.roles || [];
        applySession(res.data, role);
        if (!freshRoles.includes(role)) {
          return null;
        }
        return targetPath;
      } catch {
        return null;
      }
    },
    [user, dashboards, applySession],
  );

  const activeDashboard = useMemo(
    () => dashboards.find((d) => d.role === activeRole) || null,
    [dashboards, activeRole],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      permissions,
      dashboards,
      activeRole,
      activeDashboard,
      login,
      logout,
      changePassword,
      hasRole,
      hasPermission,
      hasAnyPermission,
      canAccessDashboard,
      switchRole,
      reloadSession,
    }),
    [user, token, loading, permissions, dashboards, activeRole, activeDashboard, login, logout, changePassword, hasRole, hasPermission, hasAnyPermission, canAccessDashboard, switchRole, reloadSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
