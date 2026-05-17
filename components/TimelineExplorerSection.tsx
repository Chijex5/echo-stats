"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Disc3 } from 'lucide-react';
// Generate deterministic heatmap data
const heatmapData = Array.from({
  length: 7 * 52
}).map((_, i) => {
  // Create some patterns
  const week = Math.floor(i / 7);
  const day = i % 7;
  const isWeekend = day === 0 || day === 6;
  const baseIntensity = isWeekend ? 0.6 : 0.2;
  const seasonalBoost = Math.sin(week / 52 * Math.PI * 2) * 0.3;
  const intensity = Math.max(
    0.05,
    Math.min(0.9, baseIntensity + seasonalBoost + (i % 3 === 0 ? 0.2 : 0))
  );
  return intensity;
});
export function TimelineExplorerSection() {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Timeline Explorer
          </h2>
          <p className="text-sm text-white/50">
            Drag to explore any moment in your listening history.
          </p>
        </div>
      </div>

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
          duration: 0.6
        }}
        className="glass-card p-6 md:p-8">
        
        {/* Timeline Strip Mock */}
        <div className="mb-10">
          <div className="flex justify-between text-xs font-medium text-white/40 mb-2 px-2">
            <span>2018</span>
            <span>2019</span>
            <span>2020</span>
            <span>2021</span>
            <span>2022</span>
            <span>2023</span>
            <span>2024</span>
            <span>2025</span>
          </div>
          <div className="relative h-8 bg-white/5 rounded-lg border border-white/10">
            {/* Selected Range Mock */}
            <div className="absolute left-[70%] right-[10%] top-0 bottom-0 bg-spotify/20 border-x-2 border-spotify rounded-sm">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium bg-white/10 px-2 py-1 rounded-md">
                Jun 2024 — Mar 2025 · 187 days
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Heatmap */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Calendar size={14} className="text-white/50" />
              Listening Density
            </h3>
            <div className="flex gap-1 overflow-x-auto hide-scrollbar pb-2">
              {/* Days labels */}
              <div className="flex flex-col gap-1 text-[8px] text-white/30 font-medium justify-around pr-2 shrink-0">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>
              {/* Grid */}
              <div className="grid grid-rows-7 grid-flow-col gap-1 shrink-0">
                {heatmapData.map((intensity, i) =>
                <div
                  key={i}
                  className="w-3 h-3 rounded-sm hover:ring-1 hover:ring-white/50 transition-all"
                  style={{
                    backgroundColor: `rgba(29, 185, 84, ${intensity})`
                  }} />

                )}
              </div>
            </div>
          </div>

          {/* Historical Snapshot */}
          <div className="lg:col-span-1 bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-medium mb-4 text-white/80">
              Snapshot: Aug 2024
            </h3>

            <div className="grid grid-cols-3 gap-1 mb-4">
              {Array.from({
                length: 9
              }).map((_, i) =>
              <div
                key={i}
                className={`aspect-square rounded-md bg-gradient-to-br ${['from-red-500 to-orange-500', 'from-blue-500 to-purple-500', 'from-emerald-400 to-cyan-500', 'from-pink-500 to-rose-400'][i % 4]} opacity-80`} />

              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/40">1.</span>
                <span className="truncate font-medium">Pink + White</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/40">2.</span>
                <span className="truncate font-medium">Nights</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/40">3.</span>
                <span className="truncate font-medium">Ivy</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5">
              <span className="text-xs text-white/50 block mb-1">Top Mood</span>
              <span className="text-sm font-medium text-pink-400">
                Nostalgic
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>);

}