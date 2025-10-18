"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { SteamGame } from "@/lib/types";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SteamGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const searchGames = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/games/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Error searching games:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchGames(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchGames]);

  const handleGameClick = (appid: number) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/game/${appid}`);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for Steam games..."
          className={cn(
            "w-full rounded-full border border-white/20 bg-slate-900/50 px-6 py-4 text-white placeholder-gray-400 backdrop-blur-sm transition-all focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
          )}
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-md shadow-xl">
          <div className="max-h-96 overflow-y-auto">
            {results.map((game) => (
              <button
                key={game.appid}
                onClick={() => handleGameClick(game.appid)}
                className="w-full px-6 py-3 text-left text-white hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
              >
                <div className="font-medium">{game.name}</div>
                <div className="text-xs text-gray-400">App ID: {game.appid}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && results.length === 0 && query && !isLoading && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-md shadow-xl">
          <div className="px-6 py-4 text-center text-gray-400">
            No games found
          </div>
        </div>
      )}
    </div>
  );
}
