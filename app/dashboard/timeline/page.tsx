"use client";
import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Calendar,
  ArrowUpRight,
  ArrowRight,
  Shuffle,
  ZoomIn,
  ZoomOut,
  Search,
  Volume2,
  Moon,
  Sun,
  CloudRain,
  Flame,
  Heart,
  Music2,
  TrendingUp,
  TrendingDown,
  History,
  Clock } from
'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
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
function TimelineControl({
  activeIdx,
  setActiveIdx



}: {activeIdx: number;setActiveIdx: (n: number) => void;}) {
  return (
    <section>
      <div className="glass-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] bg-spotify/15 rounded-full blur-[120px] pointer-events-none" />

        {/* Top row: controls */}
        <div className="relative flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-white/40 shrink-0">
              Now exploring
            </div>
            <div className="text-lg font-semibold truncate">
              {PERIODS[activeIdx].monthName} {PERIODS[activeIdx].year}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Date search */}
            <div className="relative hidden md:block">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              
              <input
                type="text"
                placeholder="Jump to date…"
                className="bg-white/5 border border-white/10 rounded-full py-2 pl-9 pr-3 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-spotify/50 focus:bg-white/10 transition-all w-44" />
              
            </div>
            {/* Zoom */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1">
              <button
                className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70"
                aria-label="Zoom out">
                
                <ZoomOut size={13} />
              </button>
              <span className="text-[10px] uppercase tracking-widest text-white/40 px-1.5">
                Month
              </span>
              <button
                className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70"
                aria-label="Zoom in">
                
                <ZoomIn size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick jumps */}
        <div className="relative flex flex-wrap items-center gap-2 mb-8">
          {QUICK_JUMPS.map((q, i) =>
          <button
            key={q.label}
            onClick={() => {
              if (i === 0) {
                // random
                const r = Math.floor(Date.now() / 1000 % PERIODS.length);
                setActiveIdx(r === activeIdx ? (r + 1) % PERIODS.length : r);
              }
            }}
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-full text-xs font-medium text-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-spotify/40">
            
              <q.icon size={12} className="text-white/60" />
              {q.label}
            </button>
          )}
        </div>

        {/* Timeline strip */}
        <div className="relative">
          {/* baseline */}
          <div className="absolute left-0 right-0 top-[40px] h-px bg-white/10" />

          {/* Year labels */}
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40 mb-3">
            {[2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map((y) =>
            <span key={y}>{y}</span>
            )}
          </div>

          {/* Scrubber dots row */}
          <div className="relative h-6 mb-6">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 grid grid-cols-12 gap-0">
              {/* faint month ticks */}
              {Array.from({
                length: 12 * 8
              }).map((_, i) =>
              <div key={i} className="h-1.5 border-l border-white/5" />
              )}
            </div>

            {/* Period markers */}
            {PERIODS.map((p, i) => {
              // Map period to horizontal position (Jan 2018 = 0%, Dec 2025 = 100%)
              const startYear = 2018;
              const monthsTotal = 8 * 12;
              const monthsFromStart = (p.year - startYear) * 12 + p.monthIdx;
              const left = monthsFromStart / (monthsTotal - 1) * 100;
              const active = activeIdx === i;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveIdx(i)}
                  className="absolute -translate-x-1/2 group"
                  style={{
                    left: `${left}%`,
                    top: 0
                  }}
                  aria-label={`Jump to ${p.label}`}>
                  
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full transition-all ${active ? 'bg-spotify scale-125' : 'bg-white/30 group-hover:bg-white/70 group-hover:scale-110'}`}>
                      
                      {active &&
                      <motion.div
                        layoutId="timeline-active"
                        className="absolute inset-0 rounded-full ring-2 ring-spotify/50"
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 28
                        }} />

                      }
                    </div>
                    <div
                      className={`mt-2 text-[10px] font-medium transition-colors whitespace-nowrap ${active ? 'text-spotify' : 'text-white/40 group-hover:text-white/70'}`}>
                      
                      {p.label}
                    </div>
                  </div>
                </button>);

            })}
          </div>

          {/* Year hours mini area underneath */}
          <div className="mt-12 -mx-2 h-14">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={YEAR_HOURS}>
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
                  fill="url(#tl-hours)" />
                
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Custom date picker hint */}
        <div className="relative flex items-center gap-3 mt-6 text-xs text-white/40">
          <Calendar size={12} />
          <span>
            Tip: pick any month above, or use search to jump to an exact date.
          </span>
        </div>
      </div>
    </section>);

}
function SnapshotViewer({ activeIdx }: {activeIdx: number;}) {
  const p = PERIODS[activeIdx];
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
                {p.tracks.map((t, i) =>
                <div key={i} className="flex items-center gap-3 group">
                    <span className="text-xs text-white/30 w-5 font-serif-display">
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                    <div
                    className={`w-10 h-10 rounded-md bg-gradient-to-br ${t.color} ring-1 ring-white/10 shrink-0`}>
                    
                      <div className="w-full h-full rounded-md bg-black/15" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate group-hover:text-white">
                        {t.title}
                      </div>
                      <div className="text-xs text-white/50 truncate">
                        {t.artist}
                      </div>
                    </div>
                  </div>
                )}
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
function CalendarHeatmap() {
  const [year, setYear] = useState(2024);
  // 365 cells, deterministic intensity
  const days = Array.from({
    length: 365
  }).map((_, i) => {
    const week = Math.floor(i / 7);
    const day = i % 7;
    const wknd = day === 0 || day === 6 ? 0.2 : 0;
    const seasonal = Math.sin((week + (year - 2024) * 12) * 0.18) * 0.3;
    const spike = (i + year) % 17 === 0 ? 0.3 : 0;
    return Math.max(0.05, Math.min(0.95, 0.4 + seasonal + wknd + spike));
  });
  const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'];

  return (
    <section>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Year at a glance
          </h2>
          <p className="text-sm text-white/50">
            Every day you listened, colored by intensity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setYear((y) => Math.max(2018, y - 1))}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Previous year">
            
            <ArrowRight size={14} className="rotate-180 text-white/70" />
          </button>
          <span className="text-sm font-medium tabular-nums px-2 min-w-[3rem] text-center">
            {year}
          </span>
          <button
            onClick={() => setYear((y) => Math.min(2025, y + 1))}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Next year">
            
            <ArrowRight size={14} className="text-white/70" />
          </button>
        </div>
      </div>

      <div className="glass-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[420px] h-[420px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative overflow-x-auto hide-scrollbar">
          {/* Month labels */}
          <div
            className="grid gap-1 mb-2"
            style={{
              gridTemplateColumns: 'repeat(53, minmax(0, 1fr))'
            }}>
            
            {months.map((m, i) =>
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
            {days.map((v, i) =>
            <motion.div
              key={i}
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
                backgroundColor: `rgba(29,185,84,${v})`,
                width: 12
              }}
              title={`Day ${i + 1}`} />

            )}
          </div>

          {/* Legend */}
          <div className="relative flex items-center justify-end gap-2 text-[10px] text-white/40 mt-4">
            less
            {[0.15, 0.35, 0.55, 0.75, 0.9].map((o) =>
            <span
              key={o}
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: `rgba(29,185,84,${o})`
              }} />

            )}
            more
          </div>
        </div>
      </div>
    </section>);

}
function TimeComparison() {
  const A = PERIODS.find((x) => x.id === 'jan-2024')!;
  const B = PERIODS.find((x) => x.id === 'jan-2025')!;
  
  // Use a top-level component for the comparison cell to avoid creating
  // components during render (preserves state and avoids React warnings).

  const moodDelta = (B.moodScore - A.moodScore).toFixed(1);
  const hoursDelta = B.totalHours - A.totalHours;
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Then vs now</h2>
        <p className="text-sm text-white/50">
          A year of difference, side by side.
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
function RandomNostalgia({
  setActiveIdx


}: {setActiveIdx: (n: number) => void;}) {
  return (
    <section>
      <motion.div
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
          duration: 0.6
        }}
        className="glass-card p-8 md:p-12 relative overflow-hidden">
        
        {/* magical glow */}
        <div className="absolute -top-32 left-1/3 w-[500px] h-[400px] bg-spotify/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-pink-500/15 rounded-full blur-[120px] pointer-events-none" />

        {/* floating mini cards */}
        <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 pointer-events-none hidden md:flex">
          {[
          'from-pink-500 to-orange-400',
          'from-emerald-400 to-cyan-500',
          'from-purple-500 to-indigo-500'].
          map((c, i) =>
          <motion.div
            key={i}
            animate={{
              y: [0, -10, 0],
              rotate: i % 2 === 0 ? -6 : 6
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut'
            }}
            className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${c} shadow-2xl shadow-black/40 ring-1 ring-white/10`}
            style={{
              marginLeft: i === 0 ? 0 : -16
            }}>
            
              <div className="w-full h-full rounded-2xl bg-black/15" />
            </motion.div>
          )}
        </div>

        <div className="relative max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-[10px] uppercase tracking-widest text-white/60 mb-6">
            <Shuffle size={11} className="text-spotify" />
            Surprise me
          </div>
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
            Take me somewhere{' '}
            <span className="font-serif-display italic text-spotify/90">
              random
            </span>
            .
          </h3>
          <p className="text-white/60 leading-relaxed mb-8 max-w-md">
            Close your eyes. We&apos;ll drop you into a forgotten week, with the
            songs, the mood, and the hidden memories that came with it.
          </p>
          <button
            onClick={() => {
              const r = Math.floor(Date.now() / 7 % PERIODS.length);
              setActiveIdx(r);
              if (typeof window !== 'undefined') {
                window.scrollTo({
                  top: 400,
                  behavior: 'smooth'
                });
              }
            }}
            className="inline-flex items-center gap-2 bg-spotify hover:bg-spotify-light text-black text-sm font-semibold px-6 py-3 rounded-full transition-all shadow-[0_0_32px_-6px_rgba(29,185,84,0.7)] hover:-translate-y-0.5">
            
            <Shuffle size={14} />
            Jump to a random memory
          </button>
        </div>
      </motion.div>
    </section>);

}
function TimelineInsights() {
  return (
    <section className="pb-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Timeline insights</h2>
        <p className="text-sm text-white/50">Patterns across your years.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {INSIGHTS.map((ins, i) =>
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
  const [activeIdx, setActiveIdx] = useState(4); // Sep 2024
  return (
    <div className="min-h-screen bg-background text-white selection:bg-spotify/30 selection:text-white flex">
      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative">
        <TopNav />

        <main className="flex-1 p-6 md:p-10 max-w-[1400px] mx-auto w-full relative">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
          <div className="absolute top-[40%] left-[-20%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
          <div className="absolute bottom-0 right-[-10%] w-[700px] h-[700px] bg-pink-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

          <div className="relative z-10 flex flex-col gap-14">
            <TimelineHero />
            <TimelineControl
              activeIdx={activeIdx}
              setActiveIdx={setActiveIdx} />
            
            <SnapshotViewer activeIdx={activeIdx} />
            <TimeMachineStories />
            <CalendarHeatmap />
            <TimeComparison />
            <RandomNostalgia setActiveIdx={setActiveIdx} />
            <TimelineInsights />
          </div>
        </main>
      </div>
    </div>);

}