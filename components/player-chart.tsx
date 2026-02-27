"use client";

import { useState, useEffect, useCallback } from "react";
import { SpotlightCard } from "./ui/spotlight-card";
import { CardTitle } from "./ui/card";

interface PlayerDataPoint {
  date: string;
  players: number;
}

interface PlayerData {
  currentPlayers: number;
  peak24h: number;
  peakAllTime: number;
  history: PlayerDataPoint[];
}

const TIME_PERIODS = [
  { label: "30D", value: "30" },
  { label: "60D", value: "60" },
  { label: "90D", value: "90" },
  { label: "1Y", value: "365" },
] as const;

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function PlayerChart({ appid }: { appid: string }) {
  const [data, setData] = useState<PlayerData | null>(null);
  const [period, setPeriod] = useState("30");
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/players/${appid}?period=${period}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Error fetching player data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [appid, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading && !data) {
    return (
      <div className="mb-12">
        <div className="flex h-64 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxPlayers = Math.max(...data.history.map((d) => d.players), 1);

  // Determine how many bars to show and how to sample
  const maxBars = 60;
  const history = data.history;
  const step = history.length > maxBars ? Math.ceil(history.length / maxBars) : 1;
  const sampledHistory = history.filter((_, i) => i % step === 0 || i === history.length - 1);

  return (
    <div className="mb-12">
      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <SpotlightCard>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
              <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse"></div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Current Players
              </p>
              <p className="text-2xl font-bold text-emerald-400">
                {formatNumber(data.currentPlayers)}
              </p>
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                24-Hour Peak
              </p>
              <p className="text-2xl font-bold text-blue-400">
                {formatNumber(data.peak24h)}
              </p>
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
              <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                All-Time Peak
              </p>
              <p className="text-2xl font-bold text-amber-400">
                {formatNumber(data.peakAllTime)}
              </p>
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <CardTitle>Concurrent Players</CardTitle>
          <div className="flex gap-1 rounded-lg bg-white/5 p-1">
            {TIME_PERIODS.map((tp) => (
              <button
                key={tp.value}
                onClick={() => setPeriod(tp.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  period === tp.value
                    ? "bg-white text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Y-axis labels + bars */}
        <div className="relative">
          {/* Y-axis */}
          <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-right pr-3 w-16">
            <span className="text-xs text-gray-500">{formatNumber(maxPlayers)}</span>
            <span className="text-xs text-gray-500">{formatNumber(Math.round(maxPlayers * 0.75))}</span>
            <span className="text-xs text-gray-500">{formatNumber(Math.round(maxPlayers * 0.5))}</span>
            <span className="text-xs text-gray-500">{formatNumber(Math.round(maxPlayers * 0.25))}</span>
            <span className="text-xs text-gray-500">0</span>
          </div>

          {/* Grid lines */}
          <div className="ml-16 relative">
            <div className="absolute inset-0 bottom-6 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="border-t border-white/5 w-full"></div>
              ))}
            </div>

            {/* Bars container */}
            <div
              className="flex items-end gap-px relative"
              style={{ height: "280px" }}
            >
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-lg z-10">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                </div>
              )}
              {sampledHistory.map((point, i) => {
                const barHeight = Math.max((point.players / maxPlayers) * 280, 2);
                const isHovered = hoveredBar === i;
                return (
                  <div
                    key={point.date}
                    className="relative flex-1 flex items-end h-full"
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none">
                        <div className="rounded-lg bg-black/90 border border-white/20 px-3 py-2 text-center whitespace-nowrap shadow-xl">
                          <p className="text-xs text-gray-400">
                            {new Date(point.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-sm font-bold text-white">
                            {point.players.toLocaleString()} players
                          </p>
                        </div>
                      </div>
                    )}
                    {/* Bar */}
                    <div
                      className={`w-full rounded-t transition-all duration-150 ${
                        isHovered
                          ? "bg-emerald-400"
                          : "bg-emerald-500/60 hover:bg-emerald-400/80"
                      }`}
                      style={{
                        height: `${barHeight}px`,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="mt-2 flex justify-between">
              {sampledHistory.length > 0 && (
                <>
                  <span className="text-xs text-gray-500">
                    {new Date(sampledHistory[0].date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {sampledHistory.length > 2 && (
                    <span className="text-xs text-gray-500">
                      {new Date(
                        sampledHistory[Math.floor(sampledHistory.length / 2)].date
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(
                      sampledHistory[sampledHistory.length - 1].date
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
