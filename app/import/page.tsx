"use client";
import  { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  UploadCloud,
  FileJson,
  Lock,
  ShieldCheck,
  Trash2,
  EyeOff,
  CheckCircle2,
  Music,
  Clock,
  TrendingUp } from
'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
const mockChartData = [
{
  value: 10
},
{
  value: 25
},
{
  value: 15
},
{
  value: 40
},
{
  value: 30
},
{
  value: 60
},
{
  value: 45
},
{
  value: 80
},
{
  value: 65
},
{
  value: 100
}];

export default function ImportPage() {
  const [uploadState, setUploadState] = useState<
    'idle' | 'uploading' | 'analyzing' | 'success'>(
    'idle');
  const [progress, setProgress] = useState(0);
  // Simulate upload process for demo purposes
  const simulateUpload = () => {
    if (uploadState !== 'idle') return;
    setUploadState('uploading');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadState('analyzing');
          setTimeout(() => setUploadState('success'), 2500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };
  return (
    <div className="pt-32 pb-20 min-h-screen relative overflow-hidden">
      {/* Ambient Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-spotify/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
      <div
        className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] mix-blend-screen animate-pulse-slow"
        style={{
          animationDelay: '1s'
        }} />
      
      <div
        className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow"
        style={{
          animationDelay: '2s'
        }} />
      

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Upload Section */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <motion.div
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                duration: 0.6,
                ease: 'easeOut'
              }}>
              
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Import your{' '}
                <span className="font-serif-display italic text-spotify">
                  Spotify
                </span>{' '}
                history
              </h1>
              <p className="text-lg text-white/60 max-w-xl leading-relaxed">
                Upload your account data export to unlock your complete
                listening timeline, forgotten favorites, and custom date
                insights.
              </p>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                duration: 0.6,
                delay: 0.1,
                ease: 'easeOut'
              }}
              className="glass-card p-8 md:p-12 relative overflow-hidden group">
              
              {/* Inner highlight */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <AnimatePresence mode="wait">
                {uploadState === 'idle' &&
                <motion.div
                  key="idle"
                  initial={{
                    opacity: 0
                  }}
                  animate={{
                    opacity: 1
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.95
                  }}
                  className="flex flex-col items-center text-center">
                  
                    <div
                    onClick={simulateUpload}
                    className="w-full border-2 border-dashed border-white/20 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-spotify/50 hover:bg-spotify/5 transition-all duration-300 group/dropzone relative overflow-hidden">
                    
                      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover/dropzone:opacity-100 transition-opacity" />

                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 relative">
                        <div className="absolute inset-0 rounded-full border border-white/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                        <UploadCloud
                        size={32}
                        className="text-white/80 group-hover/dropzone:text-spotify transition-colors" />
                      
                      </div>

                      <h3 className="text-xl font-semibold mb-2">
                        Drop your Spotify JSON files here
                      </h3>
                      <p className="text-white/50 text-sm mb-6">
                        or click to browse from your computer
                      </p>

                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70">
                        <FileJson size={14} />
                        Supported: JSON archive
                      </div>
                    </div>
                  </motion.div>
                }

                {(uploadState === 'uploading' ||
                uploadState === 'analyzing') &&
                <motion.div
                  key="processing"
                  initial={{
                    opacity: 0,
                    scale: 0.95
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1
                  }}
                  exit={{
                    opacity: 0,
                    scale: 1.05
                  }}
                  className="flex flex-col items-center text-center py-12">
                  
                    <div className="relative w-24 h-24 mb-8">
                      <svg
                      className="w-full h-full -rotate-90"
                      viewBox="0 0 100 100">
                      
                        <circle
                        className="text-white/10 stroke-current"
                        strokeWidth="4"
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent" />
                      
                        <motion.circle
                        className="text-spotify stroke-current"
                        strokeWidth="4"
                        strokeLinecap="round"
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        initial={{
                          strokeDasharray: '0 251.2'
                        }}
                        animate={{
                          strokeDasharray: `${progress / 100 * 251.2} 251.2`
                        }}
                        transition={{
                          duration: 0.1
                        }} />
                      
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-semibold">
                          {progress}%
                        </span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-semibold mb-2">
                      {uploadState === 'uploading' ?
                    'Uploading archive...' :
                    'Analyzing your music story...'}
                    </h3>
                    <p className="text-white/50 text-sm">
                      {uploadState === 'uploading' ?
                    'Securely transferring your data' :
                    'Reconstructing your timeline'}
                    </p>
                  </motion.div>
                }

                {uploadState === 'success' &&
                <motion.div
                  key="success"
                  initial={{
                    opacity: 0,
                    scale: 0.95
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1
                  }}
                  className="flex flex-col items-center text-center py-8">
                  
                    <div className="w-20 h-20 rounded-full bg-spotify/20 flex items-center justify-center mb-6 text-spotify">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-3xl font-bold mb-2">
                      Import Complete!
                    </h3>
                    <p className="text-white/60 mb-8">
                      We&aps;ve successfully reconstructed your music history.
                    </p>

                    <div className="grid grid-cols-3 gap-4 w-full mb-8">
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="text-2xl font-serif-display text-spotify mb-1">
                          14,205
                        </div>
                        <div className="text-xs text-white/50 uppercase tracking-wider">
                          Tracks
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="text-2xl font-serif-display text-violet-400 mb-1">
                          6
                        </div>
                        <div className="text-xs text-white/50 uppercase tracking-wider">
                          Years
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="text-2xl font-serif-display text-blue-400 mb-1">
                          128
                        </div>
                        <div className="text-xs text-white/50 uppercase tracking-wider">
                          Insights
                        </div>
                      </div>
                    </div>

                    <Link
                    href="/dashboard"
                    className="w-full py-4 rounded-full bg-spotify text-black font-semibold text-lg hover:bg-spotify-light transition-colors shadow-[0_0_30px_-5px_rgba(29,185,84,0.5)] text-center block">
                    
                      View Your Story
                    </Link>
                  </motion.div>
                }
              </AnimatePresence>
            </motion.div>

            {/* Instruction Helper */}
            <motion.div
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                ease: 'easeOut'
              }}
              className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              
              <h4 className="font-medium text-white/90 mb-4 flex items-center gap-2">
                <FileJson size={16} className="text-white/50" />
                How to get your Spotify archive
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold mb-3">
                    1
                  </div>
                  <p className="text-sm text-white/70">
                    Go to Spotify Account Privacy settings
                  </p>
                </div>
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold mb-3">
                    2
                  </div>
                  <p className="text-sm text-white/70">
                    Request your &quot;Extended streaming history&quot;
                  </p>
                </div>
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold mb-3">
                    3
                  </div>
                  <p className="text-sm text-white/70">
                    Download the ZIP and extract the JSON files
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Trust Section */}
            <motion.div
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 1
              }}
              transition={{
                duration: 0.6,
                delay: 0.3
              }}
              className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs text-white/40">
              
              <div className="flex items-center gap-1.5">
                <Lock size={14} /> Secure upload
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} /> Encrypted
              </div>
              <div className="flex items-center gap-1.5">
                <Trash2 size={14} /> Delete anytime
              </div>
              <div className="flex items-center gap-1.5">
                <EyeOff size={14} /> Private analysis
              </div>
            </motion.div>
          </div>

          {/* Side Visualization Panel */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{
                opacity: 0,
                x: 30
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: 'easeOut'
              }}
              className="sticky top-32">
              
              <div className="glass-card p-6 relative overflow-hidden min-h-[600px] border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px]" />

                <div className="relative z-10">
                  <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-8">
                    What you&apos;ll unlock
                  </h3>

                  {/* Mock Visualizations */}
                  <div className="space-y-6">
                    {/* Timeline Preview */}
                    <div className="bg-black/40 rounded-2xl p-5 border border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">
                          Listening Timeline
                        </span>
                        <TrendingUp size={14} className="text-spotify" />
                      </div>
                      <div className="h-24 -mx-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={mockChartData}>
                            <defs>
                              <linearGradient
                                id="colorValue"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1">
                                
                                <stop
                                  offset="5%"
                                  stopColor="#1DB954"
                                  stopOpacity={0.3} />
                                
                                <stop
                                  offset="95%"
                                  stopColor="#1DB954"
                                  stopOpacity={0} />
                                
                              </linearGradient>
                            </defs>
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke="#1DB954"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#colorValue)" />
                            
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Floating Cards Preview */}
                    <div className="relative h-40">
                      <motion.div
                        animate={{
                          y: [-5, 5, -5]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        className="absolute top-0 left-0 w-48 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-xl z-20">
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Clock size={14} className="text-violet-400" />
                          <span className="text-xs font-medium text-white/70">
                            April 2024
                          </span>
                        </div>
                        <p className="text-sm font-semibold">
                          Most nostalgic month
                        </p>
                      </motion.div>

                      <motion.div
                        animate={{
                          y: [5, -5, 5]
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 1
                        }}
                        className="absolute bottom-0 right-0 w-52 bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-xl z-10">
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Music size={14} className="text-pink-400" />
                          <span className="text-xs font-medium text-white/70">
                            First Stream
                          </span>
                        </div>
                        <p className="text-sm font-semibold truncate">
                          The Less I Know The Better
                        </p>
                        <p className="text-xs text-white/40">Tame Impala</p>
                      </motion.div>
                    </div>

                    {/* Heatmap Preview */}
                    <div className="bg-black/40 rounded-2xl p-5 border border-white/5">
                      <span className="text-sm font-medium mb-3 block">
                        Yearly Heatmap
                      </span>
                      <div className="grid grid-cols-12 gap-1">
                        {Array.from({
                          length: 48
                        }).map((_, i) =>
                        <div
                          key={i}
                          className="aspect-square rounded-sm"
                          style={{
                            backgroundColor: `rgba(29, 185, 84, ${0.1 + (i % 8) * 0.1})`
                          }} />

                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fade out bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0c] to-transparent z-20" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>);

}