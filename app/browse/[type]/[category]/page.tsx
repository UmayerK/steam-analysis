"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { GameCard } from "@/components/game-card";
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {games.map((game) => {
                const totalReviews = (game.positive || 0) + (game.negative || 0);
                const score = totalReviews > 0
                  ? Math.round((game.positive / totalReviews) * 100)
                  : game.userscore;
                return (
                  <GameCard
                    key={game.appid}
                    appid={game.appid}
                    name={game.name}
                    score={score}
                    price={game.price}
                    developer={game.developer}
                    genre={game.genre}
                    owners={game.owners}
                    isFree={game.price === '0'}
                  />
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
