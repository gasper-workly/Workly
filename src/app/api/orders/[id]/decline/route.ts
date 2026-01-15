import { NextRequest, NextResponse } from 'next/server';
import { declineOrder } from '@/app/lib/orders';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const order = await declineOrder(params.id);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  return NextResponse.json(order);
}

