"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Music, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Ambient Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-spotify/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
      <div
        className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[150px] mix-blend-screen animate-pulse-slow"
        style={{
          animationDelay: '1s'
        }} />
      
      <div
        className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow"
        style={{
          animationDelay: '2s'
        }} />
      

      {/* Abstract Waveform SVG Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1440 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          
          <motion.path
            initial={{
              pathLength: 0,
              opacity: 0
            }}
            animate={{
              pathLength: 1,
              opacity: 1
            }}
            transition={{
              duration: 3,
              ease: 'easeInOut'
            }}
            d="M0 200C240 200 240 100 480 100C720 100 720 300 960 300C1200 300 1200 200 1440 200"
            stroke="url(#paint0_linear)"
            strokeWidth="2" />
          
          <motion.path
            initial={{
              pathLength: 0,
              opacity: 0
            }}
            animate={{
              pathLength: 1,
              opacity: 0.5
            }}
            transition={{
              duration: 4,
              ease: 'easeInOut',
              delay: 0.5
            }}
            d="M0 250C240 250 240 50 480 50C720 50 720 350 960 350C1200 350 1200 250 1440 250"
            stroke="url(#paint1_linear)"
            strokeWidth="1" />
          
          <defs>
            <linearGradient
              id="paint0_linear"
              x1="0"
              y1="200"
              x2="1440"
              y2="200"
              gradientUnits="userSpaceOnUse">
              
              <stop stopColor="#1DB954" stopOpacity="0" />
              <stop offset="0.5" stopColor="#1DB954" />
              <stop offset="1" stopColor="#7C3AED" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="paint1_linear"
              x1="0"
              y1="200"
              x2="1440"
              y2="200"
              gradientUnits="userSpaceOnUse">
              
              <stop stopColor="#7C3AED" stopOpacity="0" />
              <stop offset="0.5" stopColor="#3B82F6" />
              <stop offset="1" stopColor="#1DB954" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center text-center">
        <motion.div
          initial={{
            y: 30,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
          
          <span className="flex h-2 w-2 rounded-full bg-spotify animate-pulse"></span>
          <span className="text-sm font-medium text-white/80">
            EchoStats 2026 is here
          </span>
        </motion.div>

        <motion.h1
          initial={{
            y: 40,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          transition={{
            duration: 0.8,
            delay: 0.1,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="text-6xl md:text-8xl font-bold tracking-tight mb-6 max-w-5xl leading-[1.1]">
          
          Your music tells a{' '}
          <span className="font-serif-display italic font-normal text-spotify/90">
            story
          </span>
          .<br />
          See yours.
        </motion.h1>

        <motion.p
          initial={{
            y: 40,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          transition={{
            duration: 0.8,
            delay: 0.2,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="text-lg md:text-xl text-white/60 max-w-2xl mb-10 leading-relaxed">
          
          Connect Spotify and discover forgotten favorites, music age, listening
          evolution, and hidden insights from your entire music journey.
        </motion.p>

        <motion.div
          initial={{
            y: 40,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          transition={{
            duration: 0.8,
            delay: 0.3,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="flex flex-col sm:flex-row items-center gap-4">
          
          <Link href={"/auth"} className="flex items-center justify-center gap-2 bg-spotify hover:bg-spotify-light text-black text-base font-semibold px-8 py-4 rounded-full transition-all shadow-[0_0_40px_-8px_rgba(29,185,84,0.6)] hover:shadow-[0_0_50px_-8px_rgba(29,185,84,0.8)] hover:-translate-y-1 w-full sm:w-auto">
            <Play size={20} fill="currentColor" />
            Connect Spotify
          </Link>
          <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-base font-medium px-8 py-4 rounded-full transition-all hover:-translate-y-1 w-full sm:w-auto">
            See Demo
          </button>
        </motion.div>
      </div>

      {/* Floating Preview Cards (Desktop mostly) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block">
        {/* Card 1: Music Age */}
        <motion.div
          initial={{
            opacity: 0,
            x: -50,
            y: 50,
            rotate: -10
          }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            rotate: -6
          }}
          transition={{
            duration: 1.2,
            delay: 0.5,
            ease: 'easeOut'
          }}
          className="absolute top-[20%] left-[10%] glass-card p-5 w-64 animate-float">
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Clock size={16} />
            </div>
            <span className="text-sm font-medium text-white/80">
              Your music age
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-serif-display">23</span>
            <span className="text-sm text-white/50 mb-2">years old</span>
          </div>
          <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-[65%]" />
          </div>
        </motion.div>

        {/* Card 2: Forgotten Favorite */}
        <motion.div
          initial={{
            opacity: 0,
            x: 50,
            y: -50,
            rotate: 10
          }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            rotate: 4
          }}
          transition={{
            duration: 1.2,
            delay: 0.7,
            ease: 'easeOut'
          }}
          className="absolute top-[15%] right-[12%] glass-card p-4 w-56 animate-float-delayed">
          
          <span className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3 block">
            Forgotten Favorite
          </span>
          <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 mb-3 shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20" />
            <Music
              className="absolute bottom-3 left-3 text-white/80"
              size={20} />
            
          </div>
          <p className="font-medium text-sm truncate">Midnight City</p>
          <p className="text-xs text-white/50 truncate">M83</p>
        </motion.div>

        {/* Card 3: Genre Shift */}
        <motion.div
          initial={{
            opacity: 0,
            y: 100,
            rotate: -5
          }}
          animate={{
            opacity: 1,
            y: 0,
            rotate: -3
          }}
          transition={{
            duration: 1.2,
            delay: 0.9,
            ease: 'easeOut'
          }}
          className="absolute bottom-[20%] left-[15%] glass-card p-5 w-72 animate-float-delayed">
          
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-spotify" />
            <span className="text-sm font-medium text-white/80">
              Genre Evolution
            </span>
          </div>
          <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/5">
            <span className="text-sm text-white/70">Afrobeats</span>
            <ArrowRight size={14} className="text-white/30" />
            <span className="text-sm font-medium text-spotify-light">
              Indie Soul
            </span>
          </div>
        </motion.div>

        {/* Card 4: Most Played */}
        <motion.div
          initial={{
            opacity: 0,
            x: 50,
            y: 100,
            rotate: 5
          }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            rotate: 6
          }}
          transition={{
            duration: 1.2,
            delay: 1.1,
            ease: 'easeOut'
          }}
          className="absolute bottom-[25%] right-[10%] glass-card p-5 w-64 animate-float">
          
          <span className="text-xs font-medium text-white/50 uppercase tracking-wider mb-4 block">
            Most played this month
          </span>
          <div className="flex items-end gap-2 h-16 mb-2">
            {[40, 70, 45, 90, 60, 85, 100].map((h, i) =>
            <div
              key={i}
              className="flex-1 bg-spotify/20 rounded-t-sm relative group">
              
                <div
                className="absolute bottom-0 left-0 right-0 bg-spotify rounded-t-sm transition-all duration-500"
                style={{
                  height: `${h}%`
                }} />
              
              </div>
            )}
          </div>
          <div className="flex justify-between text-[10px] text-white/40">
            <span>Mon</span>
            <span>Sun</span>
          </div>
        </motion.div>
      </div>
    </section>);

}