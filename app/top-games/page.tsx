"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { GameCard } from "@/components/game-card";
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {games.map((game) => (
                <GameCard
                  key={game.appid}
                  appid={game.appid}
                  name={game.name}
                  score={game.userscore}
                  price={game.price}
                  developer={game.developer}
                  genre={game.genre}
                  owners={game.owners}
                  isFree={game.price === '0'}
                />
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
