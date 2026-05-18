"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Heart,
  Moon,
  Coffee,
  CloudRain,
  Flame,
  Repeat,
  Compass,
  Gem,
  Clock,
  TrendingUp,
  Wind,
  Star,
  Zap,
  ArrowUpRight,
  CalendarHeart } from
'lucide-react';
import {
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  LineChart,
  Line } from
'recharts';
import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
// ---------- DATA ----------
const MOOD_RADAR = [
{
  axis: 'Energy',
  value: 78
},
{
  axis: 'Calm',
  value: 52
},
{
  axis: 'Nostalgia',
  value: 86
},
{
  axis: 'Joy',
  value: 64
},
{
  axis: 'Melancholy',
  value: 71
}];

const AGE_TREND = Array.from({
  length: 14
}).map((_, i) => ({
  v: Math.round(2000 + i * 1.6 + Math.sin(i * 0.7) * 3)
}));
const ERA_DATA = [
{
  label: '60s',
  value: 4
},
{
  label: '70s',
  value: 8
},
{
  label: '80s',
  value: 14
},
{
  label: '90s',
  value: 22
},
{
  label: '00s',
  value: 36
},
{
  label: '10s',
  value: 100,
  active: true
},
{
  label: '20s',
  value: 72
}];

const PERSONALITY_CARDS = [
{
  icon: Compass,
  title: 'Hidden genre',
  accent: 'text-emerald-300',
  tint: 'from-emerald-500/15 to-transparent',
  value: 'Nu-jazz',
  sub: 'Quietly your 3rd most played — but you never put it in any playlist.'
},
{
  icon: Heart,
  title: 'Most emotional month',
  accent: 'text-rose-300',
  tint: 'from-rose-500/15 to-transparent',
  value: 'August',
  sub: 'Mood scores peaked at 9.2/10 — your most introspective stretch of the year.'
},
{
  icon: Wind,
  title: 'Music changed most in',
  accent: 'text-cyan-300',
  tint: 'from-cyan-500/15 to-transparent',
  value: 'March',
  sub: 'A 47% shift in genre composition — you started over.'
},
{
  icon: Moon,
  title: 'Late-night obsession',
  accent: 'text-violet-300',
  tint: 'from-violet-500/15 to-transparent',
  value: 'Solitude',
  sub: 'Played 64 times after 11 PM. Tame Impala scored your nights.'
},
{
  icon: Coffee,
  title: 'Comfort artist',
  accent: 'text-amber-300',
  tint: 'from-amber-500/15 to-transparent',
  value: 'Frank Ocean',
  sub: 'You return to their catalogue more than anyone else — 3.2× the average.'
},
{
  icon: CloudRain,
  title: 'Most repeated heartbreak song',
  accent: 'text-indigo-300',
  tint: 'from-indigo-500/15 to-transparent',
  value: 'Skinny Love',
  sub: "11 plays in one weekend last winter. We hope you're okay."
},
{
  icon: Zap,
  title: 'Most adventurous week',
  accent: 'text-fuchsia-300',
  tint: 'from-fuchsia-500/15 to-transparent',
  value: 'Apr 14 – 20',
  sub: '34 new artists in 7 days. Your widest exploration on record.'
},
{
  icon: Flame,
  title: 'Longest genre streak',
  accent: 'text-orange-300',
  tint: 'from-orange-500/15 to-transparent',
  value: 'Soul · 23 days',
  sub: 'For three weeks straight, nothing else got a look in.'
}];

const HIDDEN_GEMS = [
{
  tag: 'Least popular favorite',
  title: 'Water Underground',
  artist: 'Real Estate',
  meta: "Only 4,200 monthly listeners — you're in their top 1%.",
  color: 'from-cyan-400 to-blue-500'
},
{
  tag: 'Underrated artist',
  title: 'Cleo Sol',
  artist: 'Soul',
  meta: '187 plays this season — yet barely on the charts.',
  color: 'from-amber-400 to-orange-500'
},
{
  tag: 'Most unique discovery',
  title: 'Tadow',
  artist: 'FKJ & Masego',
  meta: '99.4% of users have never heard this.',
  color: 'from-orange-400 to-amber-500'
},
{
  tag: 'Surprise track',
  title: 'Glory',
  artist: 'Common',
  meta: "You don't usually go this old-school. Then it landed.",
  color: 'from-yellow-500 to-amber-600'
},
{
  tag: 'Niche genre favorite',
  title: 'Marea',
  artist: 'Fred again..',
  meta: 'You went deep on UK garage in Q2.',
  color: 'from-emerald-400 to-cyan-500'
}];

const FUN_CARDS = [
{
  icon: Star,
  big: '4 years',
  label: 'younger',
  sub: "Your music age is 22 — but your real age is 26. You're still listening like a college kid."
},
{
  icon: Clock,
  big: 'Stronger',
  label: 'Oldest favorite',
  sub: 'Released July 31, 2007. Still in heavy rotation 18 years later.'
},
{
  icon: TrendingUp,
  big: '3 days',
  label: 'Shortest obsession',
  sub: 'You played "Espresso" 28 times. Then never again.'
},
{
  icon: CloudRain,
  big: 'Indie Folk',
  label: 'Your rainy-day genre',
  sub: 'Whenever the weather drops below 12°C, your taste follows.'
},
{
  icon: Moon,
  big: 'Saoirse',
  label: 'Your midnight anthem',
  sub: 'Played 41 times between 11:45 PM and 1:00 AM.'
},
{
  icon: Repeat,
  big: 'LUNCH ×17',
  label: 'Accidental repeat',
  sub: 'On April 12th, you somehow played the same song 17 times in a row.'
}];

const TASTE_MONTHS = [
{
  id: 'jan',
  label: 'Jan',
  mood: 'Reflective',
  topGenre: 'Indie',
  shift: 'Steady',
  accent: 'from-blue-500 to-indigo-500'
},
{
  id: 'feb',
  label: 'Feb',
  mood: 'Melancholic',
  topGenre: 'Folk',
  shift: '+R&B',
  accent: 'from-indigo-500 to-violet-500'
},
{
  id: 'mar',
  label: 'Mar',
  mood: 'Restless',
  topGenre: 'Electronic',
  shift: '+47% new',
  accent: 'from-cyan-400 to-blue-500'
},
{
  id: 'apr',
  label: 'Apr',
  mood: 'Euphoric',
  topGenre: 'Hip-hop',
  shift: '+Soul',
  accent: 'from-fuchsia-500 to-pink-500'
},
{
  id: 'may',
  label: 'May',
  mood: 'Warm',
  topGenre: 'Soul',
  shift: 'Deepening',
  accent: 'from-amber-400 to-orange-500'
},
{
  id: 'jun',
  label: 'Jun',
  mood: 'Playful',
  topGenre: 'Pop',
  shift: 'Lighter',
  accent: 'from-rose-400 to-pink-500'
},
{
  id: 'jul',
  label: 'Jul',
  mood: 'Bright',
  topGenre: 'Afrobeats',
  shift: '+Dance',
  accent: 'from-emerald-400 to-teal-500'
},
{
  id: 'aug',
  label: 'Aug',
  mood: 'Nostalgic',
  topGenre: 'R&B',
  shift: 'Looking back',
  accent: 'from-pink-500 to-orange-400'
},
{
  id: 'sep',
  label: 'Sep',
  mood: 'Focused',
  topGenre: 'Jazz',
  shift: '−noise',
  accent: 'from-violet-500 to-indigo-500'
},
{
  id: 'oct',
  label: 'Oct',
  mood: 'Cinematic',
  topGenre: 'Indie',
  shift: '+Folk',
  accent: 'from-orange-500 to-red-500'
},
{
  id: 'nov',
  label: 'Nov',
  mood: 'Cozy',
  topGenre: 'Soul',
  shift: 'Warmer',
  accent: 'from-amber-500 to-yellow-500'
},
{
  id: 'dec',
  label: 'Dec',
  mood: 'Reflective',
  topGenre: 'Indie',
  shift: 'Looping back',
  accent: 'from-blue-500 to-purple-500'
}];

const STORY_SLIDES = [
{
  headline: 'This month sounded hopeful.',
  body: 'Energy scores rose 18% — your highest stretch since spring. Major-key tracks doubled in your rotation.',
  accent: 'from-emerald-500/40 via-spotify/30 to-teal-500/20'
},
{
  headline: 'You were most nostalgic in August.',
  body: '64% of plays were tracks released before 2015. Old loves came home for the summer.',
  accent: 'from-pink-500/40 via-orange-500/30 to-amber-500/20'
},
{
  headline: 'Your playlists got calmer over the past year.',
  body: "Tempo dropped from 124 BPM to 102 BPM on average. You've been slowing down — and the music followed.",
  accent: 'from-indigo-500/40 via-violet-500/30 to-fuchsia-500/20'
}];

// Music DNA nodes — deterministic positions
const DNA_NODES = [
{
  id: 'soul',
  label: 'Soul',
  x: 50,
  y: 50,
  r: 28,
  color: '#F472B6'
},
{
  id: 'indie',
  label: 'Indie',
  x: 22,
  y: 35,
  r: 22,
  color: '#1DB954'
},
{
  id: 'hiphop',
  label: 'Hip-hop',
  x: 78,
  y: 32,
  r: 24,
  color: '#7C3AED'
},
{
  id: 'rnb',
  label: 'R&B',
  x: 30,
  y: 72,
  r: 20,
  color: '#F59E0B'
},
{
  id: 'jazz',
  label: 'Jazz',
  x: 70,
  y: 75,
  r: 18,
  color: '#3B82F6'
},
{
  id: 'electronic',
  label: 'Electronic',
  x: 88,
  y: 58,
  r: 14,
  color: '#22D3EE'
},
{
  id: 'folk',
  label: 'Folk',
  x: 12,
  y: 58,
  r: 12,
  color: '#A78BFA'
},
{
  id: 'afrobeats',
  label: 'Afrobeats',
  x: 55,
  y: 14,
  r: 14,
  color: '#FB7185'
}];

const DNA_EDGES: [string, string, number][] = [
['soul', 'rnb', 0.9],
['soul', 'indie', 0.75],
['soul', 'hiphop', 0.7],
['soul', 'jazz', 0.6],
['indie', 'folk', 0.7],
['hiphop', 'electronic', 0.55],
['hiphop', 'rnb', 0.65],
['jazz', 'electronic', 0.4],
['indie', 'rnb', 0.5],
['soul', 'afrobeats', 0.5],
['hiphop', 'afrobeats', 0.55]];

// ---------- HELPERS ----------
function findNode(id: string) {
  return DNA_NODES.find((n) => n.id === id)!;
}
// ---------- SECTIONS ----------
function InsightsHero() {
  // 28 deterministic particles
  const particles = Array.from({
    length: 28
  }).map((_, i) => ({
    left: i * 13.37 % 100,
    top: i * 7.91 % 100,
    delay: i % 7 * 0.4,
    size: 2 + i * 3 % 4,
    duration: 5 + i * 1.7 % 4
  }));
  return (
    <section className="relative pt-2 pb-4">
      {/* Aurora background */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-spotify/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-10 -left-10 w-[420px] h-[420px] bg-violet-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-fuchsia-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Particles */}
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
            y: [-6, 6, -6],
            opacity: [0.2, 0.7, 0.2]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut'
          }} />

        )}
      </div>

      {/* Waveform svg */}
      <svg
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 w-full h-40 opacity-30 pointer-events-none"
        viewBox="0 0 1440 200"
        fill="none">
        
        <defs>
          <linearGradient
            id="hero-wave"
            x1="0"
            y1="0"
            x2="1440"
            y2="0"
            gradientUnits="userSpaceOnUse">
            
            <stop offset="0" stopColor="#1DB954" stopOpacity="0" />
            <stop offset="0.5" stopColor="#1DB954" />
            <stop offset="1" stopColor="#7C3AED" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M0 100 C 240 30, 240 170, 480 100 S 720 30, 960 100 S 1200 170, 1440 100"
          stroke="url(#hero-wave)"
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
          <Sparkles size={12} className="text-spotify" />
          AI-generated insights
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-[1.05]">
          Your music{' '}
          <span className="font-serif-display italic font-normal text-spotify/90">
            insights
          </span>
          .
        </h1>
        <p className="text-lg text-white/60 max-w-xl leading-relaxed">
          Patterns, moods, and stories hidden in your listening habits —
          surfaced from over 14,000 plays.
        </p>
      </div>
    </section>);

}
function PrimaryInsightCards() {
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Music Age */}
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
            margin: '-50px'
          }}
          transition={{
            duration: 0.5
          }}
          className="glass-card p-8 relative overflow-hidden">
          
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-blue-500/20 blur-[100px] pointer-events-none" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-3">
              Music Age
            </div>
            <div className="flex items-end gap-6 mb-6">
              <div className="relative w-32 h-32 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="72%"
                    outerRadius="100%"
                    data={[
                    {
                      value: 76,
                      fill: '#3B82F6'
                    }]
                    }
                    startAngle={90}
                    endAngle={-270}>
                    
                    <RadialBar
                      background={{
                        fill: 'rgba(255,255,255,0.05)'
                      }}
                      dataKey="value"
                      cornerRadius={20} />
                    
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-serif-display">22</span>
                  <span className="text-[10px] uppercase tracking-widest text-white/40">
                    years
                  </span>
                </div>
              </div>
              <div className="pb-2">
                <h3 className="text-2xl font-bold mb-2">
                  Your music age is 22.
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Your favorite tracks average a 2022 release year — four years
                  younger than you are.
                </p>
              </div>
            </div>
            <div className="h-14 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={AGE_TREND}>
                  <defs>
                    <linearGradient id="age-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    dataKey="v"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#age-grad)" />
                  
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Listening Personality */}
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
            margin: '-50px'
          }}
          transition={{
            duration: 0.5,
            delay: 0.1
          }}
          className="glass-card p-8 relative overflow-hidden">
          
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-violet-500/25 blur-[100px] pointer-events-none" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-3">
              Listening personality
            </div>
            <div className="flex items-start gap-6 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/30 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                <Moon size={32} className="text-violet-200" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-3xl font-serif-display italic text-violet-200 mb-2 leading-tight">
                  The Night Explorer
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  68% of your discovery happens after 10 PM. You find your sound
                  when the rest of the world goes quiet.
                </p>
              </div>
            </div>

            {/* abstract emotional graphic */}
            <div className="flex items-end gap-1 h-12 mt-4">
              {Array.from({
                length: 36
              }).map((_, i) => {
                const h = 20 + Math.cos((i - 24) * 0.45) * 60;
                const isNight = i > 22 || i < 8;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm"
                    style={{
                      height: `${Math.max(8, h)}%`,
                      backgroundColor: isNight ?
                      'rgba(167,139,250,0.85)' :
                      'rgba(255,255,255,0.12)'
                    }} />);


              })}
            </div>
            <div className="flex justify-between text-[10px] text-white/40 mt-2">
              <span>0:00</span>
              <span>12:00</span>
              <span>23:59</span>
            </div>
          </div>
        </motion.div>

        {/* Emotional Profile */}
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
            margin: '-50px'
          }}
          transition={{
            duration: 0.5,
            delay: 0.15
          }}
          className="glass-card p-8 relative overflow-hidden">
          
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-rose-500/20 blur-[100px] pointer-events-none" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-3">
              Emotional profile
            </div>
            <h3 className="text-2xl font-bold mb-1">
              You feel things deeply through music.
            </h3>
            <p className="text-sm text-white/60 mb-4">
              High energy and high nostalgia — a rare combination.
            </p>

            <div className="h-56 -mx-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={MOOD_RADAR} outerRadius="72%">
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{
                      fill: 'rgba(255,255,255,0.55)',
                      fontSize: 11
                    }} />
                  
                  <Radar
                    dataKey="value"
                    stroke="#F472B6"
                    fill="#F472B6"
                    fillOpacity={0.35}
                    strokeWidth={2} />
                  
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Favorite Era */}
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
            margin: '-50px'
          }}
          transition={{
            duration: 0.5,
            delay: 0.2
          }}
          className="glass-card p-8 relative overflow-hidden">
          
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-spotify/20 blur-[100px] pointer-events-none" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-3">
              Favorite era
            </div>
            <h3 className="text-2xl font-bold mb-1">
              You belong in the{' '}
              <span className="font-serif-display italic text-spotify/90">
                2010s
              </span>
              .
            </h3>
            <p className="text-sm text-white/60 mb-6">
              42% of your listening lives in this decade — the golden age of
              indie soul and hip-hop revival.
            </p>

            {/* Decade timeline */}
            <div className="flex items-end gap-2 h-24 mb-3">
              {ERA_DATA.map((e) =>
              <div
                key={e.label}
                className="flex-1 flex flex-col items-center justify-end gap-1">
                
                  <div
                  className={`w-full rounded-t-md ${e.active ? 'bg-spotify shadow-[0_0_22px_-4px_rgba(29,185,84,0.7)]' : 'bg-white/10'}`}
                  style={{
                    height: `${e.value}%`
                  }} />
                
                  <span
                  className={`text-[10px] font-medium ${e.active ? 'text-spotify' : 'text-white/40'}`}>
                  
                    {e.label}
                  </span>
                </div>
              )}
            </div>

            {/* Decade album collage */}
            <div className="flex gap-2 mt-4">
              {[
              'from-pink-500 to-orange-400',
              'from-purple-500 to-indigo-500',
              'from-emerald-500 to-teal-400',
              'from-amber-400 to-orange-500',
              'from-blue-500 to-cyan-500'].
              map((c, i) =>
              <div
                key={i}
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${c} ring-1 ring-white/10 shadow-md`}
                style={{
                  marginLeft: i === 0 ? 0 : -10,
                  transform: `rotate(${i % 2 === 0 ? -4 : 4}deg)`
                }}>
                
                  <div className="w-full h-full rounded-lg bg-black/15" />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>);

}
function PersonalityInsights() {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Personality insights
          </h2>
          <p className="text-sm text-white/50">
            Eight things we noticed about the way you listen.
          </p>
        </div>
        <span className="hidden md:inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/40">
          <Sparkles size={11} className="text-spotify" /> EchoAI · v2
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {PERSONALITY_CARDS.map((card, i) =>
        <motion.div
          key={card.title}
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
            delay: Math.min(i * 0.05, 0.4)
          }}
          className="glass-card p-6 relative overflow-hidden hover:-translate-y-0.5 transition-transform group">
          
            <div
            className={`absolute inset-0 bg-gradient-to-b ${card.tint} opacity-60 pointer-events-none`} />
          
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div
                className={`w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center ${card.accent}`}>
                
                  <card.icon size={16} strokeWidth={1.8} />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-white/35">
                  {card.title}
                </span>
              </div>
              <div className={`text-xl font-semibold mb-2 ${card.accent}`}>
                {card.value}
              </div>
              <p className="text-xs text-white/55 leading-relaxed">
                {card.sub}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>);

}
function MusicDNA() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Your music DNA</h2>
        <p className="text-sm text-white/50">
          Genres mapped by how often you cross between them.
        </p>
      </div>

      <div className="glass-card p-6 md:p-10 relative overflow-hidden">
        {/* Aurora */}
        <div className="absolute -top-40 -left-20 w-[500px] h-[500px] bg-spotify/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-fuchsia-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 items-center">
          {/* Graph */}
          <div className="relative w-full aspect-square max-w-[560px] mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                {DNA_EDGES.map(([a, b], i) =>
                <linearGradient
                  key={i}
                  id={`edge-${i}`}
                  gradientUnits="userSpaceOnUse"
                  x1={findNode(a).x}
                  y1={findNode(a).y}
                  x2={findNode(b).x}
                  y2={findNode(b).y}>
                  
                    <stop
                    offset="0%"
                    stopColor={findNode(a).color}
                    stopOpacity="0.7" />
                  
                    <stop
                    offset="100%"
                    stopColor={findNode(b).color}
                    stopOpacity="0.7" />
                  
                  </linearGradient>
                )}
              </defs>

              {/* Edges */}
              {DNA_EDGES.map(([a, b, w], i) => {
                const na = findNode(a);
                const nb = findNode(b);
                return (
                  <motion.line
                    key={i}
                    x1={na.x}
                    y1={na.y}
                    x2={nb.x}
                    y2={nb.y}
                    stroke={`url(#edge-${i})`}
                    strokeWidth={w * 0.8}
                    strokeLinecap="round"
                    initial={{
                      pathLength: 0,
                      opacity: 0
                    }}
                    whileInView={{
                      pathLength: 1,
                      opacity: 0.6
                    }}
                    viewport={{
                      once: true
                    }}
                    transition={{
                      duration: 1.2,
                      delay: i * 0.08,
                      ease: 'easeOut'
                    }} />);


              })}

              {/* Nodes */}
              {DNA_NODES.map((n, i) =>
              <motion.g
                key={n.id}
                initial={{
                  opacity: 0,
                  scale: 0.6
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1
                }}
                viewport={{
                  once: true
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.4 + i * 0.06
                }}>
                
                  <motion.circle
                  cx={n.x}
                  cy={n.y}
                  r={n.r / 4}
                  fill={n.color}
                  fillOpacity={0.15}
                  animate={{
                    r: [n.r / 4, n.r / 4 + 1.5, n.r / 4]
                  }}
                  transition={{
                    duration: 4 + i * 0.3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }} />
                
                  <circle cx={n.x} cy={n.y} r={n.r / 8} fill={n.color} />
                  <text
                  x={n.x}
                  y={n.y - n.r / 5 - 1.5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="2.4"
                  fontWeight={500}
                  style={{
                    letterSpacing: 0.1
                  }}>
                  
                    {n.label}
                  </text>
                </motion.g>
              )}
            </svg>
          </div>

          {/* Side legend */}
          <div className="space-y-5">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                Core cluster
              </div>
              <div className="text-lg font-semibold">Soul · R&B · Hip-hop</div>
              <p className="text-xs text-white/50 mt-1">
                Your gravitational center — 64% of cross-genre listens happen
                here.
              </p>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                Strongest tie
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: '#F472B6'
                  }} />
                
                Soul
                <span className="text-white/30">↔</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: '#F59E0B'
                  }} />
                
                R&B
                <span className="text-white/50 ml-1">· 0.9</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                Emerging tie
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: '#7C3AED'
                  }} />
                
                Hip-hop
                <span className="text-white/30">↔</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: '#FB7185'
                  }} />
                
                Afrobeats
                <span className="text-spotify ml-1">· +28%</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
                Outlier
              </div>
              <div className="text-sm">
                <span className="font-medium">Nu-jazz</span>
                <span className="text-white/50">
                  {' '}
                  · plays alone, but plays often.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}
function TasteEvolution() {
  const [active, setActive] = useState('aug');
  const month = TASTE_MONTHS.find((m) => m.id === active) || TASTE_MONTHS[0];
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Taste evolution</h2>
        <p className="text-sm text-white/50">
          Tap a month to see how your sound shifted.
        </p>
      </div>

      <div className="glass-card p-6 md:p-8 relative overflow-hidden">
        <div
          className={`absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-[140px] opacity-30 bg-gradient-to-br ${month.accent} pointer-events-none transition-all duration-700`} />
        

        {/* Timeline strip */}
        <div className="relative mb-10">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2" />
          <div className="relative flex items-center gap-2 md:gap-4 overflow-x-auto hide-scrollbar pb-2">
            {TASTE_MONTHS.map((m) =>
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              className="relative flex flex-col items-center gap-2 shrink-0 group focus:outline-none px-1">
              
                <span
                className={`text-xs font-medium transition-colors ${active === m.id ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
                
                  {m.label}
                </span>
                <div className="relative w-3 h-3 flex items-center justify-center">
                  <div
                  className={`w-1.5 h-1.5 rounded-full transition-all ${active === m.id ? 'bg-white scale-100' : 'bg-white/25 group-hover:bg-white/60'}`} />
                
                  {active === m.id &&
                <motion.div
                  layoutId="taste-active"
                  className="absolute inset-0 rounded-full border-2 border-spotify/70"
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 28
                  }} />

                }
                </div>
              </button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{
              opacity: 0,
              y: 12
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -8
            }}
            transition={{
              duration: 0.35
            }}
            className="relative grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8 items-center">
            
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
                {month.label} 2024
              </div>
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                You felt{' '}
                <span className="font-serif-display italic text-white/90">
                  {month.mood.toLowerCase()}
                </span>{' '}
                this month.
              </h3>

              <div className="grid grid-cols-3 gap-4 mb-2">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                    Top genre
                  </div>
                  <div className="text-base font-medium">{month.topGenre}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                    Mood
                  </div>
                  <div className="text-base font-medium">{month.mood}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                    Shift
                  </div>
                  <div className="text-base font-medium text-spotify">
                    {month.shift}
                  </div>
                </div>
              </div>

              {/* mini drift chart */}
              <div className="h-16 mt-6 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={Array.from({
                      length: 14
                    }).map((_, i) => ({
                      v: 50 + Math.sin((i + active.charCodeAt(0)) * 0.6) * 30
                    }))}>
                    
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke="#1DB954"
                      strokeWidth={2}
                      dot={false} />
                    
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* album collage */}
            <div className="grid grid-cols-3 gap-2 mx-auto">
              {Array.from({
                length: 9
              }).map((_, i) =>
              <div
                key={i}
                className={`aspect-square rounded-lg bg-gradient-to-br ${month.accent} ring-1 ring-white/10 shadow-md`}
                style={{
                  opacity: 0.55 + i * 11 % 5 * 0.08
                }}>
                
                  <div className="w-full h-full rounded-lg bg-black/15" />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>);

}
function HiddenGems() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Hidden gems</h2>
        <p className="text-sm text-white/50">
          The corners of your library most people don&aps;t see.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {HIDDEN_GEMS.map((g, i) =>
        <motion.div
          key={g.title}
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
          className="glass-card p-5 hover:-translate-y-1 transition-transform">
          
            <div
            className={`relative w-full aspect-square rounded-xl bg-gradient-to-br ${g.color} mb-4 overflow-hidden ring-1 ring-white/10 shadow-md`}>
            
              <div className="absolute inset-0 bg-black/15" />
              <Gem
              size={16}
              className="absolute bottom-3 right-3 text-white/70" />
            
              <span className="absolute top-3 left-3 text-[9px] uppercase tracking-widest font-medium px-2 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/90">
                {g.tag}
              </span>
            </div>
            <div className="text-sm font-semibold truncate">{g.title}</div>
            <div className="text-xs text-white/50 truncate mb-3">
              {g.artist}
            </div>
            <div className="text-[11px] text-white/45 leading-relaxed">
              {g.meta}
            </div>
          </motion.div>
        )}
      </div>
    </section>);

}
function FunInsights() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Fun facts</h2>
        <p className="text-sm text-white/50">The lighter side of the data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {FUN_CARDS.map((c, i) =>
        <motion.div
          key={c.label}
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
          className="glass-card p-6 relative overflow-hidden group hover:-translate-y-0.5 transition-transform">
          
            <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-spotify/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative flex items-start justify-between mb-6">
              <c.icon size={18} className="text-white/50" strokeWidth={1.8} />
              <span className="text-[10px] uppercase tracking-widest text-white/40">
                {c.label}
              </span>
            </div>
            <div className="text-4xl font-serif-display mb-3 leading-tight">
              {c.big}
            </div>
            <p className="text-sm text-white/55 leading-relaxed">{c.sub}</p>
          </motion.div>
        )}
      </div>
    </section>);

}
function EmotionalStorytelling() {
  const [idx, setIdx] = useState(0);
  const slide = STORY_SLIDES[idx];
  return (
    <section className="pb-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">A story for you</h2>
        <p className="text-sm text-white/50">
          What the patterns are quietly saying.
        </p>
      </div>

      <div className="relative glass-card overflow-hidden p-8 md:p-14 min-h-[360px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            transition={{
              duration: 0.5
            }}
            className={`absolute inset-0 bg-gradient-to-br ${slide.accent} pointer-events-none`} />
          
        </AnimatePresence>

        <div className="relative max-w-2xl">
          <div className="flex items-center gap-1.5 mb-8">
            {STORY_SLIDES.map((_, i) =>
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="group flex-1 max-w-[80px]"
              aria-label={`Slide ${i + 1}`}>
              
                <div
                className={`h-0.5 rounded-full transition-all ${i === idx ? 'bg-white' : 'bg-white/20 group-hover:bg-white/40'}`} />
              
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
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
                duration: 0.5
              }}>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/[0.05] text-[10px] uppercase tracking-widest text-white/70 mb-6">
                <CalendarHeart size={11} className="text-white/80" />
                Chapter {String(idx + 1).padStart(2, '0')} /{' '}
                {String(STORY_SLIDES.length).padStart(2, '0')}
              </div>
              <h3 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.05] mb-6">
                {slide.headline}
              </h3>
              <p className="text-base md:text-lg text-white/75 leading-relaxed max-w-xl">
                {slide.body}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center gap-3">
            <button
              onClick={() => setIdx((i) => (i + 1) % STORY_SLIDES.length)}
              className="inline-flex items-center gap-2 bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5">
              
              Next chapter
              <ArrowUpRight size={14} />
            </button>
            <button className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors">
              Share this
            </button>
          </div>
        </div>
      </div>
    </section>);

}
// ---------- PAGE ----------
export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-background text-white selection:bg-spotify/30 selection:text-white flex overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col overflow-x-hidden">
        <TopNav />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-10 w-full">
          {/* max-w constraint lives here, not on <main> */}
          <div className="max-w-[1400px] mx-auto relative overflow-x-hidden">
            {/* Page-level ambient blobs */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
            <div className="absolute top-[40%] left-[-20%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 right-[-10%] w-[700px] h-[700px] bg-fuchsia-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

            <div className="relative z-10 flex flex-col gap-14">
              <InsightsHero />
              <PrimaryInsightCards />
              <PersonalityInsights />
              <MusicDNA />
              <TasteEvolution />
              <HiddenGems />
              <FunInsights />
              <EmotionalStorytelling />
            </div>
          </div>
        </main>
      </div>
    </div>);

}