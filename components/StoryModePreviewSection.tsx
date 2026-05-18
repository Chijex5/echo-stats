"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Share2, Sparkles, Smartphone } from 'lucide-react';
import { useStoryPreview } from '@/lib/hooks/useDashboard';

export function StoryModePreviewSection() {
  const { data, error } = useStoryPreview();
  const slideCount = data?.slideCount ?? 12;
  const newArtists = data?.newArtists ?? 0;
  const platformCopy = data?.platformCopy ?? "Instagram & TikTok";
  const bars = data?.bars.length
    ? data.bars.map((bar) => bar.heightPct)
    : [40, 70, 45, 90, 60, 85, 100, 50];

  return (
    <section className="mb-20">
      {error && (
        <p className="text-sm text-red-400/70 mb-4">
          Could not load story preview. Showing defaults.
        </p>
      )}
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
          duration: 0.8
        }}
        className="glass-card p-8 md:p-12 relative overflow-hidden border-white/10">
        
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-spotify/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-violet-500/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Copy Side */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 mb-6">
              <Sparkles size={14} className="text-spotify" />
              Generated for you
            </div>

            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Your Year So Far —{' '}
              <span className="font-serif-display italic text-white/80">
                ready to share
              </span>
              .
            </h2>
            <p className="text-lg text-white/60 mb-8">
              We&apos;ve packaged your latest insights into a beautiful, shareable
              story format.
            </p>

            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3 text-sm text-white/80">
                <Smartphone size={16} className="text-white/40" /> {slideCount}
                personalized slides
              </li>
              <li className="flex items-center gap-3 text-sm text-white/80">
                <Share2 size={16} className="text-white/40" /> Optimized for {platformCopy}
              </li>
              <li className="flex items-center gap-3 text-sm text-white/80">
                <Play size={16} className="text-white/40" /> Animated
                transitions & music
              </li>
            </ul>

            <button className="flex items-center gap-2 bg-spotify hover:bg-spotify-light text-black text-base font-semibold px-8 py-4 rounded-full transition-all shadow-[0_0_30px_-5px_rgba(29,185,84,0.5)] hover:shadow-[0_0_40px_-5px_rgba(29,185,84,0.7)] hover:-translate-y-1">
              Open Story Mode <span className="ml-1">→</span>
            </button>
          </div>

          {/* Phone Mockup Side */}
          <div className="flex justify-center lg:justify-end">
            <motion.div
              animate={{
                y: [-10, 10, -10]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="relative w-[280px] h-[560px] rounded-[2.5rem] border-[6px] border-gray-950 bg-gray-950 shadow-2xl overflow-hidden">
              
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-pink-600 to-orange-500 flex flex-col p-6 text-white">
                {/* Slide Indicators */}
                <div className="flex gap-1 mb-6">
                  <div className="h-1 flex-1 bg-white rounded-full" />
                  <div className="h-1 flex-1 bg-white/30 rounded-full" />
                  <div className="h-1 flex-1 bg-white/30 rounded-full" />
                  <div className="h-1 flex-1 bg-white/30 rounded-full" />
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <span className="text-xs font-medium uppercase tracking-widest text-white/80 mb-2 block">
                    Discovery
                  </span>
                  <h3 className="text-3xl font-bold leading-tight mb-6">
                    You found <br />
                    <span className="text-6xl font-serif-display block mt-2">
                      {newArtists.toLocaleString()}
                    </span>
                    new artists.
                  </h3>

                  <div className="flex items-end gap-1 h-16 opacity-80">
                    {bars.map((h, i) =>
                    <div
                      key={i}
                      className="flex-1 bg-white rounded-t-sm"
                      style={{
                        height: `${h}%`
                      }} />

                    )}
                  </div>
                </div>
              </div>
              {/* Phone Glare */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>);

}
