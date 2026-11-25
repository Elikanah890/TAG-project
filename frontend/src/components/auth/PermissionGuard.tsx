import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AccessDenied from '@/pages/AccessDenied';

type Props = {
  children: JSX.Element;
  roles?: string[];
  permissions?: string[];
  anyPermissions?: string[];
  allowPasswordChange?: boolean;
};

export default function PermissionGuard({ children, roles, permissions, anyPermissions, allowPasswordChange }: Props) {
  const { user, loading, hasRole, hasPermission, hasAnyPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-black/60">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (user.mustChangePassword && !allowPasswordChange) {
    return <Navigate to="/change-password" replace state={{ from: location.pathname }} />;
  }
  if (roles?.length && !hasRole(...roles)) return <AccessDenied />;
  if (permissions?.length && !hasPermission(...permissions)) return <AccessDenied required={permissions} />;
  if (anyPermissions?.length && !hasAnyPermission(...anyPermissions)) return <AccessDenied required={anyPermissions} />;
  return children;
}
