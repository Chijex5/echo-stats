"use client";
import React, { useMemo, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Calendar,
  Users,
  ArrowRight,
  Shuffle,
  X,
  Moon,
  Sun,
  CloudRain,
  Flame,
  Heart,
  Music2,
  TrendingUp,
  Zap,
  History,
  Clock } from
'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import { RandomNostalgiaModal } from '@/components/RandomNolstagiaModal';
import {
  useTimelineExplorer,
  useTimelinePage,
  type TimelineCell,
  type TimelinePageInsight,
} from '@/lib/hooks/useDashboard';
// ---------- DATA ----------
type Period = {
  id: string;
  label: string;
  year: number;
  monthIdx: number;
  monthName: string;
  topGenre: string;
  mood: string;
  moodScore: number;
  totalHours: number;
  uniqueArtists: number;
  topArtist: string;
  topArtistColor: string;
  accent: string;
  tracks: {
    title: string;
    albumImageUrl?: string;
    artist: string;
    color: string;
  }[];
  story?: {
    tag: string;
    line: string;
  };
};
const PERIODS: Period[] = [
{
  id: 'jan-2024',
  label: 'Jan 2024',
  year: 2024,
  monthIdx: 0,
  monthName: 'January',
  topGenre: 'Indie',
  mood: 'Reflective',
  moodScore: 6.4,
  totalHours: 64,
  uniqueArtists: 38,
  topArtist: 'Bon Iver',
  topArtistColor: 'from-sky-500 to-indigo-500',
  accent: 'from-blue-500/30 to-indigo-500/20',
  tracks: [
  {
    title: 'Skinny Love',
    artist: 'Bon Iver',
    color: 'from-sky-500 to-indigo-500'
  },
  {
    title: 'Holocene',
    artist: 'Bon Iver',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    title: 'Bags',
    artist: 'Clairo',
    color: 'from-violet-500 to-fuchsia-500'
  }]

},
{
  id: 'mar-2024',
  label: 'Mar 2024',
  year: 2024,
  monthIdx: 2,
  monthName: 'March',
  topGenre: 'Electronic',
  mood: 'Restless',
  moodScore: 7.8,
  totalHours: 92,
  uniqueArtists: 61,
  topArtist: 'Fred again..',
  topArtistColor: 'from-emerald-400 to-cyan-500',
  accent: 'from-cyan-500/30 to-blue-500/20',
  tracks: [
  {
    title: 'Marea',
    artist: 'Fred again..',
    color: 'from-emerald-400 to-cyan-500'
  },
  {
    title: 'Borderline',
    artist: 'Tame Impala',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    title: 'Pink + White',
    artist: 'Frank Ocean',
    color: 'from-pink-500 to-orange-400'
  }],

  story: {
    tag: 'Turning point',
    line: 'This month changed your music forever.'
  }
},
{
  id: 'may-2024',
  label: 'May 2024',
  year: 2024,
  monthIdx: 4,
  monthName: 'May',
  topGenre: 'Soul',
  mood: 'Warm',
  moodScore: 8.1,
  totalHours: 78,
  uniqueArtists: 44,
  topArtist: 'Cleo Sol',
  topArtistColor: 'from-amber-400 to-orange-500',
  accent: 'from-amber-400/30 to-orange-500/20',
  tracks: [
  {
    title: 'Saoirse',
    artist: 'Cleo Sol',
    color: 'from-amber-400 to-orange-500'
  },
  {
    title: 'Glory',
    artist: 'Common',
    color: 'from-yellow-500 to-amber-600'
  },
  {
    title: 'Ivy',
    artist: 'Frank Ocean',
    color: 'from-rose-400 to-orange-300'
  }]

},
{
  id: 'jul-2024',
  label: 'Jul 2024',
  year: 2024,
  monthIdx: 6,
  monthName: 'July',
  topGenre: 'Afrobeats',
  mood: 'Bright',
  moodScore: 8.6,
  totalHours: 104,
  uniqueArtists: 72,
  topArtist: 'Burna Boy',
  topArtistColor: 'from-green-500 to-emerald-400',
  accent: 'from-emerald-400/30 to-spotify/20',
  tracks: [
  {
    title: 'Last Last',
    artist: 'Burna Boy',
    color: 'from-green-500 to-emerald-400'
  },
  {
    title: 'Calm Down',
    artist: 'Rema',
    color: 'from-amber-500 to-orange-500'
  },
  {
    title: 'Soso',
    artist: 'Omah Lay',
    color: 'from-yellow-500 to-amber-500'
  }],

  story: {
    tag: 'Discovery',
    line: 'You discovered Afrobeats here.'
  }
},
{
  id: 'sep-2024',
  label: 'Sep 2024',
  year: 2024,
  monthIdx: 8,
  monthName: 'September',
  topGenre: 'Indie Rock',
  mood: 'Nostalgic',
  moodScore: 9.2,
  totalHours: 87,
  uniqueArtists: 51,
  topArtist: 'The Neighbourhood',
  topArtistColor: 'from-blue-500 to-violet-600',
  accent: 'from-blue-500/30 to-violet-600/20',
  tracks: [
  {
    title: 'Sweater Weather',
    artist: 'The Neighbourhood',
    color: 'from-slate-500 to-blue-600'
  },
  {
    title: 'Pink + White',
    artist: 'Frank Ocean',
    color: 'from-pink-500 to-orange-400'
  },
  {
    title: 'Nights',
    artist: 'Frank Ocean',
    color: 'from-purple-600 to-blue-500'
  }],

  story: {
    tag: 'Memory',
    line: 'You listened to Sweater Weather every night.'
  }
},
{
  id: 'nov-2024',
  label: 'Nov 2024',
  year: 2024,
  monthIdx: 10,
  monthName: 'November',
  topGenre: 'Hip-hop',
  mood: 'Focused',
  moodScore: 7.4,
  totalHours: 71,
  uniqueArtists: 42,
  topArtist: 'Kendrick Lamar',
  topArtistColor: 'from-red-500 to-orange-500',
  accent: 'from-red-500/25 to-orange-500/15',
  tracks: [
  {
    title: 'Not Like Us',
    artist: 'Kendrick Lamar',
    color: 'from-red-500 to-orange-500'
  },
  {
    title: 'Reborn',
    artist: 'KIDS SEE GHOSTS',
    color: 'from-zinc-600 to-zinc-800'
  },
  {
    title: 'Stronger',
    artist: 'Kanye West',
    color: 'from-zinc-500 to-stone-600'
  }]

},
{
  id: 'jan-2025',
  label: 'Jan 2025',
  year: 2025,
  monthIdx: 0,
  monthName: 'January',
  topGenre: 'R&B',
  mood: 'Hopeful',
  moodScore: 8.4,
  totalHours: 82,
  uniqueArtists: 48,
  topArtist: 'Frank Ocean',
  topArtistColor: 'from-pink-500 to-orange-400',
  accent: 'from-pink-500/25 to-rose-500/15',
  tracks: [
  {
    title: 'Pink + White',
    artist: 'Frank Ocean',
    color: 'from-pink-500 to-orange-400'
  },
  {
    title: 'Saoirse',
    artist: 'Cleo Sol',
    color: 'from-amber-400 to-orange-500'
  },
  {
    title: 'Solitude',
    artist: 'Tame Impala',
    color: 'from-purple-500 to-indigo-500'
  }],

  story: {
    tag: 'Soundtrack',
    line: 'This was your soundtrack during finals week.'
  }
},
{
  id: 'mar-2025',
  label: 'Mar 2025',
  year: 2025,
  monthIdx: 2,
  monthName: 'March',
  topGenre: 'Pop',
  mood: 'Playful',
  moodScore: 7.9,
  totalHours: 96,
  uniqueArtists: 67,
  topArtist: 'Chappell Roan',
  topArtistColor: 'from-rose-400 to-pink-500',
  accent: 'from-rose-400/30 to-pink-500/20',
  tracks: [
  {
    title: 'Good Luck, Babe!',
    artist: 'Chappell Roan',
    color: 'from-rose-400 to-pink-500'
  },
  {
    title: 'LUNCH',
    artist: 'Billie Eilish',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Espresso',
    artist: 'Sabrina Carpenter',
    color: 'from-pink-400 to-rose-400'
  }]

}];

const QUICK_JUMPS = [
{
  icon: Sparkles,
  label: 'Random nostalgia'
},
{
  icon: Heart,
  label: 'First play'
},
{
  icon: Sun,
  label: 'Last summer'
},
{
  icon: CloudRain,
  label: 'Rainy season'
}];

const STORIES = [
{
  tag: 'School year',
  headline: 'This was your soundtrack during exams.',
  body: 'Late nights from May 12 to June 8 leaned 84% lo-fi and ambient — the score to your studying.',
  accent: 'from-blue-500/30 via-violet-500/20 to-indigo-500/10',
  image: 'from-indigo-500 to-purple-500'
},
{
  tag: 'Discovery',
  headline: 'You discovered Afrobeats here.',
  body: 'July 2024 — 34 new artists in one month. Burna Boy became your most-played for the rest of the year.',
  accent: 'from-emerald-500/30 via-spotify/20 to-amber-500/10',
  image: 'from-green-500 to-emerald-400'
},
{
  tag: 'Nightly ritual',
  headline: 'You listened to this song every night.',
  body: '"Sweater Weather" played at midnight 23 nights in a row last September. A habit you didn\'t know you had.',
  accent: 'from-blue-500/30 via-violet-600/20 to-pink-500/10',
  image: 'from-slate-500 to-blue-600'
}];

// 30-cell calendar heatmap for active month
function makeMonthHeat(seed: number) {
  return Array.from({
    length: 30
  }).map((_, i) => {
    const wave = Math.sin((i + seed) * 0.45) * 0.35 + 0.45;
    const spike = (i + seed) % 7 === 0 ? 0.25 : 0;
    return Math.max(0.05, Math.min(0.95, wave + spike));
  });
}
// 12-month listening hours for the year
const YEAR_HOURS = Array.from({
  length: 12
}).map((_, i) => ({
  v: Math.round(50 + Math.sin(i * 0.55) * 30 + (i === 6 ? 25 : 0))
}));
const INSIGHTS = [
{
  icon: Flame,
  label: 'Most listened',
  value: 'July 2024',
  sub: '104 hours of music',
  accent: 'text-orange-300'
},
{
  icon: Moon,
  label: 'Quietest month',
  value: 'February 2024',
  sub: '38 hours · your low',
  accent: 'text-indigo-300'
},
{
  icon: Heart,
  label: 'Most emotional',
  value: 'September 2024',
  sub: 'Mood score peaked at 9.2',
  accent: 'text-rose-300'
},
{
  icon: Music2,
  label: 'Favorite year',
  value: '2024',
  sub: 'Your highest discovery rate',
  accent: 'text-spotify'
},
{
  icon: Sparkles,
  label: 'First discovered artist',
  value: 'Cleo Sol',
  sub: 'Jan 17, 2024 · 11:32 PM',
  accent: 'text-amber-300'
},
{
  icon: TrendingUp,
  label: 'Year taste shifted most',
  value: '2024',
  sub: '+47% genre diversification',
  accent: 'text-cyan-300'
}];

// ---------- HELPERS ----------
function PARTICLES() {
  return Array.from({
    length: 22
  }).map((_, i) => ({
    left: i * 14.7 % 100,
    top: i * 8.3 % 100,
    delay: i % 7 * 0.4,
    size: 2 + i * 2 % 4,
    duration: 5 + i * 1.9 % 4
  }));
}
// ---------- SECTIONS ----------
function TimelineHero() {
  const particles = PARTICLES();
  return (
    <section className="relative pt-2 pb-2">
      <div className="absolute -top-20 left-1/3 w-[700px] h-[400px] bg-violet-600/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-10 -right-10 w-[420px] h-[420px] bg-spotify/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-20 -left-10 w-[420px] h-[420px] bg-pink-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) =>
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            opacity: 0.4
          }}
          animate={{
            y: [-6, 6, -6],
            opacity: [0.15, 0.6, 0.15]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut'
          }} />

        )}
      </div>

      {/* floating album cards collage */}
      <div className="absolute right-0 top-4 hidden lg:flex items-center pointer-events-none">
        {[
        'from-amber-400 to-orange-500',
        'from-blue-500 to-violet-600',
        'from-pink-500 to-orange-400',
        'from-emerald-400 to-cyan-500',
        'from-purple-500 to-indigo-500'].
        map((c, i) =>
        <motion.div
          key={i}
          initial={{
            opacity: 0,
            y: 30,
            rotate: 0
          }}
          animate={{
            opacity: 1,
            y: [0, -10, 0],
            rotate: i % 2 === 0 ? -8 : 8
          }}
          transition={{
            opacity: {
              duration: 0.6,
              delay: i * 0.1
            },
            y: {
              duration: 4 + i * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2
            },
            rotate: {
              duration: 0.6,
              delay: i * 0.1
            }
          }}
          className={`w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br ${c} shadow-2xl shadow-black/40 ring-1 ring-white/10`}
          style={{
            marginLeft: i === 0 ? 0 : -18,
            filter: i === 1 ? 'none' : 'blur(0.5px)'
          }}>
          
            <div className="w-full h-full rounded-2xl bg-black/20" />
          </motion.div>
        )}
      </div>

      {/* Soft horizontal timeline curve */}
      <svg
        className="absolute left-0 right-0 bottom-2 w-full h-32 opacity-30 pointer-events-none"
        viewBox="0 0 1440 200"
        fill="none">
        
        <defs>
          <linearGradient
            id="tl-curve"
            x1="0"
            y1="0"
            x2="1440"
            y2="0"
            gradientUnits="userSpaceOnUse">
            
            <stop offset="0" stopColor="#7C3AED" stopOpacity="0" />
            <stop offset="0.5" stopColor="#1DB954" />
            <stop offset="1" stopColor="#F472B6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M0 120 C 240 60, 240 180, 480 120 S 720 60, 960 120 S 1200 180, 1440 120"
          stroke="url(#tl-curve)"
          strokeWidth="1.5"
          initial={{
            pathLength: 0,
            opacity: 0
          }}
          animate={{
            pathLength: 1,
            opacity: 1
          }}
          transition={{
            duration: 2.5,
            ease: 'easeInOut'
          }} />
        
      </svg>

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-white/60 mb-6">
          <History size={12} className="text-spotify" />
          Time machine
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-4">
          Travel through your music{' '}
          <span className="font-serif-display italic font-normal text-spotify/90">
            history
          </span>
          .
        </h1>
        <p className="text-lg text-white/55 max-w-xl">
          See what soundtracked any moment of your life. Drag, jump, or get lost
          in a random memory.
        </p>
      </div>
    </section>);

}

function TimeWarpLoader() {
  const rings = [1, 2, 3, 4, 5];
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16 select-none">
      {/* Concentric pulsing rings */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {rings.map((n) => (
          <motion.div
            key={n}
            className="absolute inset-0 rounded-full border border-spotify/40"
            initial={{ scale: 0.2, opacity: 0.8 }}
            animate={{ scale: 1.8 * n * 0.4, opacity: 0 }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              delay: n * 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
        {/* Center icon that spins and glows */}
        <motion.div
          className="w-16 h-16 rounded-full bg-spotify/20 border border-spotify/60 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <Clock size={24} className="text-spotify" />
        </motion.div>
      </div>
 
      {/* Animated text lines */}
      {["Rewinding your timeline…", "Surfacing a forgotten moment…", "Almost there…"].map(
        (text, i) => (
          <motion.p
            key={text}
            className="text-sm text-white/50 font-medium tracking-wide"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.6, delay: i * 1.6, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )
      )}
 
      {/* Acceleration bar */}
      <div className="w-48 h-px bg-white/10 relative overflow-hidden rounded-full">
        <motion.div
          className="absolute top-0 left-0 h-full bg-spotify rounded-full"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ duration: 1.4, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
          style={{ width: "50%" }}
        />
      </div>
    </div>
  );
}
 
// ── Modal content when a period is loaded ────────────────────
function MemoryCard({ period, onRetry, onClose }: {
  period: Period;
  onRetry: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      key={period.id}
      initial={{ opacity: 0, scale: 0.93, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.93, y: -24 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">
            Random memory
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            {period.monthName}{" "}
            <span className="font-serif italic text-white/70">{period.year}</span>
          </h2>
          <p className="text-sm text-white/55 mt-1">
            You felt{" "}
            <span className="text-white font-medium">{period.mood.toLowerCase()}</span>.
          </p>
        </div>
 
        {/* Mood score badge */}
        <div className="shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10">
          <span className="text-lg font-bold text-spotify leading-none">
            {period.moodScore.toFixed(1)}
          </span>
          <span className="text-[9px] uppercase tracking-widest text-white/40 mt-0.5">mood</span>
        </div>
      </div>
 
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Clock, label: "Hours", value: `${period.totalHours}h` },
          { icon: Users, label: "Artists", value: period.uniqueArtists },
          { icon: Zap, label: "Genre", value: period.topGenre },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-3 flex flex-col gap-1.5"
          >
            <div className="flex items-center gap-1.5">
              <Icon size={11} className="text-white/40" />
              <span className="text-[9px] uppercase tracking-widest text-white/40">{label}</span>
            </div>
            <span className="text-sm font-semibold truncate">{value}</span>
          </div>
        ))}
      </div>
 
      {/* Top artist */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
        <div
          className={`w-10 h-10 rounded-full bg-gradient-to-br ${period.topArtistColor} flex items-center justify-center font-bold text-sm ring-1 ring-white/10 shrink-0`}
        >
          {period.topArtist
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-widest text-white/40">Top artist</div>
          <div className="text-sm font-semibold">{period.topArtist}</div>
        </div>
      </div>
 
      {/* Tracks */}
      {period.tracks.length > 0 && (
        <div>
          <div className="text-[9px] uppercase tracking-widest text-white/40 mb-2">
            Top songs
          </div>
          <div className="space-y-2">
            {period.tracks.slice(0, 3).map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-white/25 w-4 font-mono">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg shrink-0 overflow-hidden ${
                    t.albumImageUrl ? "" : `bg-gradient-to-br ${t.color}`
                  }`}
                >
                  {t.albumImageUrl && (
                    <img src={t.albumImageUrl} alt={t.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{t.title}</div>
                  <div className="text-xs text-white/45 truncate">{t.artist}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
 
      {/* Story tag */}
      {period.story && (
        <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06] text-sm">
          <span className="px-2 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[9px] uppercase tracking-widest text-white/50 shrink-0">
            {period.story.tag}
          </span>
          <span className="text-white/70 italic font-serif">{period.story.line}</span>
        </div>
      )}
 
      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onRetry}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-spotify hover:bg-[#1ed760] text-black text-sm font-semibold px-5 py-3 rounded-full transition-all shadow-[0_0_28px_-4px_rgba(29,185,84,0.65)] hover:-translate-y-0.5 active:scale-95"
        >
          <Shuffle size={14} />
          Another random memory
        </button>
        <button
          onClick={onClose}
          className="inline-flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white/80 text-sm font-medium px-5 py-3 rounded-full transition-all"
        >
          <X size={14} />
          Close
        </button>
      </div>
    </motion.div>
  );
}

function TimelineControl({
  activeIdx,
  setActiveIdx,
  periods,
  yearHours,
  yearLabels,
  startYear,
  endYear,
}: {
  activeIdx: number;
  setActiveIdx: (n: number) => void;
  periods: Period[];
  yearHours: { year?: string; v: number }[];
  yearLabels: string[];
  startYear: number;
  endYear: number;
}) {
  const activePeriod = periods[activeIdx] ?? periods[0] ?? PERIODS[0];
  const years = useMemo(
    () => [...new Set(periods.map((p) => p.year))].sort((a, b) => a - b),
    [periods]
  );
  const selectedYear = activePeriod.year;
  const monthsForYear = useMemo(
    () =>
      periods
        .filter((p) => p.year === selectedYear)
        .sort((a, b) => a.monthIdx - b.monthIdx),
    [periods, selectedYear]
  );
  const selectedMonthId = activePeriod.id;

  // How many total months the scrubber spans
  const monthsTotal = Math.max(1, (endYear - startYear + 1) * 12);
  return (
    <section>
      <div className="glass-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] bg-spotify/15 rounded-full blur-[120px] pointer-events-none" />

        {/* ── Top row: label + dropdowns ── */}
        <div className="relative flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[10px] uppercase tracking-widest text-white/40 shrink-0">
              Now exploring
            </span>
            <span className="text-lg font-semibold truncate">
              {activePeriod.monthName} {activePeriod.year}
            </span>
          </div>

          <div className="flex w-full md:w-auto items-center gap-2.5 md:gap-3">
            {/* Year */}
            <label className="flex-1 md:flex-none flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/[0.04] px-3 pt-2 pb-2.5 cursor-pointer min-w-[90px]">
              <span className="text-[10px] uppercase tracking-widest text-white/40">Year</span>
              <select
                value={String(selectedYear)}
                onChange={(e) => {
                  const nextYear = Number(e.target.value);
                  const first = periods.find((p) => p.year === nextYear);
                  if (!first) return;
                  const idx = periods.findIndex((p) => p.id === first.id);
                  if (idx >= 0) setActiveIdx(idx);
                }}
                className="bg-transparent text-sm font-semibold text-white focus:outline-none w-full appearance-none"
              >
                {years.map((y) => (
                  <option key={y} value={String(y)} className="bg-[#0D1117] text-white text-sm">
                    {y}
                  </option>
                ))}
              </select>
            </label>

            {/* Month */}
            <label className="flex-1 md:flex-none flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/[0.04] px-3 pt-2 pb-2.5 cursor-pointer min-w-[130px]">
              <span className="text-[10px] uppercase tracking-widest text-white/40">Month</span>
              <select
                value={selectedMonthId}
                onChange={(e) => {
                  const idx = periods.findIndex((p) => p.id === e.target.value);
                  if (idx >= 0) setActiveIdx(idx);
                }}
                className="bg-transparent text-sm font-semibold text-white focus:outline-none w-full appearance-none"
              >
                {monthsForYear.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0D1117] text-white text-sm">
                    {p.monthName}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* ── Quick jumps ── */}
        <div className="relative flex flex-wrap items-center gap-2 mb-10">
          {QUICK_JUMPS.map((q, i) => (
            <button
              key={q.label}
              onClick={() => {
                if (i === 0) {
                  const r = Math.floor((Date.now() / 1000) % periods.length);
                  setActiveIdx(r === activeIdx ? (r + 1) % periods.length : r);
                }
              }}
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-full text-xs font-medium text-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-spotify/40"
            >
              <q.icon size={12} className="text-white/60" />
              {q.label}
            </button>
          ))}
        </div>

        {/* ── Timeline scrubber ── */}
        <div className="relative">
          {/* Year axis labels — spaced by actual year position */}
          <div className="relative h-5 mb-1">
            {years.map((y) => {
              const monthsFromStart = (y - startYear) * 12;
              const pct = monthsTotal <= 1 ? 0 : (monthsFromStart / (monthsTotal - 1)) * 100;
              return (
                <span
                  key={y}
                  className="absolute text-[10px] uppercase tracking-widest text-white/35 -translate-x-1/2"
                  style={{ left: `${pct}%` }}
                >
                  {y}
                </span>
              );
            })}
          </div>

          {/* Baseline */}
          <div className="relative h-px bg-white/10 mb-0" />

          {/* Period dots — NO labels rendered inline */}
          <div className="relative h-10">
            {periods.map((p, i) => {
              const monthsFromStart = (p.year - startYear) * 12 + p.monthIdx;
              const pct =
                monthsTotal <= 1 ? 50 : (monthsFromStart / (monthsTotal - 1)) * 100;
              const isActive = activeIdx === i;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveIdx(i)}
                  aria-label={`Jump to ${p.label}`}
                  className="absolute top-2 -translate-x-1/2 group focus:outline-none"
                  style={{ left: `${pct}%` }}
                >
                  {/* dot */}
                  <div
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-spotify scale-[1.4] shadow-[0_0_8px_rgba(29,185,84,0.8)]'
                        : 'bg-white/25 group-hover:bg-white/70 group-hover:scale-110'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="timeline-active"
                        className="absolute inset-0 rounded-full ring-2 ring-spotify/50"
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                      />
                    )}
                  </div>

                  {/* Label only on active dot — appears above the dot */}
                  {isActive && (
                    <>
                      {/* Desktop: label above dot */}
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="hidden sm:block absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap z-10"
                      >
                        <span className="bg-spotify text-black text-xs font-bold px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(29,185,84,0.5)]">
                          {p.label}
                        </span>
                      </motion.div>
                      {/* Mobile: label below dot */}
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="sm:hidden absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap z-10"
                      >
                        <span className="bg-spotify text-black text-xs font-bold px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(29,185,84,0.5)]">
                          {p.label}
                        </span>
                      </motion.div>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Area chart */}
          <div className="-mx-2 h-16 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearHours.length ? yearHours : YEAR_HOURS}>
                <defs>
                  <linearGradient id="tl-hours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1DB954" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#1DB954" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="v"
                  stroke="#1DB954"
                  strokeWidth={1.5}
                  fill="url(#tl-hours)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hint */}
        <div className="relative flex items-center gap-3 mt-5 text-xs text-white/40">
          <Calendar size={12} />
          <span>
            Pick a year first, then choose from months that exist in your Spotify timeline.
          </span>
        </div>
      </div>
    </section>
  );
}

function SnapshotViewer({ activeIdx, periods }: {activeIdx: number;periods: Period[];}) {
  const p = periods[activeIdx] ?? periods[0] ?? PERIODS[0];
  const heat = makeMonthHeat(p.monthIdx + p.year);
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Snapshot</h2>
        <p className="text-sm text-white/50">
          A look at this exact stretch of your life.
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={p.id}
          initial={{
            opacity: 0,
            y: 16
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            y: -16
          }}
          transition={{
            duration: 0.45,
            ease: 'easeOut'
          }}
          className="glass-card p-6 md:p-10 relative overflow-hidden">
          
          <div
            className={`absolute -top-40 -right-20 w-[500px] h-[500px] rounded-full blur-[140px] opacity-50 bg-gradient-to-br ${p.accent} pointer-events-none`} />
          

          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
            {/* Left side: meta + tracks */}
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-[10px] uppercase tracking-widest text-white/40">
                  Snapshot
                </div>
                <div className="text-[10px] uppercase tracking-widest text-spotify">
                  {p.label}
                </div>
              </div>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 leading-tight">
                {p.monthName}{' '}
                <span className="font-serif-display italic text-white/80">
                  {p.year}
                </span>
              </h3>
              <p className="text-base text-white/60 mb-8">
                You felt{' '}
                <span className="text-white font-medium">
                  {p.mood.toLowerCase()}
                </span>
                . <span className="text-white">{p.totalHours} hours</span> of
                music. <span className="text-white">{p.uniqueArtists}</span>{' '}
                unique artists.
              </p>

              {/* Top artist + genre + mood */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-3">
                    Top artist
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${p.topArtistColor} flex items-center justify-center font-bold text-sm ring-1 ring-white/10`}>
                      
                      {p.topArtist.
                      split(' ').
                      map((w) => w[0]).
                      slice(0, 2).
                      join('')}
                    </div>
                    <div className="text-sm font-medium truncate">
                      {p.topArtist}
                    </div>
                  </div>
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-3">
                    Top genre
                  </div>
                  <div className="text-sm font-medium">{p.topGenre}</div>
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-3">
                    Mood score
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-serif-display">
                      {p.moodScore.toFixed(1)}
                    </span>
                    <span className="text-xs text-white/50">/ 10</span>
                  </div>
                </div>
              </div>

              {/* Top songs then */}
              <div className="text-[10px] uppercase tracking-widest text-white/40 mb-3">
                Top songs then
              </div>
              <div className="space-y-3">
                {p.tracks.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <span className="text-xs text-white/30 w-5 font-serif-display">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>

                    <div
                      className={`w-10 h-10 rounded-md ring-1 ring-white/10 shrink-0 overflow-hidden ${
                        t.albumImageUrl ? "" : `bg-gradient-to-br ${t.color}`
                      }`}
                    >
                      {t.albumImageUrl ? (
                        <img
                          src={t.albumImageUrl}
                          alt={t.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-black/15" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate group-hover:text-white">
                        {t.title}
                      </div>
                      <div className="text-xs text-white/50 truncate">{t.artist}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: collage + heatmap */}
            <div className="space-y-6">
              {/* Album mosaic */}
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 mb-3">
                  Album mosaic
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[...p.tracks, ...p.tracks, ...p.tracks].
                  slice(0, 9).
                  map((t, i) =>
                  <div
                    key={i}
                    className={`aspect-square rounded-md bg-gradient-to-br ${t.color} ring-1 ring-white/10 shadow-md`}
                    style={{
                      opacity: 0.55 + i * 13 % 5 * 0.08
                    }}>
                    
                        <div className="w-full h-full rounded-md bg-black/15" />
                      </div>
                  )}
                </div>
              </div>

              {/* Daily heatmap */}
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 mb-3">
                  Daily listening
                </div>
                <div className="grid grid-cols-10 gap-1">
                  {heat.map((v, i) =>
                  <div
                    key={i}
                    className="aspect-square rounded-sm"
                    style={{
                      backgroundColor: `rgba(29,185,84,${v})`
                    }} />

                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] text-white/40 mt-2">
                  <span>Day 1</span>
                  <span>Day 30</span>
                </div>
              </div>
            </div>
          </div>

          {/* If this period has a special story */}
          {p.story &&
          <div className="relative mt-8 pt-6 border-t border-white/5 flex items-center gap-3 text-sm">
              <span className="px-2 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[10px] uppercase tracking-widest text-white/60">
                {p.story.tag}
              </span>
              <span className="text-white/80 font-serif-display italic">
                {p.story.line}
              </span>
            </div>
          }
        </motion.div>
      </AnimatePresence>
    </section>);

}
function TimeMachineStories() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          Time machine stories
        </h2>
        <p className="text-sm text-white/50">
          Moments your music remembers for you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STORIES.map((s, i) =>
        <motion.div
          key={s.headline}
          initial={{
            opacity: 0,
            y: 20
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: true,
            margin: '-40px'
          }}
          transition={{
            duration: 0.5,
            delay: i * 0.08
          }}
          className="glass-card p-6 relative overflow-hidden group hover:-translate-y-0.5 transition-transform">
          
            <div
            className={`absolute inset-0 bg-gradient-to-br ${s.accent} opacity-60 pointer-events-none`} />
          
            <div className="relative">
              {/* Layered album posters */}
              <div className="relative h-32 mb-6">
                <div
                className={`absolute left-6 top-3 w-20 h-20 rounded-xl bg-gradient-to-br ${s.image} opacity-50 rotate-6 ring-1 ring-white/10 blur-[1px]`} />
              
                <div
                className={`absolute left-2 top-1 w-20 h-20 rounded-xl bg-gradient-to-br ${s.image} opacity-70 -rotate-3 ring-1 ring-white/10`} />
              
                <div
                className={`absolute left-0 top-0 w-24 h-24 rounded-xl bg-gradient-to-br ${s.image} ring-1 ring-white/10 shadow-2xl shadow-black/40`}>
                
                  <div className="w-full h-full rounded-xl bg-black/15" />
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.05] text-[10px] uppercase tracking-widest text-white/70 mb-4">
                {s.tag}
              </div>
              <h3 className="text-xl font-semibold leading-snug mb-2">
                {s.headline}
              </h3>
              <p className="text-sm text-white/55 leading-relaxed">{s.body}</p>
            </div>
          </motion.div>
        )}
      </div>
    </section>);

}
function CalendarHeatmap({ cells, selectedRangeLabel }: {cells: TimelineCell[];selectedRangeLabel?: string;}) {
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = cells.length ? cells : Array.from({ length: 364 }).map((_, i) => ({
    date: `mock-${i}`,
    plays: 0,
    intensity: 0.08,
  }));

  return (
    <section>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Year at a glance
          </h2>
          <p className="text-sm text-white/50">
            {selectedRangeLabel ?? 'Every day you listened in your recent Spotify timeline.'}
          </p>
        </div>
      </div>

      <div className="glass-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[420px] h-[420px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative overflow-x-auto hide-scrollbar">
          <div
            className="grid gap-1 mb-2"
            style={{
              gridTemplateColumns: 'repeat(53, minmax(0, 1fr))'
            }}>
            {monthLabels.map((m, i) =>
            <div
              key={m}
              className="text-[9px] uppercase tracking-widest text-white/40"
              style={{
                gridColumn: `${1 + Math.floor(i * 53 / 12)} / span 4`
              }}>
                {m}
              </div>
            )}
          </div>

          <div className="grid grid-rows-7 grid-flow-col gap-[3px] min-w-[680px]">
            {days.map((day, i) =>
            <motion.div
              key={`${day.date}-${i}`}
              initial={{
                opacity: 0,
                scale: 0.4
              }}
              whileInView={{
                opacity: 1,
                scale: 1
              }}
              viewport={{
                once: true
              }}
              transition={{
                duration: 0.2,
                delay: Math.min(i * 0.001, 0.3)
              }}
              className="aspect-square rounded-[2px] hover:ring-2 hover:ring-white/50 transition-all"
              style={{
                backgroundColor: `rgba(29,185,84,${Math.max(0.06, day.intensity)})`,
                boxShadow: day.intensity > 0.5 ? '0 0 10px rgba(29,185,84,0.16)' : undefined
              }}
              title={`${day.date} · ${day.plays} plays`} />
            )}
          </div>
        </div>
      </div>
    </section>);

}
function TimeComparison({ periods }: {periods: Period[];}) {
  function getAandDifference(periods: Period[]) {
    const timeKey = (p: Period) => p.year * 12 + p.monthIdx;

    const B = periods.at(-1)!;
    const bKey = timeKey(B);

    const map = new Map<number, Period>();
    for (const p of periods) map.set(timeKey(p), p);

    let A = map.get(bKey - 12);

    if (!A) {
      const minKey = Math.min(...periods.map(timeKey));

      for (let k = bKey - 1; k >= minKey; k--) {
        const candidate = map.get(k);
        if (candidate) {
          A = candidate;
          break;
        }
      }
    }

    A ??= periods[0];

    const diffMonths = Math.abs(timeKey(B) - timeKey(A));
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;

    const difference =
      years > 0 && months > 0
        ? `${years === 1 ? "A year" : `${years} years`} and ${months} month${months > 1 ? "s" : ""} apart, side by side.`
        : years > 0
        ? `${years === 1 ? "A year" : `${years} years`} apart, side by side.`
        : `${months} month${months > 1 ? "s" : ""} apart, side by side.`;

    return { A, B, difference };
  }

  const { A, B, difference } = getAandDifference(periods);
  
  // Use a top-level component for the comparison cell to avoid creating
  // components during render (preserves state and avoids React warnings).

  const moodDelta = (B.moodScore - A.moodScore).toFixed(1);
  const hoursDelta = B.totalHours - A.totalHours;
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Then vs now</h2>
        <p className="text-sm text-white/50">
          {difference}
        </p>
      </div>

      <div className="relative">
        <div className="flex flex-col lg:flex-row items-stretch gap-6">
          <ComparisonCell p={A} side="left" />

          {/* Connector */}
          <div className="hidden lg:flex flex-col items-center justify-center px-2">
            <motion.div
              initial={{
                opacity: 0
              }}
              whileInView={{
                opacity: 1
              }}
              viewport={{
                once: true
              }}
              transition={{
                duration: 0.6,
                delay: 0.3
              }}
              className="flex flex-col items-center gap-3">
              
              <div className="w-10 h-10 rounded-full bg-spotify/20 border border-spotify/40 text-spotify flex items-center justify-center">
                <ArrowRight size={16} />
              </div>
              <div className="text-[10px] uppercase tracking-widest text-white/40 text-center leading-tight">
                Mood
                <br />
                <span className="text-spotify font-medium">+{moodDelta}</span>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-white/40 text-center leading-tight">
                Hours
                <br />
                <span
                  className={`font-medium ${hoursDelta >= 0 ? 'text-spotify' : 'text-rose-400'}`}>
                  
                  {hoursDelta >= 0 ? '+' : ''}
                  {hoursDelta}h
                </span>
              </div>
            </motion.div>
          </div>

          <ComparisonCell p={B} side="right" />
        </div>
      </div>
    </section>);

}

// Top-level component for the two comparison cells used in TimeComparison
function ComparisonCell({ p, side }: { p: Period; side: 'left' | 'right' }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: side === 'left' ? -16 : 16
      }}
      whileInView={{
        opacity: 1,
        x: 0
      }}
      viewport={{
        once: true,
        margin: '-40px'
      }}
      transition={{
        duration: 0.5
      }}
      className="glass-card p-6 relative overflow-hidden flex-1 min-w-0">
      <div
        className={`absolute -top-32 ${side === 'left' ? '-left-20' : '-right-20'} w-[400px] h-[400px] rounded-full blur-[120px] opacity-50 bg-gradient-to-br ${p.accent} pointer-events-none`} />

      <div className="relative">
        <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
          {side === 'left' ? 'Then' : 'Now'}
        </div>
        <div className="text-2xl font-bold tracking-tight mb-4">
          {p.monthName} {p.year}
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
              Top artist
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${p.topArtistColor} ring-1 ring-white/10 flex items-center justify-center font-bold text-sm`}>
                {p.topArtist.split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </div>
              <div className="text-sm font-medium">{p.topArtist}</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-white/40">Top genre</span>
            <span className="text-sm font-medium">{p.topGenre}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-white/40">Top song</span>
            <span className="text-sm font-medium truncate ml-3">{p.tracks[0].title}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-white/40">Mood</span>
            <span className="text-sm font-medium">{p.mood} · {p.moodScore.toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-white/40">Hours</span>
            <span className="text-sm font-medium">{p.totalHours} h</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TimelineInsights({ insights }: {insights?: TimelinePageInsight[];}) {
  const cards = insights?.length
    ? insights.map((ins, index) => ({
      label: ins.label,
      value: ins.title,
      sub: ins.sub,
      accent: ins.accent,
      icon: [TrendingUp, Music2, Moon][index % 3],
    }))
    : INSIGHTS;
  return (
    <section className="pb-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Timeline insights</h2>
        <p className="text-sm text-white/50">Patterns across your years.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((ins, i) =>
        <motion.div
          key={ins.label}
          initial={{
            opacity: 0,
            y: 16
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: true,
            margin: '-40px'
          }}
          transition={{
            duration: 0.4,
            delay: i * 0.05
          }}
          className="glass-card p-6 relative overflow-hidden hover:-translate-y-0.5 transition-transform">
          
            <div className="flex items-center justify-between mb-6">
              <div
              className={`w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center ${ins.accent}`}>
              
                <ins.icon size={16} strokeWidth={1.8} />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-white/35">
                {ins.label}
              </span>
            </div>
            <div className={`text-xl font-semibold mb-1 ${ins.accent}`}>
              {ins.value}
            </div>
            <p className="text-xs text-white/55 leading-relaxed">{ins.sub}</p>
          </motion.div>
        )}
      </div>
    </section>);

}
// ---------- PAGE ----------
export default function TimelinePage() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const { data, error } = useTimelinePage();
  const { data: explorerData } = useTimelineExplorer();
  const periods = data?.periods.length ? data.periods : PERIODS;


  const defaultIdx = data?.periods.length ? data.periods.length - 1 : 4;
  const safeActiveIdx = Math.min(activeIdx ?? defaultIdx, periods.length - 1);
  const yearLabels = data?.yearLabels.length ? data.yearLabels : ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];
  return (
    <div className="min-h-screen bg-background text-white selection:bg-spotify/30 selection:text-white flex overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col overflow-x-hidden">
        <TopNav />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-10 w-full">
            {/* max-w constraint lives here, not on <main> */}
            <div className="max-w-[1400px] mx-auto relative overflow-x-hidden">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
            <div className="absolute top-[40%] left-[-20%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 right-[-10%] w-[700px] h-[700px] bg-pink-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

            <div className="relative z-10 flex flex-col gap-14">
              {error && <p className="text-sm text-red-400/70">Could not load timeline data. Showing local defaults.</p>}
              <TimelineHero />
              <TimelineControl
                activeIdx={safeActiveIdx}
                setActiveIdx={setActiveIdx}
                periods={periods}
                yearHours={data?.yearHours ?? YEAR_HOURS}
                yearLabels={yearLabels}
                startYear={data?.range?.startYear ?? Number(yearLabels[0])}
                endYear={data?.range?.endYear ?? Number(yearLabels.at(-1) ?? yearLabels[0])} />
              
              <SnapshotViewer activeIdx={safeActiveIdx} periods={periods} />
              <TimeMachineStories />
              <CalendarHeatmap cells={explorerData?.cells ?? []} selectedRangeLabel={explorerData?.selectedRange.label} />
              <TimeComparison periods={periods} />
              <RandomNostalgiaModal periods={periods} />
              <TimelineInsights insights={data?.insights} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );

}
