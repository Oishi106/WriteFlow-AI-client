'use client';

import { useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useAuthStore } from '@/store/authStore';

function AuthSync() {
  const { data: session, status } = useSession();
  const syncSession = useAuthStore((state) => state.syncSession);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    syncSession(status === 'authenticated' ? session : null);
  }, [session, status, syncSession]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return;

    const apiToken = (session.user as { token?: string }).token;
    if (apiToken) {
      localStorage.setItem('writeflow_token', apiToken);
    }
  }, [session, status]);

  return null;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <AuthSync />
      {children}
    </SessionProvider>
  );
}
