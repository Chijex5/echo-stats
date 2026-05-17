"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Sparkles, History, HeartPulse } from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar } from
'recharts';
const moodData = [
{
  name: 'A',
  value: 30
},
{
  name: 'B',
  value: 40
},
{
  name: 'C',
  value: 35
},
{
  name: 'D',
  value: 50
},
{
  name: 'E',
  value: 45
},
{
  name: 'F',
  value: 60
},
{
  name: 'G',
  value: 55
},
{
  name: 'H',
  value: 70
},
{
  name: 'I',
  value: 65
},
{
  name: 'J',
  value: 80
},
{
  name: 'K',
  value: 75
},
{
  name: 'L',
  value: 90
}];

const ageData = [
{
  name: 'Age',
  value: 75,
  fill: '#3B82F6'
}];

export function Features() {
  return (
    <section id="features" className="py-32 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-20">
          <motion.h2
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
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            
            A new way to{' '}
            <span className="font-serif-display italic text-white/80">
              hear
            </span>{' '}
            yourself
          </motion.h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            We analyze thousands of data points from your listening history to
            uncover the patterns you never knew existed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feature 1: Music Age */}
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
              delay: 0.1
            }}
            className="glass-card p-8 md:p-10 relative overflow-hidden group">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] group-hover:bg-blue-500/20 transition-colors duration-500" />

            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-8 border border-blue-500/20">
              <CalendarDays size={24} />
            </div>

            <div className="h-32 mb-8 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="20%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="100%"
                  barSize={10}
                  data={ageData}
                  startAngle={180}
                  endAngle={0}>
                  
                  <RadialBar
                    background={{
                      fill: 'rgba(255,255,255,0.05)'
                    }}
                    dataKey="value"
                    cornerRadius={10} />
                  
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute left-[20%] top-[50%] -translate-x-1/2 -translate-y-1/4 text-center">
                <span className="text-3xl font-serif-display block">28</span>
                <span className="text-[10px] text-white/40 uppercase tracking-wider">
                  Years
                </span>
              </div>
            </div>

            <h3 className="text-2xl font-semibold mb-2">Music Age</h3>
            <p className="text-white/50 leading-relaxed">
              Discover if your soul is stuck in the 80s or living in the future
              based on your sonic footprint.
            </p>
          </motion.div>

          {/* Feature 2: Song of the Day */}
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
              delay: 0.2
            }}
            className="glass-card p-8 md:p-10 relative overflow-hidden group">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-colors duration-500" />

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-8 border border-emerald-500/20">
              <Sparkles size={24} />
            </div>

            <div className="h-32 mb-8 flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-white/10 rounded mb-2" />
                <div className="h-3 w-1/2 bg-white/5 rounded mb-4" />
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) =>
                  <div
                    key={i}
                    className="h-1 w-full bg-emerald-500/40 rounded-full" />

                  )}
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-semibold mb-2">Forgotten Favorites</h3>
            <p className="text-white/50 leading-relaxed">
              We unearth tracks you used to have on repeat but haven&apos;t played in
              years.
            </p>
          </motion.div>

          {/* Feature 3: Time Machine */}
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
              delay: 0.3
            }}
            className="glass-card p-8 md:p-10 relative overflow-hidden group">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] group-hover:bg-purple-500/20 transition-colors duration-500" />

            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-8 border border-purple-500/20">
              <History size={24} />
            </div>

            <div className="h-32 mb-8 flex flex-col justify-center">
              <div className="relative w-full h-1 bg-white/10 rounded-full mb-4">
                <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-purple-500/0 to-purple-500 rounded-full" />
                <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
              </div>
              <div className="flex justify-between text-xs text-white/40 font-medium">
                <span>2018</span>
                <span>2021</span>
                <span className="text-purple-400">Now</span>
              </div>
            </div>

            <h3 className="text-2xl font-semibold mb-2">Time Machine</h3>
            <p className="text-white/50 leading-relaxed">
              Travel back to any month in your history and see exactly what was
              soundtracking your life.
            </p>
          </motion.div>

          {/* Feature 4: Emotional Insights */}
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
              delay: 0.4
            }}
            className="glass-card p-8 md:p-10 relative overflow-hidden group">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] group-hover:bg-pink-500/20 transition-colors duration-500" />

            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-400 mb-8 border border-pink-500/20">
              <HeartPulse size={24} />
            </div>

            <div className="h-32 mb-8 -mx-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moodData}>
                  <defs>
                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#ec4899"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMood)" />
                  
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <h3 className="text-2xl font-semibold mb-2">Emotional Resonance</h3>
            <p className="text-white/50 leading-relaxed">
              See the emotional arc of your year. We map the acoustic features
              of your tracks to your mood.
            </p>
          </motion.div>
        </div>
      </div>
    </section>);

}