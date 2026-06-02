import { NextResponse } from 'next/server';

type CreateRequest = {
  plan?: string;
  amount?: number;
  itemId?: string;
};

const PLAN_AMOUNTS: Record<string, number> = {
  pro: 1900,
  team: 4900,
};

const getOrigin = (request: Request) => {
  const headerOrigin = request.headers.get('origin');
  if (headerOrigin) return headerOrigin;
  return new URL(request.url).origin;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateRequest;
    const planKey = body.plan?.toLowerCase() || '';
    const itemId = body.itemId?.trim();

    const amountFromPlan = PLAN_AMOUNTS[planKey];
    const amount = amountFromPlan ?? (typeof body.amount === 'number' ? body.amount : NaN);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ message: 'Invalid payment amount.' }, { status: 400 });
    }

    // Mock mode for development
    if (process.env.NODE_ENV === 'development') {
      const origin = getOrigin(request);
      const now = Date.now();
      const successUrl = new URL('/payment/success', origin);
      successUrl.searchParams.set('trxId', `MOCK-${now}`);
      if (planKey) successUrl.searchParams.set('plan', planKey);
      if (itemId) successUrl.searchParams.set('itemId', itemId);
      return NextResponse.json({
        paymentId: `MOCK-${now}`,
        bkashURL: successUrl.toString(),
      });
    }

    const { createBkashPayment } = await import('@/lib/bkash');
    const origin = getOrigin(request);
    const callbackUrl = new URL('/api/bkash/callback', origin);
    callbackUrl.searchParams.set('plan', planKey || 'custom');
    if (itemId) callbackUrl.searchParams.set('itemId', itemId);

    const result = await createBkashPayment({
      amount,
      callbackURL: callbackUrl.toString(),
      merchantInvoiceNumber: `WF-${planKey || 'custom'}-${Date.now()}`,
    });

    return NextResponse.json({
      paymentId: result.paymentID,
      bkashURL: result.bkashURL,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not create payment.';
    return NextResponse.json({ message }, { status: 500 });
  }
}