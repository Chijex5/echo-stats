"use client";
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Heart,
  Share2,
  Clock,
  Calendar,
  Moon,
  CloudRain,
  Sparkles,
  Disc3,
  Repeat,
  Music2,
  ArrowUpRight,
  Flame,
  ChevronLeft,
  ChevronRight } from
'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer } from
'recharts';
import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
// ---------- DATA ----------
const SONG = {
  title: 'Sweater Weather',
  artist: 'The Neighbourhood',
  album: 'I Love You.',
  released: '2013',
  lastPlayed: '124 days ago',
  pastPlays: 142,
  favoriteMonth: 'September 2024',
  duration: '4:00',
  // gradient pair drives the entire page's color story
  gradientFrom: '#3B82F6',
  gradientTo: '#7C3AED',
  gradientClass: 'from-blue-500 to-violet-600'
};
const STORY_BEATS = [
{
  stat: '47',
  label: 'times in September 2024',
  icon: Repeat
},
{
  stat: '68%',
  label: 'of plays were after midnight',
  icon: Moon
},
{
  stat: '124',
  label: 'days since you last played it',
  icon: Calendar
},
{
  stat: 'Rainy',
  label: 'season anchor — your shelter song',
  icon: CloudRain
}];

const SNAPSHOT_TRACKS = [
{
  title: 'Pink + White',
  artist: 'Frank Ocean',
  color: 'from-pink-500 to-orange-400'
},
{
  title: 'Solitude',
  artist: 'Tame Impala',
  color: 'from-purple-500 to-indigo-500'
},
{
  title: 'Ivy',
  artist: 'Frank Ocean',
  color: 'from-rose-400 to-orange-300'
},
{
  title: 'Nights',
  artist: 'Frank Ocean',
  color: 'from-purple-600 to-blue-500'
}];

const RELATED = [
{
  title: 'Midnight City',
  artist: 'M83',
  color: 'from-indigo-600 to-purple-700',
  tag: 'Late-night favorite',
  lastPlayed: '4 mo ago'
},
{
  title: 'Skinny Love',
  artist: 'Bon Iver',
  color: 'from-sky-500 to-indigo-500',
  tag: 'Rainy-day classic',
  lastPlayed: '7 mo ago'
},
{
  title: 'Cherry Wine',
  artist: 'Hozier',
  color: 'from-red-700 to-rose-800',
  tag: 'Seasonal anchor',
  lastPlayed: '3 mo ago'
},
{
  title: 'Tadow',
  artist: 'FKJ & Masego',
  color: 'from-orange-400 to-amber-500',
  tag: 'One-week addiction',
  lastPlayed: '6 mo ago'
},
{
  title: 'Reborn',
  artist: 'KIDS SEE GHOSTS',
  color: 'from-zinc-600 to-zinc-800',
  tag: 'Summer obsession',
  lastPlayed: '9 mo ago'
}];

const MOOD = [
{
  axis: 'Energy',
  value: 54
},
{
  axis: 'Calm',
  value: 78
},
{
  axis: 'Nostalgia',
  value: 92
},
{
  axis: 'Joy',
  value: 48
},
{
  axis: 'Melancholy',
  value: 84
}];

const HOUR_HEAT = Array.from({
  length: 24
}).map((_, h) => ({
  hour: h,
  v: Math.round(
    20 + Math.cos((h - 1) * Math.PI / 12) * 65 + (h >= 4 && h <= 9 ? -30 : 0)
  )
}));
const MONTH_TREND = [
{
  m: 'Jan',
  v: 4
},
{
  m: 'Feb',
  v: 6
},
{
  m: 'Mar',
  v: 8
},
{
  m: 'Apr',
  v: 11
},
{
  m: 'May',
  v: 14
},
{
  m: 'Jun',
  v: 18
},
{
  m: 'Jul',
  v: 24
},
{
  m: 'Aug',
  v: 32
},
{
  m: 'Sep',
  v: 47
},
{
  m: 'Oct',
  v: 22
},
{
  m: 'Nov',
  v: 9
},
{
  m: 'Dec',
  v: 3
}];

const REPEAT_CURVE = Array.from({
  length: 18
}).map((_, i) => ({
  v: Math.max(
    1,
    Math.round(20 * Math.exp(-Math.pow((i - 9) / 3.5, 2)) + (i === 9 ? 5 : 0))
  )
}));
const ALGO_REASONS = [
{
  icon: Calendar,
  label: 'Forgotten',
  desc: 'Last played 124 days ago — past your nostalgia threshold.'
},
{
  icon: Heart,
  label: 'Loved',
  desc: '142 lifetime plays, top 4% of your library.'
},
{
  icon: CloudRain,
  label: 'Seasonal',
  desc: "Today's weather matches your historical play pattern."
},
{
  icon: Sparkles,
  label: 'Hidden affinity',
  desc: "Strong overlap with what you're streaming this week."
}];

// ---------- HELPERS ----------
function PARTICLES() {
  return Array.from({
    length: 22
  }).map((_, i) => ({
    left: i * 11.3 % 100,
    top: i * 19.7 % 100,
    delay: i % 6 * 0.5,
    size: 2 + i * 3 % 3,
    duration: 6 + i * 1.3 % 5
  }));
}
// ---------- SECTIONS ----------
function SotdHero() {
  const particles = PARTICLES();
  return (
    <section className="relative pt-4 pb-2">
      {/* Cinematic ambient layers */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[160px] pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${SONG.gradientFrom}55, transparent 70%)`
        }} />
      
      <div
        className="absolute top-32 -left-20 w-[420px] h-[420px] rounded-full blur-[140px] pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${SONG.gradientTo}40, transparent 70%)`
        }} />
      
      <div className="absolute top-20 right-0 w-[420px] h-[420px] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Floating particles */}
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
            opacity: 0.5
          }}
          animate={{
            y: [-8, 8, -8],
            opacity: [0.15, 0.7, 0.15]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut'
          }} />

        )}
      </div>

      {/* Soft waveform behind card */}
      <svg
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 w-full h-72 opacity-25 pointer-events-none"
        viewBox="0 0 1440 320"
        fill="none">
        
        <defs>
          <linearGradient
            id="sotd-wave"
            x1="0"
            y1="0"
            x2="1440"
            y2="0"
            gradientUnits="userSpaceOnUse">
            
            <stop offset="0" stopColor={SONG.gradientFrom} stopOpacity="0" />
            <stop offset="0.5" stopColor={SONG.gradientFrom} />
            <stop offset="1" stopColor={SONG.gradientTo} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M0 160 C 240 70, 240 250, 480 160 S 720 70, 960 160 S 1200 250, 1440 160"
          stroke="url(#sotd-wave)"
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
            duration: 2.4,
            ease: 'easeInOut'
          }} />
        
      </svg>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-white/60 mb-6">
          <Sparkles size={12} className="text-spotify" />
          Song of the day · Tuesday
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-3">
          A song you{' '}
          <span className="font-serif-display italic font-normal text-white/90">
            loved
          </span>{' '}
          once.
        </h1>
        <p className="text-lg text-white/55 max-w-xl mx-auto">
          A memory waiting to return. Today, we found it.
        </p>
      </div>

      {/* Main hero card */}
      <div className="relative z-10 mt-12 mx-auto max-w-3xl">
        {/* Glow under the card */}
        <div
          className="absolute -inset-6 rounded-[2.5rem] blur-2xl opacity-70 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${SONG.gradientFrom}50, ${SONG.gradientTo}40)`
          }} />
        

        <div className="relative glass-card p-8 md:p-10 overflow-hidden">
          {/* Inner highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* Expanded blurred album backdrop */}
          <div
            className={`absolute -top-32 -left-20 w-[420px] h-[420px] rounded-full bg-gradient-to-br ${SONG.gradientClass} blur-[120px] opacity-30 pointer-events-none`} />
          

          <div className="relative grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 md:gap-10 items-center">
            {/* Album */}
            <div className="relative mx-auto md:mx-0">
              {/* Vinyl disc behind */}
              <motion.div
                animate={{
                  rotate: 360
                }}
                transition={{
                  duration: 22,
                  ease: 'linear',
                  repeat: Infinity
                }}
                className="absolute -right-12 top-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-gradient-to-br from-zinc-800 to-black ring-1 ring-white/10 hidden md:block"
                style={{
                  backgroundImage:
                  'radial-gradient(circle at center, rgba(255,255,255,0.06) 0%, transparent 12%), repeating-radial-gradient(circle at center, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 6px)'
                }}>
                
                <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 ring-1 ring-white/10" />
              </motion.div>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 16,
                  scale: 0.96
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1
                }}
                transition={{
                  duration: 0.7,
                  ease: 'easeOut'
                }}
                className={`relative w-56 h-56 md:w-64 md:h-64 rounded-2xl bg-gradient-to-br ${SONG.gradientClass} shadow-2xl shadow-black/60 ring-1 ring-white/10 overflow-hidden`}>
                
                <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/15" />
                <Disc3
                  className="absolute bottom-4 right-4 text-white/30"
                  size={40} />
                
                {/* subtle play hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30 cursor-pointer group">
                  <div className="w-16 h-16 rounded-full bg-white/95 text-black flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
                    <Play size={22} fill="currentColor" className="ml-1" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Meta */}
            <div className="min-w-0 text-center md:text-left">
              <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
                Forgotten favorite
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-1 truncate">
                {SONG.title}
              </h2>
              <p className="text-lg text-white/65 mb-6">
                {SONG.artist} <span className="text-white/30">·</span>{' '}
                {SONG.album} <span className="text-white/30">·</span>{' '}
                {SONG.released}
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                    Past plays
                  </div>
                  <div className="text-xl font-serif-display">
                    {SONG.pastPlays}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                    Last played
                  </div>
                  <div className="text-sm font-medium">{SONG.lastPlayed}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                    Favorite month
                  </div>
                  <div className="text-sm font-medium">
                    {SONG.favoriteMonth}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                <button className="inline-flex items-center gap-2 bg-spotify hover:bg-spotify-light text-black text-sm font-semibold px-6 py-3 rounded-full transition-all shadow-[0_0_32px_-6px_rgba(29,185,84,0.7)] hover:-translate-y-0.5">
                  <Play size={14} fill="currentColor" />
                  Play preview
                </button>
                <button className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/10 text-white text-sm font-medium px-5 py-3 rounded-full transition-colors">
                  <Heart size={14} />
                  Save
                </button>
                <button className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/10 text-white text-sm font-medium px-5 py-3 rounded-full transition-colors">
                  <Share2 size={14} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}
function TheStory() {
  return (
    <section>
      <div className="mb-6 max-w-2xl">
        <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
          The story
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
          You lived with this song for a{' '}
          <span className="font-serif-display italic text-white/90">
            season
          </span>
          .
        </h2>
      </div>

      <div className="glass-card p-8 md:p-10 relative overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full blur-[120px] opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${SONG.gradientFrom}, transparent)`
          }} />
        

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {STORY_BEATS.map((b, i) =>
          <motion.div
            key={i}
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
              duration: 0.5,
              delay: i * 0.08
            }}
            className="flex items-start gap-5">
            
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/70 shrink-0">
                <b.icon size={16} strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <div className="text-3xl md:text-4xl font-serif-display leading-none mb-1">
                  {b.stat}
                </div>
                <div className="text-sm text-white/55 leading-relaxed">
                  {b.label}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}
function MemorySnapshot() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Memory snapshot</h2>
        <p className="text-sm text-white/50">
          What surrounded this song in September 2024.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* What else */}
        <div className="glass-card p-6 lg:col-span-1">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-4">
            What else you played
          </div>
          <div className="space-y-3">
            {SNAPSHOT_TRACKS.map((t, i) =>
            <div key={i} className="flex items-center gap-3">
                <div
                className={`w-10 h-10 rounded-md bg-gradient-to-br ${t.color} ring-1 ring-white/10 shrink-0`}>
                
                  <div className="w-full h-full rounded-md bg-black/15" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{t.title}</div>
                  <div className="text-xs text-white/50 truncate">
                    {t.artist}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: artist + mood + genre */}
        <div className="glass-card p-6 lg:col-span-1 flex flex-col gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
              Top artist
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center font-bold ring-1 ring-white/10">
                FO
              </div>
              <div>
                <div className="text-base font-semibold">Frank Ocean</div>
                <div className="text-xs text-white/50">
                  94 plays · 3.2× your average
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-5">
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
              Dominant mood
            </div>
            <div className="text-2xl font-serif-display italic text-rose-300 mb-1">
              Nostalgic & calm
            </div>
            <p className="text-xs text-white/50">
              Tempos averaged 92 BPM. Major-key tracks at 38%.
            </p>
          </div>
          <div className="border-t border-white/5 pt-5">
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
              Top genre
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-spotify" />
              Indie · 42%
              <span className="text-white/30 mx-1">·</span>
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              R&B · 28%
            </div>
          </div>
        </div>

        {/* Snapshot collage */}
        <div className="glass-card p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] uppercase tracking-widest text-white/40">
              Snapshot
            </div>
            <div className="text-xs text-white/60 font-medium">
              September 2024
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
            'from-pink-500 to-orange-400',
            'from-purple-500 to-indigo-500',
            'from-emerald-500 to-teal-400',
            'from-amber-400 to-orange-500',
            'from-blue-500 to-cyan-500',
            'from-rose-400 to-pink-500',
            'from-violet-500 to-fuchsia-500',
            'from-indigo-500 to-purple-500',
            'from-yellow-500 to-amber-600'].
            map((c, i) =>
            <div
              key={i}
              className={`aspect-square rounded-md bg-gradient-to-br ${c} ring-1 ring-white/10 shadow-md`}
              style={{
                opacity: 0.55 + i * 13 % 5 * 0.08
              }}>
              
                <div className="w-full h-full rounded-md bg-black/15" />
              </div>
            )}
          </div>
          <div className="mt-4 text-xs text-white/50">
            That month, you streamed{' '}
            <span className="text-white font-medium">87 hours</span> of music.
          </div>
        </div>
      </div>
    </section>);

}
function WhyWePickedThis() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          Why we picked this
        </h2>
        <p className="text-sm text-white/50">
          A glimpse at the algorithm choosing today&apos;s memory.
        </p>
      </div>

      <div className="glass-card p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />

        {/* Algorithm flow */}
        <div className="relative">
          {/* Connecting line behind nodes */}
          <div className="hidden md:block absolute top-12 left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {ALGO_REASONS.map((r, i) =>
            <motion.div
              key={r.label}
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
                duration: 0.45,
                delay: i * 0.08
              }}
              className="relative flex flex-col items-center text-center">
              
                <div className="relative w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/80 mb-4">
                  <r.icon size={20} strokeWidth={1.8} />
                  <div className="absolute -inset-1 rounded-2xl border border-spotify/30 opacity-0 hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-sm font-semibold mb-2">{r.label}</div>
                <p className="text-xs text-white/50 leading-relaxed max-w-[180px]">
                  {r.desc}
                </p>
              </motion.div>
            )}
          </div>

          {/* Conclusion */}
          <div className="mt-10 pt-8 border-t border-white/5 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                  Affinity score
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-serif-display">94</span>
                  <span className="text-sm text-spotify font-medium">
                    Excellent nostalgic match
                  </span>
                </div>
              </div>
              <div className="w-full md:w-80">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{
                      width: 0
                    }}
                    whileInView={{
                      width: '94%'
                    }}
                    viewport={{
                      once: true
                    }}
                    transition={{
                      duration: 1.2,
                      ease: 'easeOut'
                    }}
                    className="h-full bg-gradient-to-r from-spotify via-emerald-400 to-emerald-200 rounded-full" />
                  
                </div>
                <div className="flex justify-between text-[10px] text-white/40 mt-2">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}
function RelatedForgotten() {
  return (
    <section>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">More memories</h2>
          <p className="text-sm text-white/50">
            Other forgotten favorites we&apos;d resurface next.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Previous">
            
            <ChevronLeft size={16} />
          </button>
          <button
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Next">
            
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory">
        {RELATED.map((r, i) =>
        <motion.div
          key={r.title}
          initial={{
            opacity: 0,
            x: 20
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
            duration: 0.4,
            delay: i * 0.06
          }}
          className="snap-start shrink-0 w-60 glass-card p-4 hover:-translate-y-1 transition-transform group">
          
            <div
            className={`relative w-full aspect-square rounded-xl bg-gradient-to-br ${r.color} mb-4 overflow-hidden ring-1 ring-white/10 shadow-md`}>
            
              <div className="absolute inset-0 bg-black/15" />
              <span className="absolute top-3 left-3 text-[9px] uppercase tracking-widest font-medium px-2 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/90">
                {r.tag}
              </span>
              <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Play size={14} fill="currentColor" className="ml-0.5" />
              </div>
            </div>
            <div className="text-sm font-semibold truncate">{r.title}</div>
            <div className="text-xs text-white/50 truncate mb-2">
              {r.artist}
            </div>
            <div className="text-[11px] text-white/40 flex items-center gap-1">
              <Clock size={11} /> Last played {r.lastPlayed}
            </div>
          </motion.div>
        )}
      </div>
    </section>);

}
function MoodReconstruction() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          Mood reconstruction
        </h2>
        <p className="text-sm text-white/50">
          The texture of your listening when this song lived in heavy rotation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar */}
        <div className="glass-card p-6 lg:col-span-1 min-h-[280px] flex flex-col">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
            Emotional fingerprint
          </div>
          <div className="flex-1 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={MOOD} outerRadius="72%">
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{
                    fill: 'rgba(255,255,255,0.55)',
                    fontSize: 10
                  }} />
                
                <Radar
                  dataKey="value"
                  stroke={SONG.gradientFrom}
                  fill={SONG.gradientFrom}
                  fillOpacity={0.3}
                  strokeWidth={2} />
                
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hour heatmap */}
        <div className="glass-card p-6 lg:col-span-2 min-h-[280px] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-widest text-white/40">
              Listening by hour
            </span>
            <span className="text-xs text-white/50">
              Peak at <span className="text-white font-medium">12:47 AM</span>
            </span>
          </div>
          <div className="flex-1 flex items-end gap-[3px]">
            {HOUR_HEAT.map((h, i) => {
              const peak = h.hour >= 23 || h.hour <= 2;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm"
                  style={{
                    height: `${Math.max(8, h.v)}%`,
                    background: peak ?
                    `linear-gradient(to top, ${SONG.gradientFrom}, ${SONG.gradientTo})` :
                    'rgba(255,255,255,0.12)',
                    boxShadow: peak ?
                    `0 0 18px ${SONG.gradientFrom}66` :
                    'none'
                  }} />);


            })}
          </div>
          <div className="flex justify-between text-[10px] text-white/40 mt-2">
            <span>00</span>
            <span>06</span>
            <span>12</span>
            <span>18</span>
            <span>23</span>
          </div>
        </div>

        {/* Month trend */}
        <div className="glass-card p-6 min-h-[220px] flex flex-col">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
            Plays per month
          </div>
          <div className="flex-1 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTH_TREND}>
                <defs>
                  <linearGradient id="sotd-month" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={SONG.gradientFrom}
                      stopOpacity={0.45} />
                    
                    <stop
                      offset="100%"
                      stopColor={SONG.gradientFrom}
                      stopOpacity={0} />
                    
                  </linearGradient>
                </defs>
                <Area
                  dataKey="v"
                  stroke={SONG.gradientFrom}
                  strokeWidth={2}
                  fill="url(#sotd-month)" />
                
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[10px] text-white/40 mt-2">
            {MONTH_TREND.map((m) =>
            <span key={m.m}>{m.m[0]}</span>
            )}
          </div>
        </div>

        {/* Repeat frequency curve */}
        <div className="glass-card p-6 min-h-[220px] flex flex-col">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
            Repeat frequency · per session
          </div>
          <div className="flex-1 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REPEAT_CURVE}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={SONG.gradientTo}
                  strokeWidth={2.5}
                  dot={false} />
                
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-white/55 mt-2">
            Most listened back-to-back{' '}
            <span className="text-white font-medium">5 times</span> in one
            sitting.
          </div>
        </div>

        {/* Release year */}
        <div className="glass-card p-6 min-h-[220px] flex flex-col">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
            Release year context
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                {
                  y: '11',
                  v: 18
                },
                {
                  y: '12',
                  v: 28
                },
                {
                  y: '13',
                  v: 100
                },
                {
                  y: '14',
                  v: 42
                },
                {
                  y: '15',
                  v: 38
                },
                {
                  y: '16',
                  v: 22
                },
                {
                  y: '17',
                  v: 18
                },
                {
                  y: '18',
                  v: 14
                }]
                }>
                
                <Bar
                  dataKey="v"
                  radius={[4, 4, 0, 0]}
                  fill={SONG.gradientFrom} />
                
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-white/55 mt-2">
            Released <span className="text-white font-medium">2013</span> · your
            peak indie-rock year.
          </div>
        </div>
      </div>
    </section>);

}
function DailyRitual() {
  const stats = [
  {
    icon: Flame,
    value: '14',
    label: 'Days returned in a row'
  },
  {
    icon: Sparkles,
    value: '42',
    label: 'Songs rediscovered'
  },
  {
    icon: Heart,
    value: '8.6/10',
    label: 'Avg nostalgia score'
  },
  {
    icon: Music2,
    value: '6',
    label: 'Saved to library'
  }];

  return (
    <section className="pb-6">
      <div className="glass-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-24 left-1/3 w-[400px] h-[300px] bg-spotify/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-md">
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
              Daily ritual
            </div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              Come back tomorrow for a new{' '}
              <span className="font-serif-display italic text-spotify/90">
                memory
              </span>
              .
            </h3>
            <p className="text-sm text-white/55 leading-relaxed">
              We pick one resurfaced favorite each morning. Your streak grows
              when you stop by.
            </p>
            <button className="mt-5 inline-flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/10 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors">
              Get a daily reminder
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 md:max-w-2xl">
            {stats.map((s, i) =>
            <motion.div
              key={s.label}
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
                delay: i * 0.06
              }}
              className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
              
                <s.icon
                size={16}
                className="text-white/50 mb-3"
                strokeWidth={1.8} />
              
                <div className="text-2xl font-serif-display mb-1">
                  {s.value}
                </div>
                <div className="text-[11px] text-white/50 leading-tight">
                  {s.label}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>);

}
// ---------- PAGE ----------
export default function SongOfTheDayPage() {
  return (
    <div className="min-h-screen bg-background text-white selection:bg-spotify/30 selection:text-white flex">
      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative">
        <TopNav />

        <main className="flex-1 p-6 md:p-10 max-w-[1400px] mx-auto w-full relative">
          {/* Page-level ambient */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
          <div className="absolute top-[40%] left-[-20%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
          <div className="absolute bottom-0 right-[-10%] w-[700px] h-[700px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

          <div className="relative z-10 flex flex-col gap-14">
            <SotdHero />
            <TheStory />
            <MemorySnapshot />
            <WhyWePickedThis />
            <RelatedForgotten />
            <MoodReconstruction />
            <DailyRitual />
          </div>
        </main>
      </div>
    </div>);

}