import { NextRequest, NextResponse } from 'next/server';
import { getJobReview } from '@/app/lib/reviews';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const review = await getJobReview(params.id);
    return NextResponse.json(review ?? {});
  } catch {
    return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 });
  }
}

