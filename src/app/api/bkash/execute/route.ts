import { NextResponse } from 'next/server';
import { executeBkashPayment } from '@/lib/bkash';

type ExecuteRequest = {
  paymentId?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExecuteRequest;
    if (!body.paymentId) {
      return NextResponse.json({ message: 'Missing paymentId.' }, { status: 400 });
    }

    const result = await executeBkashPayment(body.paymentId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not execute payment.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
