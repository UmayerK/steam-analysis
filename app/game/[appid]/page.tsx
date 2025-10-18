"use client";

import { use, useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { WishlistButton } from "@/components/wishlist-button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select";
import { WorkshopSection } from "@/components/workshop-section";
import { NewsSection } from "@/components/news-section";
import { CommunityLinks } from "@/components/community-links";
import type { SteamAppDetails, ReviewWithSentiment, SentimentStats } from "@/lib/types";

interface PageProps {
  params: Promise<{ appid: string }>;
}

export default function GamePage({ params }: PageProps) {
  const { appid } = use(params);
  const [gameDetails, setGameDetails] = useState<SteamAppDetails | null>(null);
  const [reviews, setReviews] = useState<ReviewWithSentiment[]>([]);
  const [sentimentStats, setSentimentStats] = useState<SentimentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Filter states
  const [language, setLanguage] = useState('all');
  const [sortByPlaytime, setSortByPlaytime] = useState<string>('default');

  const observerTarget = useRef(null);

  // Fetch reviews with filters
  const fetchReviews = useCallback(async (isLoadMore = false, currentCursor: string | null = null) => {
    try {
      const params = new URLSearchParams({
        num_per_page: '20',
        language,
      });

      if (sortByPlaytime !== 'default') {
        params.set('sort_by_playtime', sortByPlaytime);
      }

      if (isLoadMore && currentCursor) {
        params.set('cursor', currentCursor);
      }

      const reviewsRes = await fetch(`/api/reviews/${appid}?${params.toString()}`);
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();

        if (isLoadMore) {
          setReviews(prev => [...prev, ...reviewsData.reviews]);
        } else {
          setReviews(reviewsData.reviews);
        }

        setCursor(reviewsData.cursor);
        setHasMore(reviewsData.reviews.length === 20);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  }, [appid, language, sortByPlaytime]);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch game details
        const detailsRes = await fetch(`/api/games/${appid}`);
        if (detailsRes.ok) {
          const details = await detailsRes.json();
          setGameDetails(details);
        }

        // Fetch reviews with sentiment
        await fetchReviews(false, null);

        // Fetch sentiment stats
        const sentimentRes = await fetch(`/api/sentiment/${appid}`);
        if (sentimentRes.ok) {
          const sentiment = await sentimentRes.json();
          setSentimentStats(sentiment);
        }
      } catch (error) {
        console.error("Error fetching game data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [appid, fetchReviews]);

  // Refetch when filters change
  useEffect(() => {
    if (!isLoading) {
      setReviews([]);
      setCursor(null);
      setHasMore(true);
      fetchReviews(false, null);
    }
  }, [language, sortByPlaytime, isLoading, fetchReviews]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          fetchReviews(true, cursor).finally(() => setIsLoadingMore(false));
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, cursor, fetchReviews]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
      </div>
    );
  }

  if (!gameDetails?.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Game Not Found</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const game = gameDetails.data;
  const getSentimentPercentage = () => {
    if (!sentimentStats?.overall) return 0;
    const { positiveCount, totalReviews } = sentimentStats.overall;
    return totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Home
        </Link>

        {/* Game Header */}
        <div className="mb-12 overflow-hidden rounded-3xl">
          <div className="relative h-[400px]">
            <Image
              src={game.header_image}
              alt={game.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-12">
              <h1 className="mb-4 text-6xl font-bold text-white">{game.name}</h1>
              <div className="flex gap-2 flex-wrap">
                {game.genres?.map((genre) => (
                  <Badge key={genre.id} variant="default">
                    {genre.description}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sentiment Overview */}
        {sentimentStats && (
          <div className="mb-12 grid gap-6 md:grid-cols-4">
            <SpotlightCard>
              <CardTitle>Overall Sentiment</CardTitle>
              <div className="mt-4">
                <div className="text-5xl font-bold text-white">
                  {getSentimentPercentage()}%
                </div>
                <div className="text-gray-400">Positive Reviews</div>
              </div>
            </SpotlightCard>

            <SpotlightCard>
              <CardTitle>Positive</CardTitle>
              <div className="mt-4">
                <div className="text-5xl font-bold text-green-400">
                  {sentimentStats.overall.positiveCount}
                </div>
                <div className="text-gray-400">Reviews</div>
              </div>
            </SpotlightCard>

            <SpotlightCard>
              <CardTitle>Neutral</CardTitle>
              <div className="mt-4">
                <div className="text-5xl font-bold text-yellow-400">
                  {sentimentStats.overall.neutralCount}
                </div>
                <div className="text-gray-400">Reviews</div>
              </div>
            </SpotlightCard>

            <SpotlightCard>
              <CardTitle>Negative</CardTitle>
              <div className="mt-4">
                <div className="text-5xl font-bold text-red-400">
                  {sentimentStats.overall.negativeCount}
                </div>
                <div className="text-gray-400">Reviews</div>
              </div>
            </SpotlightCard>
          </div>
        )}

        {/* Game Info & Timeline */}
        <div className="mb-12 grid gap-6 lg:grid-cols-2">
          {/* Game Description */}
          <Card>
            <CardTitle>About This Game</CardTitle>
            <CardDescription
              className="mt-4"
              dangerouslySetInnerHTML={{ __html: game.short_description }}
            />
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Developer:</span>
                <span className="text-white">{game.developers?.join(", ")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Publisher:</span>
                <span className="text-white">{game.publishers?.join(", ")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Release Date:</span>
                <span className="text-white">{game.release_date.date}</span>
              </div>
              {game.price_overview && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-white">{game.price_overview.final_formatted}</span>
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <a
                href={`https://store.steampowered.com/app/${appid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700"
              >
                View on Steam →
              </a>
              <WishlistButton
                appid={parseInt(appid)}
                name={game.name}
                header_image={game.header_image}
                variant="button"
              />
            </div>
          </Card>

          {/* Sentiment Timeline */}
          {sentimentStats?.timeline && sentimentStats.timeline.length > 0 && (
            <Card>
              <CardTitle>Sentiment Trend Over Time</CardTitle>
              <div className="mt-4 space-y-2">
                {sentimentStats.timeline.slice(-10).map((item) => (
                  <div key={item.date} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{item.date}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 rounded-full bg-gray-700 overflow-hidden">
                        <div
                          className={`h-full ${
                            item.averageScore > 1
                              ? "bg-green-500"
                              : item.averageScore < -1
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                          style={{
                            width: `${Math.min(100, Math.max(0, ((item.averageScore + 5) / 10) * 100))}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-white w-16 text-right">
                        {item.count} reviews
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Tabbed Community Content */}
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="reviews">Reviews & Sentiment</TabsTrigger>
            <TabsTrigger value="workshop">Workshop & Mods</TabsTrigger>
            <TabsTrigger value="news">News & Updates</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews">
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-3xl font-bold text-white">
                Recent Reviews with Sentiment Analysis
              </h2>

              <div className="flex gap-4 flex-wrap">
                <Select
                  label="Language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="all">All Languages</option>
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                  <option value="russian">Russian</option>
                  <option value="schinese">Simplified Chinese</option>
                  <option value="tchinese">Traditional Chinese</option>
                  <option value="japanese">Japanese</option>
                  <option value="korean">Korean</option>
                  <option value="portuguese">Portuguese</option>
                  <option value="brazilian">Brazilian Portuguese</option>
                </Select>

                <Select
                  label="Sort by Playtime"
                  value={sortByPlaytime}
                  onChange={(e) => setSortByPlaytime(e.target.value)}
                >
                  <option value="default">Default</option>
                  <option value="most">Most Hours</option>
                  <option value="least">Least Hours</option>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.length > 0 ? (
                <>
                  {reviews.map((review) => (
                    <Card key={review.recommendationid}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2 flex-wrap">
                            <Badge
                              variant={review.sentimentLabel}
                            >
                              {review.sentimentLabel.toUpperCase()} (Score: {review.sentiment.score.toFixed(1)})
                            </Badge>
                            <Badge variant={review.voted_up ? "positive" : "negative"}>
                              {review.voted_up ? "👍 Recommended" : "👎 Not Recommended"}
                            </Badge>
                            <span className="text-sm text-gray-400">
                              {new Date(review.timestamp_created * 1000).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-300">{review.review}</p>
                          <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                            <span>{(review.author.playtime_forever / 60).toFixed(1)} hours played</span>
                            <span>👍 {review.votes_up} helpful</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {/* Infinite scroll trigger */}
                  {hasMore && (
                    <div ref={observerTarget} className="flex justify-center py-8">
                      {isLoadingMore && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                          <span>Loading more reviews...</span>
                        </div>
                      )}
                    </div>
                  )}

                  {!hasMore && reviews.length > 0 && (
                    <div className="text-center py-8 text-gray-400">
                      No more reviews to load
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="mb-4 text-5xl">📝</div>
                  <p className="text-gray-400">No reviews available yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="workshop">
            <WorkshopSection appid={appid} />
          </TabsContent>

          <TabsContent value="news">
            <NewsSection appid={appid} />
          </TabsContent>

          <TabsContent value="community">
            <CommunityLinks appid={appid} gameName={game.name} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
