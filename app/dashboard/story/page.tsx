"use client";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pause, Play, Share2, Download, RotateCcw,
  ChevronLeft, ChevronRight, CalendarRange,
  Sparkles, ArrowRight, Music2, Mic2, Clock,
  Layers, RefreshCcw, HeartPulse, Diamond,
  Fingerprint, X, Loader2,
} from "lucide-react";
import { useStoryMode } from "@/lib/hooks/useDashboard";
import { TopNav } from "@/components/TopNav";
import { Sidebar } from "@/components/Sidebar";

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */
type StorySlide = {
  id: number;
  label: string;
  title: string;
  subtitle: string;
  accent: string;
  hexFrom: string;
  hexVia: string;
  hexTo: string;
  Icon: React.FC<{ size?: number; strokeWidth?: number }>;
};

const DURATION_MS = 5500;

/* ─────────────────────────────────────────────────────────────
   Full-story HTML export — all 8 slides, print-ready
───────────────────────────────────────────────────────────── */
function buildFullExportHTML(slides: StorySlide[], from: string, to: string): string {
  const cards = slides.map((s) => `
    <div class="card">
      <div class="card-glow" style="background:radial-gradient(circle at 30% 30%,${s.hexVia}55,transparent 60%)"></div>
      <div class="card-inner" style="background:linear-gradient(145deg,${s.hexFrom},${s.hexVia} 52%,${s.hexTo})">
        <div class="noise"></div>
        <div class="card-body">
          <div class="chip">${s.label}</div>
          <h2 class="title">${s.title}</h2>
          <p class="sub">${s.subtitle}</p>
        </div>
        <div class="card-footer">
          <span class="brand">&#9835; Music Story</span>
          <span class="range-text">${from} &rarr; ${to}</span>
        </div>
      </div>
    </div>`).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Music Story &middot; ${from} &ndash; ${to}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{background:#080808;min-height:100%;font-family:'DM Sans',sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;color:#fff}
.page-header{text-align:center;padding:56px 24px 40px}
.eyebrow{font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:14px}
.page-header h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(48px,8vw,88px);letter-spacing:.04em;line-height:1}
.range-badge{display:inline-block;margin-top:18px;padding:6px 18px;border:1px solid rgba(255,255,255,.15);border-radius:100px;font-size:12px;color:rgba(255,255,255,.5);letter-spacing:.1em}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;padding:0 32px 64px;max-width:1100px;margin:0 auto}
.card{position:relative;border-radius:36px;aspect-ratio:9/16;overflow:hidden}
.card-glow{position:absolute;inset:-20px;pointer-events:none;z-index:0;filter:blur(40px);opacity:.55}
.card-inner{position:relative;z-index:1;width:100%;height:100%;border-radius:36px;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;border:1px solid rgba(255,255,255,.12)}
.noise{position:absolute;inset:0;border-radius:inherit;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.06'/%3E%3C/svg%3E");pointer-events:none;z-index:1;mix-blend-mode:overlay}
.card-body{padding:32px 28px 0;position:relative;z-index:2}
.chip{display:inline-block;font-size:10px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.65);background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.18);border-radius:100px;padding:5px 14px;margin-bottom:20px}
.title{font-family:'Bebas Neue',sans-serif;font-size:clamp(34px,5vw,52px);letter-spacing:.04em;line-height:1;word-break:break-word}
.sub{margin-top:14px;font-size:14px;line-height:1.6;color:rgba(255,255,255,.72);font-weight:300}
.card-footer{position:relative;z-index:2;padding:16px 28px 28px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,.1);margin-top:24px}
.brand{font-family:'Bebas Neue',sans-serif;font-size:15px;letter-spacing:.1em;color:rgba(255,255,255,.45)}
.range-text{font-size:11px;color:rgba(255,255,255,.3);letter-spacing:.06em}
@media print{.grid{page-break-inside:avoid}.card{break-inside:avoid}}
</style>
</head>
<body>
<div class="page-header">
  <p class="eyebrow">Your Music Story</p>
  <h1>WRAPPED</h1>
  <span class="range-badge">${from} &middot; ${to}</span>
</div>
<div class="grid">${cards}</div>
</body>
</html>`;
}

/* ─────────────────────────────────────────────────────────────
   Progress strip
───────────────────────────────────────────────────────────── */
function ProgressStrip({ count, active, paused }: { count: number; active: number; paused: boolean }) {
  return (
    <div className="flex items-center gap-[3px] flex-1">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/20">
          <motion.div
            className="h-full rounded-full bg-white"
            animate={{ width: i < active ? "100%" : i === active && !paused ? "100%" : "0%" }}
            transition={{ duration: i === active ? DURATION_MS / 1000 : 0.22, ease: "linear" }}
          />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Slide content — uses absolute fill so it CANNOT resize the frame
───────────────────────────────────────────────────────────── */
function SlideContent({ slide }: { slide: StorySlide }) {
  const { Icon } = slide;

  if (slide.id === 1) {
    return (
      <div className="absolute inset-0 flex flex-col justify-between p-6 pb-5 overflow-hidden">
        {/* Vinyl */}
        <div className="flex justify-center mt-4">
          <div className="relative w-40 h-40 shrink-0">
            <motion.div
              className="absolute inset-0 rounded-full border border-white/20 bg-gradient-to-br from-white/15 via-white/5 to-transparent shadow-2xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-[18%] rounded-full bg-black/65 border border-white/10 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white/40 border border-white/60" />
            </div>
            {[0.74, 0.57, 0.42].map((r, i) => (
              <div key={i} className="absolute rounded-full border border-white/[0.07] pointer-events-none"
                style={{ inset: `${(1 - r) * 50}%` }} />
            ))}
          </div>
        </div>
        {/* Waveform */}
        <div className="flex items-end justify-center gap-[2px] h-9 px-2 shrink-0">
          {Array.from({ length: 36 }, (_, i) => (
            <motion.div key={i} className="w-[2.5px] rounded-full bg-white/45"
              animate={{ height: ["14%", `${22 + Math.abs(Math.sin((i + 1) * 0.65)) * 68}%`, "14%"] }}
              transition={{ duration: 1.1 + (i % 5) * 0.13, repeat: Infinity, ease: "easeInOut", delay: i * 0.03 }}
            />
          ))}
        </div>
        {/* Info card */}
        <div className="rounded-[18px] border border-white/15 bg-black/30 px-4 py-4 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-1.5 mb-2">
            <Icon size={12} strokeWidth={1.8} />
            <span className="text-[9px] uppercase tracking-[.25em] text-white/50">{slide.label}</span>
          </div>
          <h2 className="text-xl font-black leading-tight tracking-tight line-clamp-2">{slide.title}</h2>
          <p className="mt-1.5 text-[11px] text-white/60 leading-relaxed line-clamp-2">{slide.subtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-5 p-6 overflow-hidden">
      {/* Decorative icon */}
      <div className="flex items-center justify-center shrink-0">
        <div className="relative">
          <div className="absolute inset-0 scale-[2] rounded-full bg-white/8 blur-2xl" />
          <div className="relative rounded-[20px] border border-white/20 bg-black/25 p-5 backdrop-blur-md">
            <Icon size={38} strokeWidth={1.2} />
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="rounded-[18px] border border-white/15 bg-black/30 px-5 py-5 backdrop-blur-md shrink-0">
        <span className="text-[9px] uppercase tracking-[.25em] text-white/45">{slide.label}</span>
        <h2 className="mt-2 text-2xl font-black leading-[1.05] tracking-tight line-clamp-3">{slide.title}</h2>
        <p className="mt-2.5 text-[12px] text-white/65 leading-relaxed line-clamp-3">{slide.subtitle}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Phone frame — proper React component so it never remounts
   on parent re-renders. Fixed pixel height, no viewport units
   inside the slide area.
───────────────────────────────────────────────────────────── */
interface PhoneFrameProps {
  slides: StorySlide[];
  active: number;
  paused: boolean;
  isLoading: boolean;
  current: StorySlide;
  onPrev: () => void;
  onNext: () => void;
  onTogglePause: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

function PhoneFrame({
  slides, active, paused, isLoading, current,
  onPrev, onNext, onTogglePause, onTouchStart, onTouchEnd,
}: PhoneFrameProps) {
  return (
    <div
      className="relative w-[340px] rounded-[44px] border border-white/[0.11] bg-black/50 p-[10px] shadow-[0_0_70px_rgba(139,92,246,0.28),0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-2xl"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Fixed-height screen — NEVER changes size */}
      <div className="w-full h-[600px] flex flex-col overflow-hidden rounded-[36px] border border-white/[0.07] bg-[#060608]">

        {/* Top bar: progress + pause */}
        <div className="shrink-0 flex items-center gap-2 px-4 pt-3.5 pb-2">
          <ProgressStrip count={slides.length} active={active} paused={paused} />
          <button
            onClick={onTogglePause}
            className="shrink-0 rounded-full bg-white/10 p-[7px] transition hover:bg-white/20 active:scale-90"
          >
            {paused ? <Play size={11} strokeWidth={2.2} /> : <Pause size={11} strokeWidth={2.2} />}
          </button>
        </div>

        {/* Slide area — fixed remaining height, no reflow possible */}
        <div className="flex-1 overflow-hidden mx-1 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 24, scale: 0.985 }}
              animate={{ opacity: 1, x: 0,  scale: 1    }}
              exit={{   opacity: 0, x: -24, scale: 0.985 }}
              transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              className={`absolute inset-0 rounded-[28px] bg-gradient-to-br ${current.accent} overflow-hidden`}
            >
              <SlideContent slide={current} />
            </motion.div>
          </AnimatePresence>

          {/* Loading shimmer overlay */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-[28px] bg-black/50 backdrop-blur-sm flex items-center justify-center z-20"
              >
                <Loader2 size={24} className="animate-spin text-white/60" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom nav */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5">
          <button onClick={onPrev}
            className="rounded-2xl bg-white/[0.07] border border-white/10 p-2.5 transition hover:bg-white/15 active:scale-90">
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <div className="text-center">
            <p className="text-[8px] uppercase tracking-[.26em] text-white/35">
              {active + 1} of {slides.length}
            </p>
            <p className="text-[11px] font-medium text-white/65 mt-0.5 leading-none">{current.label}</p>
          </div>
          <button onClick={onNext}
            className="rounded-2xl bg-white/[0.07] border border-white/10 p-2.5 transition hover:bg-white/15 active:scale-90">
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Date range input — shared between mobile + desktop
───────────────────────────────────────────────────────────── */
function DateRangeInputs({
  from, to, isLoading,
  onFromChange, onToChange,
}: {
  from: string; to: string; isLoading: boolean;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <label className="space-y-1.5">
          <span className="block text-[9px] uppercase tracking-[.22em] text-white/35">From</span>
          <input
            type="date" value={from} max={to}
            onChange={(e) => onFromChange(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white/90 outline-none transition focus:border-fuchsia-400/50 focus:bg-black/55 [color-scheme:dark]"
          />
        </label>
        <ArrowRight size={12} className="mb-3 text-white/22" />
        <label className="space-y-1.5">
          <span className="block text-[9px] uppercase tracking-[.22em] text-white/35">To</span>
          <input
            type="date" value={to} min={from}
            onChange={(e) => onToChange(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white/90 outline-none transition focus:border-fuchsia-400/50 focus:bg-black/55 [color-scheme:dark]"
          />
        </label>
      </div>
      {/* Live refetch indicator */}
      <div className={`flex items-center gap-2 transition-opacity duration-300 ${isLoading ? "opacity-100" : "opacity-0"}`}>
        <Loader2 size={11} className="animate-spin text-fuchsia-400" />
        <span className="text-[10px] text-fuchsia-400/80">Updating story…</span>
      </div>
      {!isLoading && (
        <p className="text-[10px] text-white/28">Story updates automatically when you change the range.</p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Export modal
───────────────────────────────────────────────────────────── */
function ExportModal({
  slides, from, to, onClose,
}: { slides: StorySlide[]; from: string; to: string; onClose: () => void }) {

  const handleDownload = () => {
    const html = buildFullExportHTML(slides, from, to);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `music-story-${from}-${to}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const html = buildFullExportHTML(slides, from, to);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.onload = () => win.print();
  };

  const handleNativeShare = async () => {
    if (!navigator.share) { handleDownload(); return; }
    try {
      await navigator.share({
        title: "My Music Story",
        text: `My music story for ${from} – ${to}`,
      });
    } catch { /* cancelled */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md px-4 pb-6 sm:pb-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 56, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{   y: 40, opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", damping: 32, stiffness: 360 }}
        className="w-full max-w-sm rounded-[28px] border border-white/[0.1] bg-[#0d0d10] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
          <div>
            <p className="text-[9px] uppercase tracking-[.26em] text-white/35">Export</p>
            <h3 className="mt-0.5 text-[15px] font-bold text-white">Your Full Story</h3>
          </div>
          <button onClick={onClose}
            className="rounded-xl bg-white/[0.07] p-2 text-white/45 transition hover:text-white active:scale-90">
            <X size={15} />
          </button>
        </div>

        {/* Slide strip preview */}
        <div className="px-5 pt-4 pb-3 border-b border-white/[0.07]">
          <p className="text-[9px] uppercase tracking-[.22em] text-white/30 mb-2.5">All {slides.length} slides included</p>
          <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
            {slides.map((s, i) => (
              <div key={s.id}
                className={`shrink-0 w-[46px] h-[66px] rounded-[14px] bg-gradient-to-br ${s.accent} border border-white/12 flex flex-col items-center justify-end pb-2 gap-1`}
              >
                <s.Icon size={13} strokeWidth={1.6} />
                <span className="text-[6px] uppercase tracking-wide text-white/65 text-center px-1 leading-tight">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Range */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-white/[0.07] text-white/40 text-xs">
          <CalendarRange size={12} strokeWidth={1.6} />
          <span>{from}</span>
          <ArrowRight size={10} className="text-white/22" />
          <span>{to}</span>
        </div>

        {/* Actions */}
        <div className="p-5 space-y-2">
          <button onClick={handlePrint}
            className="flex items-center justify-center gap-2.5 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[.98]">
            <Sparkles size={14} strokeWidth={1.8} />
            Save as PDF — all 8 slides
          </button>
          <button onClick={handleDownload}
            className="flex items-center justify-center gap-2.5 w-full rounded-2xl border border-white/[0.1] bg-white/[0.05] py-3.5 text-sm text-white/75 transition hover:bg-white/[0.09] active:scale-[.98]">
            <Download size={14} strokeWidth={1.6} />
            Download HTML file
          </button>
          <button onClick={handleNativeShare}
            className="flex items-center justify-center gap-2.5 w-full rounded-2xl border border-white/[0.1] bg-white/[0.05] py-3.5 text-sm text-white/75 transition hover:bg-white/[0.09] active:scale-[.98]">
            <Share2 size={14} strokeWidth={1.6} />
            Share via&hellip;
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────── */
export default function StoryModePage() {
  const [active, setActive]         = useState(0);
  const [paused, setPaused]         = useState(false);
  const [from, setFrom]             = useState("2025-01-01");
  const [to, setTo]                 = useState("2025-12-31");
  const [exportOpen, setExportOpen] = useState(false);
  const [dateOpen, setDateOpen]     = useState(false);
  const touchStart                  = useRef<number | null>(null);

  const { data, error, isLoading } = useStoryMode(from, to);

  const slides = useMemo<StorySlide[]>(() => {
    const emotionalMonth = data?.emotionalMonth.month
      ? new Date(2025, data.emotionalMonth.month - 1, 1).toLocaleString("en-US", { month: "long" })
      : "Unknown";
    return [
      { id: 1, label: "Top Song",           title: data?.topSong.title ?? "Loading your anthem",            subtitle: data?.topSong.subtitle ?? "Analyzing play history",                         accent: "from-fuchsia-500 via-purple-500 to-blue-500",    hexFrom: "#d946ef", hexVia: "#a855f7", hexTo: "#3b82f6", Icon: Music2      },
      { id: 2, label: "Top Artist",         title: data?.topArtist.title ?? "Loading top artist",           subtitle: data?.topArtist.subtitle ?? "Calculating listening minutes",                accent: "from-emerald-400 via-cyan-500 to-teal-600",      hexFrom: "#34d399", hexVia: "#06b6d4", hexTo: "#0f766e", Icon: Mic2        },
      { id: 3, label: "Music Age",          title: data?.musicAge.year ?? "Unknown",                        subtitle: data?.musicAge.subtitle ?? "Inferred from release-date metadata.",          accent: "from-violet-600 via-fuchsia-500 to-pink-400",    hexFrom: "#7c3aed", hexVia: "#d946ef", hexTo: "#f472b6", Icon: Clock       },
      { id: 4, label: "Favorite Era",       title: data?.favoriteEra.title ?? "Favorite era loading",       subtitle: data?.favoriteEra.subtitle ?? "Scanning your listening hours",              accent: "from-blue-500 via-indigo-500 to-violet-600",     hexFrom: "#3b82f6", hexVia: "#6366f1", hexTo: "#7c3aed", Icon: Layers      },
      { id: 5, label: "Forgotten Favorite", title: data?.forgottenFavorite.title ?? "Hidden memory",        subtitle: data?.forgottenFavorite.subtitle ?? "Looking for long-gap rediscoveries",   accent: "from-amber-400 via-orange-500 to-rose-500",      hexFrom: "#fbbf24", hexVia: "#f97316", hexTo: "#f43f5e", Icon: RefreshCcw  },
      { id: 6, label: "Emotional Month",    title: emotionalMonth,                                          subtitle: data?.emotionalMonth.subtitle ?? "Not enough data in selected range",       accent: "from-indigo-600 via-sky-500 to-cyan-400",        hexFrom: "#4f46e5", hexVia: "#0ea5e9", hexTo: "#22d3ee", Icon: HeartPulse  },
      { id: 7, label: "Hidden Gem",         title: data?.hiddenGem?.trackName ?? "No hidden gem yet",       subtitle: data?.hiddenGem ? `${data.hiddenGem.artistName} · ${data.hiddenGem.plays} plays` : "Play more tracks to unlock this", accent: "from-purple-600 via-indigo-500 to-sky-400", hexFrom: "#9333ea", hexVia: "#6366f1", hexTo: "#38bdf8", Icon: Diamond     },
      { id: 8, label: "Personality",        title: data?.personality.title ?? "Personality loading",        subtitle: data?.personality.subtitle ?? "Calibrating your listening fingerprint",      accent: "from-rose-500 via-fuchsia-600 to-violet-600",    hexFrom: "#f43f5e", hexVia: "#c026d3", hexTo: "#7c3aed", Icon: Fingerprint },
    ];
  }, [data]);

  /* Auto-advance — pause while loading so partial data doesn't flicker */
  useEffect(() => {
    if (paused || isLoading) return;
    const t = setInterval(() => setActive((p) => (p + 1) % slides.length), DURATION_MS);
    return () => clearInterval(t);
  }, [paused, isLoading, slides.length]);

  const prev = useCallback(() => setActive((p) => (p - 1 + slides.length) % slides.length), [slides.length]);
  const next = useCallback(() => setActive((p) => (p + 1) % slides.length), [slides.length]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  }, []);
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStart.current = null;
  }, [next, prev]);

  const current = slides[active];

  /* Shared phone frame props */
  const frameProps: PhoneFrameProps = {
    slides, active, paused, isLoading, current,
    onPrev: prev, onNext: next,
    onTogglePause: () => setPaused((p) => !p),
    onTouchStart, onTouchEnd,
  };

  return (
    <div className="min-h-screen bg-background text-white selection:bg-violet-500/30 flex overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col overflow-x-hidden">
        <TopNav />

        {/* Ambient atmosphere */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-600/[0.09] blur-[130px]" />
          <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-fuchsia-600/[0.07] blur-[110px]" />
          <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full bg-cyan-600/[0.06] blur-[130px]" />
        </div>

        <main className="relative flex-1 w-full">

          {/* ── MOBILE ( < lg ) ─────────────────────────────── */}
          <div className="lg:hidden flex flex-col items-center px-4 pt-5 pb-12 gap-5">

            <PhoneFrame {...frameProps} />

            {/* Dot nav */}
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`rounded-full transition-all duration-300 ${i === active ? "w-5 h-[5px] bg-white" : "w-[5px] h-[5px] bg-white/20"}`}
                />
              ))}
            </div>

            {/* CTA */}
            <button onClick={() => setExportOpen(true)}
              className="flex items-center justify-center gap-2.5 w-full max-w-[340px] rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 py-3.5 text-sm font-semibold transition hover:opacity-90 active:scale-[.98]">
              <Sparkles size={14} strokeWidth={1.8} />
              Share your music story
            </button>

            <div className="flex gap-2 w-full max-w-[340px]">
              <button onClick={() => setActive(0)}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-sm text-white/60 transition hover:text-white active:scale-[.98]">
                <RotateCcw size={13} strokeWidth={1.8} /> Replay
              </button>
              <button onClick={() => setDateOpen((p) => !p)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-2xl border py-3 text-sm transition active:scale-[.98] ${
                  dateOpen
                    ? "border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-300"
                    : "border-white/10 bg-white/[0.04] text-white/60 hover:text-white"
                }`}>
                <CalendarRange size={13} strokeWidth={1.8} />
                {dateOpen ? "Hide" : "Date range"}
              </button>
            </div>

            {/* Collapsible date panel */}
            <AnimatePresence>
              {dateOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="w-full max-w-[340px] overflow-hidden"
                >
                  <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl">
                    <DateRangeInputs from={from} to={to} isLoading={isLoading} onFromChange={setFrom} onToChange={setTo} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && <p className="text-xs text-rose-400/80 max-w-[340px] text-center">Failed to load story data. Check your connection.</p>}
          </div>

          {/* ── DESKTOP ( ≥ lg ) ─────────────────────────────── */}
          <div className="hidden lg:flex items-center justify-center gap-12 px-12 py-10 min-h-[calc(100vh-64px)]">

            {/* Sticky phone */}
            <div className="sticky top-10 self-start pt-2">
              <PhoneFrame {...frameProps} />
            </div>

            {/* Right panel */}
            <div className="w-[360px] shrink-0 space-y-3">

              {/* Title + chapter nav */}
              <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-6 backdrop-blur-xl">
                <p className="text-[8px] uppercase tracking-[.3em] text-white/30 mb-2">Story Mode</p>
                <h1 className="text-[26px] font-black leading-[1.1] tracking-tight">
                  Your music story,
                  <span className="text-white/35 font-black"> cinematic.</span>
                </h1>

                {error && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-rose-400/75">
                    Failed to load story data.
                  </p>
                )}

                <div className="mt-5 grid grid-cols-2 gap-1.5">
                  {slides.map((slide, i) => {
                    const isAct = i === active;
                    return (
                      <button key={slide.id} onClick={() => setActive(i)}
                        className={`group relative flex items-center gap-2.5 rounded-[18px] border p-3 text-left transition-all ${
                          isAct
                            ? "border-white/22 bg-white/[0.09]"
                            : "border-white/[0.06] bg-transparent hover:bg-white/[0.04]"
                        }`}
                      >
                        {isAct && (
                          <motion.div layoutId="chapter-bg"
                            className={`absolute inset-0 rounded-[18px] bg-gradient-to-br ${slide.accent} opacity-[0.18] -z-10`}
                          />
                        )}
                        <div className={`shrink-0 rounded-xl p-[7px] transition-colors ${isAct ? "bg-white/14" : "bg-white/[0.07]"}`}>
                          <slide.Icon size={12} strokeWidth={1.8} />
                        </div>
                        <span className={`text-[11px] font-medium leading-tight transition-colors ${isAct ? "text-white" : "text-white/50"}`}>
                          {slide.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date range */}
              <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-[11px] text-white/40">
                    <CalendarRange size={12} strokeWidth={1.6} />
                    Date range
                  </div>
                  <span className="text-[8px] uppercase tracking-[.2em] text-white/25 border border-white/[0.08] rounded-full px-2.5 py-1">
                    Story filter
                  </span>
                </div>
                <DateRangeInputs from={from} to={to} isLoading={isLoading} onFromChange={setFrom} onToChange={setTo} />
              </div>

              {/* Actions */}
              <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-5 backdrop-blur-xl space-y-2">
                <button onClick={() => setExportOpen(true)}
                  className="flex items-center justify-center gap-2.5 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 py-3.5 text-sm font-semibold transition hover:opacity-90 active:scale-[.98]">
                  <Sparkles size={13} strokeWidth={1.8} />
                  Share your music story
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setExportOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/[0.09] bg-white/[0.04] py-3 text-sm text-white/60 transition hover:text-white hover:bg-white/[0.07] active:scale-[.98]">
                    <Share2 size={12} strokeWidth={1.6} /> Share
                  </button>
                  <button onClick={() => setExportOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/[0.09] bg-white/[0.04] py-3 text-sm text-white/60 transition hover:text-white hover:bg-white/[0.07] active:scale-[.98]">
                    <Download size={12} strokeWidth={1.6} /> Export
                  </button>
                </div>
                <button onClick={() => setActive(0)}
                  className="flex items-center justify-center gap-2 w-full rounded-2xl border border-white/[0.07] py-3 text-sm text-white/38 transition hover:text-white/65 active:scale-[.98]">
                  <RotateCcw size={12} strokeWidth={1.6} /> Replay Story
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Export modal */}
      <AnimatePresence>
        {exportOpen && (
          <ExportModal slides={slides} from={from} to={to} onClose={() => setExportOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}