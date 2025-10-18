"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/lib/wishlist-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black">
        <div className="container mx-auto px-4 py-12">
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
          </div>
        </div>
      </main>
    );
  }

  const sortedWishlist = [...wishlist].sort((a, b) => b.addedAt - a.addedAt);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            My Wishlist
          </h1>
          {wishlist.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear your entire wishlist?")) {
                  clearWishlist();
                }
              }}
              className="rounded-full bg-red-500/20 px-6 py-2 text-red-400 transition-colors hover:bg-red-500/30"
            >
              Clear All
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-6 text-6xl">💔</div>
            <h2 className="mb-4 text-2xl font-bold text-white">
              Your Wishlist is Empty
            </h2>
            <p className="mb-8 text-gray-400">
              Start adding games to keep track of titles you're interested in!
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/top-games"
                className="rounded-full bg-white px-8 py-3 font-semibold text-black transition-all hover:scale-105"
              >
                Browse Top Games
              </Link>
              <Link
                href="/browse"
                className="rounded-full border border-white/20 bg-white/10 px-8 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Browse by Category
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-6 text-gray-400">
              {wishlist.length} {wishlist.length === 1 ? 'game' : 'games'} in your wishlist
            </p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedWishlist.map((game) => (
                <Card key={game.appid} className="overflow-hidden">
                  <div className="relative">
                    {game.header_image && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={game.header_image}
                          alt={game.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <button
                      onClick={() => removeFromWishlist(game.appid)}
                      className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white transition-transform hover:scale-110"
                      title="Remove from wishlist"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2 text-lg font-bold text-white">
                      {game.name}
                    </h3>
                    <div className="mb-3 flex items-center gap-2 text-sm text-gray-400">
                      <span>Added {new Date(game.addedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/game/${game.appid}`}
                        className="flex-1 rounded-full bg-white/10 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-white/20"
                      >
                        View Details
                      </Link>
                      <a
                        href={`https://store.steampowered.com/app/${game.appid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 rounded-full bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                      >
                        Steam Store
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
