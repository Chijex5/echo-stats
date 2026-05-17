"use client";
import { motion } from 'framer-motion';
import { Smartphone, Share2, Sparkles } from 'lucide-react';
export function StoryMode() {
  return (
    <section id="story" className="py-32 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Copy Side */}
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{
                opacity: 0,
                x: -30
              }}
              whileInView={{
                opacity: 1,
                x: 0
              }}
              viewport={{
                once: true
              }}
              transition={{
                duration: 0.8
              }}>
              
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Your year, told like a{' '}
                <span className="font-serif-display italic text-spotify">
                  story
                </span>
                .
              </h2>
              <p className="text-lg text-white/60 mb-10 leading-relaxed">
                Why wait for December? Generate a beautiful, shareable story of
                your listening habits anytime. Tap through your personal
                narrative with rich visuals and data.
              </p>

              <ul className="space-y-6">
                {[
                {
                  icon: Smartphone,
                  title: 'Swipeable Slides',
                  desc: 'Familiar story format optimized for mobile viewing.'
                },
                {
                  icon: Share2,
                  title: 'Shareable Moments',
                  desc: 'Export any slide directly to Instagram or TikTok.'
                },
                {
                  icon: Sparkles,
                  title: 'Personal Narration',
                  desc: 'AI-generated insights that read like a love letter to your taste.'
                }].
                map((feature, idx) =>
                <li key={idx} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                      <feature.icon size={18} className="text-white/80" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-white/50">{feature.desc}</p>
                    </div>
                  </li>
                )}
              </ul>
            </motion.div>
          </div>

          {/* Phone Mockup Side */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end relative">
            {/* Glow behind phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[500px] bg-spotify/20 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
              initial={{
                opacity: 0,
                y: 40
              }}
              whileInView={{
                opacity: 1,
                y: 0
              }}
              viewport={{
                once: true
              }}
              transition={{
                duration: 1,
                ease: 'easeOut'
              }}
              className="relative w-[300px] h-[600px] rounded-[3rem] border-[8px] border-gray-950 bg-gray-950 shadow-2xl overflow-hidden animate-float">
              
              {/* Screen Content */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 flex flex-col p-6 text-white">
                {/* Slide Indicators */}
                <div className="flex gap-1 mb-8">
                  <div className="h-1 flex-1 bg-white rounded-full" />
                  <div className="h-1 flex-1 bg-white/30 rounded-full" />
                  <div className="h-1 flex-1 bg-white/30 rounded-full" />
                  <div className="h-1 flex-1 bg-white/30 rounded-full" />
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <span className="text-sm font-medium uppercase tracking-widest text-white/80 mb-4 block">
                    Track Count
                  </span>
                  <h3 className="text-4xl font-bold leading-tight mb-8">
                    You listened to <br />
                    <span className="text-6xl font-serif-display block mt-2">
                      1,247
                    </span>
                    unique tracks.
                  </h3>

                  {/* Decorative Waveform */}
                  <div className="flex items-end gap-1 h-20 opacity-80">
                    {[40, 70, 45, 90, 60, 85, 100, 50, 75, 30, 60, 80].map(
                      (h, i) =>
                      <div
                        key={i}
                        className="flex-1 bg-white rounded-t-sm"
                        style={{
                          height: `${h}%`
                        }} />


                    )}
                  </div>
                </div>

                <div className="text-center mt-auto pb-4">
                  <span className="text-xs font-medium text-white/60 uppercase tracking-widest animate-pulse">
                    Tap to continue
                  </span>
                </div>
              </div>

              {/* Phone Glare */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>);

}