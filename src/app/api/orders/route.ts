import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/app/lib/orders';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { threadId: _threadId, taskId, clientId, providerId, title, location, dateTimeISO, priceEur } = body ?? {};
    const numericPrice = typeof priceEur === 'number' ? priceEur : Number(priceEur);
    if (!taskId || !clientId || !providerId || !title || !dateTimeISO || !Number.isFinite(numericPrice)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const order = await createOrder({
      job_id: taskId,
      client_id: clientId,
      provider_id: providerId,
      title,
      location,
      date_time: dateTimeISO,
      price_eur: numericPrice,
    });
    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

