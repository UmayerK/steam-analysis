import { NextResponse } from 'next/server';
import { getPopularTags } from '@/lib/steamspy-api';

export async function GET() {
  try {
    const tags = getPopularTags();
    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}
