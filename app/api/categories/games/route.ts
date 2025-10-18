import { NextRequest, NextResponse } from 'next/server';
import { getGamesByGenre, getGamesByTag } from '@/lib/steamspy-api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'genre' or 'tag'
    const value = searchParams.get('value');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '20', 10);

    if (!type || !value) {
      return NextResponse.json(
        { error: 'Type and value parameters are required' },
        { status: 400 }
      );
    }

    let games;
    if (type === 'genre') {
      games = await getGamesByGenre(value);
    } else if (type === 'tag') {
      games = await getGamesByTag(value);
    } else {
      return NextResponse.json(
        { error: 'Invalid type parameter. Must be "genre" or "tag"' },
        { status: 400 }
      );
    }

    // Pagination
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedGames = games.slice(startIndex, endIndex);

    return NextResponse.json({
      games: paginatedGames,
      total: games.length,
      page,
      perPage,
      totalPages: Math.ceil(games.length / perPage),
    });
  } catch (error) {
    console.error('Error fetching games by category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}
