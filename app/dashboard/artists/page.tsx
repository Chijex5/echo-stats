"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Flame, GitCompareArrows, Play } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { useTopArtists, type TopArtist, type Trend } from "@/lib/hooks/useDashboard";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TREND: Record<Trend, { icon: React.ReactNode; color: string; label: string }> = {
  up:   { icon: <TrendingUp size={11} />,   color: "#1DB954", label: "Rising"  },
  down: { icon: <TrendingDown size={11} />, color: "#ef4444", label: "Falling" },
  same: { icon: <Minus size={11} />,        color: "rgba(255,255,255,0.25)", label: "Stable" },
};

function lineColor(trend: Trend) {
  return trend === "up" ? "rgba(29,185,84,0.8)" : trend === "down" ? "rgba(248,113,113,0.7)" : "rgba(255,255,255,0.3)";
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  artist,
  size = "md",
  ring = false,
}: {
  artist: TopArtist;
  size?: "sm" | "md" | "lg" | "xl";
  ring?: boolean;
}) {
  const dims = { sm: "w-10 h-10 text-sm", md: "w-16 h-16 text-lg", lg: "w-24 h-24 text-2xl", xl: "w-32 h-32 md:w-40 md:h-40 text-4xl" };
  return (
    <div className={`relative rounded-full shrink-0 ${dims[size]}`}>
      {ring && (
        <div className="absolute -inset-1 rounded-full border-2 border-[#1DB954]/60 animate-pulse z-10 pointer-events-none" />
      )}
      {artist.imageUrl ? (
        <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover rounded-full" />
      ) : (
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${artist.color} flex items-center justify-center font-bold text-white`}>
          {artist.initials}
        </div>
      )}
    </div>
  );
}

// ─── #1 Featured Hero ─────────────────────────────────────────────────────────

function FeaturedArtist({ artist }: { artist: TopArtist }) {
  const t = TREND[artist.trend];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-3xl border border-white/[0.07] bg-white/[0.03] overflow-hidden p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start"
    >
      {/* Background glow from artist color */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{ background: `radial-gradient(ellipse 60% 80% at 20% 50%, #1DB954, transparent)` }}
      />

      {/* Avatar */}
      <div className="relative z-10 shrink-0">
        <Avatar artist={artist} size="xl" ring />
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#1DB954] text-black text-[10px] font-black tracking-widest uppercase whitespace-nowrap">
          #1
        </div>
      </div>

      {/* Info */}
      <div className="relative z-10 flex-1 min-w-0 text-center md:text-left">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#1DB954] mb-2 font-medium">Most played artist</p>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none truncate mb-3">
          {artist.name}
        </h2>
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-white/50 mb-6">
          <span className="flex items-center gap-1.5">
            <Play size={12} fill="currentColor" />
            {artist.plays.toLocaleString()} plays
          </span>
          <span className="flex items-center gap-1.5" style={{ color: t.color }}>
            {t.icon} {artist.deltaLabel}
          </span>
        </div>

        {/* Sparkline */}
        <div className="w-full max-w-xs mx-auto md:mx-0 h-14">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={artist.sparkline}>
              <Line type="monotone" dataKey="v" stroke={lineColor(artist.trend)} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Artist Grid Card ─────────────────────────────────────────────────────────

interface GridCardProps {
  artist: TopArtist;
  rank: number;
  index: number;
}

function GridCard({ artist, rank, index }: GridCardProps) {
  const t = TREND[artist.trend];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
      className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300 p-4 flex flex-col gap-3"
    >
      {/* Top row: avatar + rank + name */}
      <div className="flex items-center gap-3">
        <Avatar artist={artist} size="md" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm truncate group-hover:text-[#1DB954] transition-colors">
            {artist.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-white/25 font-mono">#{rank}</span>
            <span className="text-[10px] text-white/40">
              {artist.plays.toLocaleString()} plays
            </span>
          </div>
        </div>
        {/* Trend badge */}
        <span
          className="flex items-center gap-1 text-[10px] font-medium shrink-0"
          style={{ color: t.color }}
          aria-label={t.label}
        >
          {t.icon}
        </span>
      </div>

      {/* Sparkline */}
      <div className="h-8 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={artist.sparkline}>
            <Line type="monotone" dataKey="v" stroke={lineColor(artist.trend)} strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Delta label */}
      <p className="text-[10px] text-white/35">{artist.deltaLabel}</p>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function FeaturedSkeleton() {
  return (
    <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center animate-pulse">
      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/10 shrink-0" />
      <div className="flex-1 flex flex-col gap-3 w-full">
        <div className="h-3 w-32 rounded bg-white/10" />
        <div className="h-10 w-64 rounded bg-white/10" />
        <div className="h-3 w-24 rounded bg-white/[0.06]" />
        <div className="h-14 w-full max-w-xs rounded bg-white/[0.06] mt-2" />
      </div>
    </div>
  );
}

function GridCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex flex-col gap-3 animate-pulse"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-white/10 shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3 w-2/3 rounded bg-white/10" />
          <div className="h-2.5 w-1/3 rounded bg-white/[0.06]" />
        </div>
      </div>
      <div className="h-8 rounded bg-white/[0.06]" />
      <div className="h-2.5 w-24 rounded bg-white/10" />
    </div>
  );
}

// ─── Insights Bar ─────────────────────────────────────────────────────────────

function InsightsBar({ artists }: { artists: TopArtist[] }) {
  const sortedByDelta = [...artists].sort((a, b) => b.delta - a.delta);
  const fastRising = sortedByDelta.find((a) => a.delta > 0) ?? null;
  const forgotten = [...artists].sort((a, b) => a.delta - b.delta).find((a) => a.delta < 0) ?? null;
  const totalDrift = artists.reduce((acc, a) => acc + Math.abs(a.delta), 0);
  const driftPct = artists.length
    ? Math.min(100, Math.round((totalDrift / artists.reduce((n, a) => n + a.plays, 1)) * 100))
    : 0;

  const items = [
    {
      icon: <GitCompareArrows size={14} />,
      label: "Monthly drift",
      value: `${driftPct}%`,
      sub: "Artist rotation shift vs last month",
    },
    {
      icon: <Flame size={14} />,
      label: "Fast rising",
      value: fastRising?.name ?? "None yet",
      sub: fastRising ? `+${fastRising.delta} plays this month` : "Keep listening",
    },
    {
      icon: <TrendingDown size={14} />,
      label: "Fading out",
      value: forgotten?.name ?? "None",
      sub: forgotten ? `${forgotten.delta} plays vs last month` : "No notable drop",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      aria-label="Artist insights"
    >
      <h2 className="text-xs uppercase tracking-[0.18em] text-white/30 font-medium mb-4">
        Artist Insights
      </h2>
      <div className="grid sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5"
          >
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 mb-3">
              <span className="text-[#1DB954]">{item.icon}</span>
              {item.label}
            </div>
            <p className="text-lg font-bold truncate leading-tight">{item.value}</p>
            <p className="text-[11px] text-white/35 mt-1">{item.sub}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TopArtistsPage() {
  const { data, isLoading, error } = useTopArtists(30);
  const artists = data?.artists ?? [];

  const featured = artists[0] ?? null;
  const gridArtists = artists.slice(1); // ranks 2–30

  return (
    <div className="min-h-screen bg-background text-white selection:bg-[#1DB954]/30 selection:text-white flex overflow-x-hidden">
      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col overflow-x-hidden">
        <TopNav />

        <main className="flex-1 px-4 py-8 md:px-8 md:py-12 w-full">
          <div className="max-w-[1100px] mx-auto relative">
            {/* Ambient glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-[#1DB954]/6 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute top-[50%] right-0 w-[400px] h-[400px] bg-violet-700/6 rounded-full blur-[120px] pointer-events-none -z-10" />

            <div className="flex flex-col gap-12">
              {/* Page header */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#1DB954] mb-2 font-medium">
                  Your listening history
                </p>
                <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-none">
                  Top Artists
                </h1>
                <p className="mt-2 text-white/40 text-sm">
                  Top 30 artists and trends from your listening history
                </p>
              </motion.div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-400/60">
                  Could not load artists. Please try again.
                </p>
              )}

              {/* ── Featured #1 ── */}
              {isLoading ? (
                <FeaturedSkeleton />
              ) : featured ? (
                <FeaturedArtist artist={featured} />
              ) : null}

              {/* ── Grid #2–30 ── */}
              {(isLoading || gridArtists.length > 0) && (
                <section aria-label="Artists ranked 2 to 30">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs uppercase tracking-[0.18em] text-white/30 font-medium">
                      Full Rankings
                    </h2>
                    {!isLoading && (
                      <span className="text-xs text-white/20">{artists.length} artists</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {isLoading
                      ? Array.from({ length: 15 }, (_, i) => (
                          <GridCardSkeleton key={i} index={i} />
                        ))
                      : gridArtists.map((artist, index) => (
                          <GridCard
                            key={artist.name}
                            artist={artist}
                            rank={index + 2}
                            index={index}
                          />
                        ))}
                  </div>
                </section>
              )}

              {/* ── Insights (only when data is ready) ── */}
              {!isLoading && artists.length > 0 && (
                <InsightsBar artists={artists} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}