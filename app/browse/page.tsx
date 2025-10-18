"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";

export default function BrowsePage() {
  const [activeTab, setActiveTab] = useState<'genres' | 'tags'>('genres');
  const [genres, setGenres] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const [genresRes, tagsRes] = await Promise.all([
        fetch('/api/categories/genres'),
        fetch('/api/categories/tags'),
      ]);

      if (genresRes.ok) {
        const genresData = await genresRes.json();
        setGenres(genresData.genres);
      }

      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        setTags(tagsData.tags);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const categoryIcons: Record<string, string> = {
    // Genres
    'Action': '⚔️',
    'Adventure': '🗺️',
    'Casual': '🎮',
    'Indie': '💡',
    'Massively Multiplayer': '🌐',
    'Racing': '🏎️',
    'RPG': '🐉',
    'Simulation': '🎯',
    'Sports': '⚽',
    'Strategy': '🧠',
    // Popular tags
    'Multiplayer': '👥',
    'Singleplayer': '👤',
    'Co-op': '🤝',
    'FPS': '🎯',
    'Survival': '🏕️',
    'Horror': '👻',
    'Open World': '🌍',
    'Sandbox': '🏗️',
    'Zombies': '🧟',
    'Crafting': '🔨',
    'Puzzle': '🧩',
    'Platformer': '🪜',
    'Roguelike': '🎲',
    'Roguelite': '🎲',
    'Souls-like': '⚔️',
    'Metroidvania': '🗺️',
    'Tower Defense': '🏰',
    'Card Game': '🃏',
    'Turn-Based': '⏰',
    'Real-Time': '⚡',
    'Point & Click': '🖱️',
    'Visual Novel': '📖',
    'Anime': '🎌',
    'Pixel Graphics': '👾',
    '2D': '📐',
    '3D': '🎮',
    'VR': '🥽',
    'Early Access': '🚧',
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black">
      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-8 text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
          Browse Games
        </h1>

        {/* Tabs */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setActiveTab('genres')}
            className={`rounded-full px-6 py-3 font-semibold transition-all ${
              activeTab === 'genres'
                ? 'bg-white text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Genres
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`rounded-full px-6 py-3 font-semibold transition-all ${
              activeTab === 'tags'
                ? 'bg-white text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Tags
          </button>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {(activeTab === 'genres' ? genres : tags).map((category) => (
              <Link
                key={category}
                href={`/browse/${activeTab === 'genres' ? 'genre' : 'tag'}/${encodeURIComponent(category)}`}
              >
                <Card className="h-full transition-all hover:scale-105 cursor-pointer">
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="mb-3 text-4xl">
                      {categoryIcons[category] || '🎮'}
                    </div>
                    <CardTitle className="text-base">
                      {category}
                    </CardTitle>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
