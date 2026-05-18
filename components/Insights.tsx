"use client";

import React from "react";
import { motion } from "framer-motion";
import { Gem, Compass, HeartPulse, RotateCcw, Sun } from "lucide-react";
import {
  useInsights,
  type EmotionalProfile,
  type FavoriteDecade,
  type FirstSong,
  type LongestStreak,
  type HiddenGem,
  type GenreDrift,
} from "@/lib/hooks/useDashboard";

// ─── Shared card wrapper ───────────────────────────────────────────────────

interface InsightCardProps {
  children: React.ReactNode;
  delay?: number;
  glow?: string; // e.g. "bg-emerald-500/10" hover "bg-emerald-500/20"
  glowHover?: string;
}

function InsightCard({ children, delay = 0, glow = "bg-white/5", glowHover = "bg-white/10" }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass-card p-6 relative overflow-hidden group"
    >
      <div
        className={`absolute top-0 right-0 w-32 h-32 ${glow} rounded-full blur-[40px] group-hover:${glowHover} transition-colors pointer-events-none`}
      />
      {children}
    </motion.div>
  );
}

// ─── Skeleton pieces ───────────────────────────────────────────────────────

function SkeletonLine({ w = "w-full", h = "h-3" }: { w?: string; h?: string }) {
  return <div className={`${w} ${h} rounded bg-white/10 animate-pulse`} />;
}

function SkeletonCard({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  return (
    <div
      className="glass-card p-6 relative overflow-hidden animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function IconSlot({ children, bg, text }: { children: React.ReactNode; bg: string; text: string }) {
  return (
    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${text} mb-4 shrink-0`}>
      {children}
    </div>
  );
}

// ─── Card: Hidden Gem ──────────────────────────────────────────────────────

function HiddenGemCard({ data }: { data: HiddenGem }) {
  return (
    <InsightCard delay={0} glow="bg-emerald-500/10" glowHover="bg-emerald-500/20">
      <IconSlot bg="bg-emerald-500/20" text="text-emerald-400">
        <Gem size={20} />
      </IconSlot>
      <h3 className="font-semibold text-lg mb-1">Hidden Gem</h3>
      <p className="text-sm text-white/60 mb-4">
        One of your least-played recent discoveries — worth a closer listen.
      </p>
      <div className="bg-white/5 rounded-lg p-3 border border-white/5">
        <p className="font-medium text-sm truncate">{data.trackName}</p>
        <p className="text-xs text-white/40 truncate">{data.artistName}</p>
      </div>
    </InsightCard>
  );
}

function HiddenGemSkeleton() {
  return (
    <SkeletonCard delay={0}>
      <div className="w-10 h-10 rounded-xl bg-white/10 mb-4" />
      <SkeletonLine w="w-32" h="h-4" />
      <div className="mt-1 mb-4 space-y-1.5">
        <SkeletonLine w="w-full" h="h-2.5" />
        <SkeletonLine w="w-3/4" h="h-2.5" />
      </div>
      <div className="bg-white/5 rounded-lg p-3 space-y-1.5">
        <SkeletonLine w="w-2/3" h="h-3" />
        <SkeletonLine w="w-1/3" h="h-2.5" />
      </div>
    </SkeletonCard>
  );
}

// ─── Card: Genre Drift ─────────────────────────────────────────────────────

function GenreDriftCard({ data }: { data: GenreDrift }) {
  const from = data.from ?? "Unknown";
  const to = data.to ?? "Unknown";

  return (
    <InsightCard delay={0.1} glow="bg-purple-500/10" glowHover="bg-purple-500/20">
      <IconSlot bg="bg-purple-500/20" text="text-purple-400">
        <Compass size={20} />
      </IconSlot>
      <h3 className="font-semibold text-lg mb-1">Artist Drift</h3>
      <p className="text-sm text-white/60 mb-4">
        {data.drifted
          ? "Your most-played artist shifted this month."
          : "You're staying loyal to the same artist."}
      </p>
      <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/5 gap-2">
        <span className="text-xs text-white/50 truncate max-w-[80px]">{from}</span>
        <div className="flex-1 h-px bg-white/10 mx-1 relative shrink">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t border-r border-white/30 rotate-45" />
        </div>
        <span className="text-xs font-medium text-purple-400 truncate max-w-[80px] text-right">{to}</span>
      </div>
    </InsightCard>
  );
}

function GenreDriftSkeleton() {
  return (
    <SkeletonCard delay={60}>
      <div className="w-10 h-10 rounded-xl bg-white/10 mb-4" />
      <SkeletonLine w="w-28" h="h-4" />
      <div className="mt-1 mb-4 space-y-1.5">
        <SkeletonLine w="w-full" h="h-2.5" />
      </div>
      <div className="bg-white/5 rounded-lg p-3 flex items-center gap-2">
        <SkeletonLine w="w-16" h="h-2.5" />
        <div className="flex-1 h-px bg-white/10" />
        <SkeletonLine w="w-16" h="h-2.5" />
      </div>
    </SkeletonCard>
  );
}

// ─── Card: Emotional Profile ───────────────────────────────────────────────

const ENERGY_COLORS: Record<string, string> = {
  calm: "bg-blue-500/20",
  neutral: "bg-purple-500/40",
  energetic: "bg-pink-500/80",
  intense: "bg-red-500/80",
};

function EmotionalProfileCard({ data }: { data: EmotionalProfile }) {
  const dominant = data.dominantLabel;
  const dominantKey =
    dominant === "Calm" ? "calm"
    : dominant === "Neutral" ? "neutral"
    : dominant === "High Energy" ? "energetic"
    : "intense";

  return (
    <InsightCard delay={0.2} glow="bg-pink-500/10" glowHover="bg-pink-500/20">
      <IconSlot bg="bg-pink-500/20" text="text-pink-400">
        <HeartPulse size={20} />
      </IconSlot>
      <h3 className="font-semibold text-lg mb-1">Emotional Profile</h3>
      <p className="text-sm text-white/60 mb-4">
        Your recent listening leans heavily towards {dominant.toLowerCase()}.
      </p>
      {/* Proportional bar */}
      <div className="flex gap-1 h-10 mb-2 relative">
        {(["calm", "neutral", "energetic", "intense"] as const).map((key) => {
          const pct = data[key];
          if (pct === 0) return null;
          const isLast = key === dominantKey;
          return (
            <div
              key={key}
              className={`${ENERGY_COLORS[key]} rounded-sm relative`}
              style={{ width: `${pct}%` }}
            >
              {isLast && (
                <div className="absolute -top-6 right-0 text-[10px] font-bold text-pink-400 whitespace-nowrap">
                  {dominant}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-white/30 mt-1">
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>22:00</span>
      </div>
    </InsightCard>
  );
}

function EmotionalProfileSkeleton() {
  return (
    <SkeletonCard delay={120}>
      <div className="w-10 h-10 rounded-xl bg-white/10 mb-4" />
      <SkeletonLine w="w-36" h="h-4" />
      <div className="mt-1 mb-4 space-y-1.5">
        <SkeletonLine w="w-full" h="h-2.5" />
        <SkeletonLine w="w-5/6" h="h-2.5" />
      </div>
      <div className="flex gap-1 h-10">
        <div className="flex-1 rounded-sm bg-white/10" />
        <div className="flex-1 rounded-sm bg-white/10" />
        <div className="flex-[2] rounded-sm bg-white/10" />
      </div>
    </SkeletonCard>
  );
}

// ─── Card: Favorite Decade ─────────────────────────────────────────────────

function FavoriteDecadeCard({ data }: { data: FavoriteDecade }) {
  return (
    <InsightCard delay={0.3} glow="bg-indigo-500/10" glowHover="bg-indigo-500/20">
      <IconSlot bg="bg-indigo-500/20" text="text-indigo-400">
        <RotateCcw size={20} />
      </IconSlot>
      <h3 className="font-semibold text-lg mb-1">Favorite Decade</h3>
      <p className="text-sm text-white/60 mb-4">
        You&apos;re heavily anchored in the {data.topDecade} sound.
      </p>
      <div className="flex items-end gap-1 h-12 mb-2">
        {data.bars.map((bar) => (
          <div
            key={bar.decade}
            className={`flex-1 rounded-t-sm transition-colors ${bar.isTop ? "bg-spotify" : "bg-white/10"}`}
            style={{ height: `${bar.heightPct}%` }}
            title={`${bar.label}: ${bar.count} plays`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-white/30 mb-1">
        {data.bars.map((bar) => (
          <span key={bar.decade} className={bar.isTop ? "text-spotify font-semibold" : ""}>
            {bar.label.slice(2)} {/* "2010s" → "10s" */}
          </span>
        ))}
      </div>
      <div className="text-xs font-medium text-spotify">
        {data.topDecade} · {data.topPct}% of listening
      </div>
    </InsightCard>
  );
}

function FavoriteDecadeSkeleton() {
  return (
    <SkeletonCard delay={180}>
      <div className="w-10 h-10 rounded-xl bg-white/10 mb-4" />
      <SkeletonLine w="w-36" h="h-4" />
      <div className="mt-1 mb-4">
        <SkeletonLine w="w-full" h="h-2.5" />
      </div>
      <div className="flex items-end gap-1 h-12 mb-2">
        {[30, 50, 70, 40, 100, 60, 20].map((h, i) => (
          <div key={i} className="flex-1 rounded-t-sm bg-white/10" style={{ height: `${h}%` }} />
        ))}
      </div>
      <SkeletonLine w="w-32" h="h-3" />
    </SkeletonCard>
  );
}

// ─── Card: First Song This Year ────────────────────────────────────────────

function FirstSongCard({ data }: { data: FirstSong }) {
  const date = new Date(data.ts);
  const label = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <InsightCard delay={0.4} glow="bg-amber-500/10" glowHover="bg-amber-500/20">
      <IconSlot bg="bg-amber-500/20" text="text-amber-400">
        <Sun size={20} />
      </IconSlot>
      <h3 className="font-semibold text-lg mb-1">First Song This Year</h3>
      <p className="text-sm text-white/60 mb-4">Setting the tone for {date.getFullYear()}.</p>
      <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/5">
        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 shrink-0" />
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{data.trackName}</p>
          <p className="text-xs font-serif italic text-amber-400">
            {label} · {time}
          </p>
        </div>
      </div>
    </InsightCard>
  );
}

function FirstSongSkeleton() {
  return (
    <SkeletonCard delay={240}>
      <div className="w-10 h-10 rounded-xl bg-white/10 mb-4" />
      <SkeletonLine w="w-44" h="h-4" />
      <div className="mt-1 mb-4">
        <SkeletonLine w="w-40" h="h-2.5" />
      </div>
      <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-white/10 shrink-0" />
        <div className="space-y-1.5 flex-1">
          <SkeletonLine w="w-2/3" h="h-3" />
          <SkeletonLine w="w-1/2" h="h-2.5" />
        </div>
      </div>
    </SkeletonCard>
  );
}

// ─── Card: Longest Repeat Streak ──────────────────────────────────────────

function LongestStreakCard({ data }: { data: LongestStreak }) {
  return (
    <InsightCard delay={0.5} glow="bg-blue-500/10" glowHover="bg-blue-500/20">
      <IconSlot bg="bg-blue-500/20" text="text-blue-400">
        {/* repeat icon */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="m17 2 4 4-4 4" />
          <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
          <path d="m7 22-4-4 4-4" />
          <path d="M21 13v1a4 4 0 0 1-4 4H3" />
        </svg>
      </IconSlot>
      <h3 className="font-semibold text-lg mb-1">Longest Streak</h3>
      <p className="text-sm text-white/60 mb-4">
        You couldn&apos;t get enough of this track.
      </p>
      <div className="mb-3">
        <p className="font-medium text-sm truncate">{data.trackName}</p>
        <p className="text-xs text-blue-400">Played {data.days} days in a row</p>
      </div>
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: Math.min(data.days, 30) }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-blue-400"
            style={{ opacity: 0.3 + (i / Math.max(data.days - 1, 1)) * 0.7 }}
          />
        ))}
        {data.days > 30 && (
          <span className="text-[10px] text-blue-400/60 self-center">+{data.days - 30}</span>
        )}
      </div>
    </InsightCard>
  );
}

function LongestStreakSkeleton() {
  return (
    <SkeletonCard delay={300}>
      <div className="w-10 h-10 rounded-xl bg-white/10 mb-4" />
      <SkeletonLine w="w-32" h="h-4" />
      <div className="mt-1 mb-4 space-y-1.5">
        <SkeletonLine w="w-full" h="h-2.5" />
      </div>
      <div className="mb-3 space-y-1.5">
        <SkeletonLine w="w-2/3" h="h-3" />
        <SkeletonLine w="w-1/3" h="h-2.5" />
      </div>
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/10" />
        ))}
      </div>
    </SkeletonCard>
  );
}

// ─── Insights (root) ───────────────────────────────────────────────────────

export function Insights() {
  const { data, isLoading, error } = useInsights();

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Discovery Insights</h2>
      </div>

      {error && (
        <p className="text-sm text-red-400/70 mb-4">
          Could not load insights. Please try again.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading || !data ? (
          <>
            <HiddenGemSkeleton />
            <GenreDriftSkeleton />
            <EmotionalProfileSkeleton />
            <FavoriteDecadeSkeleton />
            <FirstSongSkeleton />
            <LongestStreakSkeleton />
          </>
        ) : (
          <>
            {data.hiddenGem ? (
              <HiddenGemCard data={data.hiddenGem} />
            ) : (
              <InsightCard delay={0} glow="bg-emerald-500/10">
                <IconSlot bg="bg-emerald-500/20" text="text-emerald-400"><Gem size={20} /></IconSlot>
                <h3 className="font-semibold text-lg mb-1">Hidden Gem</h3>
                <p className="text-sm text-white/40">Not enough data yet.</p>
              </InsightCard>
            )}

            <GenreDriftCard data={data.genreDrift} />
            <EmotionalProfileCard data={data.emotionalProfile} />
            <FavoriteDecadeCard data={data.favoriteDecade} />

            {data.firstSong ? (
              <FirstSongCard data={data.firstSong} />
            ) : (
              <InsightCard delay={0.4} glow="bg-amber-500/10">
                <IconSlot bg="bg-amber-500/20" text="text-amber-400"><Sun size={20} /></IconSlot>
                <h3 className="font-semibold text-lg mb-1">First Song This Year</h3>
                <p className="text-sm text-white/40">No plays recorded yet this year.</p>
              </InsightCard>
            )}

            {data.longestStreak ? (
              <LongestStreakCard data={data.longestStreak} />
            ) : (
              <InsightCard delay={0.5} glow="bg-blue-500/10">
                <IconSlot bg="bg-blue-500/20" text="text-blue-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                    <path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" />
                  </svg>
                </IconSlot>
                <h3 className="font-semibold text-lg mb-1">Longest Streak</h3>
                <p className="text-sm text-white/40">No repeat streaks found yet.</p>
              </InsightCard>
            )}
          </>
        )}
      </div>
    </section>
  );
}