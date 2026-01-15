import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/app/lib/orders';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { threadId, taskId, clientId, providerId, title, location, dateTimeISO, priceEur } = body ?? {};
    if (!threadId || !taskId || !clientId || !providerId || !title || !location || !dateTimeISO || !priceEur) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const order = await createOrder({ threadId, taskId, clientId, providerId, title, location, dateTimeISO, priceEur });
    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

