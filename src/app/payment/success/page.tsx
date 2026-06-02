'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Suspense, useEffect } from 'react';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trxID = searchParams.get('trxId') || searchParams.get('trxID');
  const paymentId = searchParams.get('paymentId') || searchParams.get('paymentID');
  const plan = searchParams.get('plan');
  const itemId = searchParams.get('itemId');
  const redirectTo = itemId ? `/editor?itemId=${encodeURIComponent(itemId)}` : '/editor';

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(redirectTo);
    }, 1400);
    return () => clearTimeout(timer);
  }, [router, redirectTo]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Payment Successful!</h1>
        <p className="text-muted-foreground mb-6">
          Your {plan && <span className="font-semibold capitalize">{plan}</span>} plan has been activated.
        </p>
        {(trxID || paymentId) && (
          <div className="text-xs text-muted-foreground mb-8 space-y-1">
            {trxID && (
              <p>
                Transaction ID: <span className="font-mono">{trxID}</span>
              </p>
            )}
            {paymentId && (
              <p>
                Payment ID: <span className="font-mono">{paymentId}</span>
              </p>
            )}
          </div>
        )}
        <Link
          href={redirectTo}
          className="inline-block py-3 px-8 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold"
        >
          Continue to Editor
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentSuccessContent />
    </Suspense>
  );
}