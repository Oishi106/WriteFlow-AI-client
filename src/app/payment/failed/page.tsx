'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || 'failed';
  const message = searchParams.get('message') || '';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-lg w-full rounded-2xl border border-border bg-card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="font-display text-3xl font-bold mt-4">Payment not completed</h1>
        <p className="text-muted-foreground mt-2">
          We could not confirm your payment. You can try again or choose another plan.
        </p>

        <div className="mt-6 text-sm text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium">{status}</span>
          </div>
          {message && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Details</span>
              <span className="font-medium">{message}</span>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link href="/checkout" className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold">
            Try again
          </Link>
          <Link href="/" className="w-full py-3 rounded-xl border border-border text-foreground font-semibold">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense>
      <PaymentFailedContent />
    </Suspense>
  );
}