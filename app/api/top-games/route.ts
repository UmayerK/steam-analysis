import { NextRequest, NextResponse } from 'next/server';
import {
  getTop100Games,
  filterByPriceRange,
  filterByGenre,
  sortGames,
} from '@/lib/steamspy-api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const priceRange = searchParams.get('priceRange') as 'free' | 'under10' | '10to30' | 'over30' | null;
    const genre = searchParams.get('genre');
    const sortBy = searchParams.get('sortBy') as 'players' | 'rating' | 'name' | null;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '20', 10);

    // Fetch top 100 games
    let games = await getTop100Games();

    // Apply filters
    if (priceRange) {
      games = filterByPriceRange(games, priceRange);
    }

    if (genre) {
      games = filterByGenre(games, genre);
    }

    // Sort games
    if (sortBy) {
      games = sortGames(games, sortBy);
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
    console.error('Error in top-games API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top games' },
      { status: 500 }
    );
  }
}
