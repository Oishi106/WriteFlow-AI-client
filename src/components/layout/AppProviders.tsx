'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import AuthSync from '@/components/layout/AuthSync';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} basePath="/api/auth">
      <AuthSync />
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
