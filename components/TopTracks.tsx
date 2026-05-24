"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useTopTracks, type TopTrack, type Trend } from "@/lib/hooks/useDashboard";

// ─── Skeleton ──────────────────────────────────────────────────────────────

function TrackSkeleton({ index }: { index: number }) {
  return (
    <div
      className="flex items-center gap-4 p-3 rounded-xl animate-pulse"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* rank */}
      <div className="w-8 flex justify-center">
        <div className="w-5 h-4 rounded bg-white/10" />
      </div>

      {/* album art */}
      <div className="w-12 h-12 rounded-lg bg-white/10 shrink-0" />

      {/* title + artist */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="h-3 w-3/5 rounded bg-white/10" />
        <div className="h-2.5 w-2/5 rounded bg-white/[0.06]" />
      </div>

      {/* sparkline */}
      <div className="w-16 h-6 rounded bg-white/[0.06] hidden sm:block" />

      {/* trend icon */}
      <div className="w-4 h-4 rounded bg-white/10" />

      {/* plays */}
      <div className="w-8 h-3.5 rounded bg-white/10" />
    </div>
  );
}

// ─── Single Track Row ──────────────────────────────────────────────────────

interface TrackRowProps {
  track: TopTrack;
  index: number;
}

function TrackRow({ track, index }: TrackRowProps) {
  const trendIcon: Record<Trend, React.ReactNode> = {
    up: <TrendingUp size={14} className="text-spotify" />,
    down: <TrendingDown size={14} className="text-red-400" />,
    same: <Minus size={14} className="text-white/30" />,
  };

  return (
    <motion.div
      key={track.uri}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-all group"
    >
      {/* Rank */}
      <div className="w-8 text-center text-2xl font-serif text-white/20 group-hover:text-white/40 transition-colors select-none">
        {(index + 1).toString().padStart(2, "0")}
      </div>

      {/* Album art */}
      <div
        className={`w-12 h-12 rounded-lg relative overflow-hidden shrink-0 shadow-md ${
          track.albumImageUrl ? "" : `bg-gradient-to-br ${track.color}`
        }`}
      >
        {track.albumImageUrl ? (
          <img
            src={track.albumImageUrl}
            alt={track.trackName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-black/20" />
        )}

        {/* Hover play overlay — always on top */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity cursor-pointer">
          <Play size={16} fill="currentColor" className="ml-0.5" />
        </div>
      </div>

      {/* Title + artist */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate group-hover:text-spotify transition-colors cursor-pointer">
          {track.trackName}
        </p>
        <p className="text-xs text-white/50 truncate">{track.artistName}</p>
      </div>

      {/* Right-side controls */}
      <div className="flex items-center gap-4">
        {/* Trend icon */}
        <div className="flex items-center gap-1 w-12 justify-end">
          {trendIcon[track.trend]}
        </div>

        {/* Play count — hidden on hover, replaced by play button */}
        <div className="w-8 text-right group-hover:hidden">
          <span className="text-sm font-medium text-white/70" title="Plays this month">
            {track.playCount}
          </span>
        </div>

        <div className="w-8 text-right hidden group-hover:flex justify-end">
          <button
            aria-label={`Play ${track.trackName}`}
            className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:text-spotify transition-colors"
          >
            <Play size={10} fill="currentColor" className="ml-0.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Top-level component ───────────────────────────────────────────────────

const SKELETON_COUNT = 10;

export function TopTracks({limit = 10} : {limit?: number}) {
  const { data, isLoading, error } = useTopTracks(limit);
  const tracks = data?.tracks ?? [];

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Top Tracks</h2>
        <button className="text-sm font-medium text-white/50 hover:text-white transition-colors">
          View All
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400/70 mb-4">
          Could not load tracks. Please try again.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-2">
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <TrackSkeleton key={i} index={i} />
            ))
          : tracks.map((track, index) => (
              <TrackRow key={track.uri} track={track} index={index} />
            ))}
      </div>
    </section>
  );
}
