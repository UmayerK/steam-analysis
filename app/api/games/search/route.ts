import { NextRequest, NextResponse } from 'next/server';
import { searchGames } from '@/lib/steam-api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const games = await searchGames(query);

    return NextResponse.json(games);
  } catch (error) {
    console.error('Error searching games:', error);
    return NextResponse.json(
      { error: 'Failed to search games' },
      { status: 500 }
    );
  }
}
