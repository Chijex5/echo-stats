"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import {
  Play, Heart, Share2, Clock, Calendar, Moon,
  CloudRain, Sparkles, Disc3, Repeat, Music2,
  ArrowUpRight, Flame, ChevronLeft, ChevronRight,
  LucideIcon,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  ResponsiveContainer,
} from "recharts";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import {
  useSongOfTheDay,
  type SotdSong,
  type SotdStats,
  type StoryBeat,
  type MemorySnapshot,
  type AlgoReason,
  type MoodReconstruction,
  type RelatedTrack,
  type DailyRitual,
  type AlgoIconName,
  type StoryIconName,
} from "@/lib/hooks/useSongOfTheDay";

// ─── Icon map ──────────────────────────────────────────────────────────────

const ICON_MAP: Record<AlgoIconName | StoryIconName, LucideIcon> = {
  Calendar,
  Heart,
  Moon,
  Sparkles,
  CloudRain,
  Repeat,
};

// ─── Particles (memoised, stable) ──────────────────────────────────────────

const PARTICLE_DATA = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 11.3) % 100,
  top: (i * 19.7) % 100,
  delay: (i % 6) * 0.5,
  size: 2 + (i * 3) % 3,
  duration: 6 + (i * 1.3) % 5,
}));

// ─── Skeleton primitives ───────────────────────────────────────────────────

function Shimmer({ w = "w-full", h = "h-3", cls = "" }: { w?: string; h?: string; cls?: string }) {
  return <div className={`${w} ${h} ${cls} rounded bg-white/10 animate-pulse`} />;
}

// ─── SotdHero ──────────────────────────────────────────────────────────────

interface SotdHeroProps {
  song: SotdSong;
  stats: SotdStats;
}

function SotdHero({ song, stats }: SotdHeroProps) {
  return (
    <section className="relative pt-4 pb-2">
      {/* Ambient blobs */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[160px] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${song.gradientFrom}55, transparent 70%)` }}
      />
      <div
        className="absolute top-32 -left-20 w-[420px] h-[420px] rounded-full blur-[140px] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${song.gradientTo}40, transparent 70%)` }}
      />
      <div className="absolute top-20 right-0 w-[420px] h-[420px] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLE_DATA.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, opacity: 0.5 }}
            animate={{ y: [-8, 8, -8], opacity: [0.15, 0.7, 0.15] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Waveform */}
      <svg className="absolute left-0 right-0 top-1/2 -translate-y-1/2 w-full h-72 opacity-25 pointer-events-none" viewBox="0 0 1440 320" fill="none">
        <defs>
          <linearGradient id="sotd-wave" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={song.gradientFrom} stopOpacity="0" />
            <stop offset="0.5" stopColor={song.gradientFrom} />
            <stop offset="1" stopColor={song.gradientTo} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M0 160 C 240 70, 240 250, 480 160 S 720 70, 960 160 S 1200 250, 1440 160"
          stroke="url(#sotd-wave)" strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.4, ease: "easeInOut" }}
        />
      </svg>

      {/* Headline */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-white/60 mb-6">
          <Sparkles size={12} className="text-spotify" />
          Song of the day · {new Date().toLocaleDateString("en-US", { weekday: "long" })}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-3">
          A song you{" "}
          <span className="font-serif italic font-normal text-white/90">loved</span> once.
        </h1>
        <p className="text-lg text-white/55 max-w-xl mx-auto">
          A memory waiting to return. Today, we found it.
        </p>
      </div>

      {/* Hero card */}
      <div className="relative z-10 mt-12 mx-auto max-w-3xl">
        <div
          className="absolute -inset-6 rounded-[2.5rem] blur-2xl opacity-70 pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${song.gradientFrom}50, ${song.gradientTo}40)` }}
        />
        <div className="relative glass-card p-8 md:p-10 overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className={`absolute -top-32 -left-20 w-[420px] h-[420px] rounded-full bg-gradient-to-br ${song.gradientClass} blur-[120px] opacity-30 pointer-events-none`} />

          <div className="relative grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 md:gap-10 items-center">
            {/* Album art */}
            <div className="relative mx-auto md:mx-0">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 22, ease: "linear", repeat: Infinity }}
                className="absolute -right-12 top-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-gradient-to-br from-zinc-800 to-black ring-1 ring-white/10 hidden md:block"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at center, rgba(255,255,255,0.06) 0%, transparent 12%), repeating-radial-gradient(circle at center, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 6px)",
                }}
              >
                <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 ring-1 ring-white/10" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={`relative w-56 h-56 md:w-64 md:h-64 rounded-2xl bg-gradient-to-br ${song.gradientClass} shadow-2xl shadow-black/60 ring-1 ring-white/10 overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/15" />
                <Disc3 className="absolute bottom-4 right-4 text-white/30" size={40} />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30 cursor-pointer group">
                  <div className="w-16 h-16 rounded-full bg-white/95 text-black flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
                    <Play size={22} fill="currentColor" className="ml-1" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Metadata */}
            <div className="min-w-0 text-center md:text-left">
              <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
                Forgotten favorite
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-1 truncate">
                {song.title}
              </h2>
              <p className="text-lg text-white/65 mb-6">
                {song.artist} <span className="text-white/30">·</span>{" "}
                {song.album} <span className="text-white/30">·</span>{" "}
                {song.released}
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Past plays</div>
                  <div className="text-xl font-serif">{stats.pastPlays}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Last played</div>
                  <div className="text-sm font-medium">{stats.lastPlayed}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Favorite month</div>
                  <div className="text-sm font-medium">{stats.favoriteMonth}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                <button className="inline-flex items-center gap-2 bg-spotify hover:bg-spotify-light text-black text-sm font-semibold px-6 py-3 rounded-full transition-all shadow-[0_0_32px_-6px_rgba(29,185,84,0.7)] hover:-translate-y-0.5">
                  <Play size={14} fill="currentColor" />
                  Play preview
                </button>
                <button className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/10 text-white text-sm font-medium px-5 py-3 rounded-full transition-colors">
                  <Heart size={14} /> Save
                </button>
                <button className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/10 text-white text-sm font-medium px-5 py-3 rounded-full transition-colors">
                  <Share2 size={14} /> Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SotdHeroSkeleton() {
  return (
    <section className="relative pt-4 pb-2">
      <div className="relative z-10 max-w-4xl mx-auto text-center mb-12">
        <Shimmer w="w-48" h="h-5" cls="mx-auto mb-6" />
        <Shimmer w="w-3/4" h="h-12" cls="mx-auto mb-3" />
        <Shimmer w="w-1/2" h="h-5" cls="mx-auto" />
      </div>
      <div className="mx-auto max-w-3xl glass-card p-8 md:p-10 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 items-center">
          <div className="w-56 h-56 md:w-64 md:h-64 rounded-2xl bg-white/10 mx-auto md:mx-0" />
          <div className="space-y-4">
            <Shimmer w="w-24" h="h-2.5" />
            <Shimmer w="w-3/4" h="h-9" />
            <Shimmer w="w-1/2" h="h-5" />
            <div className="grid grid-cols-3 gap-4 pt-2">
              {[0,1,2].map(i => <div key={i} className="space-y-1.5"><Shimmer w="w-full" h="h-2" /><Shimmer w="w-2/3" h="h-5" /></div>)}
            </div>
            <div className="flex gap-3 pt-2">
              <Shimmer w="w-32" h="h-11" cls="rounded-full" />
              <Shimmer w="w-20" h="h-11" cls="rounded-full" />
              <Shimmer w="w-20" h="h-11" cls="rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── TheStory ──────────────────────────────────────────────────────────────

interface TheStoryProps {
  beats: StoryBeat[];
  song: SotdSong;
}

function TheStory({ beats, song }: TheStoryProps) {
  return (
    <section>
      <div className="mb-6 max-w-2xl">
        <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">The story</div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
          You lived with this song for a{" "}
          <span className="font-serif italic text-white/90">season</span>.
        </h2>
      </div>
      <div className="glass-card p-8 md:p-10 relative overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full blur-[120px] opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${song.gradientFrom}, transparent)` }}
        />
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {beats.map((b, i) => {
            const Icon = ICON_MAP[b.icon];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex items-start gap-5"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/70 shrink-0">
                  <Icon size={16} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <div className="text-3xl md:text-4xl font-serif leading-none mb-1">{b.stat}</div>
                  <div className="text-sm text-white/55 leading-relaxed">{b.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TheStorySkeleton() {
  return (
    <section>
      <div className="mb-6 space-y-2">
        <Shimmer w="w-20" h="h-2.5" />
        <Shimmer w="w-3/4" h="h-9" />
      </div>
      <div className="glass-card p-8 md:p-10 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0,1,2,3].map(i => (
            <div key={i} className="flex items-start gap-5">
              <div className="w-10 h-10 rounded-xl bg-white/10 shrink-0" />
              <div className="space-y-2 flex-1">
                <Shimmer w="w-20" h="h-9" />
                <Shimmer w="w-3/4" h="h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── MemorySnapshot ────────────────────────────────────────────────────────

function MemorySnapshotSection({ data }: { data: MemorySnapshot }) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Memory snapshot</h2>
        <p className="text-sm text-white/50">
          What surrounded this song in {data.peakMonthLabel}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Co-played tracks */}
        <div className="glass-card p-6 lg:col-span-1">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-4">What else you played</div>
          <div className="space-y-3">
            {data.snapshotTracks.map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-md bg-gradient-to-br ${t.color} ring-1 ring-white/10 shrink-0`}>
                  <div className="w-full h-full rounded-md bg-black/15" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{t.title}</div>
                  <div className="text-xs text-white/50 truncate">{t.artist}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top artist + mood */}
        <div className="glass-card p-6 lg:col-span-1 flex flex-col gap-6">
          {data.topArtist && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Top artist</div>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${data.topArtist.color} flex items-center justify-center font-bold ring-1 ring-white/10`}>
                  {data.topArtist.initials}
                </div>
                <div>
                  <div className="text-base font-semibold">{data.topArtist.name}</div>
                  <div className="text-xs text-white/50">{data.topArtist.plays} plays that month</div>
                </div>
              </div>
            </div>
          )}
          <div className="border-t border-white/5 pt-5">
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Hours streamed</div>
            <div className="text-2xl font-serif">{data.peakMonthHours}h</div>
            <p className="text-xs text-white/50">total that month</p>
          </div>
        </div>

        {/* Photo collage grid */}
        <div className="glass-card p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] uppercase tracking-widest text-white/40">Snapshot</div>
            <div className="text-xs text-white/60 font-medium">{data.peakMonthLabel}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {data.snapshotCollage.map((c, i) => (
              <div key={i} className={`aspect-square rounded-md bg-gradient-to-br ${c} ring-1 ring-white/10 shadow-md`}
                style={{ opacity: 0.55 + (i * 13) % 5 * 0.08 }}>
                <div className="w-full h-full rounded-md bg-black/15" />
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-white/50">
            That month, you streamed{" "}
            <span className="text-white font-medium">{data.peakMonthHours} hours</span> of music.
          </div>
        </div>
      </div>
    </section>
  );
}

function MemorySnapshotSkeleton() {
  return (
    <section>
      <div className="mb-6 space-y-1.5"><Shimmer w="w-44" h="h-7" /><Shimmer w="w-56" h="h-4" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[0,1,2].map(i => (
          <div key={i} className="glass-card p-6 animate-pulse space-y-3">
            {[0,1,2,3].map(j => (
              <div key={j} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-white/10 shrink-0" />
                <div className="space-y-1.5 flex-1"><Shimmer w="w-3/4" h="h-3" /><Shimmer w="w-1/2" h="h-2.5" /></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── WhyWePickedThis ───────────────────────────────────────────────────────

interface WhyProps {
  reasons: AlgoReason[];
  affinityScore: number;
  affinityLabel: string;
}

function WhyWePickedThis({ reasons, affinityScore, affinityLabel }: WhyProps) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Why we picked this</h2>
        <p className="text-sm text-white/50">A glimpse at the algorithm choosing today&apos;s memory.</p>
      </div>
      <div className="glass-card p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative">
          <div className="hidden md:block absolute top-12 left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {reasons.map((r, i) => {
              const Icon = ICON_MAP[r.icon];
              return (
                <motion.div
                  key={r.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="relative w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/80 mb-4">
                    <Icon size={20} strokeWidth={1.8} />
                    <div className="absolute -inset-1 rounded-2xl border border-spotify/30 opacity-0 hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-sm font-semibold mb-2">{r.label}</div>
                  <p className="text-xs text-white/50 leading-relaxed max-w-[180px]">{r.desc}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-10 pt-8 border-t border-white/5 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Affinity score</div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-serif">{affinityScore}</span>
                  <span className="text-sm text-spotify font-medium">{affinityLabel}</span>
                </div>
              </div>
              <div className="w-full md:w-80">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${affinityScore}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-spotify via-emerald-400 to-emerald-200 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-white/40 mt-2">
                  <span>0</span><span>50</span><span>100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhySkeleton() {
  return (
    <section>
      <div className="mb-6 space-y-1.5"><Shimmer w="w-48" h="h-7" /><Shimmer w="w-64" h="h-4" /></div>
      <div className="glass-card p-6 md:p-10 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[0,1,2,3].map(i => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/10" />
              <Shimmer w="w-20" h="h-3" />
              <Shimmer w="w-28" h="h-2.5" />
              <Shimmer w="w-24" h="h-2.5" />
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row gap-4 justify-between">
          <div className="space-y-2"><Shimmer w="w-24" h="h-2.5" /><Shimmer w="w-32" h="h-10" /></div>
          <Shimmer w="w-full md:w-80" h="h-2" cls="self-center" />
        </div>
      </div>
    </section>
  );
}

// ─── RelatedForgotten ──────────────────────────────────────────────────────

function RelatedForgotten({ related }: { related: RelatedTrack[] }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -256 : 256, behavior: "smooth" });
  }

  return (
    <section>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">More memories</h2>
          <p className="text-sm text-white/50">Other forgotten favorites we&apos;d resurface next.</p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button onClick={() => scroll("left")} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors" aria-label="Previous">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scroll("right")} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors" aria-label="Next">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory">
        {related.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="snap-start shrink-0 w-60 glass-card p-4 hover:-translate-y-1 transition-transform group"
          >
            <div className={`relative w-full aspect-square rounded-xl bg-gradient-to-br ${r.color} mb-4 overflow-hidden ring-1 ring-white/10 shadow-md`}>
              <div className="absolute inset-0 bg-black/15" />
              <span className="absolute top-3 left-3 text-[9px] uppercase tracking-widest font-medium px-2 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/90">
                {r.tag}
              </span>
              <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Play size={14} fill="currentColor" className="ml-0.5" />
              </div>
            </div>
            <div className="text-sm font-semibold truncate">{r.title}</div>
            <div className="text-xs text-white/50 truncate mb-2">{r.artist}</div>
            <div className="text-[11px] text-white/40 flex items-center gap-1">
              <Clock size={11} /> Last played {r.lastPlayed}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function RelatedSkeleton() {
  return (
    <section>
      <div className="mb-6 space-y-1.5"><Shimmer w="w-36" h="h-7" /><Shimmer w="w-56" h="h-4" /></div>
      <div className="flex gap-4 overflow-hidden">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="shrink-0 w-60 glass-card p-4 animate-pulse" style={{ animationDelay: `${i*60}ms` }}>
            <div className="w-full aspect-square rounded-xl bg-white/10 mb-4" />
            <Shimmer w="w-3/4" h="h-3.5" cls="mb-1" />
            <Shimmer w="w-1/2" h="h-3" cls="mb-2" />
            <Shimmer w="w-28" h="h-2.5" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── MoodReconstruction ────────────────────────────────────────────────────

interface MoodProps {
  data: MoodReconstruction;
  song: SotdSong;
}

// Radar data — derived from hour distribution rather than hardcoded
function buildMoodRadar(hourHeat: { hour: number; v: number }[]) {
  const total = hourHeat.reduce((s, h) => s + h.v, 0) || 1;
  const morning = hourHeat.filter(h => h.hour >= 6 && h.hour <= 11).reduce((s, h) => s + h.v, 0);
  const night = hourHeat.filter(h => h.hour >= 22 || h.hour <= 4).reduce((s, h) => s + h.v, 0);
  const afternoon = hourHeat.filter(h => h.hour >= 12 && h.hour <= 17).reduce((s, h) => s + h.v, 0);
  const evening = hourHeat.filter(h => h.hour >= 18 && h.hour <= 21).reduce((s, h) => s + h.v, 0);
  const maxMonthly = Math.max(...hourHeat.map(h => h.v), 1);

  return [
    { axis: "Energy",     value: Math.round((evening / total) * 100) },
    { axis: "Calm",       value: Math.round((morning / total) * 100) },
    { axis: "Nostalgia",  value: Math.round((night / total) * 150)   }, // amplified
    { axis: "Joy",        value: Math.round((afternoon / total) * 80) },
    { axis: "Melancholy", value: Math.round((night / total) * 120)   },
  ];
}

function MoodReconstructionSection({ data, song }: MoodProps) {
  const moodRadar = buildMoodRadar(data.hourHeat);

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Mood reconstruction</h2>
        <p className="text-sm text-white/50">
          The texture of your listening when this song lived in heavy rotation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar */}
        <div className="glass-card p-6 lg:col-span-1 min-h-[280px] flex flex-col">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Emotional fingerprint</div>
          <div className="flex-1 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={moodRadar} outerRadius="72%">
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 10 }} />
                <Radar dataKey="value" stroke={song.gradientFrom} fill={song.gradientFrom} fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hour heatmap */}
        <div className="glass-card p-6 lg:col-span-2 min-h-[280px] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-widest text-white/40">Listening by hour</span>
            <span className="text-xs text-white/50">Peak at <span className="text-white font-medium">{data.peakHourLabel}</span></span>
          </div>
          <div className="flex-1 flex items-end gap-[3px]">
            {data.hourHeat.map((h) => {
              const peak = h.hour >= 23 || h.hour <= 2;
              const maxV = Math.max(...data.hourHeat.map(x => x.v), 1);
              return (
                <div key={h.hour} className="flex-1 rounded-t-sm"
                  style={{
                    height: `${Math.max(8, Math.round((h.v / maxV) * 100))}%`,
                    background: peak
                      ? `linear-gradient(to top, ${song.gradientFrom}, ${song.gradientTo})`
                      : "rgba(255,255,255,0.12)",
                    boxShadow: peak ? `0 0 18px ${song.gradientFrom}66` : "none",
                  }}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-white/40 mt-2">
            <span>00</span><span>06</span><span>12</span><span>18</span><span>23</span>
          </div>
        </div>

        {/* Monthly trend */}
        <div className="glass-card p-6 min-h-[220px] flex flex-col">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Plays per month</div>
          <div className="flex-1 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthTrend}>
                <defs>
                  <linearGradient id="sotd-month" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={song.gradientFrom} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={song.gradientFrom} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area dataKey="v" stroke={song.gradientFrom} strokeWidth={2} fill="url(#sotd-month)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[10px] text-white/40 mt-2">
            {data.monthTrend.map((m) => <span key={m.m}>{m.m[0]}</span>)}
          </div>
        </div>

        {/* Repeat curve */}
        <div className="glass-card p-6 min-h-[220px] flex flex-col">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Repeat frequency · per session</div>
          <div className="flex-1 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.repeatCurve}>
                <Line type="monotone" dataKey="v" stroke={song.gradientTo} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-white/55 mt-2">
            Most listened back-to-back{" "}
            <span className="text-white font-medium">{data.maxRepeatsInOneDay} times</span> in one sitting.
          </div>
        </div>

        {/* Play count bar by year relative bucket */}
        <div className="glass-card p-6 min-h-[220px] flex flex-col">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Play history overview</div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthTrend}>
                <Bar dataKey="v" radius={[4, 4, 0, 0]} fill={song.gradientFrom} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-white/55 mt-2">
            Last 12 months · <span className="text-white font-medium">{data.monthTrend.reduce((s, m) => s + m.v, 0)} plays</span> total.
          </div>
        </div>
      </div>
    </section>
  );
}

function MoodSkeleton() {
  return (
    <section>
      <div className="mb-6 space-y-1.5"><Shimmer w="w-52" h="h-7" /><Shimmer w="w-72" h="h-4" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 min-h-[280px] animate-pulse bg-white/[0.02]" />
        <div className="glass-card p-6 min-h-[280px] lg:col-span-2 animate-pulse bg-white/[0.02]" />
        <div className="glass-card p-6 min-h-[220px] animate-pulse bg-white/[0.02]" />
        <div className="glass-card p-6 min-h-[220px] animate-pulse bg-white/[0.02]" />
        <div className="glass-card p-6 min-h-[220px] animate-pulse bg-white/[0.02]" />
      </div>
    </section>
  );
}

// ─── DailyRitual ───────────────────────────────────────────────────────────

function DailyRitualSection({ data }: { data: DailyRitual }) {
  const stats = [
    { icon: Flame,   value: String(data.streakDays),           label: "Days active in a row" },
    { icon: Sparkles, value: String(data.totalRediscovered),   label: "Songs in your pool" },
    { icon: Heart,   value: `${data.avgAffinityScore}/100`,    label: "Avg affinity score" },
    { icon: Music2,  value: String(data.savedToLibrary),       label: "Saved to library" },
  ];

  return (
    <section className="pb-6">
      <div className="glass-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-24 left-1/3 w-[400px] h-[300px] bg-spotify/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-md">
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Daily ritual</div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              Come back tomorrow for a new{" "}
              <span className="font-serif italic text-spotify/90">memory</span>.
            </h3>
            <p className="text-sm text-white/55 leading-relaxed">
              We pick one resurfaced favorite each morning. Your streak grows when you stop by.
            </p>
            <button className="mt-5 inline-flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/10 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors">
              Get a daily reminder <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 md:max-w-2xl">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="bg-white/[0.03] border border-white/5 rounded-2xl p-5"
              >
                <s.icon size={16} className="text-white/50 mb-3" strokeWidth={1.8} />
                <div className="text-2xl font-serif mb-1">{s.value}</div>
                <div className="text-[11px] text-white/50 leading-tight">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function SongOfTheDayPage() {
  const { data, isLoading, error } = useSongOfTheDay();

  return (
    <div className="min-h-screen bg-background text-white selection:bg-spotify/30 selection:text-white flex overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col overflow-x-hidden">
        <TopNav />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-10 w-full">
          {/* max-w constraint lives here, not on <main> */}
          <div className="max-w-[1400px] mx-auto relative overflow-x-hidden">
          {/* Ambient */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
            <div className="absolute top-[40%] left-[-20%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 right-[-10%] w-[700px] h-[700px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

            {error && (
              <div className="relative z-10 flex items-center justify-center min-h-[60vh]">
                <p className="text-white/50 text-sm">Could not load today&apos;s song. Please try again.</p>
              </div>
            )}

            <div className="relative z-10 flex flex-col gap-14">
              {isLoading || !data ? (
                <>
                  <SotdHeroSkeleton />
                  <TheStorySkeleton />
                  <MemorySnapshotSkeleton />
                  <WhySkeleton />
                  <RelatedSkeleton />
                  <MoodSkeleton />
                </>
              ) : (
                <>
                  <SotdHero song={data.song} stats={data.stats} />
                  <TheStory beats={data.storyBeats} song={data.song} />
                  <MemorySnapshotSection data={data.memorySnapshot} />
                  <WhyWePickedThis reasons={data.algoReasons} affinityScore={data.affinityScore} affinityLabel={data.affinityLabel} />
                  <RelatedForgotten related={data.related} />
                  <MoodReconstructionSection data={data.moodReconstruction} song={data.song} />
                  <DailyRitualSection data={data.dailyRitual} />
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}