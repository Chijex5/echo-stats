"use client";
import React from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown } from
'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
const artists = [
{
  id: 1,
  name: 'Kendrick Lamar',
  genre: 'Hip-hop',
  initials: 'KL',
  color: 'from-red-500 to-orange-500',
  trend: 'up',
  delta: '+12 plays this month',
  data: [
  {
    v: 10
  },
  {
    v: 15
  },
  {
    v: 12
  },
  {
    v: 20
  },
  {
    v: 25
  }]

},
{
  id: 2,
  name: 'Tame Impala',
  genre: 'Indie',
  initials: 'TI',
  color: 'from-purple-500 to-indigo-500',
  trend: 'down',
  delta: '−4 plays vs last',
  data: [
  {
    v: 25
  },
  {
    v: 20
  },
  {
    v: 22
  },
  {
    v: 15
  },
  {
    v: 12
  }]

},
{
  id: 3,
  name: 'Frank Ocean',
  genre: 'R&B',
  initials: 'FO',
  color: 'from-pink-500 to-rose-400',
  trend: 'up',
  delta: '+8 plays this month',
  data: [
  {
    v: 5
  },
  {
    v: 10
  },
  {
    v: 8
  },
  {
    v: 15
  },
  {
    v: 18
  }]

},
{
  id: 4,
  name: 'Fred again..',
  genre: 'Electronic',
  initials: 'FA',
  color: 'from-emerald-400 to-cyan-500',
  trend: 'up',
  delta: '+24 plays this month',
  data: [
  {
    v: 2
  },
  {
    v: 8
  },
  {
    v: 15
  },
  {
    v: 20
  },
  {
    v: 30
  }]

},
{
  id: 5,
  name: 'Billie Eilish',
  genre: 'Pop',
  initials: 'BE',
  color: 'from-blue-500 to-cyan-400',
  trend: 'same',
  delta: 'Steady listening',
  data: [
  {
    v: 15
  },
  {
    v: 16
  },
  {
    v: 15
  },
  {
    v: 17
  },
  {
    v: 15
  }]

},
{
  id: 6,
  name: 'Cleo Sol',
  genre: 'Soul',
  initials: 'CS',
  color: 'from-amber-500 to-orange-400',
  trend: 'up',
  delta: '+15 plays this month',
  data: [
  {
    v: 0
  },
  {
    v: 5
  },
  {
    v: 10
  },
  {
    v: 15
  },
  {
    v: 20
  }]

},
{
  id: 7,
  name: 'Burna Boy',
  genre: 'Afrobeats',
  initials: 'BB',
  color: 'from-green-500 to-emerald-400',
  trend: 'down',
  delta: '−8 plays vs last',
  data: [
  {
    v: 30
  },
  {
    v: 25
  },
  {
    v: 20
  },
  {
    v: 15
  },
  {
    v: 10
  }]

},
{
  id: 8,
  name: 'The Weeknd',
  genre: 'R&B',
  initials: 'TW',
  color: 'from-red-600 to-pink-600',
  trend: 'up',
  delta: '+5 plays this month',
  data: [
  {
    v: 10
  },
  {
    v: 12
  },
  {
    v: 15
  },
  {
    v: 14
  },
  {
    v: 18
  }]

}];

export function TopArtistsSection() {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Top Artists</h2>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft size={16} className="text-white/70" />
          </button>
          <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronRight size={16} className="text-white/70" />
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-4 pb-4 -mx-6 px-6 md:mx-0 md:px-0">
        {artists.map((artist, index) =>
        <motion.div
          key={artist.id}
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
            duration: 0.5,
            delay: index * 0.05
          }}
          className="w-48 shrink-0 snap-start rounded-2xl glass-card p-5 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
          
            <div
            className={`w-20 h-20 rounded-full bg-gradient-to-br ${artist.color} flex items-center justify-center text-2xl font-bold text-white shadow-lg mb-4 relative`}>
            
              {index === 0 &&
            <div className="absolute -inset-1 rounded-full border-2 border-spotify animate-pulse" />
            }
              {artist.initials}
            </div>

            <h3 className="font-semibold text-sm w-full truncate mb-1">
              {artist.name}
            </h3>

            <div className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-medium text-white/60 mb-4">
              {artist.genre}
            </div>

            <div className="w-full h-8 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={artist.data}>
                  <Line
                  type="monotone"
                  dataKey="v"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth={2}
                  dot={false} />
                
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-white/50">
              {artist.trend === 'up' &&
            <TrendingUp size={10} className="text-spotify" />
            }
              {artist.trend === 'down' &&
            <TrendingDown size={10} className="text-red-400" />
            }
              {artist.delta}
            </div>
          </motion.div>
        )}
      </div>
    </section>);

}