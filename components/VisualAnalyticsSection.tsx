"use client";
import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer } from
'recharts';
const streamData = Array.from({
  length: 30
}).map((_, i) => ({
  value: Math.max(10, Math.sin(i / 3) * 50 + 50 + Math.random() * 20)
}));
const genreData = [
{
  name: 'Indie',
  value: 400
},
{
  name: 'Hip Hop',
  value: 300
},
{
  name: 'Pop',
  value: 300
},
{
  name: 'Electronic',
  value: 200
}];

const genreColors = ['#1DB954', '#7C3AED', '#3B82F6', '#F472B6'];
const moodData = Array.from({
  length: 10
}).map((_, i) => ({
  happy: 50 + Math.random() * 30,
  sad: 30 + Math.random() * 20,
  energetic: 60 + Math.random() * 40,
  calm: 40 + Math.random() * 30
}));
const yearData = [
{
  year: '70s',
  value: 5
},
{
  year: '80s',
  value: 15
},
{
  year: '90s',
  value: 25
},
{
  year: '00s',
  value: 45
},
{
  year: '10s',
  value: 85
},
{
  year: '20s',
  value: 100
}];

export function VisualAnalyticsSection() {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold tracking-tight mb-6">
        Visual Analytics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stream Timeline (Large) */}
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
          className="glass-card p-6 lg:col-span-2 lg:row-span-2 min-h-[300px] flex flex-col">
          
          <h3 className="text-sm font-medium text-white/70 mb-6">
            Stream Timeline
          </h3>
          <div className="flex-1 -mx-4 -mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={streamData}>
                <defs>
                  <linearGradient id="colorStream" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1DB954" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1DB954" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#1DB954"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorStream)" />
                
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Genre Mix */}
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
          className="glass-card p-6 flex flex-col items-center justify-center min-h-[250px]">
          
          <h3 className="text-sm font-medium text-white/70 mb-2 w-full text-left">
            Genre Mix
          </h3>
          <div className="w-full h-40 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genreData}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none">
                  
                  {genreData.map((entry, index) =>
                  <Cell
                    key={`cell-${index}`}
                    fill={genreColors[index % genreColors.length]} />

                  )}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-serif-display">7</span>
              <span className="text-[10px] text-white/40 uppercase">
                Genres
              </span>
            </div>
          </div>
        </motion.div>

        {/* Mood Spectrum */}
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
          className="glass-card p-6 min-h-[250px] flex flex-col">
          
          <h3 className="text-sm font-medium text-white/70 mb-4">
            Mood Spectrum
          </h3>
          <div className="flex-1 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodData}>
                <Line
                  type="monotone"
                  dataKey="happy"
                  stroke="#F472B6"
                  strokeWidth={2}
                  dot={false} />
                
                <Line
                  type="monotone"
                  dataKey="energetic"
                  stroke="#1DB954"
                  strokeWidth={2}
                  dot={false} />
                
                <Line
                  type="monotone"
                  dataKey="calm"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false} />
                
                <Line
                  type="monotone"
                  dataKey="sad"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  dot={false} />
                
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[10px] text-white/50 mt-2">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-pink-400" /> Happy
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-spotify" /> Energy
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-400" /> Calm
            </span>
          </div>
        </motion.div>

        {/* Release Year Histogram */}
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
          className="glass-card p-6 min-h-[250px] flex flex-col">
          
          <h3 className="text-sm font-medium text-white/70 mb-4">
            Release Year
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearData}>
                <Bar dataKey="value" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[10px] text-white/40 mt-2">
            <span>70s</span>
            <span>20s</span>
          </div>
        </motion.div>
      </div>
    </section>);

}