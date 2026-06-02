'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { itemsApi } from '@/lib/api';

const plans = [
  { key: 'pro', name: 'Pro', price: 1900, period: 'per month', summary: 'For solo creators and freelancers.' },
  { key: 'team', name: 'Team', price: 4900, period: 'per month', summary: 'For content teams at scale.' },
];

const formatPrice = (amount: number) => `${amount.toLocaleString('en-US')} BDT`;
const USD_BDT_RATE = Number(process.env.NEXT_PUBLIC_USD_BDT_RATE || 0);

type ItemSummary = { _id: string; title: string; price?: number };
const parsePayload = (res: any) => res?.data ?? res;

function CheckoutContent() {
  const searchParams = useSearchParams();
  const planFromQuery = searchParams.get('plan')?.toLowerCase() || '';
  const itemId = searchParams.get('itemId') || '';
  const [selectedPlan, setSelectedPlan] = useState(planFromQuery || 'pro');
  const [item, setItem] = useState<ItemSummary | null>(null);
  const [itemLoading, setItemLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const activePlan = useMemo(
    () => plans.find((plan) => plan.key === selectedPlan) || plans[0],
    [selectedPlan]
  );

  const itemPriceBDT = item?.price && USD_BDT_RATE > 0
    ? Math.round(item.price * USD_BDT_RATE)
    : null;

  useEffect(() => {
    if (!itemId) return;
    setItemLoading(true);
    itemsApi.getItemById(itemId)
      .then((res) => {
        const payload = parsePayload(res);
        const data = (payload?.data ?? payload) as ItemSummary;
        if (data?._id) setItem(data);
      })
      .catch(() => setItem(null))
      .finally(() => setItemLoading(false));
  }, [itemId]);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      if (itemId && !itemPriceBDT) {
        throw new Error('Item price is unavailable. Please try again later.');
      }
      const response = await fetch('/api/bkash/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          itemId
            ? { amount: itemPriceBDT, itemId }
            : { plan: activePlan.key, itemId: itemId || undefined }
        ),
      });

      const payload = (await response.json()) as { bkashURL?: string; message?: string };
      if (!response.ok || !payload.bkashURL) {
        throw new Error(payload.message || 'Unable to start payment.');
      }
      window.location.href = payload.bkashURL;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment failed to start.';
      toast({ title: 'bKash error', description: message, variant: 'destructive' });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-brand-500 text-xs font-semibold uppercase tracking-[0.3em]">Checkout</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3">Pay with bKash</h1>
          <p className="text-muted-foreground mt-4 max-w-2xl">
            You will be redirected to the bKash secure checkout. After payment, we will confirm the transaction and unlock your plan.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <div className="space-y-4">
            {itemId ? (
              <div className="w-full rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Template</p>
                    <p className="text-xl font-semibold">
                      {itemLoading ? 'Loading template...' : item?.title || 'Selected template'}
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">One-time purchase</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{itemPriceBDT ? formatPrice(itemPriceBDT) : '—'}</p>
                    <p className="text-muted-foreground text-xs">total</p>
                  </div>
                </div>
              </div>
            ) : (
              plans.map((plan) => (
                <button
                  key={plan.key}
                  type="button"
                  onClick={() => setSelectedPlan(plan.key)}
                  className={`w-full text-left rounded-2xl border p-6 transition-all ${
                    activePlan.key === plan.key
                      ? 'border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/10'
                      : 'border-border bg-card hover:border-brand-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-semibold">{plan.name}</p>
                      <p className="text-muted-foreground text-sm mt-1">{plan.summary}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatPrice(plan.price)}</p>
                      <p className="text-muted-foreground text-xs">{plan.period}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 h-fit">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-500/15 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-brand-500" />
              </div>
              <div>
                <p className="text-sm font-semibold">Secure payment</p>
                <p className="text-xs text-muted-foreground">Powered by bKash tokenized checkout</p>
              </div>
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{itemId ? 'Template' : 'Plan'}</span>
                <span className="font-medium">
                  {itemId ? item?.title || 'Selected template' : activePlan.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">
                  {itemId && itemPriceBDT ? formatPrice(itemPriceBDT) : formatPrice(activePlan.price)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={isLoading}
              className="mt-6 w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting...</>
              ) : (
                'Pay with bKash'
              )}
            </button>

            <p className="text-xs text-muted-foreground mt-4">
              Not ready?{' '}
              <Link href="/" className="text-brand-500 hover:underline">Go back</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}