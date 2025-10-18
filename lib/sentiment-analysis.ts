import Sentiment from 'sentiment';
import type {
  SteamReview,
  ReviewWithSentiment,
  SentimentScore,
  SentimentStats
} from './types';

const sentiment = new Sentiment();

/**
 * Analyze sentiment of a single review text
 */
export function analyzeSentiment(text: string): SentimentScore {
  const result = sentiment.analyze(text);

  return {
    score: result.score,
    comparative: result.comparative,
    tokens: result.tokens,
    positive: result.positive,
    negative: result.negative,
  };
}

/**
 * Get sentiment label based on score
 */
export function getSentimentLabel(score: number): 'positive' | 'neutral' | 'negative' {
  if (score > 1) return 'positive';
  if (score < -1) return 'negative';
  return 'neutral';
}

/**
 * Analyze a single review and add sentiment data
 */
export function analyzeReview(review: SteamReview): ReviewWithSentiment {
  const sentimentScore = analyzeSentiment(review.review);
  const sentimentLabel = getSentimentLabel(sentimentScore.score);

  return {
    ...review,
    sentiment: sentimentScore,
    sentimentLabel,
  };
}

/**
 * Analyze multiple reviews
 */
export function analyzeReviews(reviews: SteamReview[]): ReviewWithSentiment[] {
  return reviews.map(review => analyzeReview(review));
}

/**
 * Calculate sentiment statistics from analyzed reviews
 */
export function calculateSentimentStats(
  reviews: ReviewWithSentiment[]
): SentimentStats {
  const totalReviews = reviews.length;

  // Count sentiment labels
  const positiveCount = reviews.filter(r => r.sentimentLabel === 'positive').length;
  const neutralCount = reviews.filter(r => r.sentimentLabel === 'neutral').length;
  const negativeCount = reviews.filter(r => r.sentimentLabel === 'negative').length;

  // Calculate average sentiment score
  const averageScore = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.sentiment.score, 0) / totalReviews
    : 0;

  // Group reviews by date for timeline
  const reviewsByDate = new Map<string, ReviewWithSentiment[]>();

  reviews.forEach(review => {
    const date = new Date(review.timestamp_created * 1000).toISOString().split('T')[0];

    if (!reviewsByDate.has(date)) {
      reviewsByDate.set(date, []);
    }
    reviewsByDate.get(date)!.push(review);
  });

  // Calculate timeline data
  const timeline = Array.from(reviewsByDate.entries())
    .map(([date, dateReviews]) => ({
      date,
      averageScore: dateReviews.reduce((sum, r) => sum + r.sentiment.score, 0) / dateReviews.length,
      count: dateReviews.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    overall: {
      averageScore,
      positiveCount,
      neutralCount,
      negativeCount,
      totalReviews,
    },
    timeline,
  };
}

/**
 * Get sentiment color class for UI
 */
export function getSentimentColor(label: 'positive' | 'neutral' | 'negative'): string {
  switch (label) {
    case 'positive':
      return 'text-green-500';
    case 'negative':
      return 'text-red-500';
    case 'neutral':
      return 'text-yellow-500';
  }
}

/**
 * Get sentiment background color class for UI
 */
export function getSentimentBgColor(label: 'positive' | 'neutral' | 'negative'): string {
  switch (label) {
    case 'positive':
      return 'bg-green-500/20';
    case 'negative':
      return 'bg-red-500/20';
    case 'neutral':
      return 'bg-yellow-500/20';
  }
}

/**
 * Get sentiment emoji
 */
export function getSentimentEmoji(label: 'positive' | 'neutral' | 'negative'): string {
  switch (label) {
    case 'positive':
      return '😊';
    case 'negative':
      return '😞';
    case 'neutral':
      return '😐';
  }
}
