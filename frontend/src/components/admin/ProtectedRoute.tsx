import PermissionGuard from '@/components/auth/PermissionGuard';

export default function ProtectedRoute({ children, roles, allowPasswordChange }: { children: JSX.Element; roles?: string[]; allowPasswordChange?: boolean }) {
  return <PermissionGuard roles={roles} allowPasswordChange={allowPasswordChange}>{children}</PermissionGuard>;
}
