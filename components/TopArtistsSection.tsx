"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { useTopArtists, type TopArtist, type Trend } from "@/lib/hooks/useDashboard";

// ─── Skeleton ──────────────────────────────────────────────────────────────

function ArtistSkeleton({ index }: { index: number }) {
  return (
    <div
      className="w-48 shrink-0 snap-start rounded-2xl glass-card p-5 flex flex-col items-center text-center animate-pulse"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* avatar circle */}
      <div className="w-20 h-20 rounded-full bg-white/10 mb-4" />
      {/* name */}
      <div className="h-3 w-28 rounded bg-white/10 mb-2" />
      {/* genre pill */}
      <div className="h-4 w-16 rounded-full bg-white/[0.06] mb-4" />
      {/* sparkline */}
      <div className="w-full h-8 rounded bg-white/[0.06] mb-3" />
      {/* delta */}
      <div className="h-2.5 w-24 rounded bg-white/10" />
    </div>
  );
}

// ─── Trend icon ────────────────────────────────────────────────────────────

const TREND_ICON: Record<Trend, React.ReactNode> = {
  up: <TrendingUp size={10} className="text-spotify" />,
  down: <TrendingDown size={10} className="text-red-400" />,
  same: null,
};

// ─── Single Artist Card ────────────────────────────────────────────────────

interface ArtistCardProps {
  artist: TopArtist;
  index: number;
  isFirst: boolean;
}

function ArtistCard({ artist, index, isFirst }: ArtistCardProps) {
  const lineColor =
    artist.trend === "up"
      ? "rgba(29,185,84,0.7)"   // spotify green
      : artist.trend === "down"
      ? "rgba(248,113,113,0.7)" // red-400
      : "rgba(255,255,255,0.4)";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="w-48 shrink-0 snap-start rounded-2xl glass-card p-5 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300"
    >
      {/* Avatar */}
      <div
        className={`w-20 h-20 rounded-full bg-gradient-to-br ${artist.color} flex items-center justify-center text-2xl font-bold text-white shadow-lg mb-4 relative`}
      >
        {isFirst && (
          <div className="absolute -inset-1 rounded-full border-2 border-spotify animate-pulse" />
        )}
        {artist.initials}
      </div>

      {/* Name */}
      <h3 className="font-semibold text-sm w-full truncate mb-1">{artist.name}</h3>

      {/* Plays count as subtle pill — genre isn't in the API, so we surface plays */}
      <div className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-medium text-white/60 mb-4">
        {artist.plays.toLocaleString()} plays
      </div>

      {/* Sparkline */}
      <div className="w-full h-8 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={artist.sparkline}>
            <Line
              type="monotone"
              dataKey="v"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Delta label */}
      <div className="flex items-center gap-1 text-[10px] text-white/50">
        {TREND_ICON[artist.trend]}
        <span>{artist.deltaLabel}</span>
      </div>
    </motion.div>
  );
}

// ─── TopArtistsSection ─────────────────────────────────────────────────────

const SKELETON_COUNT = 8;

export function TopArtistsSection() {
  const { data, isLoading, error } = useTopArtists(8);
  const artists = data?.artists ?? [];

  // Scroll the carousel programmatically via the chevron buttons
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -208 : 208, behavior: "smooth" });
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Top Artists</h2>
        <div className="flex items-center gap-2">
          <button
            aria-label="Scroll left"
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={16} className="text-white/70" />
          </button>
          <button
            aria-label="Scroll right"
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronRight size={16} className="text-white/70" />
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400/70 mb-4">
          Could not load artists. Please try again.
        </p>
      )}

      <div
        ref={scrollRef}
        className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-4 pb-4 -mx-6 px-6 md:mx-0 md:px-0"
      >
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <ArtistSkeleton key={i} index={i} />
            ))
          : artists.map((artist, index) => (
              <ArtistCard
                key={artist.name}
                artist={artist}
                index={index}
                isFirst={index === 0}
              />
            ))}
      </div>
    </section>
  );
}