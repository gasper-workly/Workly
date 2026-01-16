import { NextRequest, NextResponse } from 'next/server';
import { declineOrder } from '@/app/lib/orders';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const order = await declineOrder(id);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  return NextResponse.json(order);
}

