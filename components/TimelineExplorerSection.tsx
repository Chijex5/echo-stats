"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Disc3 } from "lucide-react";
import { useTimelineExplorer } from "@/lib/hooks/useDashboard";

function TimelineSkeleton() {
  return (
    <div className="glass-card p-6 md:p-8 animate-pulse">
      <div className="h-8 rounded-lg bg-white/10 mb-10" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="h-4 w-36 rounded bg-white/10 mb-4" />
          <div className="h-28 rounded bg-white/[0.06]" />
        </div>
        <div className="lg:col-span-1 rounded-xl bg-white/[0.04] p-5">
          <div className="h-4 w-32 rounded bg-white/10 mb-4" />
          <div className="grid grid-cols-3 gap-1 mb-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-md bg-white/10" />
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-3 rounded bg-white/10" />
            <div className="h-3 w-2/3 rounded bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TimelineExplorerSection() {
  const { data, isLoading, error } = useTimelineExplorer();

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Timeline Explorer</h2>
          <p className="text-sm text-white/50">Drag to explore any moment in your listening history.</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-400/70 mb-4">Could not load timeline data. Please try again.</p>}

      {isLoading || !data ? (
        <TimelineSkeleton />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="glass-card p-6 md:p-8"
        >
          <div className="mb-10">
            <div className="flex justify-between text-xs font-medium text-white/40 mb-2 px-2">
              {data.yearLabels.map((year) => (
                <span key={year}>{year}</span>
              ))}
            </div>
            <div className="relative h-8 bg-white/5 rounded-lg border border-white/10">
              <div className="absolute left-[8%] right-[8%] top-0 bottom-0 bg-spotify/20 border-x-2 border-spotify rounded-sm">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium bg-white/10 px-2 py-1 rounded-md">
                  {data.selectedRange.label} · {data.selectedRange.days} days
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Calendar size={14} className="text-white/50" />
                Listening Density
              </h3>
              <div className="flex gap-1 overflow-x-auto hide-scrollbar pb-2">
                <div className="flex flex-col gap-1 text-[8px] text-white/30 font-medium justify-around pr-2 shrink-0">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                </div>
                <div className="grid grid-rows-7 grid-flow-col gap-1 shrink-0">
                  {data.cells.map((cell) => (
                    <div
                      key={cell.date}
                      title={`${cell.date}: ${cell.plays} plays`}
                      className="w-3 h-3 rounded-sm hover:ring-1 hover:ring-white/50 transition-all"
                      style={{ backgroundColor: `rgba(29, 185, 84, ${cell.intensity})` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-medium mb-4 text-white/80">Snapshot: {data.snapshot.label}</h3>
              <div className="grid grid-cols-3 gap-1 mb-4">
                {data.snapshot.collage.map((color, i) => (
                  <div key={`${color}-${i}`} className={`aspect-square rounded-md bg-gradient-to-br ${color} opacity-80`} />
                ))}
              </div>
              <div className="space-y-2 mb-4">
                {data.snapshot.tracks.length ? (
                  data.snapshot.tracks.map((track, index) => (
                    <div key={`${track.title}-${track.artist}`} className="flex items-center gap-2 text-xs">
                      <span className="text-white/40">{index + 1}.</span>
                      <span className="truncate font-medium">{track.title}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Disc3 size={14} />
                    No plays this month yet.
                  </div>
                )}
              </div>
              <div className="pt-3 border-t border-white/5">
                <span className="text-xs text-white/50 block mb-1">Top Artist</span>
                <span className="text-sm font-medium text-pink-400">{data.snapshot.topArtist}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
