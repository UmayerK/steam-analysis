import type {
  SteamReview,
  ReviewWithSentiment,
  SentimentScore,
  SentimentStats
} from './types';

// ─── Word-Level Sentiment Lexicon ──────────────────────────────────────
// Scores from -5 (very negative) to +5 (very positive)
const WORD_SCORES: Record<string, number> = {
  // ── Strong Positive (4-5) ──
  masterpiece: 5, phenomenal: 5, outstanding: 5, incredible: 5, extraordinary: 5,
  flawless: 5, perfection: 5, perfect: 5, spectacular: 4, magnificent: 4,
  exceptional: 4, brilliant: 4, superb: 4, marvelous: 4, stunning: 4,
  breathtaking: 4, gorgeous: 4, fantastic: 4, wonderful: 4, excellent: 4,
  goat: 5, goated: 5, godlike: 5, legendary: 4, elite: 4, best: 3,

  // ── Positive (2-3) ──
  amazing: 3, awesome: 3, great: 3, love: 3, loved: 3, loving: 3,
  beautiful: 3, impressive: 3, addictive: 3, addicting: 3, addicted: 3,
  engaging: 3, immersive: 3, captivating: 3, compelling: 3, satisfying: 3,
  polished: 3, recommend: 3, recommended: 3, favorite: 3, favourite: 3,
  epic: 3, insane: 3, fire: 3, banger: 3, slaps: 3, bussin: 3, poggers: 3, pog: 3,
  gem: 3, underrated: 3, innovative: 3, revolutionary: 3,
  good: 2, nice: 2, fun: 2, enjoy: 2, enjoyed: 2, enjoying: 2, enjoyable: 2,
  cool: 2, solid: 2, smooth: 2, clean: 2, fair: 2, worth: 2,
  entertaining: 2, interesting: 2, exciting: 2, thrilling: 2,
  creative: 2, unique: 2, charming: 2, delightful: 2,
  reliable: 2, stable: 2, responsive: 2, intuitive: 2,
  happy: 2, glad: 2, pleased: 2, thankful: 2, grateful: 2,
  gg: 2, based: 2, valid: 2, lit: 3, dope: 2, sick: 2, hype: 2,
  wholesome: 3, heartwarming: 3,

  // ── Mild Positive (1) ──
  ok: 1, okay: 1, fine: 1, alright: 1, decent: 1, playable: 1,
  adequate: 1, acceptable: 1, passable: 1, reasonable: 1,
  ez: 1, neat: 1, chill: 1, relaxing: 1, comfy: 1,
  like: 1, liked: 1, appreciate: 1, appreciated: 1,

  // ── Mild Negative (-1) ──
  mid: -1, meh: -1, mediocre: -1, average: -1, bland: -1, generic: -1,
  repetitive: -1, dull: -1, stale: -1,
  clunky: -1, awkward: -1, slow: -1, grindy: -1, grind: -1,
  overpriced: -1, overrated: -1, underwhelming: -1,
  confusing: -1, annoying: -1, frustrating: -1,
  eh: -1,

  // ── Negative (-2 to -3) ──
  bad: -2, poor: -2, terrible: -3, horrible: -3, awful: -3, dreadful: -3,
  hate: -3, hated: -3, worst: -3, sucks: -3, suck: -3, sucked: -3,
  ugly: -2, lazy: -2, pathetic: -2, joke: -2,
  disappointing: -2, disappointed: -2, disappointment: -2,
  broken: -3, buggy: -2, laggy: -2, glitchy: -2, unfinished: -2, unpolished: -2,
  crash: -2, crashes: -2, crashing: -2, lag: -2, stuttering: -2, stutter: -2,
  unfair: -2, unbalanced: -2, toxic: -2, rigged: -2,
  boring: -2, tedious: -2, monotonous: -2,
  trash: -3, garbage: -3, rubbish: -3, crap: -3, crappy: -3, shit: -3, shitty: -3,
  cringe: -2, lame: -2, dead: -2,
  cheaters: -3, cheater: -3, hackers: -3, hacker: -3, hacks: -2,
  regret: -2, refund: -2, refunded: -2, uninstall: -2, uninstalled: -2,

  // ── Strong Negative (-4 to -5) ──
  unplayable: -4, disaster: -4, catastrophe: -4, abomination: -4,
  scam: -4, cashgrab: -4, ripoff: -4, fraud: -4,
  p2w: -3, paytowin: -4,
  malware: -5, spyware: -5, virus: -5,
  waste: -3, wasted: -3,
};

// ─── Phrase-Level Patterns ─────────────────────────────────────────────
// Multi-word phrases with their sentiment scores
const PHRASE_PATTERNS: Array<{ pattern: RegExp; score: number }> = [
  // Strong positive phrases
  { pattern: /\bgame\s*of\s*the\s*year\b/i, score: 5 },
  { pattern: /\bbest\s+game\s+(i('ve|'ve)?\s+)?(ever|played)\b/i, score: 5 },
  { pattern: /\bbest\s+game\s+of\s+all\s+time\b/i, score: 5 },
  { pattern: /\bbest\s+game\b/i, score: 3 },
  { pattern: /\bgame\s+of\s+the\s+(decade|century|generation)\b/i, score: 5 },
  { pattern: /\bworth\s+(every|each)\s+(penny|cent|dollar)\b/i, score: 4 },
  { pattern: /\bhighly\s+recommend(ed)?\b/i, score: 4 },
  { pattern: /\bmust\s+(have|play|buy|own|get)\b/i, score: 4 },
  { pattern: /\bcan'?t\s+stop\s+playing\b/i, score: 4 },
  { pattern: /\bcouldn'?t\s+put\s+(it\s+)?down\b/i, score: 4 },
  { pattern: /\blove\s+(this|the|it)\b/i, score: 4 },
  { pattern: /\bhours?\s+of\s+fun\b/i, score: 3 },
  { pattern: /\bwell\s+(made|crafted|designed|done|polished)\b/i, score: 3 },
  { pattern: /\bworth\s+(it|the\s+(price|money|buy))\b/i, score: 3 },
  { pattern: /\bgreat\s+(game|fun|time|experience|gameplay)\b/i, score: 3 },
  { pattern: /\bgood\s+(game|fun|time|experience|gameplay|stuff)\b/i, score: 3 },
  { pattern: /\bso\s+(much\s+)?fun\b/i, score: 3 },
  { pattern: /\breally\s+(good|great|fun|enjoy(ed)?|nice|love|amazing)\b/i, score: 3 },
  { pattern: /\bvery\s+(good|great|fun|enjoy(able)?|nice|entertaining)\b/i, score: 3 },
  { pattern: /\bsuper\s+(fun|good|great|cool)\b/i, score: 3 },
  { pattern: /\bpretty\s+(good|great|fun|cool|solid|nice)\b/i, score: 2 },
  { pattern: /\bi\s+love\b/i, score: 3 },
  { pattern: /\bi\s+enjoy(ed)?\b/i, score: 2 },
  { pattern: /\bi\s+like(d)?\b/i, score: 2 },

  // Positive short patterns
  { pattern: /^(good|great|nice|fun|cool|solid|amazing|awesome|excellent)\s*(game|one)?[.!]*$/i, score: 4 },
  { pattern: /^(love|loved)\s*(it|this|this\s*game)?[.!]*$/i, score: 4 },
  { pattern: /^(recommend(ed)?|worth\s*it)[.!]*$/i, score: 4 },
  { pattern: /^(yes|yep|ya|yeah|yea|yup)[.!]*$/i, score: 2 },
  { pattern: /^10\s*\/\s*10[.!]*$/i, score: 5 },
  { pattern: /^(pretty|very|really|so)\s+(good|great|fun|nice)[.!]*$/i, score: 3 },

  // Negative phrases
  { pattern: /\bwaste\s+of\s+(time|money)\b/i, score: -4 },
  { pattern: /\bnot\s+worth\s+(it|the\s+(price|money|time))\b/i, score: -3 },
  { pattern: /\bdon'?t\s+(buy|bother|waste|get|recommend)\b/i, score: -3 },
  { pattern: /\bdo\s+not\s+(buy|bother|waste|get|recommend)\b/i, score: -3 },
  { pattern: /\bstay\s+away\b/i, score: -3 },
  { pattern: /\bsave\s+your\s+(money|time)\b/i, score: -3 },
  { pattern: /\bworst\s+(game|purchase|experience)\b/i, score: -4 },
  { pattern: /\bdead\s+game\b/i, score: -3 },
  { pattern: /\bnot\s+(fun|good|great|worth|enjoyable|entertaining|recommended)\b/i, score: -3 },
  { pattern: /\bnot\s+even\s+(close|worth|fun|good|playable)\b/i, score: -3 },
  { pattern: /\bpay\s*to\s*win\b/i, score: -4 },
  { pattern: /\bcash\s*grab\b/i, score: -4 },
  { pattern: /\bgetting\s+worse\b/i, score: -2 },
  { pattern: /\bused\s+to\s+be\s+(good|great|fun)\b/i, score: -2 },
  { pattern: /\brip\s*off\b/i, score: -3 },
  { pattern: /\bbad\s+(game|port|optimization|experience)\b/i, score: -3 },

  // Mixed/neutral but leaning phrases
  { pattern: /\bnot\s+bad\b/i, score: 1 },
  { pattern: /\bcould\s+be\s+better\b/i, score: -1 },
  { pattern: /\bneeds\s+(work|improvement|fixing|updates?|patches?)\b/i, score: -1 },
  { pattern: /\bhas\s+potential\b/i, score: 0 },
  { pattern: /\bit'?s\s+okay?\b/i, score: 1 },
  { pattern: /\bit'?s\s+alright\b/i, score: 1 },
  { pattern: /\bit'?s\s+fine\b/i, score: 1 },
];

// ─── Negation Words ────────────────────────────────────────────────────
const NEGATION_WORDS = new Set([
  'not', "n't", 'no', 'never', 'neither', 'nobody', 'nothing',
  'nowhere', 'nor', 'hardly', 'barely', 'scarcely', 'rarely',
  'dont', "don't", 'doesnt', "doesn't", 'didnt', "didn't",
  'isnt', "isn't", 'wasnt', "wasn't", 'arent', "aren't",
  'werent', "weren't", 'wont', "won't", 'wouldnt', "wouldn't",
  'cant', "can't", 'cannot', 'shouldnt', "shouldn't",
  'couldnt', "couldn't",
]);

// ─── Intensity Modifiers ───────────────────────────────────────────────
const INTENSIFIERS: Record<string, number> = {
  very: 1.5, really: 1.5, extremely: 2.0, incredibly: 2.0,
  absolutely: 2.0, totally: 1.5, completely: 1.5, utterly: 2.0,
  super: 1.5, truly: 1.5, highly: 1.5, deeply: 1.5,
  so: 1.3, pretty: 1.2, quite: 1.2, rather: 1.1, fairly: 1.1,
  amazingly: 2.0, insanely: 2.0, ridiculously: 1.8,
};

const DIMINISHERS: Record<string, number> = {
  slightly: 0.5, somewhat: 0.6, a_bit: 0.6, a_little: 0.5,
  kind_of: 0.6, sort_of: 0.6, kinda: 0.6, sorta: 0.6,
  barely: 0.4, hardly: 0.4,
};

// ─── Rating Extraction ─────────────────────────────────────────────────
function extractRatingScore(text: string): number | null {
  const ratingPattern = /(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/g;
  const matches: RegExpExecArray[] = [];
  let m: RegExpExecArray | null;
  while ((m = ratingPattern.exec(text)) !== null) {
    matches.push(m);
  }
  if (matches.length === 0) return null;

  let totalScore = 0;
  let count = 0;

  for (const match of matches) {
    const num = parseFloat(match[1]);
    const den = parseFloat(match[2]);
    if (den > 0 && den <= 100) {
      // Normalize to -5 to +5 scale
      const ratio = num / den;
      const normalized = (ratio * 10) - 5;
      totalScore += normalized;
      count++;
    }
  }

  return count > 0 ? totalScore / count : null;
}

// ─── Emoji Sentiment ───────────────────────────────────────────────────
function analyzeEmojiSentiment(text: string): number {
  const positiveEmojis = ['👍', '😊', '😁', '😂', '🤣', '😍', '🥰', '😎', '🔥', '💯', '✨', '⭐', '🎉', '❤️', '💖', '👌', '🙌', '💪', '🥇', '🏆', '♥'];
  const negativeEmojis = ['👎', '😞', '😢', '😭', '😡', '😤', '🤮', '💩', '❌', '⛔', '🚫', '😠', '🤡', '💀'];

  let score = 0;
  for (const emoji of positiveEmojis) {
    const matches = text.match(new RegExp(emoji, 'g'));
    if (matches) score += matches.length * 1.5;
  }
  for (const emoji of negativeEmojis) {
    const matches = text.match(new RegExp(emoji, 'g'));
    if (matches) score -= matches.length * 1.5;
  }
  return score;
}

// ─── Tokenization ──────────────────────────────────────────────────────
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 0);
}

// ─── Core Word-Level Analysis with Negation & Intensity ────────────────
function analyzeWords(text: string): {
  score: number;
  positiveWords: string[];
  negativeWords: string[];
  tokens: string[];
} {
  const tokens = tokenize(text);
  const positiveWords: string[] = [];
  const negativeWords: string[] = [];
  let totalScore = 0;

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];
    const wordScore = WORD_SCORES[word];

    if (wordScore === undefined) continue;

    // Check for negation in the previous 1-3 words
    let negated = false;
    for (let j = Math.max(0, i - 3); j < i; j++) {
      const prevWord = tokens[j];
      // Check the token itself and handle contractions
      if (NEGATION_WORDS.has(prevWord)) {
        negated = true;
        break;
      }
      // Handle "n't" suffix
      if (prevWord.endsWith("n't") || prevWord.endsWith("nt")) {
        const base = prevWord.replace(/(n't|nt)$/, '');
        if (['do', 'does', 'did', 'is', 'was', 'are', 'were', 'wo', 'would', 'could', 'should', 'ca', 'has', 'have', 'had'].includes(base)) {
          negated = true;
          break;
        }
      }
    }

    // Check for intensity modifiers in the previous 1-2 words
    let intensityMult = 1.0;
    for (let j = Math.max(0, i - 2); j < i; j++) {
      const prevWord = tokens[j];
      if (INTENSIFIERS[prevWord]) {
        intensityMult = INTENSIFIERS[prevWord];
        break;
      }
      if (DIMINISHERS[prevWord]) {
        intensityMult = DIMINISHERS[prevWord];
        break;
      }
    }

    let adjustedScore = wordScore * intensityMult;
    if (negated) {
      // Flip the score but reduce magnitude slightly (negation doesn't fully invert)
      adjustedScore = -adjustedScore * 0.75;
    }

    totalScore += adjustedScore;

    if (adjustedScore > 0) {
      positiveWords.push(word);
    } else if (adjustedScore < 0) {
      negativeWords.push(word);
    }
  }

  return { score: totalScore, positiveWords, negativeWords, tokens };
}

// ─── Phrase-Level Analysis ─────────────────────────────────────────────
function analyzePhrases(text: string): number {
  let score = 0;
  for (const { pattern, score: phraseScore } of PHRASE_PATTERNS) {
    if (pattern.test(text)) {
      score += phraseScore;
    }
  }
  return score;
}

// ─── Tone Analysis ─────────────────────────────────────────────────────
function analyzeTone(text: string): number {
  let toneScore = 0;

  // ALL CAPS words indicate strong emotion — amplify in the direction of content
  const capsWords = text.match(/\b[A-Z]{2,}\b/g) || [];
  if (capsWords.length > 0) {
    // Check if caps words are positive or negative
    for (const w of capsWords) {
      const lower = w.toLowerCase();
      const wordScore = WORD_SCORES[lower];
      if (wordScore) {
        toneScore += wordScore > 0 ? 1 : -1;
      } else {
        // Generic caps = intensity, don't add direction
      }
    }
    // If no scored caps words, just add a small intensity bump
    if (toneScore === 0 && capsWords.length >= 2) {
      toneScore = 0.5; // Slight positive bias for enthusiastic caps
    }
  }

  // Exclamation marks = intensity/enthusiasm
  const exclamations = (text.match(/!/g) || []).length;
  if (exclamations >= 3) {
    toneScore += 0.5; // Lots of !!! usually positive enthusiasm
  } else if (exclamations >= 1) {
    toneScore += 0.2;
  }

  // Repeated letters (e.g., "sooo goood", "greaaaat") = enthusiasm
  const stretched = (text.match(/(.)\1{2,}/g) || []).length;
  if (stretched > 0) {
    toneScore += 0.3;
  }

  // Sarcasm markers
  if (/\/s\b/i.test(text) || /\bsarcasm\b/i.test(text)) {
    toneScore -= 2; // Likely sarcastic, invert assumed sentiment
  }

  // "but" and "however" — signal mixed feelings, slightly reduce positive
  const butCount = (text.match(/\b(but|however|although|though|except)\b/gi) || []).length;
  if (butCount > 0) {
    toneScore -= 0.3 * butCount;
  }

  return toneScore;
}

// ─── Main Sentiment Analysis Function ──────────────────────────────────
/**
 * Analyze the sentiment of a text string.
 * Returns a raw sentiment score (can be any value, typically -10 to +10 range).
 */
export function analyzeSentiment(text: string): SentimentScore {
  if (!text || text.trim().length === 0) {
    return { score: 0, comparative: 0, tokens: [], positive: [], negative: [] };
  }

  // 1. Word-level analysis with negation + intensity
  const wordAnalysis = analyzeWords(text);

  // 2. Phrase-level analysis
  const phraseScore = analyzePhrases(text);

  // 3. Emoji analysis
  const emojiScore = analyzeEmojiSentiment(text);

  // 4. Rating extraction (e.g., "9/10")
  const ratingScore = extractRatingScore(text);

  // 5. Tone analysis (caps, exclamation, sarcasm)
  const toneScore = analyzeTone(text);

  // Combine all signals
  // Phrase matches are very reliable, so give them high weight
  const wordWeight = 1.0;
  const phraseWeight = 1.5;
  const emojiWeight = 0.5;
  const ratingWeight = 2.0;
  const toneWeight = 0.5;

  let rawScore = (wordAnalysis.score * wordWeight)
    + (phraseScore * phraseWeight)
    + (emojiScore * emojiWeight)
    + ((ratingScore ?? 0) * ratingWeight)
    + (toneScore * toneWeight);

  // Normalize comparative score
  const tokenCount = Math.max(wordAnalysis.tokens.length, 1);
  const comparative = rawScore / tokenCount;

  return {
    score: Math.round(rawScore * 10) / 10,
    comparative: Math.round(comparative * 1000) / 1000,
    tokens: wordAnalysis.tokens,
    positive: wordAnalysis.positiveWords,
    negative: wordAnalysis.negativeWords,
  };
}

// ─── Review Analysis (0-100 scale) ─────────────────────────────────────
/**
 * Composite sentiment scoring on a 0–100 scale.
 *
 * Instead of anchoring on a single value and making small adjustments,
 * this combines FIVE independent continuous signals. Each signal varies
 * independently per review, so even reviews with identical text get
 * different scores based on playtime, length, and helpfulness.
 *
 * Signals (for voted_up, mirror for voted_down):
 *   1. Text sentiment  (0-22 pts) — sentiment words, phrases, ratings
 *   2. Review effort    (0-10 pts) — character length (longer = more conviction)
 *   3. Playtime         (0-7 pts)  — hours played (more = more informed)
 *   4. Helpfulness      (0-5 pts)  — community upvotes
 *   5. Tone             (0-4 pts)  — caps, exclamation, emojis, structure
 *
 * voted_up base:  52  → range 52-100
 * voted_down base: 48 → range 0-48
 */
export function analyzeReview(review: SteamReview): ReviewWithSentiment {
  const text = review.review;
  const textSentiment = analyzeSentiment(text);
  const raw = textSentiment.score;

  // ── Signal 1: Text sentiment (biggest differentiator) ──
  // Linear mapping: raw/15 capped at 1.0
  // "nice"=2 → 0.13, "good game"=6.5 → 0.43, "masterpiece 10/10"=25 → 1.0
  const textMagnitude = Math.min(Math.abs(raw) / 15, 1);
  const textAligned = raw >= 0 === review.voted_up; // text agrees with vote?

  // ── Signal 2: Review effort (continuous, log-scaled) ──
  // 1 char → 0, 50 chars → 0.39, 200 chars → 0.59, 1000 chars → 0.82, 3000 → 1.0
  const effortSignal = Math.min(Math.log(1 + text.length) / Math.log(1 + 3000), 1);

  // ── Signal 3: Playtime (continuous, log-scaled) ──
  // 0 hrs → 0, 5 hrs → 0.25, 50 hrs → 0.57, 500 hrs → 0.90, 2000 → 1.0
  const hours = (review.author.playtime_forever || 0) / 60;
  const playtimeSignal = Math.min(Math.log(1 + hours) / Math.log(1 + 2000), 1);

  // ── Signal 4: Helpfulness (continuous, log-scaled) ──
  // 0 votes → 0, 3 → 0.21, 20 → 0.52, 100 → 0.80, 500 → 1.0
  const helpfulSignal = Math.min(Math.log(1 + (review.votes_up || 0)) / Math.log(1 + 500), 1);

  // ── Signal 5: Tone markers (additive, 0-1) ──
  const hasExclamation = /!/.test(text) ? 0.25 : 0;
  const hasCaps = /[A-Z]{3,}/.test(text) ? 0.25 : 0;
  const hasMultipleSentences = (text.match(/[.!?]+/g) || []).length >= 2 ? 0.25 : 0;
  const hasEmoji = /[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|[❤♥👍👎]/u.test(text) ? 0.25 : 0;
  const toneSignal = Math.min(hasExclamation + hasCaps + hasMultipleSentences + hasEmoji, 1);

  // ── Combine into final score ──
  let score: number;

  if (review.voted_up) {
    // Positive half: base 52, max ~100
    const textContrib = textAligned
      ? textMagnitude * 22        // agreeing text → boost up to +22
      : textMagnitude * -10;      // contradicting text → pull down up to -10
    const effortContrib = effortSignal * 10;
    const playtimeContrib = playtimeSignal * 7;
    const helpfulContrib = helpfulSignal * 5;
    const toneContrib = toneSignal * 4;

    score = 52 + textContrib + effortContrib + playtimeContrib + helpfulContrib + toneContrib;
  } else {
    // Negative half: base 48, min ~0
    const textContrib = textAligned
      ? textMagnitude * 22        // agreeing negative text → push toward 0
      : textMagnitude * -10;      // contradicting text → pull toward 50
    const effortContrib = effortSignal * 10;
    const playtimeContrib = playtimeSignal * 7;
    const helpfulContrib = helpfulSignal * 5;
    const toneContrib = toneSignal * 4;

    score = 48 - textContrib - effortContrib - playtimeContrib - helpfulContrib - toneContrib;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  const sentimentScore: SentimentScore = {
    score,
    comparative: textSentiment.comparative,
    tokens: textSentiment.tokens,
    positive: textSentiment.positive,
    negative: textSentiment.negative,
  };

  return {
    ...review,
    sentiment: sentimentScore,
    sentimentLabel: getSentimentLabel(score),
  };
}

// ─── Label Thresholds (0-100 scale) ────────────────────────────────────
export function getSentimentLabel(score: number): 'positive' | 'neutral' | 'negative' {
  if (score >= 55) return 'positive';
  if (score <= 45) return 'negative';
  return 'neutral';
}

// ─── Batch Analysis ────────────────────────────────────────────────────
export function analyzeReviews(reviews: SteamReview[]): ReviewWithSentiment[] {
  return reviews.map(review => analyzeReview(review));
}

// ─── Statistics ────────────────────────────────────────────────────────
export function calculateSentimentStats(
  reviews: ReviewWithSentiment[]
): SentimentStats {
  const totalReviews = reviews.length;

  const positiveCount = reviews.filter(r => r.sentimentLabel === 'positive').length;
  const neutralCount = reviews.filter(r => r.sentimentLabel === 'neutral').length;
  const negativeCount = reviews.filter(r => r.sentimentLabel === 'negative').length;

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

// ─── UI Helpers ────────────────────────────────────────────────────────
export function getSentimentColor(label: 'positive' | 'neutral' | 'negative'): string {
  switch (label) {
    case 'positive': return 'text-green-500';
    case 'negative': return 'text-red-500';
    case 'neutral': return 'text-yellow-500';
  }
}

export function getSentimentBgColor(label: 'positive' | 'neutral' | 'negative'): string {
  switch (label) {
    case 'positive': return 'bg-green-500/20';
    case 'negative': return 'bg-red-500/20';
    case 'neutral': return 'bg-yellow-500/20';
  }
}

export function getSentimentEmoji(label: 'positive' | 'neutral' | 'negative'): string {
  switch (label) {
    case 'positive': return '😊';
    case 'negative': return '😞';
    case 'neutral': return '😐';
  }
}
