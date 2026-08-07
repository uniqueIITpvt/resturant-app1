'use client';

import { usePathname } from 'next/navigation';
import UserNavbar from './UserNavbar';

export default function ClientNavbarWrapper() {
  const pathname = usePathname();
  const isDashboardPage = pathname?.startsWith('/dashboard');
  const isAuthPage = pathname?.startsWith('/auth');

  return <>{!isDashboardPage && !isAuthPage && <UserNavbar />}</>;
}
