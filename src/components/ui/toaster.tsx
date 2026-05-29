'use client';

import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle } from 'lucide-react';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm pointer-events-auto animate-slide-in-right',
            t.variant === 'destructive'
              ? 'bg-destructive text-destructive-foreground border-destructive/50'
              : 'bg-card text-foreground border-border'
          )}
        >
          {t.variant === 'destructive' ? (
            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-500" />
          )}
          <div>
            <p className="font-medium">{t.title}</p>
            {t.description && <p className="text-sm opacity-80 mt-0.5">{t.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
