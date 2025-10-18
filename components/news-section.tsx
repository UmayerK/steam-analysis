"use client";

import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import type { SteamNewsItem } from "@/lib/types";

interface NewsSectionProps {
  appid: string;
}

export function NewsSection({ appid }: NewsSectionProps) {
  const [newsItems, setNewsItems] = useState<SteamNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`/api/community/${appid}/news?count=10`);
        if (response.ok) {
          const data = await response.json();
          if (data.appnews?.newsitems) {
            setNewsItems(data.appnews.newsitems);
          }
        } else {
          setError("News not available");
        }
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("Failed to load news");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [appid]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
      </div>
    );
  }

  if (error || newsItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4 text-5xl">📰</div>
        <p className="text-gray-400">
          {error || "No news available for this game"}
        </p>
      </div>
    );
  }

  const truncateText = (text: string, maxLength: number) => {
    // Remove HTML tags
    const stripped = text.replace(/<[^>]*>/g, '');
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength) + '...';
  };

  return (
    <div>
      <h3 className="mb-6 text-2xl font-bold text-white">Latest News & Updates</h3>

      <div className="space-y-4">
        {newsItems.map((item) => (
          <Card key={item.gid} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h4 className="text-xl font-bold text-white">{item.title}</h4>
                  <span className="text-sm text-gray-400">
                    {item.feedlabel}
                  </span>
                </div>
                <div className="mb-3 text-sm text-gray-400">
                  By {item.author} • {new Date(item.date * 1000).toLocaleDateString()} at {new Date(item.date * 1000).toLocaleTimeString()}
                </div>
                <p className="text-gray-300 mb-4">
                  {truncateText(item.contents, 300)}
                </p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Read more →
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 text-center">
        <a
          href={`https://store.steampowered.com/news/app/${appid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-full bg-white/10 px-6 py-3 font-semibold text-white transition-all hover:bg-white/20"
        >
          View All News on Steam →
        </a>
      </div>
    </div>
  );
}
