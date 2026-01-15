import { NextRequest, NextResponse } from 'next/server';
import { getOrdersForThread } from '@/app/lib/orders';

export async function GET(_req: NextRequest, { params }: { params: { threadId: string } }) {
  try {
    const orders = await getOrdersForThread(params.threadId);
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

