import { NextRequest, NextResponse } from 'next/server';
import { getJobReview } from '@/app/lib/reviews';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const review = await getJobReview(id);
    return NextResponse.json(review ?? {});
  } catch {
    return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 });
  }
}

