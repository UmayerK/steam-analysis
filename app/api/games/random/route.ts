import { NextResponse } from 'next/server';
import { getRandomGamesForBanner, getGameDetails } from '@/lib/steam-api';

export async function GET() {
  try {
    const games = await getRandomGamesForBanner(5);

    // Fetch details for each game
    const gamesWithDetails = await Promise.all(
      games.map(async (game) => {
        const details = await getGameDetails(game.appid);
        return {
          appid: game.appid,
          name: game.name,
          details,
        };
      })
    );

    // Filter out games that don't have details
    const validGames = gamesWithDetails.filter(game => game.details !== null);

    return NextResponse.json(validGames);
  } catch (error) {
    console.error('Error fetching random games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch random games' },
      { status: 500 }
    );
  }
}
