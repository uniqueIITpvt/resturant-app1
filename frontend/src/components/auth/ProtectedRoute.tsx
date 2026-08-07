'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}

export default function ProtectedRoute({
  children,
  requiresAuth = true,
  adminOnly = false,
  superAdminOnly = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isSuperAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requiresAuth && !isAuthenticated()) {
        // User is not authenticated, redirect to login
        router.push('/auth/login');
      } else if (superAdminOnly && !isSuperAdmin()) {
        // Page requires superadmin privileges but user is not a superadmin
        router.push('/');
      } else if (adminOnly && !isAdmin()) {
        // Page requires admin privileges but user is neither admin nor superadmin
        router.push('/');
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    router,
    adminOnly,
    superAdminOnly,
    requiresAuth,
  ]);

  // If still loading auth state or redirecting, show loading spinner
  if (
    isLoading ||
    (requiresAuth && !isAuthenticated()) ||
    (superAdminOnly && !isSuperAdmin()) ||
    (adminOnly && !isAdmin())
  ) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500'></div>
      </div>
    );
  }

  // User has appropriate privileges, render children
  return <>{children}</>;
}
