"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { getSteamHeaderImage } from "@/lib/steam-image-api";
import type { SteamSpyGame } from "@/lib/types";

function formatCCU(ccu: number): string {
  if (ccu >= 1_000_000) return `${(ccu / 1_000_000).toFixed(1)}M`;
  if (ccu >= 1_000) return `${(ccu / 1_000).toFixed(1)}K`;
  return ccu.toLocaleString();
}

export default function TopGamesPage() {
  const [games, setGames] = useState<SteamSpyGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchGames();
  }, [page]);

  const fetchGames = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: '100',
        sortBy: 'players',
      });

      const response = await fetch(`/api/top-games?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setGames(data.games);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching top games:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            Top Games by Concurrent Players
          </h1>
          <p className="mt-2 text-gray-400">
            Ranked by current concurrent players on Steam
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
          </div>
        ) : (
          <>
            {/* List Header */}
            <div className="mb-2 hidden items-center gap-4 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 md:flex">
              <span className="w-10 text-center">#</span>
              <span className="w-16"></span>
              <span className="flex-1">Game</span>
              <span className="w-40 text-right">Concurrent Players</span>
              <span className="w-28 text-right">Rating</span>
              <span className="w-24 text-right">Price</span>
            </div>

            {/* Games List */}
            <div className="space-y-2">
              {games.map((game, index) => {
                const rank = (page - 1) * 100 + index + 1;
                const totalReviews = (game.positive || 0) + (game.negative || 0);
                const score = totalReviews > 0
                  ? Math.round((game.positive / totalReviews) * 100)
                  : game.userscore;
                const imageUrl = getSteamHeaderImage(game.appid);
                const priceDisplay = game.price === '0' ? 'Free' : game.price ? `$${(parseFloat(game.price) / 100).toFixed(2)}` : '';

                return (
                  <Link key={game.appid} href={`/game/${game.appid}`}>
                    <div className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 transition-all hover:border-white/15 hover:bg-white/[0.06]">
                      {/* Rank */}
                      <span className={`w-10 text-center text-lg font-bold ${rank <= 3 ? 'text-yellow-400' : 'text-gray-500'}`}>
                        {rank}
                      </span>

                      {/* Thumbnail */}
                      <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-md bg-slate-800">
                        <Image
                          src={imageUrl}
                          alt={game.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>

                      {/* Name + Genre */}
                      <div className="flex-1 min-w-0">
                        <h3 className="truncate text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                          {game.name}
                        </h3>
                        {game.genre && (
                          <p className="truncate text-xs text-gray-500">{game.genre}</p>
                        )}
                      </div>

                      {/* CCU */}
                      <div className="w-40 text-right">
                        <span className="text-base font-bold text-emerald-400">
                          {formatCCU(game.ccu)}
                        </span>
                        <p className="text-xs text-gray-500">playing now</p>
                      </div>

                      {/* Rating */}
                      <div className="hidden w-28 text-right md:block">
                        {score > 0 ? (
                          <Badge variant="default" className="text-xs">
                            <span className={getScoreColor(score)}>
                              {score}%
                            </span>
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-600">N/A</span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="hidden w-24 text-right md:block">
                        <span className={`text-sm font-medium ${priceDisplay === 'Free' ? 'text-green-400' : 'text-gray-300'}`}>
                          {priceDisplay}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 text-white">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
