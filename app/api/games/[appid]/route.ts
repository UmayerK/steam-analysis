import { NextRequest, NextResponse } from 'next/server';
import { getGameDetails } from '@/lib/steam-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appid: string }> }
) {
  try {
    const { appid } = await params;
    const appIdNum = parseInt(appid, 10);

    if (isNaN(appIdNum)) {
      return NextResponse.json(
        { error: 'Invalid app ID' },
        { status: 400 }
      );
    }

    const gameDetails = await getGameDetails(appIdNum);

    if (!gameDetails) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(gameDetails);
  } catch (error) {
    console.error('Error fetching game details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game details' },
      { status: 500 }
    );
  }
}
