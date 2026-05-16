'use client';

import { usePathname } from 'next/navigation';

export default function PublicHeader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const isPWA = pathname?.startsWith('/pwa');
  const isAdmin = pathname?.startsWith('/admin');

  if (isDashboard || isPWA || isAdmin) {
    return null;
  }

  return <>{children}</>;
}
