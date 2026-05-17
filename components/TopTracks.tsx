"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Play, TrendingUp, TrendingDown, Minus } from 'lucide-react';
const tracks = [
{
  id: 1,
  title: 'Not Like Us',
  artist: 'Kendrick Lamar',
  plays: 142,
  trend: 'up',
  color: 'from-red-500 to-orange-500'
},
{
  id: 2,
  title: 'LUNCH',
  artist: 'Billie Eilish',
  plays: 98,
  trend: 'up',
  color: 'from-blue-500 to-cyan-500'
},
{
  id: 3,
  title: 'Espresso',
  artist: 'Sabrina Carpenter',
  plays: 87,
  trend: 'down',
  color: 'from-pink-400 to-rose-400'
},
{
  id: 4,
  title: 'Million Dollar Baby',
  artist: 'Tommy Richman',
  plays: 76,
  trend: 'same',
  color: 'from-purple-500 to-indigo-500'
},
{
  id: 5,
  title: 'Good Luck, Babe!',
  artist: 'Chappell Roan',
  plays: 65,
  trend: 'up',
  color: 'from-emerald-400 to-teal-500'
}];

const extendedTracks = [
...tracks,
{
  id: 6,
  title: 'Pink + White',
  artist: 'Frank Ocean',
  plays: 54,
  trend: 'up',
  color: 'from-pink-500 to-orange-400'
},
{
  id: 7,
  title: 'Nights',
  artist: 'Frank Ocean',
  plays: 48,
  trend: 'same',
  color: 'from-purple-600 to-blue-500'
},
{
  id: 8,
  title: 'Water Underground',
  artist: 'Real Estate',
  plays: 42,
  trend: 'up',
  color: 'from-emerald-500 to-teal-400'
},
{
  id: 9,
  title: 'Borderline',
  artist: 'Tame Impala',
  plays: 38,
  trend: 'down',
  color: 'from-indigo-500 to-purple-500'
},
{
  id: 10,
  title: 'Ivy',
  artist: 'Frank Ocean',
  plays: 35,
  trend: 'same',
  color: 'from-rose-400 to-orange-300'
}];

export function TopTracks() {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Top Tracks</h2>
        <button className="text-sm font-medium text-white/50 hover:text-white transition-colors">
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-2">
        {extendedTracks.map((track, index) =>
        <motion.div
          key={track.id}
          initial={{
            opacity: 0,
            x: -20
          }}
          whileInView={{
            opacity: 1,
            x: 0
          }}
          viewport={{
            once: true
          }}
          transition={{
            duration: 0.4,
            delay: index * 0.05
          }}
          className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-all group">
          
            <div className="w-8 text-center text-2xl font-serif-display text-white/20 group-hover:text-white/40 transition-colors">
              {(index + 1).toString().padStart(2, '0')}
            </div>

            <div
            className={`w-12 h-12 rounded-lg bg-gradient-to-br ${track.color} relative overflow-hidden shrink-0 shadow-md`}>
            
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity cursor-pointer">
                <Play size={16} fill="currentColor" className="ml-0.5" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate group-hover:text-spotify transition-colors cursor-pointer">
                {track.title}
              </p>
              <p className="text-xs text-white/50 truncate">{track.artist}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-6 hidden sm:block opacity-50 group-hover:opacity-100 transition-opacity">
                {/* Mock sparkline */}
                <svg
                viewBox="0 0 60 20"
                className="w-full h-full stroke-current text-white/40">
                
                  <path
                  d="M0,15 Q10,5 20,10 T40,15 T60,5"
                  fill="none"
                  strokeWidth="1.5" />
                
                </svg>
              </div>

              <div className="flex items-center gap-1 w-12 justify-end">
                {track.trend === 'up' &&
              <TrendingUp size={14} className="text-spotify" />
              }
                {track.trend === 'down' &&
              <TrendingDown size={14} className="text-red-400" />
              }
                {track.trend === 'same' &&
              <Minus size={14} className="text-white/30" />
              }
              </div>

              <div className="w-8 text-right group-hover:hidden">
                <span className="text-sm font-medium text-white/70">
                  {track.plays}
                </span>
              </div>
              <div className="w-8 text-right hidden group-hover:flex justify-end">
                <button className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:text-spotify transition-colors">
                  <Play size={10} fill="currentColor" className="ml-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>);

}