"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import type { WorkshopItem } from "@/lib/types";

interface WorkshopSectionProps {
  appid: string;
}

export function WorkshopSection({ appid }: WorkshopSectionProps) {
  const [workshopItems, setWorkshopItems] = useState<WorkshopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        const response = await fetch(`/api/community/${appid}/workshop?count=12`);
        if (response.ok) {
          const data = await response.json();
          console.log('Workshop API response:', data);
          if (data.response?.publishedfiledetails && Array.isArray(data.response.publishedfiledetails)) {
            const validItems = data.response.publishedfiledetails.filter(
              (item: WorkshopItem) => item.result === 1 || !item.result
            );
            setWorkshopItems(validItems);
          } else {
            setError("No workshop items found for this game");
          }
        } else {
          const errorData = await response.json();
          console.error('Workshop API error:', errorData);
          setError("Workshop items not available for this game");
        }
      } catch (err) {
        console.error("Error fetching workshop items:", err);
        setError("Failed to load workshop items");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkshop();
  }, [appid]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
      </div>
    );
  }

  if (error || workshopItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4 text-5xl">🛠️</div>
        <p className="text-gray-400 mb-4">
          {error || "No Workshop items available for this game"}
        </p>
        <a
          href={`https://steamcommunity.com/app/${appid}/workshop/`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700"
        >
          Visit Steam Workshop →
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">Popular Workshop Items</h3>
        <a
          href={`https://steamcommunity.com/app/${appid}/workshop/`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          View All on Steam →
        </a>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {workshopItems.map((item) => (
          <a
            key={item.publishedfileid}
            href={`https://steamcommunity.com/sharedfiles/filedetails/?id=${item.publishedfileid}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Card className="overflow-hidden h-full transition-all hover:scale-105">
              <div className="relative h-48 w-full bg-slate-800">
                {item.preview_url && (
                  <Image
                    src={item.preview_url}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <h4 className="mb-2 text-lg font-bold text-white line-clamp-2">
                  {item.title}
                </h4>
                <div className="mb-3 flex flex-wrap gap-2">
                  {item.vote_data && (
                    <Badge variant="default" className="text-xs">
                      👍 {item.vote_data.votes_up.toLocaleString()}
                    </Badge>
                  )}
                  <Badge variant="default" className="text-xs">
                    👁️ {item.views.toLocaleString()} views
                  </Badge>
                  <Badge variant="default" className="text-xs">
                    ⭐ {item.subscriptions.toLocaleString()} subs
                  </Badge>
                </div>
                {item.file_description && (
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {item.file_description.replace(/<[^>]*>/g, '')}
                  </p>
                )}
                <div className="mt-3 text-xs text-gray-500">
                  Updated {new Date(item.time_updated * 1000).toLocaleDateString()}
                </div>
              </div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
