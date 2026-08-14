/**
 * Bảo vệ route yêu cầu đăng nhập
 */

import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '../stores/authStore';

interface RequireAuthProps {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
