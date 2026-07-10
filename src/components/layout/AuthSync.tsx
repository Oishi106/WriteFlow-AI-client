'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/store/authStore';

export default function AuthSync() {
  const { data: session, status } = useSession();
  const syncSession = useAuthStore((state) => state.syncSession);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }                                   

    if (isLoggingOut) {
      if (status === 'unauthenticated') {
        syncSession(null);                       
      }
      return;
    }

    syncSession(status === 'authenticated' ? session : null);
  }, [session, status, syncSession, isLoggingOut]);

  useEffect(() => {
    if (isLoggingOut || status !== 'authenticated' || !session?.user) return;

    const apiToken = session.user.token;
    if (apiToken) {
      localStorage.setItem('writeflow_token', apiToken);
    }
  }, [session, status, isLoggingOut]);

  return null;
}
