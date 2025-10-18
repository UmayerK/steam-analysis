"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SteamSpyGame } from "@/lib/types";

export default function TopGamesPage() {
  const [games, setGames] = useState<SteamSpyGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    priceRange: '',
    genre: '',
    sortBy: 'players',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchGames();
  }, [filters, page]);

  const fetchGames = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: '20',
      });

      if (filters.priceRange) params.append('priceRange', filters.priceRange);
      if (filters.genre) params.append('genre', filters.genre);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

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

  const formatOwners = (owners: string) => {
    // Owners is in format "5,000,000 .. 10,000,000"
    const parts = owners.split(' .. ');
    if (parts.length === 2) {
      return `${parts[0]} - ${parts[1]} owners`;
    }
    return owners;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black">
      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-8 text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
          Top 100 Games
        </h1>

        {/* Filters */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Price Range
            </label>
            <select
              value={filters.priceRange}
              onChange={(e) => {
                setFilters({ ...filters, priceRange: e.target.value });
                setPage(1);
              }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 text-white focus:border-white/20 focus:outline-none"
            >
              <option value="">All Prices</option>
              <option value="free">Free</option>
              <option value="under10">Under $10</option>
              <option value="10to30">$10 - $30</option>
              <option value="over30">Over $30</option>
            </select>
          </Card>

          <Card className="p-4">
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Genre
            </label>
            <select
              value={filters.genre}
              onChange={(e) => {
                setFilters({ ...filters, genre: e.target.value });
                setPage(1);
              }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 text-white focus:border-white/20 focus:outline-none"
            >
              <option value="">All Genres</option>
              <option value="Action">Action</option>
              <option value="Adventure">Adventure</option>
              <option value="Casual">Casual</option>
              <option value="Indie">Indie</option>
              <option value="Massively Multiplayer">Massively Multiplayer</option>
              <option value="Racing">Racing</option>
              <option value="RPG">RPG</option>
              <option value="Simulation">Simulation</option>
              <option value="Sports">Sports</option>
              <option value="Strategy">Strategy</option>
            </select>
          </Card>

          <Card className="p-4">
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => {
                setFilters({ ...filters, sortBy: e.target.value });
                setPage(1);
              }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 text-white focus:border-white/20 focus:outline-none"
            >
              <option value="players">Most Players</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </Card>
        </div>

        {/* Games Grid */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
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
                      <p className="line-clamp-1">{game.genre}</p>
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
