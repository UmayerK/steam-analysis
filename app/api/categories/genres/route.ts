import { NextResponse } from 'next/server';
import { getAvailableGenres } from '@/lib/steamspy-api';

export async function GET() {
  try {
    const genres = getAvailableGenres();
    return NextResponse.json({ genres });
  } catch (error) {
    console.error('Error fetching genres:', error);
    return NextResponse.json(
      { error: 'Failed to fetch genres' },
      { status: 500 }
    );
  }
}
