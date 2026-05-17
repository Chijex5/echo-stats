"use client";
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
const testimonials = [
{
  quote:
  "It's like Spotify Wrapped but available all year round, and honestly, the insights are way deeper.",
  name: 'Sarah J.',
  handle: '@sarahlistens',
  initial: 'S',
  color: 'from-blue-400 to-indigo-500'
},
{
  quote:
  'Found a playlist from 2019 I completely forgot about. The nostalgia hit me like a truck. Beautiful UI too.',
  name: 'Marcus T.',
  handle: '@marcustech',
  initial: 'M',
  color: 'from-emerald-400 to-teal-500'
},
{
  quote:
  'The emotional arc feature is insane. It perfectly mapped my breakup in March to my listening habits.',
  name: 'Elena R.',
  handle: '@elenarose',
  initial: 'E',
  color: 'from-pink-400 to-rose-500'
}];

export function SocialProof() {
  return (
    <section className="py-32 relative z-10 border-y border-white/5 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Big Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
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
            className="pt-8 md:pt-0">
            
            <div className="text-5xl md:text-6xl font-serif-display mb-2 text-gradient">
              12M+
            </div>
            <div className="text-sm text-white/50 font-medium uppercase tracking-wider">
              Songs Analyzed
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
              delay: 0.1
            }}
            className="pt-8 md:pt-0">
            
            <div className="text-5xl md:text-6xl font-serif-display mb-2 text-gradient">
              17
            </div>
            <div className="text-sm text-white/50 font-medium uppercase tracking-wider">
              Avg Forgotten Favorites
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
              delay: 0.2
            }}
            className="pt-8 md:pt-0 flex flex-col items-center">
            
            <div className="text-5xl md:text-6xl font-serif-display mb-2 text-gradient flex items-center gap-2">
              4.9 <Star className="text-yellow-500 fill-yellow-500" size={32} />
            </div>
            <div className="text-sm text-white/50 font-medium uppercase tracking-wider">
              App Store Rating
            </div>
          </motion.div>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {testimonials.map((t, i) =>
          <motion.div
            key={i}
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
              delay: i * 0.1
            }}
            className="glass-card p-8 flex flex-col">
            
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) =>
              <Star
                key={star}
                size={16}
                className="text-spotify fill-spotify" />

              )}
              </div>
              <p className="text-white/80 text-lg mb-8 flex-1 leading-relaxed">
                &quot;{t.quote}&quot;
              </p>
              <div className="flex items-center gap-4">
                <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center font-bold text-white shadow-lg`}>
                
                  {t.initial}
                </div>
                <div>
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-white/40">{t.handle}</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Logos */}
        <div className="text-center">
          <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-8">
            Featured In
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-xl font-bold tracking-tighter">
              TechCrunch
            </span>
            <span className="text-xl font-serif-display italic tracking-wide">
              The Verge
            </span>
            <span className="text-xl font-black uppercase tracking-widest">
              WIRED
            </span>
            <span className="text-xl font-bold tracking-tight">Pitchfork</span>
            <span className="text-xl font-medium tracking-tight">
              Fast Company
            </span>
          </div>
        </div>
      </div>
    </section>);

}