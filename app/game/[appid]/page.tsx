"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { WishlistButton } from "@/components/wishlist-button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
        const reviewsRes = await fetch(`/api/reviews/${appid}`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData.reviews);
        }

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
  }, [appid]);

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
            <h2 className="mb-6 text-3xl font-bold text-white">
              Recent Reviews with Sentiment Analysis
            </h2>
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.slice(0, 10).map((review) => (
                  <Card key={review.recommendationid}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
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
                ))
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
