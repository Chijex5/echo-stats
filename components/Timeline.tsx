"use client";
import{ useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Disc3, BarChart2 } from 'lucide-react';
const timelineData = [
{
  id: 'jan',
  label: 'Jan 2024',
  hours: 87,
  topArtist: 'The Weeknd',
  mood: 'Energetic',
  color: 'from-blue-500 to-purple-500'
},
{
  id: 'feb',
  label: 'Feb 2024',
  hours: 64,
  topArtist: 'Frank Ocean',
  mood: 'Mellow',
  color: 'from-orange-400 to-pink-500'
},
{
  id: 'mar',
  label: 'Mar 2024',
  hours: 112,
  topArtist: 'Fred again..',
  mood: 'Euphoric',
  color: 'from-emerald-400 to-cyan-500'
},
{
  id: 'apr',
  label: 'Apr 2024',
  hours: 95,
  topArtist: 'Kendrick Lamar',
  mood: 'Intense',
  color: 'from-red-500 to-orange-500'
},
{
  id: 'may',
  label: 'May 2024',
  hours: 104,
  topArtist: 'Tame Impala',
  mood: 'Vibey',
  color: 'from-purple-500 to-indigo-500'
}];

export function Timeline() {
  const [activeId, setActiveId] = useState(timelineData[2].id);
  const activeData =
  timelineData.find((d) => d.id === activeId) || timelineData[0];
  return (
    <section id="timeline" className="py-32 relative z-10 overflow-hidden">
      <div className="absolute left-0 top-1/2 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Scroll through your{' '}
            <span className="font-serif-display italic text-white/80">
              sonic memory
            </span>
            .
          </h2>
        </div>

        {/* Timeline Strip */}
        <div className="relative mb-16">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10 -translate-y-1/2" />

          <div className="flex items-center gap-8 md:gap-16 overflow-x-auto hide-scrollbar py-8 relative z-10 snap-x snap-mandatory">
            {timelineData.map((item) =>
            <button
              key={item.id}
              onClick={() => setActiveId(item.id)}
              className="relative flex flex-col items-center gap-4 snap-center shrink-0 group focus:outline-none">
              
                <span
                className={`text-sm font-medium transition-colors duration-300 ${activeId === item.id ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
                
                  {item.label}
                </span>

                <div className="relative w-4 h-4 flex items-center justify-center">
                  <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${activeId === item.id ? 'bg-white scale-100' : 'bg-white/20 scale-75 group-hover:scale-100'}`} />
                
                  {activeId === item.id &&
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 rounded-full border-2 border-white/30"
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30
                  }} />

                }
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Snapshot Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -20
            }}
            transition={{
              duration: 0.4,
              ease: 'easeOut'
            }}
            className="glass-card p-8 md:p-12 relative overflow-hidden">
            
            <div
              className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 bg-gradient-to-br ${activeData.color} pointer-events-none`} />
            

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 mb-6">
                  <Disc3 size={14} />
                  Snapshot: {activeData.label}
                </div>

                <h3 className="text-3xl md:text-4xl font-bold mb-8">
                  You spent{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                    {activeData.hours} hours
                  </span>{' '}
                  immersed in sound.
                </h3>

                <div className="space-y-6">
                  <div>
                    <span className="text-sm text-white/50 block mb-2">
                      Top Artist
                    </span>
                    <span className="text-xl font-medium">
                      {activeData.topArtist}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm text-white/50 block mb-2">
                      Vibe / Mood
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-medium">
                        {activeData.mood}
                      </span>
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden max-w-[150px]">
                        <div
                          className={`h-full w-[75%] bg-gradient-to-r ${activeData.color} rounded-full`} />
                        
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`aspect-square rounded-2xl bg-gradient-to-br ${activeData.color} p-4 flex flex-col justify-end shadow-xl relative overflow-hidden`}>
                  
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10">
                    <p className="font-semibold text-sm truncate">On Repeat</p>
                    <p className="text-xs text-white/70 truncate">Track 01</p>
                  </div>
                </div>
                <div className="aspect-square rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col justify-center items-center gap-2">
                  <BarChart2 size={24} className="text-white/40" />
                  <span className="text-xs text-white/50 font-medium">
                    View full stats
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>);

}