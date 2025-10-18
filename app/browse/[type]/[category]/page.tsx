"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SteamSpyGame } from "@/lib/types";

interface PageProps {
  params: Promise<{ type: string; category: string }>;
}

export default function CategoryDetailPage({ params }: PageProps) {
  const { type, category } = use(params);
  const [games, setGames] = useState<SteamSpyGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const decodedCategory = decodeURIComponent(category);

  useEffect(() => {
    fetchGames();
  }, [type, category, page]);

  const fetchGames = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/categories/games?type=${type}&value=${encodeURIComponent(decodedCategory)}&page=${page}&perPage=20`
      );

      if (response.ok) {
        const data = await response.json();
        setGames(data.games);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const formatOwners = (owners: string) => {
    const parts = owners.split(' .. ');
    if (parts.length === 2) {
      return `${parts[0]} - ${parts[1]} owners`;
    }
    return owners;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          href="/browse"
          className="mb-6 inline-flex items-center text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Browse
        </Link>

        <h1 className="mb-8 text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
          {decodedCategory} Games
        </h1>

        {/* Games Grid */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">No games found in this category.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {games.map((game) => (
                <Link key={game.appid} href={`/game/${game.appid}`}>
                  <Card className="h-full transition-all hover:scale-105">
                    <h3 className="mb-2 text-lg font-bold text-white line-clamp-2">
                      {game.name}
                    </h3>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Badge variant="default" className="text-xs">
                        <span className={getScoreColor(game.userscore)}>
                          {game.userscore}% Positive
                        </span>
                      </Badge>
                      {game.price === '0' ? (
                        <Badge variant="positive" className="text-xs">Free</Badge>
                      ) : (
                        <Badge variant="default" className="text-xs">
                          ${(parseFloat(game.price) / 100).toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-400">
                      <p>{formatOwners(game.owners)}</p>
                      {game.developer && (
                        <p className="line-clamp-1">By {game.developer}</p>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
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
