"use client";

import React from "react";
import { motion } from "framer-motion";
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
  ResponsiveContainer,
} from "recharts";
import { useVisualAnalytics } from "@/lib/hooks/useDashboard";

const genreColors = ["#1DB954", "#7C3AED", "#3B82F6", "#F472B6"];

function ChartSkeleton({ className = "" }: { className?: string }) {
  return <div className={`glass-card p-6 min-h-[250px] animate-pulse bg-white/[0.04] ${className}`} />;
}

export function VisualAnalyticsSection() {
  const { data, isLoading, error } = useVisualAnalytics();

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold tracking-tight mb-6">Visual Analytics</h2>

      {error && <p className="text-sm text-red-400/70 mb-4">Could not load analytics. Please try again.</p>}

      {isLoading || !data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ChartSkeleton className="lg:col-span-2 lg:row-span-2 min-h-[300px]" />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 lg:col-span-2 lg:row-span-2 min-h-[300px] flex flex-col"
          >
            <h3 className="text-sm font-medium text-white/70 mb-6">Stream Timeline</h3>
            <div className="flex-1 -mx-4 -mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.streamData}>
                  <defs>
                    <linearGradient id="colorStream" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1DB954" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#1DB954" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#1DB954" strokeWidth={3} fillOpacity={1} fill="url(#colorStream)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 flex flex-col items-center justify-center min-h-[250px]"
          >
            <h3 className="text-sm font-medium text-white/70 mb-2 w-full text-left">Artist Mix</h3>
            <div className="w-full h-40 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.genreData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                    {data.genreData.map((entry, index) => (
                      <Cell key={`cell-${entry.name}`} fill={genreColors[index % genreColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-serif-display">{data.genreCount}</span>
                <span className="text-[10px] text-white/40 uppercase">Artists</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 min-h-[250px] flex flex-col"
          >
            <h3 className="text-sm font-medium text-white/70 mb-4">Mood Spectrum</h3>
            <div className="flex-1 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.moodData}>
                  <Line type="monotone" dataKey="happy" stroke="#F472B6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="energetic" stroke="#1DB954" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="calm" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="sad" stroke="#7C3AED" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-[10px] text-white/50 mt-2">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-pink-400" /> Late</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-spotify" /> Energy</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400" /> Calm</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 min-h-[250px] flex flex-col"
          >
            <h3 className="text-sm font-medium text-white/70 mb-4">Release Year</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.yearData}>
                  <Bar dataKey="value" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-[10px] text-white/40 mt-2">
              {data.yearData.map((item) => (
                <span key={item.year}>{item.year}</span>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
