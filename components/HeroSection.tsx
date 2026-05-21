"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Disc3, Sparkles, TrendingUp } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { getGreeting } from '@/lib/greetings';
import { useSession } from 'next-auth/react';
import { useInsights, useNowPlayingSync, useVisualAnalytics } from '@/lib/hooks/useDashboard';
import { useSongOfTheDay } from '@/lib/hooks/useSongOfTheDay';
import { useStoryMode } from '@/lib/hooks/useDashboard';

export const getLastPlayedText = (lastPlayed: number) => {
  if (!Number.isFinite(lastPlayed) || lastPlayed <= 0) return "No recent play";
  const now = Date.now();
  const diff = now - lastPlayed;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
}

export function HeroSection() {
  const { data: session } = useSession();
  const { data: nowPlayingData } = useNowPlayingSync();
  const { data: songOfTheDayData } = useSongOfTheDay();
  const { data: storyData } = useStoryMode();
  const { data: insightsData } = useInsights();
  const { data: visualData } = useVisualAnalytics();

  const moodData =
    visualData?.streamData?.slice(-8).map((point) => ({ value: point.value })) ?? [];

  const personalityTitle = insightsData?.emotionalProfile?.dominantLabel ?? "Still evolving";
  const personalityBars = insightsData
    ? [
        { label: "Calm", value: insightsData.emotionalProfile.calm },
        { label: "Neutral", value: insightsData.emotionalProfile.neutral },
        { label: "Energy", value: insightsData.emotionalProfile.energetic },
        { label: "Late", value: insightsData.emotionalProfile.intense },
      ]
    : [];
  return (
    <section className="relative mb-12">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-spotify/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 left-20 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10">
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
          }}
          className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 flex items-center gap-1">
              {getGreeting({ dateTime: new Date(), name: session?.user?.name })}
              <motion.div
                animate={{
                  opacity: [1, 0, 1]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity
                }}
                className="w-1 h-8 bg-spotify ml-1 rounded-full" />
              
            </h1>
            <p className="text-lg text-white/60 font-medium">
              Your music{' '}
              <span className="font-serif-display italic text-spotify/80">
                changed
              </span>{' '}
              this month.
            </p>
          </div>

          {/* Now Playing Pill */}

          <div className="glass-card px-4 py-3 rounded-2xl flex items-center gap-3 border-white/10 bg-white/[0.02]">

            {/* Album Art / Disc fallback */}
            {(() => {
              const track = nowPlayingData?.nowPlaying ?? nowPlayingData?.lastPlayed;
              const imageUrl = track?.albumImageUrl;

              return imageUrl ? (
                <motion.div
                  animate={nowPlayingData?.nowPlaying ? { rotate: 360 } : { rotate: 0 }}
                  transition={
                    nowPlayingData?.nowPlaying
                      ? { duration: 8, repeat: Infinity, ease: "linear" }
                      : { duration: 0 }
                  }
                  className="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-1 ring-white/10"
                >
                  <img
                    src={imageUrl}
                    alt={track?.trackName ?? "Album art"}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ) : (
                <motion.div
                  animate={nowPlayingData?.nowPlaying ? { rotate: 360 } : { rotate: 0 }}
                  transition={
                    nowPlayingData?.nowPlaying
                      ? { duration: 8, repeat: Infinity, ease: "linear" }
                      : { duration: 0 }
                  }
                >
                  <Disc3 size={28} className="text-spotify shrink-0" />
                </motion.div>
              );
            })()}

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] uppercase tracking-widest text-spotify/70 font-semibold">
                {nowPlayingData?.nowPlaying
                  ? "Now Playing"
                  : nowPlayingData?.lastPlayed
                  ? "Last Played"
                  : "Offline"}
              </span>
              <span className="text-xs font-medium text-white/80 truncate">
                {nowPlayingData?.nowPlaying
                  ? `${nowPlayingData.nowPlaying.trackName} — ${nowPlayingData.nowPlaying.artistName}`
                  : nowPlayingData?.lastPlayed
                  ? `${nowPlayingData.lastPlayed.trackName} — ${nowPlayingData.lastPlayed.artistName}`
                  : "Nothing playing right now"}
              </span>
            </div>

            {/* Equalizer ONLY when actively playing */}
            {nowPlayingData?.nowPlaying && (
              <div className="flex items-end gap-[2px] h-4 shrink-0">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-[2px] bg-spotify rounded-t-sm"
                    animate={{ height: ["20%", "100%", "40%", "80%", "20%"] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.08,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Hero Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Music Age Card */}
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
            className="glass-card p-6 relative overflow-hidden group col-span-1 md:col-span-2 lg:col-span-1">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[50px] group-hover:bg-blue-500/30 transition-colors" />

            <div className="flex items-center gap-2 mb-6">
              <Clock size={16} className="text-blue-400" />
              <span className="text-sm font-medium text-white/70">
                Music Age
              </span>
            </div>

            <div className="flex items-end gap-3 mb-6">
              <span className="text-6xl font-serif-display leading-none tabular-nums tracking-tighter">
                {storyData?.musicAge?.year ?? 'Unknown'}
              </span>
              <span className="text-sm text-white/50 mb-1">years old</span>
            </div>

            <div className="h-16 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moodData}>
                  <defs>
                    <linearGradient id="colorAge" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAge)" />
                  
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-white/40 mt-2">
              {storyData?.musicAge?.subtitle ?? "Inferred from your release-date metadata."}
            </p>
          </motion.div>

          {/* Song of the Day Card */}
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
            className="glass-card p-6 relative overflow-hidden group col-span-1">
            
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-pink-400" />
                <span className="text-sm font-medium text-white/70">
                  Song of the Day
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-white/40 border border-white/10 px-2 py-1 rounded-full">
                Nostalgia
              </span>
            </div>

            <div className="flex items-center gap-4 relative z-10">
              <div
                className="w-20 h-20 rounded-xl shadow-lg relative overflow-hidden shrink-0"
                style={{
                  boxShadow: songOfTheDayData?.song.gradientFrom
                    ? `0 8px 24px ${songOfTheDayData.song.gradientFrom}4D`
                    : undefined,
                }}
              >
                {songOfTheDayData?.song.AlbumImageUrl ? (
                  <img
                    src={songOfTheDayData.song.AlbumImageUrl}
                    alt={songOfTheDayData.song.title ?? "Album art"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(to bottom right, ${
                          songOfTheDayData?.song.gradientFrom ?? "#EC4899"
                        }, ${songOfTheDayData?.song.gradientTo ?? "#F97316"})`,
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <Disc3 className="absolute inset-0 m-auto text-white/40" size={28} />
                  </>
                )}
              </div>

              <div>
                <h3 className="font-bold text-lg leading-tight mb-1">
                  {songOfTheDayData?.song.title || "Unknown Track"}
                </h3>
                <p className="text-sm text-white/60 mb-2">
                  {songOfTheDayData?.song.artist || "Unknown Artist"}
                </p>
                <p className="text-xs text-pink-400 font-medium">
                  {getLastPlayedText(
                    new Date(songOfTheDayData?.stats.lastPlayedDate || "").getTime()
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Listening Personality */}
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
              delay: 0.3,
              ease: 'easeOut'
            }}
            className="glass-card p-6 relative overflow-hidden group col-span-1">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/20 rounded-full blur-[50px] group-hover:bg-violet-500/30 transition-colors" />

            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={16} className="text-violet-400" />
              <span className="text-sm font-medium text-white/70">Personality</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_6px_2px_rgba(167,139,250,0.5)]" />
            </div>

            <h3 className="text-2xl font-serif-display italic text-violet-300 mb-2">
              {personalityTitle}
            </h3>
            <p className="text-sm text-white/50 mb-6">
              {insightsData
                ? `Calm ${insightsData.emotionalProfile.calm}% · Neutral ${insightsData.emotionalProfile.neutral}% · High energy ${insightsData.emotionalProfile.energetic}% · Late night ${insightsData.emotionalProfile.intense}%.`
                : "Personality appears as more listening data is imported."}
            </p>

            <div className="flex items-center gap-1 h-8">
              {(personalityBars.length
                ? personalityBars.map((bar) => Math.max(8, bar.value))
                : [25, 45, 35, 30]).map((h, i) =>
              <div
                key={i}
                className="flex-1 bg-white/10 rounded-t-sm relative group-hover:bg-white/20 transition-colors">
                
                  <div
                  className="absolute bottom-0 left-0 right-0 bg-violet-500 rounded-t-sm transition-all duration-500"
                  style={{
                    height: `${h}%`
                  }} />
                
                </div>
              )}
            </div>
            <div className="flex justify-between text-[10px] text-white/40 mt-2">
              <span>Calm</span>
              <span>Neutral</span>
              <span>Energy</span>
              <span>Late</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

}
