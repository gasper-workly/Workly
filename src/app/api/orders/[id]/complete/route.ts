import { NextRequest, NextResponse } from 'next/server';
import { completeOrder } from '@/app/lib/orders';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const order = await completeOrder(params.id);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  return NextResponse.json(order);
}

