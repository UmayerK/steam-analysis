import Sentiment from 'sentiment';
import type {
  SteamReview,
  ReviewWithSentiment,
  SentimentScore,
  SentimentStats
} from './types';

const sentiment = new Sentiment();

// Add custom gaming-specific words
sentiment.registerLanguage('en', {
  labels: {
    // Positive gaming terms
    'masterpiece': 5,
    'amazing': 3,
    'awesome': 3,
    'epic': 3,
    'goat': 5, // Greatest of all time
    'pog': 3,
    'poggers': 3,
    'gg': 2,
    'ez': 1,
    'op': 2, // Overpowered (positive context)
    'insane': 3,
    'fire': 3,
    'banger': 3,
    'slaps': 3,
    'bussin': 3,
    'based': 2,
    'lit': 3,
    'goated': 4,
    'valid': 2,
    // Negative gaming terms
    'trash': -3,
    'garbage': -3,
    'boring': -2,
    'mid': -1,
    'meh': -1,
    'cringe': -2,
    'unplayable': -4,
    'buggy': -2,
    'broken': -3,
    'cheaters': -3,
    'cheater': -3,
    'hackers': -3,
    'hacker': -3,
    'p2w': -3, // Pay to win
    'scam': -4,
    'cashgrab': -4,
  }
});

/**
 * Extract rating patterns from text (e.g., "10/10", "9/10")
 */
function extractRatingScore(text: string): number | null {
  // Match patterns like 10/10, 9/10, 8/10, etc.
  const ratingPattern = /(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/g;
  const matches = [...text.matchAll(ratingPattern)];

  if (matches.length === 0) return null;

  let totalScore = 0;
  let count = 0;

  for (const match of matches) {
    const numerator = parseFloat(match[1]);
    const denominator = parseFloat(match[2]);

    if (denominator > 0) {
      // Normalize to -5 to 5 scale
      const normalizedScore = ((numerator / denominator) * 10) - 5;
      totalScore += normalizedScore;
      count++;
    }
  }

  return count > 0 ? totalScore / count : null;
}

/**
 * Analyze emoji sentiment
 */
function analyzeEmojiSentiment(text: string): number {
  const positiveEmojis = ['👍', '😊', '😁', '😂', '🤣', '😍', '🥰', '😎', '🔥', '💯', '✨', '⭐', '🎉', '🎮', '❤️', '💖', '👌', '🙌', '💪'];
  const negativeEmojis = ['👎', '😞', '😢', '😭', '😡', '😤', '🤮', '💩', '❌', '⛔'];

  let score = 0;

  for (const emoji of positiveEmojis) {
    score += (text.match(new RegExp(emoji, 'g')) || []).length * 2;
  }

  for (const emoji of negativeEmojis) {
    score -= (text.match(new RegExp(emoji, 'g')) || []).length * 2;
  }

  return score;
}

/**
 * Pre-process review text for better sentiment analysis
 */
function preprocessReviewText(text: string): string {
  let processed = text;

  // Replace rating patterns with sentiment words to help the analyzer
  processed = processed.replace(/10\s*\/\s*10/gi, ' perfect excellent ');
  processed = processed.replace(/9\s*\/\s*10/gi, ' great ');
  processed = processed.replace(/8\s*\/\s*10/gi, ' good ');
  processed = processed.replace(/7\s*\/\s*10/gi, ' decent ');
  processed = processed.replace(/([1-4])\s*\/\s*10/gi, ' bad ');
  processed = processed.replace(/5\s*\/\s*10/gi, ' okay ');
  processed = processed.replace(/6\s*\/\s*10/gi, ' okay ');

  return processed;
}

/**
 * Analyze sentiment of review text using NLP
 * Combines base sentiment with rating patterns and emoji analysis
 */
export function analyzeSentiment(text: string): SentimentScore {
  // Pre-process text to convert rating patterns into sentiment words
  const processedText = preprocessReviewText(text);

  // Run NLP sentiment analysis
  const result = sentiment.analyze(processedText);

  // Extract and normalize rating patterns (10/10 → positive boost)
  const ratingScore = extractRatingScore(text);

  // Analyze emoji sentiment
  const emojiScore = analyzeEmojiSentiment(text);

  // Weight different signals based on review length
  const isShortReview = text.length < 50;
  let finalScore: number;

  if (isShortReview) {
    // Short reviews: Give more weight to ratings/emojis (40% base, 40% rating, 20% emoji)
    finalScore = (result.score * 0.4) + ((ratingScore || 0) * 0.4) + (emojiScore * 0.2);
  } else {
    // Long reviews: Prioritize text analysis (70% base, 20% rating, 10% emoji)
    finalScore = (result.score * 0.7) + ((ratingScore || 0) * 0.2) + (emojiScore * 0.1);
  }

  return {
    score: Math.round(finalScore * 10) / 10,
    comparative: result.comparative,
    tokens: result.tokens,
    positive: result.positive,
    negative: result.negative,
  };
}

/**
 * Get sentiment label based on 0-10 score
 */
export function getSentimentLabel(score: number): 'positive' | 'neutral' | 'negative' {
  if (score >= 6) return 'positive';
  if (score <= 4) return 'negative';
  return 'neutral';
}

/**
 * Analyze a single review and add sentiment data
 * Returns a 0-10 score combining Steam's vote with text analysis
 *
 * Score ranges:
 * - 9-10: Exceptional positive (e.g., "10/10 masterpiece", "best game ever")
 * - 7-8: Very positive (e.g., "great game", "highly recommend")
 * - 6-7: Positive (e.g., "good", "worth it")
 * - 4-6: Neutral/Mixed
 * - 3-4: Negative (e.g., "not good", "disappointing")
 * - 1-2: Very negative (e.g., "trash", "terrible")
 * - 0-1: Extremely negative (e.g., "worst game", "complete garbage")
 */
export function analyzeReview(review: SteamReview): ReviewWithSentiment {
  // Get text-based sentiment analysis
  const textSentiment = analyzeSentiment(review.review);

  // Start with Steam's thumbs up/down as foundation
  // Use a wider base score range to create more variation
  const reviewLength = review.review.length;

  // Adjust base score based on review length and sentiment strength
  let baseScore: number;
  if (review.voted_up) {
    // Positive reviews: Start between 5.0-7.0 depending on length and sentiment
    const lengthBonus = Math.min(reviewLength / 100, 1.5); // 0 to 1.5 based on length
    const sentimentBonus = textSentiment.comparative > 0 ? textSentiment.comparative * 2 : 0;
    baseScore = 5.0 + lengthBonus + sentimentBonus;
  } else {
    // Negative reviews: Start between 3.0-5.0 depending on length and sentiment
    const lengthPenalty = Math.min(reviewLength / 100, 1.0);
    const sentimentPenalty = textSentiment.comparative < 0 ? Math.abs(textSentiment.comparative) * 2 : 0;
    baseScore = 5.0 - lengthPenalty - sentimentPenalty;
  }

  // Calculate adjustments from text sentiment
  // Amplify absolute sentiment score heavily
  const absoluteAdjustment = textSentiment.score * 2.0;

  // Calculate positive/negative word ratio and amplify
  const wordRatio = textSentiment.tokens.length > 0
    ? (textSentiment.positive.length - textSentiment.negative.length) / textSentiment.tokens.length
    : 0;
  const wordRatioAdjustment = wordRatio * 15;

  // Add variation based on word count (more words = more extreme scores)
  const wordCountFactor = Math.min(textSentiment.tokens.length / 10, 2);
  const wordCountAdjustment = (review.voted_up ? 1 : -1) * wordCountFactor * 0.5;

  // Combine all sentiment signals
  const totalAdjustment = absoluteAdjustment + wordRatioAdjustment + wordCountAdjustment;

  // Allow wide adjustment range
  const clampedAdjustment = Math.max(-5, Math.min(5, totalAdjustment));

  // Calculate final score
  let finalScore = baseScore + clampedAdjustment;

  // Clamp to 0-10 range only
  finalScore = Math.max(0, Math.min(10, finalScore));

  const sentimentScore: SentimentScore = {
    score: Math.round(finalScore * 10) / 10, // Round to 1 decimal
    comparative: textSentiment.comparative,
    tokens: textSentiment.tokens,
    positive: textSentiment.positive,
    negative: textSentiment.negative,
  };

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
