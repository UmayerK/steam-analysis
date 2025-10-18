import { NextRequest, NextResponse } from 'next/server';
import { getGameReviews } from '@/lib/steam-api';
import { analyzeReviews, calculateSentimentStats } from '@/lib/sentiment-analysis';

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

    // Fetch more reviews for better sentiment statistics
    const reviewsData = await getGameReviews(appIdNum, {
      num_per_page: 100,
      filter: 'all',
    });

    if (!reviewsData || reviewsData.reviews.length === 0) {
      return NextResponse.json(
        { error: 'No reviews found for sentiment analysis' },
        { status: 404 }
      );
    }

    // Analyze sentiment for each review
    const reviewsWithSentiment = analyzeReviews(reviewsData.reviews);

    // Calculate sentiment statistics
    const sentimentStats = calculateSentimentStats(reviewsWithSentiment);

    return NextResponse.json({
      ...sentimentStats,
      steamStats: reviewsData.query_summary,
    });
  } catch (error) {
    console.error('Error calculating sentiment stats:', error);
    return NextResponse.json(
      { error: 'Failed to calculate sentiment statistics' },
      { status: 500 }
    );
  }
}
