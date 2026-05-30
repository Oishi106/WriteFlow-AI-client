'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const HOME_LOADER_DURATION = 3200;

export default function HomePageLoader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(pathname !== '/');

  useEffect(() => {
    if (pathname !== '/') {
      setIsReady(true);
      document.body.style.overflow = '';
      return;
    }

    setIsReady(false);

    const timer = window.setTimeout(() => {
      setIsReady(true);
    }, HOME_LOADER_DURATION);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname !== '/') {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = isReady ? '' : 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isReady, pathname]);

  const showLoader = pathname === '/' && !isReady;

  return (
    <>
      {children}

      {showLoader ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#060816] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(77,110,247,0.22),transparent_45%),linear-gradient(180deg,rgba(6,8,22,0.96),rgba(6,8,22,0.99))]" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />

          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            <div className="relative flex h-40 w-40 items-center justify-center">
              <div className="absolute h-40 w-40 rounded-full border border-white/20" />
              <div className="absolute h-32 w-32 rounded-full border border-white/70 border-t-white/20 animate-spin [animation-duration:1.8s]" />
              <div className="absolute h-24 w-24 rounded-full border border-brand-400/60 border-b-transparent border-r-transparent animate-spin [animation-duration:2.8s] [animation-direction:reverse]" />
              <div className="h-4 w-4 rounded-full bg-white shadow-[0_0_30px_rgba(255,255,255,0.65)]" />
            </div>

            <div className="mt-10 flex items-end gap-3">
              <span className="font-display text-4xl font-bold tracking-[0.38em] sm:text-5xl">WRITEFLOW</span>
              <span className="pb-1 text-sm font-semibold tracking-[0.5em] text-white/45">AI</span>
            </div>

            <p className="mt-5 max-w-sm text-sm uppercase tracking-[0.35em] text-white/50 sm:text-[0.9rem]">
              Preparing your writing space
            </p>

            <div className="mt-8 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-300 animate-pulse" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/80 animate-pulse [animation-delay:150ms]" />
              <span className="h-2.5 w-2.5 rounded-full bg-accent-400 animate-pulse [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}