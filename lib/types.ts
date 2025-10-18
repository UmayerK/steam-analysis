export interface SteamGame {
  appid: number;
  name: string;
}

export interface SteamAppDetails {
  success: boolean;
  data: {
    type: string;
    name: string;
    steam_appid: number;
    required_age: number;
    is_free: boolean;
    detailed_description: string;
    about_the_game: string;
    short_description: string;
    header_image: string;
    capsule_image: string;
    capsule_imagev5: string;
    website: string | null;
    developers: string[];
    publishers: string[];
    price_overview?: {
      currency: string;
      initial: number;
      final: number;
      discount_percent: number;
      initial_formatted: string;
      final_formatted: string;
    };
    platforms: {
      windows: boolean;
      mac: boolean;
      linux: boolean;
    };
    categories: Array<{
      id: number;
      description: string;
    }>;
    genres: Array<{
      id: string;
      description: string;
    }>;
    screenshots: Array<{
      id: number;
      path_thumbnail: string;
      path_full: string;
    }>;
    release_date: {
      coming_soon: boolean;
      date: string;
    };
  };
}

export interface SteamReview {
  recommendationid: string;
  author: {
    steamid: string;
    num_games_owned: number;
    num_reviews: number;
    playtime_forever: number;
    playtime_last_two_weeks: number;
    playtime_at_review: number;
    last_played: number;
  };
  language: string;
  review: string;
  timestamp_created: number;
  timestamp_updated: number;
  voted_up: boolean;
  votes_up: number;
  votes_funny: number;
  weighted_vote_score: string;
  comment_count: number;
  steam_purchase: boolean;
  received_for_free: boolean;
  written_during_early_access: boolean;
}

export interface SteamReviewsResponse {
  success: number;
  query_summary: {
    num_reviews: number;
    review_score: number;
    review_score_desc: string;
    total_positive: number;
    total_negative: number;
    total_reviews: number;
  };
  reviews: SteamReview[];
  cursor: string;
}

export interface SentimentScore {
  score: number; // -5 to 5
  comparative: number;
  tokens: string[];
  positive: string[];
  negative: string[];
}

export interface ReviewWithSentiment extends SteamReview {
  sentiment: SentimentScore;
  sentimentLabel: 'positive' | 'neutral' | 'negative';
}

export interface SentimentStats {
  overall: {
    averageScore: number;
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
    totalReviews: number;
  };
  timeline: Array<{
    date: string;
    averageScore: number;
    count: number;
  }>;
}

// SteamSpy Types
export interface SteamSpyGame {
  appid: number;
  name: string;
  developer: string;
  publisher: string;
  score_rank: string;
  positive: number;
  negative: number;
  userscore: number;
  owners: string;
  average_forever: number;
  average_2weeks: number;
  median_forever: number;
  median_2weeks: number;
  price: string;
  initialprice: string;
  discount: string;
  languages: string;
  genre: string;
  ccu: number;
  tags: Record<string, number>;
}

export interface TopGamesFilters {
  timePeriod?: 'day' | 'week' | 'month' | 'year' | 'all';
  genre?: string;
  priceRange?: 'free' | 'under10' | '10to30' | 'over30';
  country?: string;
}

// Steam Community Types
export interface SteamNewsItem {
  gid: string;
  title: string;
  url: string;
  is_external_url: boolean;
  author: string;
  contents: string;
  feedlabel: string;
  date: number;
  feedname: string;
}

export interface SteamNewsResponse {
  appnews: {
    appid: number;
    newsitems: SteamNewsItem[];
    count: number;
  };
}

export interface WorkshopItem {
  publishedfileid: string;
  result: number;
  creator: string;
  creator_appid: number;
  consumer_appid: number;
  consumer_shortcutid: number;
  filename: string;
  file_size: string;
  preview_url: string;
  hcontent_preview: string;
  title: string;
  file_description: string;
  time_created: number;
  time_updated: number;
  visibility: number;
  flags: number;
  workshop_file: boolean;
  workshop_accepted: boolean;
  show_subscribe_all: boolean;
  num_comments_public: number;
  banned: boolean;
  ban_reason: string;
  banner: string;
  can_be_deleted: boolean;
  app_name: string;
  file_type: number;
  can_subscribe: boolean;
  subscriptions: number;
  favorited: number;
  followers: number;
  lifetime_subscriptions: number;
  lifetime_favorited: number;
  lifetime_followers: number;
  views: number;
  tags: Array<{
    tag: string;
    display_name: string;
  }>;
  vote_data?: {
    score: number;
    votes_up: number;
    votes_down: number;
  };
}

export interface WorkshopResponse {
  response: {
    result: number;
    resultcount: number;
    publishedfiledetails: WorkshopItem[];
  };
}
