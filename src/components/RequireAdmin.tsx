/**
 * Bảo vệ route chỉ dành cho admin & super_admin
 */

import { useEffect } from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '../stores/authStore';

interface RequireAdminProps {
  children: React.ReactNode;
}

export default function RequireAdmin({ children }: RequireAdminProps) {
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin' && user.role !== 'super_admin') {
      console.warn(`[RequireAdmin] Role "${user.role}" không có quyền truy cập admin route`);
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Chấp nhận cả admin và super_admin
  if (user?.role !== 'admin' && user?.role !== 'super_admin') {
    return <Navigate to="/my-account" replace />;
  }

  return <>{children}</>;
}
