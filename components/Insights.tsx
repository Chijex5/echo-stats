"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Gem, Compass, HeartPulse } from 'lucide-react';
export function Insights() {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          Discovery Insights
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            once: true
          }}
          transition={{
            duration: 0.5
          }}
          className="glass-card p-6 relative overflow-hidden group">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] group-hover:bg-emerald-500/20 transition-colors" />
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <Gem size={20} />
          </div>
          <h3 className="font-semibold text-lg mb-1">Hidden Gem</h3>
          <p className="text-sm text-white/60 mb-4">
            You&apos;re in the top 1% of listeners for this underground track.
          </p>
          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <p className="font-medium text-sm">Water Underground</p>
            <p className="text-xs text-white/40">Real Estate</p>
          </div>
        </motion.div>

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
            once: true
          }}
          transition={{
            duration: 0.5,
            delay: 0.1
          }}
          className="glass-card p-6 relative overflow-hidden group">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] group-hover:bg-purple-500/20 transition-colors" />
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
            <Compass size={20} />
          </div>
          <h3 className="font-semibold text-lg mb-1">Genre Drift</h3>
          <p className="text-sm text-white/60 mb-4">
            Your taste shifted significantly this month.
          </p>
          <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/5">
            <span className="text-xs text-white/50">Hip Hop</span>
            <div className="flex-1 h-px bg-white/10 mx-2 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t border-r border-white/30 rotate-45" />
            </div>
            <span className="text-xs font-medium text-purple-400">
              Neo Soul
            </span>
          </div>
        </motion.div>

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
            once: true
          }}
          transition={{
            duration: 0.5,
            delay: 0.2
          }}
          className="glass-card p-6 relative overflow-hidden group">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-[40px] group-hover:bg-pink-500/20 transition-colors" />
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 mb-4">
            <HeartPulse size={20} />
          </div>
          <h3 className="font-semibold text-lg mb-1">Emotional Profile</h3>
          <p className="text-sm text-white/60 mb-4">
            Your recent listening leans heavily towards high energy.
          </p>
          <div className="flex gap-1 h-10">
            <div className="w-1/4 bg-blue-500/20 rounded-l-md" />
            <div className="w-1/4 bg-purple-500/40" />
            <div className="w-2/4 bg-pink-500/80 rounded-r-md relative">
              <div className="absolute -top-6 right-2 text-[10px] font-bold text-pink-400">
                High Energy
              </div>
            </div>
          </div>
        </motion.div>

        {/* Favorite Decade */}
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
            once: true
          }}
          transition={{
            duration: 0.5,
            delay: 0.3
          }}
          className="glass-card p-6 relative overflow-hidden group">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] group-hover:bg-indigo-500/20 transition-colors" />
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5">
              
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M12 7v5l4 2" />
            </svg>
          </div>
          <h3 className="font-semibold text-lg mb-1">Favorite Decade</h3>
          <p className="text-sm text-white/60 mb-4">
            You&apos;re heavily anchored in the 2010s sound.
          </p>
          <div className="flex items-end gap-1 h-12 mb-2">
            {[10, 15, 25, 40, 100, 60].map((h, i) =>
            <div
              key={i}
              className={`flex-1 rounded-t-sm ${i === 4 ? 'bg-spotify' : 'bg-white/10'}`}
              style={{
                height: `${h}%`
              }} />

            )}
          </div>
          <div className="text-xs font-medium text-spotify">
            2010s · 42% of listening
          </div>
        </motion.div>

        {/* First Song This Year */}
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
            once: true
          }}
          transition={{
            duration: 0.5,
            delay: 0.4
          }}
          className="glass-card p-6 relative overflow-hidden group">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] group-hover:bg-amber-500/20 transition-colors" />
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5">
              
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          </div>
          <h3 className="font-semibold text-lg mb-1">First Song This Year</h3>
          <p className="text-sm text-white/60 mb-4">
            Setting the tone for 2026.
          </p>
          <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/5">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 shrink-0" />
            <div>
              <p className="font-medium text-sm truncate">New Year&apos;s Day</p>
              <p className="text-xs font-serif-display italic text-amber-400">
                Jan 1, 2026 · 12:03 AM
              </p>
            </div>
          </div>
        </motion.div>

        {/* Longest Repeat Streak */}
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
            once: true
          }}
          transition={{
            duration: 0.5,
            delay: 0.5
          }}
          className="glass-card p-6 relative overflow-hidden group">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] group-hover:bg-blue-500/20 transition-colors" />
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5">
              
              <path d="m17 2 4 4-4 4" />
              <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
              <path d="m7 22-4-4 4-4" />
              <path d="M21 13v1a4 4 0 0 1-4 4H3" />
            </svg>
          </div>
          <h3 className="font-semibold text-lg mb-1">Longest Streak</h3>
          <p className="text-sm text-white/60 mb-4">
            You couldn&apos;t get enough of this track.
          </p>
          <div className="mb-2">
            <p className="font-medium text-sm">Million Dollar Baby</p>
            <p className="text-xs text-blue-400">Played 23 days in a row</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {Array.from({
              length: 23
            }).map((_, i) =>
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-blue-400"
              style={{
                opacity: 0.3 + i / 23 * 0.7
              }} />

            )}
          </div>
        </motion.div>
      </div>
    </section>);

}