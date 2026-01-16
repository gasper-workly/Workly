import { NextRequest, NextResponse } from 'next/server';
import { getOrdersForThread } from '@/app/lib/orders';

type RouteContext = { params: Promise<{ threadId: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { threadId } = await context.params;
    const orders = await getOrdersForThread(threadId);
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

