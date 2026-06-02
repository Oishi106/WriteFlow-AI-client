import { NextResponse } from 'next/server';
import { executeBkashPayment } from '@/lib/bkash';

const buildRedirect = (request: Request, pathname: string, params: Record<string, string>) => {
  const origin = request.headers.get('origin') || new URL(request.url).origin;
  const url = new URL(pathname, origin);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return NextResponse.redirect(url);
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';
  const paymentId = searchParams.get('paymentID') || '';
  const plan = searchParams.get('plan') || 'custom';
  const itemId = searchParams.get('itemId') || '';

  if (status !== 'success' || !paymentId) {
    return buildRedirect(request, '/payment/failed', {
      status: status || 'failed',
    });
  }

  try {
    const result = await executeBkashPayment(paymentId);
    const trxId = typeof result.trxID === 'string' ? result.trxID : '';

    return buildRedirect(request, '/payment/success', {
      plan,
      paymentId,
      trxId,
      ...(itemId ? { itemId } : {}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payment execution failed.';
    return buildRedirect(request, '/payment/failed', {
      status: 'execute_failed',
      message,
    });
  }
}
