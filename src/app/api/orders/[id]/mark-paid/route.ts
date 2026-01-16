import { NextRequest, NextResponse } from 'next/server';
import { markOrderPaid } from '@/app/lib/orders';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const order = await markOrderPaid(id);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  return NextResponse.json(order);
}

