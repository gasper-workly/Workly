import { NextRequest, NextResponse } from 'next/server';
import { getProviderReviews } from '@/app/lib/reviews';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reviews = await getProviderReviews(params.id);
    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

