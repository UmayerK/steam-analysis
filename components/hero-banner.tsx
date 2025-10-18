"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { WishlistButton } from "./wishlist-button";
import type { SteamAppDetails } from "@/lib/types";

interface GameWithDetails {
  appid: number;
  name: string;
  details: SteamAppDetails | null;
}

export function HeroBanner() {
  const [games, setGames] = useState<GameWithDetails[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sentimentData, setSentimentData] = useState<any>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch("/api/games/random");
        if (response.ok) {
          const data = await response.json();
          setGames(data);
        }
      } catch (error) {
        console.error("Error fetching random games:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  useEffect(() => {
    if (games.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % games.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [games.length]);

  useEffect(() => {
    if (games.length === 0 || !games[currentIndex]) return;

    const fetchSentiment = async () => {
      try {
        const response = await fetch(`/api/sentiment/${games[currentIndex].appid}`);
        if (response.ok) {
          const data = await response.json();
          setSentimentData(data);
        }
      } catch (error) {
        console.error("Error fetching sentiment:", error);
      }
    };

    fetchSentiment();
  }, [currentIndex, games]);

  if (isLoading) {
    return (
      <div className="relative h-[600px] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex h-full items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return null;
  }

  const currentGame = games[currentIndex];
  const gameDetails = currentGame?.details?.data;

  if (!gameDetails) return null;

  const getSentimentVariant = () => {
    if (!sentimentData?.overall) return "default";
    const avg = sentimentData.overall.averageScore;
    if (avg > 1) return "positive";
    if (avg < -1) return "negative";
    return "neutral";
  };

  const getSentimentPercentage = () => {
    if (!sentimentData?.overall) return 0;
    const { positiveCount, totalReviews } = sentimentData.overall;
    return totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0;
  };

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-3xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={gameDetails.header_image}
              alt={gameDetails.name}
              fill
              sizes="(max-width: 1200px) 100vw, 1050px"
              className="object-cover object-center scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col justify-end p-12">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {sentimentData && (
                <div className="mb-4 flex gap-2">
                  <Badge variant={getSentimentVariant()}>
                    {getSentimentPercentage()}% Positive
                  </Badge>
                  <Badge variant="default">
                    {sentimentData.overall.totalReviews} Reviews Analyzed
                  </Badge>
                </div>
              )}

              <h1 className="mb-4 text-6xl font-bold text-white">
                {gameDetails.name}
              </h1>

              <p className="mb-6 max-w-3xl text-lg text-gray-300 line-clamp-3">
                {gameDetails.short_description}
              </p>

              <div className="flex gap-4 items-center">
                <Link
                  href={`/game/${currentGame.appid}`}
                  className="rounded-full bg-white px-8 py-3 font-semibold text-black transition-all hover:scale-105 hover:bg-gray-100"
                >
                  View Analysis
                </Link>
                <a
                  href={`https://store.steampowered.com/app/${currentGame.appid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/20 bg-white/10 px-8 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  View on Steam
                </a>
                <WishlistButton
                  appid={currentGame.appid}
                  name={gameDetails.name}
                  header_image={gameDetails.header_image}
                  variant="icon"
                />
              </div>
            </motion.div>
          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-8 right-8 z-10 flex gap-2">
            {games.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-white"
                    : "w-2 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
