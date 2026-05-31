'use client';

import { useEffect, useState } from 'react';

type AuthUser = {
  role?: string;
  [key: string]: unknown;
};

type UseAuthResult = {
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
};

export const useAuth = (): UseAuthResult => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('writeflow_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored) as AuthUser);
        } catch {
          localStorage.removeItem('writeflow_user');
        }
      }
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    isAdmin: user?.role === 'ADMIN',
  };
};
