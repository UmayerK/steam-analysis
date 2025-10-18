import { NextRequest, NextResponse } from 'next/server';
import { getGameReviews } from '@/lib/steam-api';
import { analyzeReviews } from '@/lib/sentiment-analysis';

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
    const cursor = searchParams.get('cursor') || undefined;
    const numPerPage = parseInt(searchParams.get('num_per_page') || '20', 10);
    const filter = searchParams.get('filter') as 'recent' | 'updated' | 'all' | undefined;

    const reviewsData = await getGameReviews(appIdNum, {
      cursor,
      num_per_page: numPerPage,
      filter,
    });

    if (!reviewsData) {
      return NextResponse.json(
        { error: 'Reviews not found' },
        { status: 404 }
      );
    }

    // Analyze sentiment for each review
    const reviewsWithSentiment = analyzeReviews(reviewsData.reviews);

    return NextResponse.json({
      ...reviewsData,
      reviews: reviewsWithSentiment,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
