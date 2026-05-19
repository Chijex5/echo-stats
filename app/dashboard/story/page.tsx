"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, Share2, Download, RotateCcw, ChevronLeft, ChevronRight, CalendarRange, Sparkles } from "lucide-react";
import { useStoryMode } from "@/lib/hooks/useDashboard";

type StorySlide = { id: number; label: string; title: string; subtitle: string; accent: string };
const DURATION_MS = 5500;

export default function StoryModePage() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [from, setFrom] = useState("2025-01-01");
  const [to, setTo] = useState("2025-12-31");
  const { data, error, isLoading } = useStoryMode(from, to);

  const slides = useMemo<StorySlide[]>(() => {
    const emotionalMonth = data?.emotionalMonth.month
      ? new Date(2025, data.emotionalMonth.month - 1, 1).toLocaleString("en-US", { month: "long" })
      : "Unknown";

    return [
      { id: 1, label: "Top Song", title: data?.topSong.title ?? "Loading your anthem", subtitle: data?.topSong.subtitle ?? "Analyzing play history", accent: "from-fuchsia-500 via-purple-500 to-blue-500" },
      { id: 2, label: "Top Artist", title: data?.topArtist.title ?? "Loading top artist", subtitle: data?.topArtist.subtitle ?? "Calculating listening minutes", accent: "from-emerald-500 via-cyan-500 to-indigo-500" },
      { id: 3, label: "Music Age", title: data?.musicAge.year ?? "Unknown", subtitle: data?.musicAge.subtitle ?? "Your listening center of gravity", accent: "from-violet-600 via-pink-500 to-amber-400" },
      { id: 4, label: "Favorite Era", title: "Late-Night 2010s", subtitle: "Neon nostalgia, midnight drives", accent: "from-blue-600 via-violet-500 to-fuchsia-500" },
      { id: 5, label: "Forgotten Favorite", title: "Paper Planes", subtitle: "A memory you should revisit", accent: "from-amber-400 via-orange-500 to-pink-500" },
      { id: 6, label: "Emotional Month", title: emotionalMonth, subtitle: data?.emotionalMonth.subtitle ?? "Not enough data in selected range", accent: "from-indigo-600 via-cyan-500 to-emerald-400" },
      { id: 7, label: "Hidden Gem", title: data?.hiddenGem?.trackName ?? "No hidden gem yet", subtitle: data?.hiddenGem ? `${data.hiddenGem.artistName} · ${data.hiddenGem.plays} plays` : "Play more tracks to unlock this", accent: "from-purple-600 via-indigo-600 to-sky-500" },
      { id: 8, label: "Personality", title: "The Night Explorer", subtitle: "A constellation of moody gems and starlit bangers", accent: "from-fuchsia-500 via-indigo-600 to-blue-600" },
    ];
  }, [data]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((p) => (p + 1) % slides.length), DURATION_MS);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  const current = slides[active];

  return (<main className="relative min-h-screen overflow-hidden bg-[#06070d] text-white">{/* UI unchanged */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#7c3aed45,transparent_35%),radial-gradient(circle_at_80%_30%,#f9731650,transparent_35%),radial-gradient(circle_at_50%_80%,#14b8a660,transparent_40%)]" />
      <div className="absolute inset-0 bg-black/35 backdrop-blur-3xl" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] items-center justify-center gap-8 px-4 py-8 lg:px-10">
        <section className="relative w-full max-w-[380px] rounded-[3rem] border border-white/20 bg-black/40 p-3 shadow-[0_0_100px_rgba(182,68,255,0.35)] backdrop-blur-xl">
          <div className="h-[82vh] min-h-[620px] overflow-hidden rounded-[2.5rem] border border-white/15 bg-neutral-950">
            <div className="flex items-center gap-2 p-4">{slides.map((_, i) => <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/20"><motion.div className="h-full bg-white" animate={{ width: i < active ? "100%" : i === active && !paused ? "100%" : "0%" }} transition={{ duration: i === active ? DURATION_MS / 1000 : 0.45, ease: "linear" }} /></div>)}<button onClick={() => setPaused((p) => !p)} className="ml-2 rounded-full bg-white/15 p-2">{paused ? <Play size={14} /> : <Pause size={14} />}</button></div>
            <AnimatePresence mode="wait"><motion.div key={current.id} initial={{ opacity: 0, x: 38 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -38 }} transition={{ duration: 0.45 }} className={`relative h-[calc(100%-122px)] bg-gradient-to-br ${current.accent}`}><SlideArt slide={current} /></motion.div></AnimatePresence>
            <div className="flex items-center justify-between border-t border-white/10 p-4"><button onClick={() => setActive((p) => (p - 1 + slides.length) % slides.length)} className="rounded-xl bg-white/10 p-2"><ChevronLeft size={18} /></button><p className="text-xs uppercase tracking-[0.2em] text-white/70">{isLoading ? "Loading" : current.label}</p><button onClick={() => setActive((p) => (p + 1) % slides.length)} className="rounded-xl bg-white/10 p-2"><ChevronRight size={18} /></button></div>
          </div>
        </section>
        <aside className="hidden w-[360px] space-y-4 lg:block">
          <div className="rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur-xl"><p className="text-xs uppercase tracking-[0.25em] text-white/60">Story Mode</p><h1 className="mt-2 text-3xl font-black leading-tight">Your music story, cinematic and alive.</h1>{error ? <p className="mt-3 text-sm text-rose-200">Failed to load story data.</p> : null}<div className="mt-5 grid grid-cols-2 gap-2">{slides.map((slide, i) => <button key={slide.id} onClick={() => setActive(i)} className={`rounded-xl border p-3 text-left text-sm ${i === active ? "border-white/50 bg-white/20" : "border-white/10 bg-white/5"}`}>{slide.label}</button>)}</div></div>
          <div className="rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur-xl"><p className="mb-3 flex items-center gap-2 text-sm text-white/70"><CalendarRange size={16} /> Custom date range</p><div className="grid grid-cols-2 gap-2"><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm" /><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm" /></div><div className="mt-4 grid grid-cols-2 gap-2"><button className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black"><Share2 size={14} className="mr-1 inline" /> Share</button><button className="rounded-xl bg-white/10 px-3 py-2 text-sm"><Download size={14} className="mr-1 inline" /> Export</button><button className="col-span-2 rounded-xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 px-3 py-2 text-sm font-semibold"><Sparkles size={14} className="mr-1 inline" /> Share your music story</button><button onClick={() => setActive(0)} className="col-span-2 rounded-xl border border-white/15 px-3 py-2 text-sm"><RotateCcw size={14} className="mr-1 inline" /> Replay Story</button></div></div>
        </aside>
      </div>
    </main>);
}

function SlideArt({ slide }: { slide: StorySlide }) {
  if (slide.id === 1) return <div className="relative h-full p-6"><div className="mx-auto mt-16 aspect-square w-52 rounded-[2rem] border border-white/30 bg-gradient-to-br from-white/30 to-white/5 p-2 shadow-2xl backdrop-blur-xl"><div className="flex h-full items-end rounded-[1.5rem] bg-[radial-gradient(circle_at_top,_#3efca3,_#6030ff_58%,_#1d1f35)] p-4"><span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Now Looping</span></div></div><h2 className="mt-8 text-4xl font-black leading-tight">{slide.title}</h2><p className="mt-2 text-white/70">{slide.subtitle}</p></div>;
  return <div className="flex h-full flex-col justify-center p-7"><div className="rounded-[2rem] border border-white/25 bg-black/20 p-6 backdrop-blur-xl"><p className="text-xs uppercase tracking-[0.2em] text-white/70">{slide.label}</p><h2 className="mt-3 text-4xl font-black leading-tight">{slide.title}</h2><p className="mt-3 text-white/75">{slide.subtitle}</p></div></div>;
}
