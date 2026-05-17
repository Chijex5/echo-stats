"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Music2 } from 'lucide-react';
import Link from 'next/link';
const particles = Array.from({
  length: 14
}).map((_, i) => ({
  id: i,
  left: `${(i * 6.7 + 5) % 95}%`,
  delay: i % 7 * 0.6,
  duration: 8 + i % 5 * 1.5,
  size: 4 + i % 3 * 2
}));
export function FinalCTA() {
  return (
    <section className="relative py-32 md:py-40 overflow-hidden">
      {/* Ambient gradient blooms */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-spotify/20 rounded-full blur-[140px]" />
        <div className="absolute left-[20%] top-[20%] w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-[120px]" />
        <div className="absolute right-[15%] bottom-[15%] w-[400px] h-[400px] bg-pink-500/15 rounded-full blur-[120px]" />
        <div className="absolute left-[55%] top-[10%] w-[300px] h-[300px] bg-blue-500/15 rounded-full blur-[100px]" />
      </div>

      {/* Floating music particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p) =>
        <motion.div
          key={p.id}
          className="absolute bottom-0 rounded-full bg-spotify/60 shadow-[0_0_12px_2px_rgba(29,185,84,0.5)]"
          style={{
            left: p.left,
            width: p.size,
            height: p.size
          }}
          initial={{
            y: 0,
            opacity: 0
          }}
          animate={{
            y: [-20, -600],
            opacity: [0, 0.8, 0]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut'
          }} />

        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{
            opacity: 0,
            y: 30
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: true,
            margin: '-100px'
          }}
          transition={{
            duration: 0.8,
            ease: 'easeOut'
          }}
          className="relative mx-auto max-w-3xl">
          
          {/* Glow behind card */}
          <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-br from-spotify/40 via-violet-500/20 to-pink-500/30 blur-2xl opacity-70" />

          <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-12 md:p-16 text-center overflow-hidden">
            {/* Inner highlight */}
            <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/[0.06] to-transparent" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-white/60 mb-8">
                <span className="h-1.5 w-1.5 rounded-full bg-spotify animate-pulse" />
                Free during beta
              </div>

              <h2 className="text-4xl md:text-6xl font-medium tracking-tight leading-[1.05] text-white">
                Reconnect with the{' '}
                <span className="font-serif-display italic text-white/95">
                  soundtrack
                </span>{' '}
                of your life.
              </h2>

              <p className="mt-6 text-white/60 text-lg max-w-xl mx-auto leading-relaxed">
                In under 30 seconds, EchoStats turns years of listening into a
                story only you could write.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={"/auth"} className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-spotify text-black font-semibold text-base shadow-[0_0_60px_-8px_rgba(29,185,84,0.7)] hover:shadow-[0_0_80px_-4px_rgba(29,185,84,0.9)] hover:-translate-y-0.5 transition-all">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                    aria-hidden="true">
                    
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                  Connect Spotify
                </Link>

                <button className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-white/15 bg-white/[0.03] hover:bg-white/[0.07] text-white/80 hover:text-white font-medium text-base backdrop-blur-md transition-all">
                  <Music2 size={16} />
                  See a demo first
                </button>
              </div>

              <p className="mt-8 text-xs text-white/40">
                No credit card. Read-only access. Disconnect anytime.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>);

}