import { NextRequest, NextResponse } from 'next/server';
import { getGameNews } from '@/lib/steam-community-api';

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

    const searchParams = request.nextUrl.searchParams;
    const count = parseInt(searchParams.get('count') || '10', 10);

    const news = await getGameNews(appIdNum, count);

    if (!news) {
      return NextResponse.json(
        { error: 'Failed to fetch news' },
        { status: 500 }
      );
    }

    return NextResponse.json(news);
  } catch (error) {
    console.error('Error in news API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
