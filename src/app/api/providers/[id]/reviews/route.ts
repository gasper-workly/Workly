import { NextRequest, NextResponse } from 'next/server';
import { getProviderReviews } from '@/app/lib/reviews';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const reviews = await getProviderReviews(id);
    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

