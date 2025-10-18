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

    // Calculate sentiment statistics from our analysis
    const sentimentStats = calculateSentimentStats(reviewsWithSentiment);

    // Use Steam's actual review summary for overall statistics (more accurate)
    // Our sentiment analysis is for individual review enrichment
    const steamSummary = reviewsData.query_summary;
    const totalReviews = steamSummary.total_reviews;
    const positiveReviews = steamSummary.total_positive;
    const negativeReviews = steamSummary.total_negative;

    return NextResponse.json({
      overall: {
        averageScore: sentimentStats.overall.averageScore,
        positiveCount: positiveReviews, // Use Steam's total
        neutralCount: 0, // Steam doesn't track neutral
        negativeCount: negativeReviews, // Use Steam's total
        totalReviews: totalReviews, // Use Steam's total
      },
      timeline: sentimentStats.timeline,
      steamStats: steamSummary,
    });
  } catch (error) {
    console.error('Error calculating sentiment stats:', error);
    return NextResponse.json(
      { error: 'Failed to calculate sentiment statistics' },
      { status: 500 }
    );
  }
}
