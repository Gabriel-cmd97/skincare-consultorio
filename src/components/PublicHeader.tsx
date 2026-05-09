'use client';

import { usePathname } from 'next/navigation';

export default function PublicHeader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const isPWA = pathname?.startsWith('/pwa');

  if (isDashboard || isPWA) {
    return null;
  }

  return <>{children}</>;
}
