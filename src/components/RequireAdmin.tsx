/**
 * Bảo vệ route chỉ dành cho admin
 */

import { Navigate } from 'react-router';
import { useAuthStore } from '../stores/authStore';

interface RequireAdminProps {
  children: React.ReactNode;
}

export default function RequireAdmin({ children }: RequireAdminProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/my-account" replace />;
  }

  return <>{children}</>;
}
