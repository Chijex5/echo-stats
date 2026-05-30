"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, TrendingUp, TrendingDown, Minus, Clock, Music } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { useTopTracks, type TopTrack, type Trend } from "@/lib/hooks/useDashboard";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatMs(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

const TREND_CONFIG: Record<Trend, { icon: React.ReactNode; label: string; color: string }> = {
  up:   { icon: <TrendingUp size={12} />,   label: "Trending up",   color: "#1DB954" },
  down: { icon: <TrendingDown size={12} />, label: "Trending down", color: "#ef4444" },
  same: { icon: <Minus size={12} />,        label: "Stable",        color: "rgba(255,255,255,0.3)" },
};

// ─── Podium Card (#1 / #2 / #3) ─────────────────────────────────────────────

interface PodiumCardProps {
  track: TopTrack;
  rank: 1 | 2 | 3;
}

const PODIUM_HEIGHTS: Record<1 | 2 | 3, string> = {
  1: "mt-0",
  2: "mt-10",
  3: "mt-16",
};

const PODIUM_ORDER: Record<1 | 2 | 3, number> = {
  1: 2, // center
  2: 1, // left
  3: 3, // right
};

const RANK_STYLES: Record<1 | 2 | 3, { glow: string; badge: string; size: string }> = {
  1: {
    glow: "0 0 60px rgba(29,185,84,0.25), 0 0 120px rgba(29,185,84,0.10)",
    badge: "bg-[#1DB954] text-black",
    size: "w-36 h-36 md:w-44 md:h-44",
  },
  2: {
    glow: "0 0 40px rgba(255,255,255,0.08)",
    badge: "bg-white/20 text-white",
    size: "w-28 h-28 md:w-36 md:h-36",
  },
  3: {
    glow: "0 0 30px rgba(255,255,255,0.05)",
    badge: "bg-white/10 text-white/70",
    size: "w-24 h-24 md:w-32 md:h-32",
  },
};

function PodiumCard({ track, rank }: PodiumCardProps) {
  const styles = RANK_STYLES[rank];
  const trend = TREND_CONFIG[track.trend];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: rank * 0.12, ease: [0.16, 1, 0.3, 1] }}
      style={{ order: PODIUM_ORDER[rank] }}
      className={`flex flex-col items-center gap-3 flex-1 min-w-0 ${PODIUM_HEIGHTS[rank]}`}
    >
      {/* Rank badge */}
      <div
        className={`text-xs font-bold tracking-widest px-3 py-1 rounded-full uppercase ${styles.badge}`}
      >
        #{rank}
      </div>

      {/* Album art */}
      <div
        className={`relative rounded-2xl overflow-hidden shrink-0 ${styles.size}`}
        style={{ boxShadow: styles.glow }}
      >
        {track.albumImageUrl ? (
          <img
            src={track.albumImageUrl}
            alt={`${track.trackName} album art`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${track.color} flex items-center justify-center`}>
            <Music size={32} className="text-white/40" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center shadow-lg">
            <Play size={20} fill="currentColor" className="text-black ml-0.5" />
          </div>
        </div>
      </div>

      {/* Track info */}
      <div className="text-center max-w-[160px]">
        <p
          className={`font-bold truncate leading-tight ${
            rank === 1 ? "text-base md:text-lg" : "text-sm md:text-base"
          }`}
        >
          {track.trackName}
        </p>
        <p className="text-xs text-white/50 truncate mt-0.5">{track.artistName}</p>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs text-white/40">
        <span className="flex items-center gap-1">
          <Play size={10} fill="currentColor" />
          {track.playCount}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={10} />
          {formatMs(track.totalMs)}
        </span>
        <span style={{ color: trend.color }} className="flex items-center gap-1">
          {trend.icon}
        </span>
      </div>

      {/* Podium base bar */}
      <div
        className={`w-full rounded-t-sm ${
          rank === 1
            ? "h-10 bg-gradient-to-t from-[#1DB954]/30 to-[#1DB954]/10 border-t border-[#1DB954]/40"
            : rank === 2
            ? "h-7 bg-white/[0.04] border-t border-white/10"
            : "h-4 bg-white/[0.03] border-t border-white/[0.07]"
        }`}
      />
    </motion.div>
  );
}

// ─── Podium skeleton ─────────────────────────────────────────────────────────

function PodiumSkeleton({ rank }: { rank: 1 | 2 | 3 }) {
  const sizes = { 1: "w-44 h-44", 2: "w-36 h-36", 3: "w-32 h-32" };
  return (
    <div
      className={`flex flex-col items-center gap-3 flex-1 min-w-0 animate-pulse ${PODIUM_HEIGHTS[rank]}`}
      style={{ order: PODIUM_ORDER[rank] }}
    >
      <div className="h-6 w-10 rounded-full bg-white/10" />
      <div className={`${sizes[rank]} rounded-2xl bg-white/10`} />
      <div className="h-3 w-28 rounded bg-white/10" />
      <div className="h-2 w-20 rounded bg-white/[0.06]" />
    </div>
  );
}

// ─── List Row (#4 and below) ─────────────────────────────────────────────────

interface ListRowProps {
  track: TopTrack;
  rank: number;
  index: number; // for stagger
}

function ListRow({ track, rank, index }: ListRowProps) {
  const trend = TREND_CONFIG[track.trend];

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3) }}
      className="group grid items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
      style={{ gridTemplateColumns: "2rem 2.75rem 1fr auto" }}
    >
      {/* Rank */}
      <span className="text-sm font-mono text-white/25 group-hover:text-white/40 transition-colors text-right tabular-nums">
        {rank}
      </span>

      {/* Album art */}
      <div
        className={`relative w-11 h-11 rounded-lg overflow-hidden shrink-0 ${
          track.albumImageUrl ? "" : `bg-gradient-to-br ${track.color}`
        }`}
      >
        {track.albumImageUrl && (
          <img src={track.albumImageUrl} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play size={12} fill="currentColor" className="ml-px" />
        </div>
      </div>

      {/* Title + artist */}
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate group-hover:text-[#1DB954] transition-colors leading-tight">
          {track.trackName}
        </p>
        <p className="text-xs text-white/40 truncate">{track.artistName}</p>
      </div>

      {/* Right meta */}
      <div className="flex items-center gap-4 shrink-0">
        <span
          className="hidden sm:flex items-center gap-1 text-xs"
          style={{ color: trend.color }}
          aria-label={trend.label}
        >
          {trend.icon}
        </span>
        <span className="hidden md:block text-xs text-white/30 tabular-nums">
          {formatMs(track.totalMs)}
        </span>
        <span className="text-xs text-white/50 tabular-nums w-8 text-right">
          {track.playCount}
        </span>
      </div>
    </motion.div>
  );
}

// ─── List skeleton ────────────────────────────────────────────────────────────

function ListRowSkeleton({ index }: { index: number }) {
  return (
    <div
      className="grid items-center gap-3 px-3 py-2.5 animate-pulse"
      style={{
        gridTemplateColumns: "2rem 2.75rem 1fr auto",
        animationDelay: `${index * 40}ms`,
      }}
    >
      <div className="h-3 w-5 rounded bg-white/10 ml-auto" />
      <div className="w-11 h-11 rounded-lg bg-white/10" />
      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-2/3 rounded bg-white/10" />
        <div className="h-2.5 w-1/3 rounded bg-white/[0.06]" />
      </div>
      <div className="h-3 w-8 rounded bg-white/10" />
    </div>
  );
}

// ─── Column header ────────────────────────────────────────────────────────────

function ListHeader() {
  return (
    <div
      className="grid items-center gap-3 px-3 pb-2 border-b border-white/[0.06] mb-1"
      style={{ gridTemplateColumns: "2rem 2.75rem 1fr auto" }}
    >
      <span className="text-[10px] uppercase tracking-widest text-white/20 text-right">#</span>
      <span /> {/* album art col */}
      <span className="text-[10px] uppercase tracking-widest text-white/20">Track</span>
      <div className="flex items-center gap-4">
        <span className="hidden sm:block text-[10px] uppercase tracking-widest text-white/20 w-4" />
        <span className="hidden md:block text-[10px] uppercase tracking-widest text-white/20 w-12">Time</span>
        <span className="text-[10px] uppercase tracking-widest text-white/20 w-8 text-right">Plays</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TopTracksPage() {
  const { data, isLoading, error } = useTopTracks(50);
  const tracks = data?.tracks ?? [];

  const podiumTracks = tracks.slice(0, 3) as TopTrack[];
  const listTracks = tracks.slice(3);

  return (
    <div className="min-h-screen bg-background text-white selection:bg-[#1DB954]/30 selection:text-white flex overflow-x-hidden">
      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col overflow-x-hidden">
        <TopNav />

        <main className="flex-1 px-4 py-8 md:px-8 md:py-12 w-full">
          <div className="max-w-[960px] mx-auto relative">
            {/* Ambient glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#1DB954]/8 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute top-[40%] -left-32 w-[400px] h-[400px] bg-violet-700/8 rounded-full blur-[120px] pointer-events-none -z-10" />

            {/* Page header */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-14 md:mb-20 text-center"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-[#1DB954] mb-3 font-medium">
                Your listening history
              </p>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
                Top Tracks
              </h1>
              <p className="mt-3 text-white/40 text-sm">
                Ranked by total plays from your imported history & Spotify sync
              </p>
            </motion.div>

            {/* ── Podium ── */}
            <section aria-label="Top 3 tracks podium" className="mb-16 md:mb-24">
              <div className="flex items-end justify-center gap-4 md:gap-8 px-4">
                {isLoading ? (
                  <>
                    <PodiumSkeleton rank={2} />
                    <PodiumSkeleton rank={1} />
                    <PodiumSkeleton rank={3} />
                  </>
                ) : (
                  podiumTracks.map((track, i) => {
                    const rank = (i + 1) as 1 | 2 | 3;
                    return <PodiumCard key={track.uri} track={track} rank={rank} />;
                  })
                )}
              </div>
            </section>

            {/* ── Full list (4–50) ── */}
            {(isLoading || listTracks.length > 0) && (
              <section aria-label="Tracks ranked 4 to 50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs uppercase tracking-[0.18em] text-white/30 font-medium">
                    Full Rankings
                  </h2>
                  {!isLoading && (
                    <span className="text-xs text-white/20">
                      {tracks.length} tracks
                    </span>
                  )}
                </div>

                <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden">
                  <div className="p-3">
                    <ListHeader />

                    {error && (
                      <p className="text-sm text-red-400/60 px-3 py-4">
                        Could not load tracks. Please try again.
                      </p>
                    )}

                    {isLoading
                      ? Array.from({ length: 20 }, (_, i) => (
                          <ListRowSkeleton key={i} index={i} />
                        ))
                      : listTracks.map((track, index) => (
                          <ListRow
                            key={track.uri}
                            track={track}
                            rank={index + 4}
                            index={index}
                          />
                        ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}