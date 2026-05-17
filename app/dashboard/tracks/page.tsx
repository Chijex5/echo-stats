"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Play,
  TrendingUp,
  TrendingDown,
  Minus,
  Disc3,
  Heart,
  Clock,
  Calendar,
  Flame,
  Repeat,
  SkipForward,
  Sparkles,
  Moon,
  Music2,
  ArrowUpRight } from
'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ResponsiveContainer } from
'recharts';
import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
// ---------- MOCK DATA ----------
const TRACKS = [
{
  rank: 1,
  title: 'Saoirse',
  artist: 'Cleo Sol',
  plays: 187,
  delta: 24,
  trend: 'up',
  color: 'from-amber-400 to-orange-500',
  spark: [4, 8, 6, 10, 14, 18, 24]
},
{
  rank: 2,
  title: 'Solitude',
  artist: 'Tame Impala',
  plays: 164,
  delta: 12,
  trend: 'up',
  color: 'from-purple-500 to-indigo-500',
  spark: [10, 12, 8, 14, 16, 18, 22]
},
{
  rank: 3,
  title: 'Pink + White',
  artist: 'Frank Ocean',
  plays: 152,
  delta: -6,
  trend: 'down',
  color: 'from-pink-500 to-orange-400',
  spark: [22, 20, 18, 16, 14, 12, 14]
},
{
  rank: 4,
  title: 'Not Like Us',
  artist: 'Kendrick Lamar',
  plays: 142,
  delta: 0,
  trend: 'same',
  color: 'from-red-500 to-orange-500',
  spark: [18, 20, 22, 19, 21, 20, 20]
},
{
  rank: 5,
  title: 'LUNCH',
  artist: 'Billie Eilish',
  plays: 128,
  delta: 18,
  trend: 'up',
  color: 'from-blue-500 to-cyan-500',
  spark: [6, 8, 12, 14, 18, 22, 28]
},
{
  rank: 6,
  title: 'Nights',
  artist: 'Frank Ocean',
  plays: 116,
  delta: 5,
  trend: 'up',
  color: 'from-purple-600 to-blue-500',
  spark: [12, 14, 12, 16, 18, 20, 18]
},
{
  rank: 7,
  title: 'Million Dollar Baby',
  artist: 'Tommy Richman',
  plays: 102,
  delta: -10,
  trend: 'down',
  color: 'from-emerald-500 to-teal-400',
  spark: [22, 18, 16, 14, 12, 10, 8]
},
{
  rank: 8,
  title: 'Good Luck, Babe!',
  artist: 'Chappell Roan',
  plays: 96,
  delta: 8,
  trend: 'up',
  color: 'from-rose-400 to-pink-500',
  spark: [4, 6, 10, 12, 14, 16, 18]
},
{
  rank: 9,
  title: 'Water Underground',
  artist: 'Real Estate',
  plays: 88,
  delta: 14,
  trend: 'up',
  color: 'from-cyan-400 to-blue-500',
  spark: [2, 4, 8, 10, 14, 18, 22]
},
{
  rank: 10,
  title: 'Espresso',
  artist: 'Sabrina Carpenter',
  plays: 84,
  delta: -4,
  trend: 'down',
  color: 'from-pink-400 to-rose-400',
  spark: [18, 16, 14, 14, 12, 10, 12]
},
{
  rank: 11,
  title: 'Ivy',
  artist: 'Frank Ocean',
  plays: 78,
  delta: 2,
  trend: 'same',
  color: 'from-rose-400 to-orange-300',
  spark: [10, 11, 10, 12, 11, 10, 12]
},
{
  rank: 12,
  title: 'Borderline',
  artist: 'Tame Impala',
  plays: 72,
  delta: -2,
  trend: 'same',
  color: 'from-indigo-500 to-purple-500',
  spark: [14, 12, 13, 12, 11, 12, 11]
},
{
  rank: 13,
  title: 'Glory',
  artist: 'Common',
  plays: 68,
  delta: 6,
  trend: 'up',
  color: 'from-yellow-500 to-amber-600',
  spark: [4, 6, 8, 10, 12, 14, 14]
},
{
  rank: 14,
  title: 'Bags',
  artist: 'Clairo',
  plays: 64,
  delta: 9,
  trend: 'up',
  color: 'from-violet-500 to-fuchsia-500',
  spark: [2, 4, 6, 8, 10, 12, 16]
},
{
  rank: 15,
  title: 'Sweater Weather',
  artist: 'The Neighbourhood',
  plays: 60,
  delta: 0,
  trend: 'same',
  color: 'from-slate-500 to-blue-600',
  spark: [10, 10, 10, 11, 10, 10, 10]
},
{
  rank: 16,
  title: 'Last Last',
  artist: 'Burna Boy',
  plays: 58,
  delta: -8,
  trend: 'down',
  color: 'from-green-500 to-emerald-400',
  spark: [16, 14, 12, 10, 8, 6, 4]
},
{
  rank: 17,
  title: 'Stronger',
  artist: 'Kanye West',
  plays: 56,
  delta: 3,
  trend: 'up',
  color: 'from-zinc-500 to-stone-600',
  spark: [6, 8, 8, 10, 10, 12, 14]
},
{
  rank: 18,
  title: "New Year's Day",
  artist: 'Taylor Swift',
  plays: 54,
  delta: 11,
  trend: 'up',
  color: 'from-amber-300 to-yellow-400',
  spark: [2, 3, 5, 8, 10, 12, 14]
},
{
  rank: 19,
  title: "Marea (we've lost dancing)",
  artist: 'Fred again..',
  plays: 50,
  delta: 4,
  trend: 'up',
  color: 'from-emerald-400 to-cyan-500',
  spark: [4, 6, 6, 8, 9, 10, 12]
},
{
  rank: 20,
  title: 'Cherry Wine',
  artist: 'Hozier',
  plays: 48,
  delta: -1,
  trend: 'same',
  color: 'from-red-700 to-rose-800',
  spark: [8, 8, 9, 8, 8, 7, 8]
},
{
  rank: 21,
  title: 'Midnight City',
  artist: 'M83',
  plays: 46,
  delta: -3,
  trend: 'down',
  color: 'from-indigo-600 to-purple-700',
  spark: [10, 9, 8, 8, 7, 6, 6]
},
{
  rank: 22,
  title: 'Skinny Love',
  artist: 'Bon Iver',
  plays: 44,
  delta: 7,
  trend: 'up',
  color: 'from-sky-500 to-indigo-500',
  spark: [3, 4, 5, 7, 8, 10, 12]
},
{
  rank: 23,
  title: 'Telekinesis',
  artist: 'Travis Scott',
  plays: 42,
  delta: -5,
  trend: 'down',
  color: 'from-red-500 to-orange-600',
  spark: [10, 9, 8, 7, 6, 6, 5]
},
{
  rank: 24,
  title: 'Reborn',
  artist: 'KIDS SEE GHOSTS',
  plays: 40,
  delta: 0,
  trend: 'same',
  color: 'from-zinc-600 to-zinc-800',
  spark: [6, 7, 7, 7, 6, 7, 6]
},
{
  rank: 25,
  title: 'Tadow',
  artist: 'FKJ & Masego',
  plays: 38,
  delta: 4,
  trend: 'up',
  color: 'from-orange-400 to-amber-500',
  spark: [2, 3, 4, 5, 6, 7, 8]
}];

const MONTHLY_TREND = Array.from({
  length: 12
}).map((_, i) => ({
  month: i,
  plays: Math.round(40 + Math.sin(i * 0.6) * 25 + i * 4)
}));
const SPOTLIGHT_MONTHLY = Array.from({
  length: 12
}).map((_, i) => ({
  month: i,
  value: Math.round(15 + Math.sin(i * 0.5 + 1) * 12 + (i > 6 ? i * 1.5 : 0))
}));
const RELEASE_YEARS = [
{
  decade: '70s',
  value: 4
},
{
  decade: '80s',
  value: 12
},
{
  decade: '90s',
  value: 18
},
{
  decade: '00s',
  value: 28
},
{
  decade: '10s',
  value: 64
},
{
  decade: '20s',
  value: 100
}];

const GENRE_MIX = [
{
  name: 'Indie',
  value: 32,
  color: '#1DB954'
},
{
  name: 'Hip-hop',
  value: 24,
  color: '#7C3AED'
},
{
  name: 'R&B',
  value: 18,
  color: '#F472B6'
},
{
  name: 'Electronic',
  value: 14,
  color: '#3B82F6'
},
{
  name: 'Soul',
  value: 12,
  color: '#F59E0B'
}];

const HOUR_HEAT = Array.from({
  length: 24
}).map((_, h) => ({
  hour: h,
  // peak 22–02, dip 04–08
  v: Math.round(
    20 +
    Math.cos((h - 23) * Math.PI / 12) * 70 + (
    h >= 4 && h <= 8 ? -25 : 0)
  )
}));
// 7×26 calendar (~6 months)
const CAL_HEAT = Array.from({
  length: 7 * 26
}).map((_, i) => {
  const week = Math.floor(i / 7);
  const day = i % 7;
  const weekend = day === 0 || day === 6 ? 0.25 : 0;
  const wave = Math.sin(week * 0.4) * 0.3 + 0.4;
  const spike = i % 13 === 0 ? 0.25 : 0;
  return Math.max(0.05, Math.min(0.95, wave + weekend + spike));
});
const FILTER_GROUPS: {
  label: string;
  options: string[];
}[] = [
{
  label: 'Genre',
  options: ['All', 'Indie', 'Hip-hop', 'R&B', 'Electronic', 'Soul', 'Pop']
},
{
  label: 'Decade',
  options: ['All', '70s', '80s', '90s', '00s', '10s', '20s']
},
{
  label: 'Mood',
  options: [
  'All',
  'Nostalgic',
  'Energetic',
  'Calm',
  'Melancholic',
  'Euphoric']

},
{
  label: 'Library',
  options: ['All', 'Saved', 'Unsaved']
},
{
  label: 'Explicit',
  options: ['All', 'Clean', 'Explicit']
}];

const INSIGHTS = [
{
  icon: Flame,
  label: 'Biggest Comeback',
  title: 'Pink + White',
  sub: '+412% this month',
  color: 'text-orange-400',
  tint: 'bg-orange-500/10'
},
{
  icon: TrendingUp,
  label: 'Fastest Rising',
  title: 'LUNCH',
  sub: 'From 47 → 5 in 3 weeks',
  color: 'text-spotify',
  tint: 'bg-spotify/10'
},
{
  icon: Repeat,
  label: 'Longest Obsession',
  title: 'Million Dollar Baby',
  sub: '23 days in a row',
  color: 'text-indigo-400',
  tint: 'bg-indigo-500/10'
},
{
  icon: SkipForward,
  label: 'Most Skipped',
  title: 'Espresso',
  sub: 'Skipped 38% of the time',
  color: 'text-rose-400',
  tint: 'bg-rose-500/10'
},
{
  icon: Disc3,
  label: 'Oldest in Rotation',
  title: 'Midnight City',
  sub: 'Released 2011 · still spinning',
  color: 'text-blue-400',
  tint: 'bg-blue-500/10'
},
{
  icon: Sparkles,
  label: 'Newest Obsession',
  title: 'Saoirse',
  sub: '187 plays in 6 weeks',
  color: 'text-amber-400',
  tint: 'bg-amber-500/10'
}];

const REDISCOVER = [
{
  tag: 'Loved & Forgot',
  title: 'Sweater Weather',
  artist: 'The Neighbourhood',
  color: 'from-slate-500 to-blue-600',
  meta: 'Last played 4 months ago'
},
{
  tag: 'Old Favorite',
  title: 'Stronger',
  artist: 'Kanye West',
  color: 'from-zinc-500 to-stone-600',
  meta: 'Top track of 2019'
},
{
  tag: 'Seasonal',
  title: 'Cherry Wine',
  artist: 'Hozier',
  color: 'from-red-700 to-rose-800',
  meta: 'Played every October'
},
{
  tag: 'Nostalgia Pick',
  title: 'Skinny Love',
  artist: 'Bon Iver',
  color: 'from-sky-500 to-indigo-500',
  meta: "You haven't heard this since 2022"
},
{
  tag: 'Loved & Forgot',
  title: 'Tadow',
  artist: 'FKJ & Masego',
  color: 'from-orange-400 to-amber-500',
  meta: 'Last played 7 months ago'
},
{
  tag: 'Old Favorite',
  title: 'Reborn',
  artist: 'KIDS SEE GHOSTS',
  color: 'from-zinc-600 to-zinc-800',
  meta: 'Top track of 2020'
}];

const SORT_OPTIONS = [
'Most played',
'Recent rise',
'Forgotten',
'Oldest favorite'];

const RANGE_OPTIONS = ['7 days', '30 days', '3 months', '1 year', 'Custom'];
// ---------- HELPERS ----------
function Sparkline({ data, color }: {data: number[];color: string;}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data.map((v) => ({
          v
        }))}>
        
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.75}
          dot={false} />
        
      </LineChart>
    </ResponsiveContainer>);

}
function TrendBadge({ trend, delta }: {trend: string;delta: number;}) {
  if (trend === 'same') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white/40">
        <Minus size={12} /> 0%
      </span>);

  }
  const up = trend === 'up';
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium ${up ? 'text-spotify' : 'text-rose-400'}`}>
      
      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {up ? '+' : ''}
      {delta}%
    </span>);

}
// ---------- SECTIONS ----------
function TracksHero({
  range,
  setRange,
  sort,
  setSort





}: {range: string;setRange: (v: string) => void;sort: string;setSort: (v: string) => void;}) {
  const [rangeOpen, setRangeOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const stats = [
  {
    label: 'Tracks played',
    value: '14,205'
  },
  {
    label: 'Total hours',
    value: '487'
  },
  {
    label: 'Unique artists',
    value: '1,283'
  },
  {
    label: 'Avg song length',
    value: '3:42'
  }];

  return (
    <section className="relative">
      {/* Album collage */}
      <div className="absolute right-0 top-0 hidden lg:flex items-center gap-3 pointer-events-none">
        {[
        'from-amber-400 to-orange-500',
        'from-pink-500 to-orange-400',
        'from-purple-500 to-indigo-500',
        'from-emerald-400 to-cyan-500',
        'from-rose-400 to-pink-500'].
        map((c, i) =>
        <motion.div
          key={i}
          initial={{
            opacity: 0,
            y: 20,
            rotate: 0
          }}
          animate={{
            opacity: 1,
            y: [0, -8, 0],
            rotate: i % 2 === 0 ? -6 : 6
          }}
          transition={{
            opacity: {
              duration: 0.6,
              delay: 0.1 * i
            },
            y: {
              duration: 4 + i * 0.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2
            },
            rotate: {
              duration: 0.6,
              delay: 0.1 * i
            }
          }}
          className={`w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br ${c} shadow-2xl shadow-black/40 ring-1 ring-white/10`}
          style={{
            marginLeft: i === 0 ? 0 : -16
          }}>
          
            <div className="w-full h-full rounded-2xl bg-black/20" />
          </motion.div>
        )}
      </div>

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-white/60 mb-6">
          <Music2 size={12} className="text-spotify" />
          Top Tracks
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
          Your{' '}
          <span className="font-serif-display italic font-normal text-spotify/90">
            top
          </span>{' '}
          tracks.
        </h1>
        <p className="text-lg text-white/60 leading-relaxed mb-8">
          Explore the songs that defined your listening journey.
        </p>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Range */}
          <div className="relative">
            <button
              onClick={() => {
                setRangeOpen((o) => !o);
                setSortOpen(false);
              }}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-spotify/40">
              
              <Calendar size={14} className="text-white/60" />
              {range}
              <ChevronDown
                size={14}
                className={`transition-transform ${rangeOpen ? 'rotate-180' : ''}`} />
              
            </button>
            <AnimatePresence>
              {rangeOpen &&
              <motion.div
                initial={{
                  opacity: 0,
                  y: -6
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                exit={{
                  opacity: 0,
                  y: -6
                }}
                transition={{
                  duration: 0.15
                }}
                className="absolute mt-2 left-0 z-30 glass-card p-2 min-w-[160px]">
                
                  {RANGE_OPTIONS.map((opt) =>
                <button
                  key={opt}
                  onClick={() => {
                    setRange(opt);
                    setRangeOpen(false);
                  }}
                  className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${range === opt ? 'bg-spotify/15 text-spotify' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                  
                      {opt}
                    </button>
                )}
                </motion.div>
              }
            </AnimatePresence>
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => {
                setSortOpen((o) => !o);
                setRangeOpen(false);
              }}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-spotify/40">
              
              <span className="text-white/60">Sort:</span>
              {sort}
              <ChevronDown
                size={14}
                className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              
            </button>
            <AnimatePresence>
              {sortOpen &&
              <motion.div
                initial={{
                  opacity: 0,
                  y: -6
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                exit={{
                  opacity: 0,
                  y: -6
                }}
                transition={{
                  duration: 0.15
                }}
                className="absolute mt-2 left-0 z-30 glass-card p-2 min-w-[180px]">
                
                  {SORT_OPTIONS.map((opt) =>
                <button
                  key={opt}
                  onClick={() => {
                    setSort(opt);
                    setSortOpen(false);
                  }}
                  className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${sort === opt ? 'bg-spotify/15 text-spotify' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                  
                      {opt}
                    </button>
                )}
                </motion.div>
              }
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          duration: 0.6,
          delay: 0.2
        }}
        className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {stats.map((s) =>
        <div key={s.label} className="glass-card p-5">
            <div className="text-[10px] uppercase tracking-widest text-white/40 font-medium mb-2">
              {s.label}
            </div>
            <div className="text-3xl font-serif-display">{s.value}</div>
          </div>
        )}
      </motion.div>
    </section>);

}
function TrackLeaderboard({
  selected,
  setSelected



}: {selected: number;setSelected: (n: number) => void;}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
          <p className="text-sm text-white/50">
            Your top 25 tracks of the period.
          </p>
        </div>
        <span className="text-xs uppercase tracking-widest text-white/40">
          25 tracks
        </span>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[40px_1fr_120px_100px_80px_56px] gap-4 px-6 py-3 border-b border-white/5 text-[10px] uppercase tracking-widest text-white/40 font-medium">
          <div>#</div>
          <div>Track</div>
          <div>30-day trend</div>
          <div>Change</div>
          <div className="text-right">Plays</div>
          <div></div>
        </div>

        <div className="divide-y divide-white/5">
          {TRACKS.map((t, i) => {
            const isActive = selected === t.rank;
            return (
              <motion.button
                key={t.rank}
                onClick={() => setSelected(t.rank)}
                initial={{
                  opacity: 0,
                  x: -10
                }}
                whileInView={{
                  opacity: 1,
                  x: 0
                }}
                viewport={{
                  once: true,
                  margin: '-50px'
                }}
                transition={{
                  duration: 0.3,
                  delay: Math.min(i * 0.02, 0.4)
                }}
                className={`w-full text-left grid grid-cols-[40px_1fr_56px] md:grid-cols-[40px_1fr_120px_100px_80px_56px] gap-4 items-center px-6 py-3 transition-all relative group ${isActive ? 'bg-spotify/[0.06]' : 'hover:bg-white/[0.03]'}`}>
                
                {isActive &&
                <motion.div
                  layoutId="track-active"
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-spotify"
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30
                  }} />

                }

                <div
                  className={`text-xl font-serif-display ${isActive ? 'text-spotify' : 'text-white/30 group-hover:text-white/60'} transition-colors`}>
                  
                  {t.rank.toString().padStart(2, '0')}
                </div>

                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`relative w-11 h-11 rounded-md bg-gradient-to-br ${t.color} shrink-0 overflow-hidden shadow-md`}>
                    
                    <div className="absolute inset-0 bg-black/15" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                      <Play size={14} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-white/90 group-hover:text-white'}`}>
                      
                      {t.title}
                    </div>
                    <div className="text-xs text-white/50 truncate">
                      {t.artist}
                    </div>
                  </div>
                </div>

                <div className="hidden md:block h-7 w-[110px]">
                  <Sparkline
                    data={t.spark}
                    color={
                    t.trend === 'down' ?
                    '#fb7185' :
                    t.trend === 'up' ?
                    '#1DB954' :
                    'rgba(255,255,255,0.3)'
                    } />
                  
                </div>

                <div className="hidden md:block">
                  <TrendBadge trend={t.trend} delta={t.delta} />
                </div>

                <div className="hidden md:block text-right text-sm tabular-nums text-white/80">
                  {t.plays}
                </div>

                <div className="text-right md:text-center">
                  <button
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-spotify hover:text-black flex items-center justify-center transition-colors"
                    aria-label="Play"
                    onClick={(e) => e.stopPropagation()}>
                    
                    <Play size={12} fill="currentColor" className="ml-0.5" />
                  </button>
                </div>
              </motion.button>);

          })}
        </div>
      </div>
    </section>);

}
function TrackSpotlight({ rank }: {rank: number;}) {
  const t = TRACKS.find((x) => x.rank === rank) || TRACKS[0];
  const radial = [
  {
    name: 'streak',
    value: 78,
    fill: '#1DB954'
  }];

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Spotlight</h2>
          <p className="text-sm text-white/50">
            A closer look at your selection.
          </p>
        </div>
        <span className="text-xs uppercase tracking-widest text-white/40">
          #{t.rank.toString().padStart(2, '0')}
        </span>
      </div>

      <div className="glass-card p-6 md:p-10 relative overflow-hidden">
        {/* Tinted ambient glow tied to track color */}
        <div
          className={`absolute -top-20 -right-20 w-[420px] h-[420px] rounded-full blur-[120px] opacity-30 bg-gradient-to-br ${t.color} pointer-events-none`} />
        

        <div className="relative grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
          {/* Album */}
          <div className="flex flex-col items-center lg:items-start">
            <motion.div
              key={t.rank}
              initial={{
                opacity: 0,
                scale: 0.95
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              transition={{
                duration: 0.4
              }}
              className={`relative w-56 h-56 md:w-64 md:h-64 rounded-2xl bg-gradient-to-br ${t.color} shadow-2xl shadow-black/50 ring-1 ring-white/10 overflow-hidden`}>
              
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10" />
              <Disc3
                className="absolute bottom-4 right-4 text-white/30"
                size={36} />
              
            </motion.div>

            <button className="mt-6 inline-flex items-center gap-2 bg-spotify hover:bg-spotify-light text-black text-sm font-semibold px-5 py-2.5 rounded-full transition-all shadow-[0_0_24px_-6px_rgba(29,185,84,0.6)] hover:-translate-y-0.5">
              <Play size={14} fill="currentColor" />
              Play track
            </button>
          </div>

          {/* Details */}
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-widest text-white/40 mb-2">
              Spotlight
            </div>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-1 truncate">
              {t.title}
            </h3>
            <p className="text-lg text-white/60 mb-6">{t.artist}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                  Listens
                </div>
                <div className="text-2xl font-serif-display">{t.plays}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                  First played
                </div>
                <div className="text-sm font-medium">Mar 04, 2024</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                  Last played
                </div>
                <div className="text-sm font-medium">Yesterday · 11:42 PM</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                  Streak
                </div>
                <div className="text-sm font-medium">14 days running</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 mb-6">
              <Moon size={16} className="text-violet-300 mt-0.5 shrink-0" />
              <p className="text-sm text-white/80">
                <span className="font-medium">Hidden insight · </span>
                <span className="text-white/60">
                  You played this most during late-night sessions — 64% of
                  listens happened after 10 PM.
                </span>
              </p>
            </div>

            {/* Mini visuals */}
            <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4">
              <div className="glass-card p-4 flex flex-col items-center justify-center">
                <div className="relative w-24 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="70%"
                      outerRadius="100%"
                      data={radial}
                      startAngle={90}
                      endAngle={-270}>
                      
                      <RadialBar
                        background={{
                          fill: 'rgba(255,255,255,0.06)'
                        }}
                        dataKey="value"
                        cornerRadius={20} />
                      
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-serif-display">78%</span>
                    <span className="text-[9px] uppercase tracking-widest text-white/40">
                      night
                    </span>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-white/40 mt-2">
                  Time of day
                </span>
              </div>

              <div className="glass-card p-4">
                <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
                  Monthly plays
                </div>
                <div className="h-20 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={SPOTLIGHT_MONTHLY}>
                      <defs>
                        <linearGradient
                          id="spot-monthly"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1">
                          
                          <stop
                            offset="0%"
                            stopColor="#1DB954"
                            stopOpacity={0.4} />
                          
                          <stop
                            offset="100%"
                            stopColor="#1DB954"
                            stopOpacity={0} />
                          
                        </linearGradient>
                      </defs>
                      <Area
                        dataKey="value"
                        stroke="#1DB954"
                        strokeWidth={2}
                        fill="url(#spot-monthly)" />
                      
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}
function TrackCharts() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Listening shape</h2>
        <p className="text-sm text-white/50">
          The patterns behind the numbers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly trend - large */}
        <div className="glass-card p-6 lg:col-span-2 min-h-[260px] flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-white/40">
              Monthly listening trend
            </span>
            <span className="text-xs text-spotify">+18% YoY</span>
          </div>
          <div className="flex-1 -mx-3 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_TREND}>
                <defs>
                  <linearGradient
                    id="monthly-trend"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1">
                    
                    <stop offset="0%" stopColor="#1DB954" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#1DB954" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="plays"
                  stroke="#1DB954"
                  strokeWidth={2.5}
                  fill="url(#monthly-trend)" />
                
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Genre distribution donut */}
        <div className="glass-card p-6 min-h-[260px] flex flex-col">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
            Genre distribution
          </div>
          <div className="flex-1 flex items-center">
            <div className="relative w-32 h-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={GENRE_MIX}
                    dataKey="value"
                    innerRadius={42}
                    outerRadius={60}
                    paddingAngle={2}
                    stroke="none">
                    
                    {GENRE_MIX.map((g) =>
                    <Cell key={g.name} fill={g.color} />
                    )}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-serif-display">5</span>
                <span className="text-[9px] uppercase tracking-widest text-white/40">
                  genres
                </span>
              </div>
            </div>
            <ul className="flex-1 space-y-2 ml-4">
              {GENRE_MIX.map((g) =>
              <li
                key={g.name}
                className="flex items-center justify-between text-xs">
                
                  <span className="flex items-center gap-2 text-white/70">
                    <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: g.color
                    }} />
                  
                    {g.name}
                  </span>
                  <span className="text-white/40 tabular-nums">{g.value}%</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Play count bar */}
        <div className="glass-card p-6 min-h-[220px] flex flex-col">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
            Plays per track (top 10)
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={TRACKS.slice(0, 10).map((t) => ({
                  name: t.rank,
                  plays: t.plays
                }))}>
                
                <Bar dataKey="plays" radius={[4, 4, 0, 0]} fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Release year histogram */}
        <div className="glass-card p-6 min-h-[220px] flex flex-col">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
            Release year histogram
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RELEASE_YEARS}>
                <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#7C3AED" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[10px] text-white/40 mt-1">
            {RELEASE_YEARS.map((r) =>
            <span key={r.decade}>{r.decade}</span>
            )}
          </div>
        </div>

        {/* Hour heatmap */}
        <div className="glass-card p-6 min-h-[220px] flex flex-col">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
            Top listening hours
          </div>
          <div className="flex-1 flex items-end gap-[3px]">
            {HOUR_HEAT.map((h) =>
            <div
              key={h.hour}
              className="flex-1 rounded-t-sm"
              style={{
                height: `${Math.max(8, h.v)}%`,
                backgroundColor: `rgba(29,185,84,${0.2 + h.v / 200})`
              }}
              title={`${h.hour}:00 · ${h.v}`} />

            )}
          </div>
          <div className="flex justify-between text-[10px] text-white/40 mt-2">
            <span>00</span>
            <span>06</span>
            <span>12</span>
            <span>18</span>
            <span>23</span>
          </div>
        </div>

        {/* Calendar heatmap */}
        <div className="glass-card p-6 min-h-[220px] lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-widest text-white/40">
              Calendar heatmap · last 6 months
            </span>
            <div className="flex items-center gap-1 text-[10px] text-white/40">
              less
              {[0.15, 0.3, 0.5, 0.7, 0.9].map((o) =>
              <span
                key={o}
                className="w-2.5 h-2.5 rounded-sm"
                style={{
                  backgroundColor: `rgba(29,185,84,${o})`
                }} />

              )}
              more
            </div>
          </div>
          <div className="grid grid-rows-7 grid-flow-col gap-[3px] overflow-x-auto hide-scrollbar">
            {CAL_HEAT.map((v, i) =>
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{
                backgroundColor: `rgba(29,185,84,${v})`
              }} />

            )}
          </div>
        </div>
      </div>
    </section>);

}
function TrackFilters() {
  const [active, setActive] = useState<Record<string, string>>({
    Genre: 'All',
    Decade: 'All',
    Mood: 'All',
    Library: 'All',
    Explicit: 'All'
  });
  return (
    <section className="sticky top-20 z-20">
      <div className="glass-card p-5">
        <div className="flex items-start gap-4 flex-wrap">
          {FILTER_GROUPS.map((group) =>
          <div key={group.label} className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-white/40 font-medium mb-2">
                {group.label}
              </div>
              <div className="flex flex-wrap gap-2">
                {group.options.map((opt) => {
                const isActive = active[group.label] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() =>
                    setActive({
                      ...active,
                      [group.label]: opt
                    })
                    }
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-spotify/40 ${isActive ? 'bg-spotify text-black border-spotify shadow-[0_0_18px_-6px_rgba(29,185,84,0.7)]' : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.06] hover:text-white'}`}>
                    
                      {opt}
                    </button>);

              })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}
function TrackInsights() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Special insights</h2>
        <p className="text-sm text-white/50">
          Patterns we found in your top tracks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INSIGHTS.map((ins, i) =>
        <motion.div
          key={ins.label}
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
            margin: '-50px'
          }}
          transition={{
            duration: 0.4,
            delay: i * 0.06
          }}
          className="glass-card p-6 relative overflow-hidden hover:-translate-y-0.5 transition-transform">
          
            <div className="flex items-center justify-between mb-6">
              <div
              className={`w-9 h-9 rounded-xl ${ins.tint} flex items-center justify-center ${ins.color}`}>
              
                <ins.icon size={18} />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-white/40">
                {ins.label}
              </span>
            </div>
            <div className="text-xl font-semibold mb-1">{ins.title}</div>
            <div className={`text-sm ${ins.color}`}>{ins.sub}</div>
          </motion.div>
        )}
      </div>
    </section>);

}
function RediscoveryStrip() {
  return (
    <section>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rediscover</h2>
          <p className="text-sm text-white/50">Songs your past self loved.</p>
        </div>
        <button className="hidden md:inline-flex items-center gap-1 text-sm text-white/60 hover:text-white">
          See all <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory">
        {REDISCOVER.map((r, i) =>
        <motion.div
          key={i}
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
            margin: '-50px'
          }}
          transition={{
            duration: 0.4,
            delay: i * 0.05
          }}
          className="snap-start shrink-0 w-60 glass-card p-4 hover:-translate-y-1 transition-transform">
          
            <div
            className={`relative w-full aspect-square rounded-xl bg-gradient-to-br ${r.color} mb-4 overflow-hidden shadow-md ring-1 ring-white/10`}>
            
              <div className="absolute inset-0 bg-black/15" />
              <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest font-medium px-2 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/90">
                {r.tag}
              </span>
              <button className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105">
                <Play size={14} fill="currentColor" className="ml-0.5" />
              </button>
            </div>
            <div className="text-sm font-medium truncate">{r.title}</div>
            <div className="text-xs text-white/50 truncate mb-3">
              {r.artist}
            </div>
            <div className="text-[11px] text-white/40 flex items-center gap-1">
              <Clock size={11} /> {r.meta}
            </div>
          </motion.div>
        )}
      </div>
    </section>);

}
// ---------- PAGE ----------
export default function TopTracksPage() {
  const [range, setRange] = useState('30 days');
  const [sort, setSort] = useState('Most played');
  const [selected, setSelected] = useState(1);
  return (
    <div className="min-h-screen bg-background text-white selection:bg-spotify/30 selection:text-white flex">
      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative">
        <TopNav />

        <main className="flex-1 p-6 md:p-10 max-w-[1400px] mx-auto w-full relative">
          {/* Ambient Page Blobs */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
          <div className="absolute top-[35%] left-[-20%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
          <div className="absolute bottom-0 right-[-10%] w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

          <div className="relative z-10 flex flex-col gap-14">
            <TracksHero
              range={range}
              setRange={setRange}
              sort={sort}
              setSort={setSort} />
            
            <TrackLeaderboard selected={selected} setSelected={setSelected} />
            <TrackSpotlight rank={selected} />
            <TrackCharts />
            <TrackFilters />
            <TrackInsights />
            <RediscoveryStrip />
          </div>
        </main>
      </div>
    </div>);

}