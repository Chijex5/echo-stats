"use client";

import React, { memo, useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Heart, Share2, Clock, Calendar, Moon,
  CloudRain, Sparkles, Disc3, Repeat, Music2,
  ArrowUpRight, Flame, ChevronLeft, ChevronRight,
  LucideIcon, Download, X, Check, Link2,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  ResponsiveContainer,
} from "recharts";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import {
  useSongOfTheDay,
  type SotdSong,
  type SotdStats,
  type StoryBeat,
  type MemorySnapshot,
  type AlgoReason,
  type MoodReconstruction,
  type RelatedTrack,
  type DailyRitual,
  type AlgoIconName,
  type StoryIconName,
} from "@/lib/hooks/useSongOfTheDay";

// ─── Icon map ──────────────────────────────────────────────────────────────

const ICON_MAP: Record<AlgoIconName | StoryIconName, LucideIcon> = {
  Calendar,
  Heart,
  Moon,
  Sparkles,
  CloudRain,
  Repeat,
};

// ─── Particles (memoised, stable) ──────────────────────────────────────────

const PARTICLE_DATA = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 11.3) % 100,
  top: (i * 19.7) % 100,
  delay: (i % 6) * 0.5,
  size: 2 + (i * 3) % 3,
  duration: 6 + (i * 1.3) % 5,
}));

// ─── Skeleton primitives ───────────────────────────────────────────────────

function Shimmer({ w = "w-full", h = "h-3", cls = "" }: { w?: string; h?: string; cls?: string }) {
  return <div className={`${w} ${h} ${cls} rounded bg-white/10 animate-pulse`} />;
}

// ─── Section Label ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/35 font-medium mb-2">
      {children}
    </div>
  );
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

// ─── Share Card (Canvas) ───────────────────────────────────────────────────

async function drawShareCard(
  song: SotdSong,
  stats: SotdStats,
  affinityScore: number,
  affinityLabel: string
): Promise<string> {
  const albumImg = song.albumImageUrl
    ? await loadImage(song.albumImageUrl).catch(() => null)
    : null;
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const W = 1080, H = 1080;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    

    // ── Base fill
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, W, H);

    // ── Ambient orbs
    const orb1 = ctx.createRadialGradient(220, 220, 0, 220, 220, 580);
    orb1.addColorStop(0, song.gradientFrom + "50");
    orb1.addColorStop(1, "transparent");
    ctx.fillStyle = orb1;
    ctx.fillRect(0, 0, W, H);

    const orb2 = ctx.createRadialGradient(880, 880, 0, 880, 880, 460);
    orb2.addColorStop(0, song.gradientTo + "40");
    orb2.addColorStop(1, "transparent");
    ctx.fillStyle = orb2;
    ctx.fillRect(0, 0, W, H);

    // ── Rounded rect helper
    const rrPath = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    // ── Album art block (left)
    const artSz = 420;
    const artX = 80;
    const artY = 130;
    ctx.shadowColor = song.gradientFrom + "88";
    ctx.shadowBlur = 90;
    rrPath(artX, artY, artSz, artSz, 32);
    ctx.save();
    ctx.clip();

    if (albumImg) {
      // IMAGE MODE
      ctx.drawImage(albumImg, artX, artY, artSz, artSz);
    } else {
      // FALLBACK GRADIENT MODE
      const artGrad = ctx.createLinearGradient(
        artX,
        artY,
        artX + artSz,
        artY + artSz
      );
      artGrad.addColorStop(0, song.gradientFrom);
      artGrad.addColorStop(1, song.gradientTo);

      ctx.fillStyle = artGrad;
      ctx.fillRect(artX, artY, artSz, artSz);
    }

    ctx.restore();
    ctx.shadowBlur = 0;
    // Overlay shimmer
    
    const shimmer = ctx.createLinearGradient(artX, artY, artX + artSz, artY + artSz);
    shimmer.addColorStop(0, "rgba(255,255,255,0.18)");
    shimmer.addColorStop(0.5, "transparent");
    shimmer.addColorStop(1, "rgba(0,0,0,0.25)");
    rrPath(artX, artY, artSz, artSz, 32);
    ctx.fillStyle = shimmer;
    ctx.fill();

    // ── Right column
    const rx = artX + artSz + 68;
    const rw = W - rx - 80;

    // "SONG OF THE DAY" chip
    rrPath(rx, artY + 4, 218, 36, 18);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fill();
    rrPath(rx, artY + 4, 218, 36, 18);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "600 20px system-ui, sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText("SONG OF THE DAY", rx + 14, artY + 22);

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 64px Georgia, 'Times New Roman', serif`;
    ctx.textBaseline = "top";
    let titleText = song.title;
    if (ctx.measureText(titleText).width > rw) {
      while (ctx.measureText(titleText + "…").width > rw && titleText.length > 1)
        titleText = titleText.slice(0, -1);
      titleText += "…";
    }
    ctx.fillText(titleText, rx, artY + 58);

    // Artist
    ctx.fillStyle = "rgba(255,255,255,0.68)";
    ctx.font = "40px system-ui, sans-serif";
    ctx.fillText(song.artist, rx, artY + 152);

    // Album · year
    ctx.fillStyle = "rgba(255,255,255,0.32)";
    ctx.font = "28px system-ui, sans-serif";
    ctx.fillText(`${song.album} · ${song.released}`, rx, artY + 212);

    // Divider
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rx, artY + 264);
    ctx.lineTo(rx + rw, artY + 264);
    ctx.stroke();

    // Stats — 3 rows
    const statRows = [
      { label: "PAST PLAYS",  value: String(stats.pastPlays) },
      { label: "LAST PLAYED", value: stats.lastPlayed },
      { label: "FAV MONTH",   value: stats.favoriteMonth },
    ];
    statRows.forEach(({ label, value }, i) => {
      const sy = artY + 290 + i * 106;
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "600 20px system-ui, sans-serif";
      ctx.textBaseline = "top";
      ctx.fillText(label, rx, sy);
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold 46px Georgia, serif`;
      ctx.fillText(value, rx, sy + 28);
    });

    // ── Bottom affinity bar
    const barY = H - 148;
    const barH = 92;
    const barPad = 80;

    // Glass background
    rrPath(barPad, barY, W - barPad * 2, barH, 20);
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fill();
    rrPath(barPad, barY, W - barPad * 2, barH, 20);
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Affinity fill
    const innerW = W - barPad * 2 - 32;
    const fillW = Math.max(36, innerW * (affinityScore / 100));
    rrPath(barPad + 16, barY + 22, fillW, barH - 44, 10);
    const barGrad = ctx.createLinearGradient(barPad + 16, 0, barPad + 16 + fillW, 0);
    barGrad.addColorStop(0, song.gradientFrom);
    barGrad.addColorStop(1, "#a7f3d0");
    ctx.fillStyle = barGrad;
    ctx.fill();

    // Affinity text
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.font = "600 26px system-ui, sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(`Affinity · ${affinityScore}/100  ·  ${affinityLabel}`, barPad + 20, barY + barH / 2);

    // Branding
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.font = "22px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("Spotify · Song of the Day", W - barPad - 4, barY + barH / 2);

    resolve(canvas.toDataURL("image/png"));
  });
}

// ─── Share Modal ───────────────────────────────────────────────────────────

interface ShareModalProps {
  song: SotdSong;
  stats: SotdStats;
  affinityScore: number;
  affinityLabel: string;
  onClose: () => void;
}

function ShareModal({ song, stats, affinityScore, affinityLabel, onClose }: ShareModalProps) {
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    drawShareCard(song, stats, affinityScore, affinityLabel).then((url) => {
      setCardUrl(url);
      setGenerating(false);
    });
  }, [song, stats, affinityScore, affinityLabel]);

  const handleDownload = () => {
    if (!cardUrl) return;
    const a = document.createElement("a");
    a.href = cardUrl;
    a.download = `sotd-${song.title.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
  };

  const handleShare = async () => {
    if (!cardUrl) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        const res = await fetch(cardUrl);
        const blob = await res.blob();
        const file = new File([blob], "song-of-the-day.png", { type: "image/png" });
        await navigator.share({ title: `${song.title} · Song of the Day`, files: [file] });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch { handleDownload(); }
    } else {
      handleDownload();
    }
  };

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xl p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          key="sheet"
          initial={{ y: 60, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 340, damping: 32 }}
          className="relative w-full sm:max-w-sm bg-[#111111] border border-white/10 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.9)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle (mobile) */}
          <div className="sm:hidden flex justify-center pt-3 pb-0">
            <div className="w-10 h-1 rounded-full bg-white/15" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3 sm:pt-5">
            <div>
              <p className="text-sm font-semibold leading-none">Share this memory</p>
              <p className="text-[11px] text-white/40 mt-1">Your personalised {song.title} card</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors border border-white/8"
            >
              <X size={14} />
            </button>
          </div>

          {/* Preview */}
          <div className="px-5 pb-1">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 ring-1 ring-white/8">
              {generating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, ease: "linear", repeat: Infinity }}
                    className="w-9 h-9 rounded-full border-2 border-white/10"
                    style={{ borderTopColor: song.gradientFrom }}
                  />
                  <span className="text-[11px] text-white/40 tracking-wide">Generating card…</span>
                </div>
              ) : cardUrl ? (
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  src={cardUrl}
                  alt="Shareable card"
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
          </div>

          {/* Actions */}
          <div className="p-5 grid grid-cols-3 gap-3">
            {[
              {
                icon: generating ? null : <Download size={17} />,
                label: "Download",
                onClick: handleDownload,
                disabled: !cardUrl,
                active: false,
              },
              {
                icon: shared ? <Check size={17} className="text-spotify" /> : <Share2 size={17} />,
                label: shared ? "Shared!" : "Share",
                onClick: handleShare,
                disabled: !cardUrl,
                active: shared,
              },
              {
                icon: copied ? <Check size={17} className="text-spotify" /> : <Link2 size={17} />,
                label: copied ? "Copied!" : "Copy link",
                onClick: handleCopyLink,
                disabled: false,
                active: copied,
              },
            ].map(({ icon, label, onClick, disabled, active }) => (
              <button
                key={label}
                onClick={onClick}
                disabled={disabled}
                className={`flex flex-col items-center gap-2 py-3.5 rounded-xl border transition-all active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed ${
                  active
                    ? "bg-spotify/10 border-spotify/30 text-spotify"
                    : "bg-white/[0.04] border-white/8 hover:bg-white/[0.08] text-white/60"
                }`}
              >
                {generating && label === "Download" ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, ease: "linear", repeat: Infinity }}
                    className="w-[17px] h-[17px] rounded-full border border-white/20"
                    style={{ borderTopColor: "rgba(255,255,255,0.6)" }}
                  />
                ) : icon}
                <span className="text-[11px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── SotdHero ──────────────────────────────────────────────────────────────

interface SotdHeroProps {
  song: SotdSong;
  stats: SotdStats;
  affinityScore: number;
  affinityLabel: string;
  onShare: () => void;
}

function SotdHero({ song, stats, affinityScore, affinityLabel, onShare }: SotdHeroProps) {
  console.log(song)
  return (
    <section className="relative pt-4 pb-2">
      {/* Ambient blobs */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[160px] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${song.gradientFrom}55, transparent 70%)` }}
      />
      <div
        className="absolute top-32 -left-20 w-[420px] h-[420px] rounded-full blur-[140px] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${song.gradientTo}40, transparent 70%)` }}
      />
      <div className="absolute top-20 right-0 w-[420px] h-[420px] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLE_DATA.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, opacity: 0.5 }}
            animate={{ y: [-8, 8, -8], opacity: [0.15, 0.7, 0.15] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Waveform */}
      <svg className="absolute left-0 right-0 top-1/2 -translate-y-1/2 w-full h-72 opacity-25 pointer-events-none" viewBox="0 0 1440 320" fill="none">
        <defs>
          <linearGradient id="sotd-wave" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={song.gradientFrom} stopOpacity="0" />
            <stop offset="0.5" stopColor={song.gradientFrom} />
            <stop offset="1" stopColor={song.gradientTo} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M0 160 C 240 70, 240 250, 480 160 S 720 70, 960 160 S 1200 250, 1440 160"
          stroke="url(#sotd-wave)" strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.4, ease: "easeInOut" }}
        />
      </svg>

      {/* Headline */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-[10px] uppercase tracking-[0.18em] text-white/60 mb-6">
          <Sparkles size={11} className="text-spotify" />
          Song of the day · {new Date().toLocaleDateString("en-US", { weekday: "long" })}
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-3">
          A song you{" "}
          <span className="font-serif italic font-normal text-white/90">loved</span> once.
        </h1>
        <p className="text-base sm:text-lg text-white/50 max-w-sm sm:max-w-xl mx-auto">
          A memory waiting to return. Today, we found it.
        </p>
      </div>

      {/* Hero card */}
      <div className="relative z-10 mt-10 sm:mt-12 mx-auto max-w-3xl">
        <div
          className="absolute -inset-4 sm:-inset-6 rounded-[2.5rem] blur-2xl opacity-60 pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${song.gradientFrom}50, ${song.gradientTo}40)` }}
        />
        <div className="relative glass-card p-5 sm:p-8 md:p-10 overflow-hidden">
          {/* Top shimmer line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className={`absolute -top-32 -left-20 w-[420px] h-[420px] rounded-full bg-gradient-to-br ${song.gradientClass} blur-[120px] opacity-30 pointer-events-none`} />

          {/* ── Mobile: stacked layout ── */}
          <div className="relative flex flex-col md:hidden items-center gap-7">
            {/* Art */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative w-52 h-52 rounded-2xl shadow-2xl shadow-black/60 ring-1 ring-white/10 overflow-hidden"
            >
              {song.albumImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={song.albumImageUrl}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${song.gradientClass}`}
                />
              )}

              {/* overlays stay ALWAYS */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/15" />
              <Disc3 className="absolute bottom-4 right-4 text-white/30" size={36} />

              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 active:opacity-100 transition-opacity cursor-pointer group">
                <div className="w-14 h-14 rounded-full bg-white/95 text-black flex items-center justify-center shadow-xl">
                  <Play size={20} fill="currentColor" className="ml-0.5" />
                </div>
              </div>
            </motion.div>

            {/* Meta */}
            <div className="text-center w-full">
              <div className="text-[10px] uppercase tracking-widest text-white/35 mb-1.5">Forgotten favorite</div>
              <h2 className="text-2xl font-bold tracking-tight mb-1 leading-tight">{song.title}</h2>
              <p className="text-sm text-white/55 mb-6">
                {song.artist}
                <span className="text-white/25 mx-2">·</span>
                {song.album}
                <span className="text-white/25 mx-2">·</span>
                {song.released}
              </p>

              {/* 2-col stats on mobile */}
              <div className="grid grid-cols-2 gap-3 mb-7 text-left">
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5">
                  <div className="text-[10px] uppercase tracking-widest text-white/35 mb-1">Past plays</div>
                  <div className="text-2xl font-serif leading-none">{stats.pastPlays}</div>
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5">
                  <div className="text-[10px] uppercase tracking-widest text-white/35 mb-1">Last played</div>
                  <div className="text-sm font-semibold leading-tight mt-0.5">{stats.lastPlayed}</div>
                </div>
              </div>

              {/* Action row */}
              <div className="grid grid-cols-3 gap-2">
                <button className="col-span-3 inline-flex items-center justify-center gap-2 bg-spotify hover:bg-spotify-light text-black text-sm font-semibold px-5 py-3 rounded-full transition-all shadow-[0_0_28px_-6px_rgba(29,185,84,0.65)] active:scale-95">
                  <Play size={14} fill="currentColor" />
                  Play preview
                </button>
                <button className="inline-flex items-center justify-center gap-1.5 bg-white/8 hover:bg-white/14 border border-white/10 text-white text-sm font-medium py-2.5 rounded-full transition-colors active:scale-95">
                  <Heart size={13} />
                  <span className="hidden sm:inline">Save</span>
                </button>
                <button
                  onClick={onShare}
                  className="col-span-2 inline-flex items-center justify-center gap-1.5 bg-white/8 hover:bg-white/14 border border-white/10 text-white text-sm font-medium py-2.5 rounded-full transition-colors active:scale-95"
                >
                  <Share2 size={13} />
                  Share card
                </button>
              </div>
            </div>
          </div>

          {/* ── Desktop: side-by-side layout ── */}
          <div className="relative hidden md:grid grid-cols-[280px_1fr] gap-8 md:gap-10 items-center">
            {/* Album art */}
            <div className="relative mx-auto md:mx-0">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 22, ease: "linear", repeat: Infinity }}
                className="absolute -right-12 top-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-gradient-to-br from-zinc-800 to-black ring-1 ring-white/10 hidden md:block"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at center, rgba(255,255,255,0.06) 0%, transparent 12%), repeating-radial-gradient(circle at center, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 6px)",
                }}
              >
                <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 ring-1 ring-white/10" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative w-56 h-56 md:w-64 md:h-64 rounded-2xl shadow-2xl shadow-black/60 ring-1 ring-white/10 overflow-hidden"
              >
                {/* BASE LAYER (image OR fallback gradient) */}
                {song.albumImageUrl ? (
                  <img
                    src={song.albumImageUrl}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${song.gradientClass}`} />
                )}

                {/* overlays stay untouched */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/15" />

                <Disc3 className="absolute bottom-4 right-4 text-white/30" size={40} />

                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30 cursor-pointer group">
                  <div className="w-16 h-16 rounded-full bg-white/95 text-black flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
                    <Play size={22} fill="currentColor" className="ml-1" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Metadata */}
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-white/35 mb-2">Forgotten favorite</div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-1 truncate">{song.title}</h2>
              <p className="text-base text-white/60 mb-6">
                {song.artist}
                <span className="text-white/25 mx-2">·</span>
                {song.album}
                <span className="text-white/25 mx-2">·</span>
                {song.released}
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Past plays", value: stats.pastPlays, isLarge: true },
                  { label: "Last played", value: stats.lastPlayed },
                  { label: "Favorite month", value: stats.favoriteMonth },
                ].map((s) => (
                  <div key={s.label} className="border-l border-white/8 pl-3 first:border-l-0 first:pl-0">
                    <div className="text-[10px] uppercase tracking-widest text-white/35 mb-1">{s.label}</div>
                    <div className={s.isLarge ? "text-2xl font-serif" : "text-sm font-semibold"}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button className="inline-flex items-center gap-2 bg-spotify hover:bg-spotify-light text-black text-sm font-semibold px-6 py-3 rounded-full transition-all shadow-[0_0_32px_-6px_rgba(29,185,84,0.7)] hover:-translate-y-0.5 active:scale-95">
                  <Play size={14} fill="currentColor" />
                  Play preview
                </button>
                <button className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/14 border border-white/10 text-white text-sm font-medium px-4 py-3 rounded-full transition-colors active:scale-95">
                  <Heart size={14} />
                  Save
                </button>
                <button
                  onClick={onShare}
                  className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/14 border border-white/10 text-white text-sm font-medium px-4 py-3 rounded-full transition-colors active:scale-95"
                >
                  <Share2 size={14} />
                  Share card
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SotdHeroSkeleton() {
  return (
    <section className="relative pt-4 pb-2">
      <div className="relative z-10 max-w-4xl mx-auto text-center mb-10 sm:mb-12">
        <Shimmer w="w-48" h="h-5" cls="mx-auto mb-6" />
        <Shimmer w="w-3/4" h="h-10 md:h-14" cls="mx-auto mb-3" />
        <Shimmer w="w-1/2" h="h-5" cls="mx-auto" />
      </div>
      <div className="mx-auto max-w-3xl glass-card p-5 sm:p-8 md:p-10 animate-pulse">
        <div className="flex flex-col md:hidden items-center gap-6">
          <div className="w-52 h-52 rounded-2xl bg-white/10" />
          <div className="w-full space-y-4">
            <Shimmer w="w-3/4" h="h-8" cls="mx-auto" />
            <Shimmer w="w-1/2" h="h-4" cls="mx-auto" />
            <div className="grid grid-cols-2 gap-3"><Shimmer h="h-16" cls="rounded-xl" /><Shimmer h="h-16" cls="rounded-xl" /></div>
            <Shimmer h="h-11" cls="rounded-full" />
          </div>
        </div>
        <div className="hidden md:grid grid-cols-[280px_1fr] gap-8 items-center">
          <div className="w-56 h-56 md:w-64 md:h-64 rounded-2xl bg-white/10 mx-auto md:mx-0" />
          <div className="space-y-4">
            <Shimmer w="w-24" h="h-2.5" />
            <Shimmer w="w-3/4" h="h-9" />
            <Shimmer w="w-1/2" h="h-5" />
            <div className="grid grid-cols-3 gap-4 pt-2">
              {[0,1,2].map(i => <div key={i} className="space-y-1.5"><Shimmer w="w-full" h="h-2" /><Shimmer w="w-2/3" h="h-5" /></div>)}
            </div>
            <div className="flex gap-2.5 pt-2">
              <Shimmer w="w-32" h="h-11" cls="rounded-full" />
              <Shimmer w="w-20" h="h-11" cls="rounded-full" />
              <Shimmer w="w-24" h="h-11" cls="rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── TheStory ──────────────────────────────────────────────────────────────

interface TheStoryProps {
  beats: StoryBeat[];
  song: SotdSong;
}

function TheStory({ beats, song }: TheStoryProps) {
  return (
    <section>
      <div className="mb-6 max-w-2xl">
        <SectionLabel>The story</SectionLabel>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">
          You lived with this song for a{" "}
          <span className="font-serif italic font-normal text-white/90">season</span>.
        </h2>
      </div>
      <div className="glass-card p-5 sm:p-8 md:p-10 relative overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full blur-[120px] opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${song.gradientFrom}, transparent)` }}
        />
        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8 md:gap-10">
          {beats.map((b, i) => {
            const Icon = ICON_MAP[b.icon];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/8 flex items-center justify-center text-white/60 shrink-0 mt-1">
                  <Icon size={15} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <div className="text-3xl sm:text-4xl font-serif leading-none mb-1.5">{b.stat}</div>
                  <div className="text-sm text-white/50 leading-relaxed">{b.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TheStorySkeleton() {
  return (
    <section>
      <div className="mb-6 space-y-2">
        <Shimmer w="w-20" h="h-2.5" />
        <Shimmer w="w-3/4" h="h-8 sm:h-10" />
      </div>
      <div className="glass-card p-5 sm:p-8 md:p-10 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
          {[0,1,2,3].map(i => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 shrink-0 mt-1" />
              <div className="space-y-2 flex-1">
                <Shimmer w="w-20" h="h-9" />
                <Shimmer w="w-3/4" h="h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── MemorySnapshot ────────────────────────────────────────────────────────

function MemorySnapshotSection({ data }: { data: MemorySnapshot }) {
  return (
    <section>
      <div className="mb-6">
        <SectionLabel>Memory snapshot</SectionLabel>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">When it peaked</h2>
        <p className="text-sm text-white/45 mt-1">
          What surrounded this song in {data.peakMonthLabel}.
        </p>
      </div>

      {/* Mobile: single column; desktop: 3-col */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Co-played tracks */}
        <div className="glass-card p-5 sm:p-6">
          <SectionLabel><Music2 size={10} />What else you played</SectionLabel>
          <div className="space-y-2.5 mt-1">
            {data.snapshotTracks.map((t, i) => (
              <div key={i} className="flex items-center gap-3 group py-1">
                <div className="w-10 h-10 rounded-lg ring-1 ring-white/10 shrink-0 relative overflow-hidden bg-black/20">
                  {t.albumImageUrl ? (
                    <img
                      src={t.albumImageUrl}
                      alt={t.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${t.color}`} />
                  )}

                  {/* subtle dark overlay for consistency */}
                  <div className="absolute inset-0 bg-black/15" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate leading-tight">{t.title}</div>
                  <div className="text-xs text-white/45 truncate mt-0.5">{t.artist}</div>
                </div>
                <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Play size={9} fill="currentColor" className="ml-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top artist + hours */}
        <div className="glass-card p-5 sm:p-6 flex flex-col gap-5">
          {data.topArtist && (
            <div>
              <SectionLabel>Top artist</SectionLabel>
              <div className="flex items-center gap-3 mt-1">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${data.topArtist.color} flex items-center justify-center font-bold ring-1 ring-white/10 text-sm`}>
                  {data.topArtist.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold">{data.topArtist.name}</div>
                  <div className="text-xs text-white/45">{data.topArtist.plays} plays that month</div>
                </div>
              </div>
            </div>
          )}
          <div className="border-t border-white/5 pt-5 flex flex-row md:flex-col gap-6 md:gap-0">
            <div className="flex-1">
              <SectionLabel>Hours streamed</SectionLabel>
              <div className="text-2xl font-serif mt-0.5">{data.peakMonthHours}h</div>
              <p className="text-xs text-white/40 mt-0.5">total that month</p>
            </div>
            <div className="flex-1">
              <SectionLabel>Peak period</SectionLabel>
              <div className="text-sm font-semibold mt-0.5">{data.peakMonthLabel}</div>
              <p className="text-xs text-white/40 mt-0.5">highest activity</p>
            </div>
          </div>
        </div>

        {/* Photo collage */}
        <div className="glass-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>Snapshot</SectionLabel>
            <div className="text-xs text-white/50 font-medium">{data.peakMonthLabel}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {data.snapshotCollage.map((c, i) => (
              <div
                key={i}
                className={`aspect-square rounded-xl bg-gradient-to-br ${c} ring-1 ring-white/8 shadow-md overflow-hidden`}
                style={{ opacity: 0.55 + (i * 13) % 5 * 0.08 }}
              >
                <div className="w-full h-full bg-black/15" />
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/40 leading-relaxed">
            You streamed{" "}
            <span className="text-white font-medium">{data.peakMonthHours} hours</span> of music that month.
          </p>
        </div>
      </div>
    </section>
  );
}

function MemorySnapshotSkeleton() {
  return (
    <section>
      <div className="mb-6 space-y-1.5"><Shimmer w="w-16" h="h-2.5" /><Shimmer w="w-44" h="h-7" /><Shimmer w="w-56" h="h-4" /></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {[0,1,2].map(i => (
          <div key={i} className="glass-card p-5 sm:p-6 animate-pulse space-y-3">
            {[0,1,2,3].map(j => (
              <div key={j} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 shrink-0" />
                <div className="space-y-1.5 flex-1"><Shimmer w="w-3/4" h="h-3" /><Shimmer w="w-1/2" h="h-2.5" /></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── WhyWePickedThis ───────────────────────────────────────────────────────

interface WhyProps {
  reasons: AlgoReason[];
  affinityScore: number;
  affinityLabel: string;
}

function WhyWePickedThis({ reasons, affinityScore, affinityLabel }: WhyProps) {
  return (
    <section>
      <div className="mb-6">
        <SectionLabel>The algorithm</SectionLabel>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Why we picked this</h2>
        <p className="text-sm text-white/45 mt-1">A glimpse at the signals choosing today&apos;s memory.</p>
      </div>
      <div className="glass-card p-5 sm:p-8 md:p-10 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {reasons.map((r, i) => {
              const Icon = ICON_MAP[r.icon];
              return (
                <motion.div
                  key={r.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="relative flex flex-col items-center text-center group"
                >
                  <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white/[0.04] border border-white/8 flex items-center justify-center text-white/70 mb-3 sm:mb-4 transition-colors group-hover:bg-white/[0.07] group-hover:border-white/14">
                    <Icon size={18} strokeWidth={1.8} />
                  </div>
                  <div className="text-sm font-semibold mb-1.5 leading-tight">{r.label}</div>
                  <p className="text-[11px] text-white/45 leading-relaxed max-w-[170px]">{r.desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Affinity bar */}
          <div className="mt-8 sm:mt-10 pt-7 sm:pt-8 border-t border-white/5 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
              <div>
                <SectionLabel>Affinity score</SectionLabel>
                <div className="flex items-baseline gap-3 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-serif">{affinityScore}</span>
                  <span className="text-sm text-spotify font-medium">{affinityLabel}</span>
                </div>
              </div>
              <div className="w-full sm:w-80">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${affinityScore}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-spotify via-emerald-400 to-emerald-200 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-white/30 mt-2">
                  <span>0</span><span>50</span><span>100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhySkeleton() {
  return (
    <section>
      <div className="mb-6 space-y-1.5"><Shimmer w="w-16" h="h-2.5" /><Shimmer w="w-48" h="h-7" /><Shimmer w="w-64" h="h-4" /></div>
      <div className="glass-card p-5 sm:p-8 md:p-10 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
          {[0,1,2,3].map(i => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white/10" />
              <Shimmer w="w-20" h="h-3" />
              <Shimmer w="w-28" h="h-2.5" />
              <Shimmer w="w-24" h="h-2.5" />
            </div>
          ))}
        </div>
        <div className="pt-7 sm:pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="space-y-2"><Shimmer w="w-24" h="h-2.5" /><Shimmer w="w-32" h="h-10" /></div>
          <Shimmer w="w-full sm:w-80" h="h-2" cls="self-center" />
        </div>
      </div>
    </section>
  );
}

// ─── RelatedForgotten ──────────────────────────────────────────────────────

function RelatedForgotten({ related }: { related: RelatedTrack[] }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -264 : 264, behavior: "smooth" });
  }

  return (
    <section>
      <div className="flex items-end justify-between mb-5 sm:mb-6">
        <div>
          <SectionLabel>More memories</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Other forgotten favorites</h2>
          <p className="text-sm text-white/45 mt-1 hidden sm:block">What we&apos;d resurface next.</p>
        </div>
        <div className="hidden md:flex items-center gap-1.5">
          <button
            onClick={() => scroll("left")}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto hide-scrollbar pb-3 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 snap-x snap-mandatory"
      >
        {related.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="snap-start shrink-0 w-[200px] sm:w-56 glass-card p-3.5 sm:p-4 hover:-translate-y-1 transition-transform group"
          >
            <div className="relative w-full aspect-square rounded-xl mb-3 sm:mb-4 overflow-hidden ring-1 ring-white/8 shadow-lg">
            {/* BASE LAYER */}
            {r.albumImageUrl ? (
              <img
                src={r.albumImageUrl}
                alt={r.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${r.color}`} />
            )}

            {/* overlays */}
            <div className="absolute inset-0 bg-black/12" />

            {/* Overlay gradient for readability */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent" />

            <span className="absolute top-2.5 left-2.5 text-[9px] uppercase tracking-widest font-semibold px-2 py-1 rounded-full bg-black/45 backdrop-blur-md text-white/90">
              {r.tag}
            </span>

            <div className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
              <Play size={13} fill="currentColor" className="ml-0.5" />
            </div>
          </div>
            <div className="text-sm font-semibold truncate leading-tight">{r.title}</div>
            <div className="text-xs text-white/45 truncate mt-0.5 mb-2.5">{r.artist}</div>
            <div className="text-[11px] text-white/35 flex items-center gap-1.5">
              <Clock size={10} className="shrink-0" />
              <span className="truncate">Last played {r.lastPlayed}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function RelatedSkeleton() {
  return (
    <section>
      <div className="mb-5 sm:mb-6 space-y-1.5">
        <Shimmer w="w-24" h="h-2.5" />
        <Shimmer w="w-52" h="h-7" />
      </div>
      <div className="flex gap-3 sm:gap-4 overflow-hidden">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="shrink-0 w-[200px] sm:w-56 glass-card p-3.5 sm:p-4 animate-pulse" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="w-full aspect-square rounded-xl bg-white/10 mb-3 sm:mb-4" />
            <Shimmer w="w-3/4" h="h-3.5" cls="mb-1" />
            <Shimmer w="w-1/2" h="h-3" cls="mb-2.5" />
            <Shimmer w="w-28" h="h-2.5" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── MoodReconstruction ────────────────────────────────────────────────────

function buildMoodRadar(hourHeat: { hour: number; v: number }[]) {
  const total = hourHeat.reduce((s, h) => s + h.v, 0) || 1;
  const morning = hourHeat.filter(h => h.hour >= 6 && h.hour <= 11).reduce((s, h) => s + h.v, 0);
  const night = hourHeat.filter(h => h.hour >= 22 || h.hour <= 4).reduce((s, h) => s + h.v, 0);
  const afternoon = hourHeat.filter(h => h.hour >= 12 && h.hour <= 17).reduce((s, h) => s + h.v, 0);
  const evening = hourHeat.filter(h => h.hour >= 18 && h.hour <= 21).reduce((s, h) => s + h.v, 0);

  return [
    { axis: "Energy",     value: Math.round((evening / total) * 100) },
    { axis: "Calm",       value: Math.round((morning / total) * 100) },
    { axis: "Nostalgia",  value: Math.round((night / total) * 150)   },
    { axis: "Joy",        value: Math.round((afternoon / total) * 80) },
    { axis: "Melancholy", value: Math.round((night / total) * 120)   },
  ];
}

interface MoodProps {
  data: MoodReconstruction;
  song: SotdSong;
}

function MoodReconstructionSection({ data, song }: MoodProps) {
  const moodRadar = buildMoodRadar(data.hourHeat);
  const maxV = Math.max(...data.hourHeat.map(x => x.v), 1);

  return (
    <section>
      <div className="mb-6">
        <SectionLabel>Mood reconstruction</SectionLabel>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">The texture of your listening</h2>
        <p className="text-sm text-white/45 mt-1">When this song lived in heavy rotation.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Radar */}
        <div className="glass-card p-5 sm:p-6 min-h-[260px] sm:min-h-[280px] flex flex-col">
          <SectionLabel>Emotional fingerprint</SectionLabel>
          <div className="flex-1 -mx-2 mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={moodRadar} outerRadius="70%">
                <PolarGrid stroke="rgba(255,255,255,0.07)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                <Radar dataKey="value" stroke={song.gradientFrom} fill={song.gradientFrom} fillOpacity={0.28} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hour heatmap */}
        <div className="glass-card p-5 sm:p-6 min-h-[260px] sm:min-h-[280px] flex flex-col sm:col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>Listening by hour</SectionLabel>
            <span className="text-xs text-white/40">
              Peak at <span className="text-white font-medium">{data.peakHourLabel}</span>
            </span>
          </div>
          <div className="flex-1 flex items-end gap-[2px] sm:gap-[3px]">
            {data.hourHeat.map((h) => {
              const peak = h.hour >= 23 || h.hour <= 2;
              return (
                <div
                  key={h.hour}
                  className="flex-1 rounded-t-sm transition-all"
                  style={{
                    height: `${Math.max(6, Math.round((h.v / maxV) * 100))}%`,
                    background: peak
                      ? `linear-gradient(to top, ${song.gradientFrom}, ${song.gradientTo})`
                      : "rgba(255,255,255,0.10)",
                    boxShadow: peak ? `0 0 14px ${song.gradientFrom}55` : "none",
                  }}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-white/30 mt-2">
            <span>00</span><span>06</span><span>12</span><span>18</span><span>23</span>
          </div>
        </div>

        {/* Monthly trend */}
        <div className="glass-card p-5 sm:p-6 min-h-[200px] sm:min-h-[220px] flex flex-col">
          <SectionLabel>Plays per month</SectionLabel>
          <div className="flex-1 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthTrend}>
                <defs>
                  <linearGradient id="sotd-month" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={song.gradientFrom} stopOpacity={0.42} />
                    <stop offset="100%" stopColor={song.gradientFrom} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area dataKey="v" stroke={song.gradientFrom} strokeWidth={2} fill="url(#sotd-month)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[10px] text-white/30 mt-1.5">
            {data.monthTrend.map((m) => <span key={m.m}>{m.m[0]}</span>)}
          </div>
        </div>

        {/* Repeat curve */}
        <div className="glass-card p-5 sm:p-6 min-h-[200px] sm:min-h-[220px] flex flex-col">
          <SectionLabel>Repeat frequency</SectionLabel>
          <div className="text-[11px] text-white/35 mb-2">per session</div>
          <div className="flex-1 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.repeatCurve}>
                <Line type="monotone" dataKey="v" stroke={song.gradientTo} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-white/45 mt-2">
            Most back-to-back:{" "}
            <span className="text-white font-medium">{data.maxRepeatsInOneDay}×</span> in one sitting.
          </div>
        </div>

        {/* Bar overview */}
        <div className="glass-card p-5 sm:p-6 min-h-[200px] sm:min-h-[220px] flex flex-col">
          <SectionLabel>Play history overview</SectionLabel>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthTrend}>
                <Bar dataKey="v" radius={[4, 4, 0, 0]} fill={song.gradientFrom} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-white/45 mt-2">
            Last 12 months · <span className="text-white font-medium">{data.monthTrend.reduce((s, m) => s + m.v, 0)} plays</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function MoodSkeleton() {
  return (
    <section>
      <div className="mb-6 space-y-1.5">
        <Shimmer w="w-16" h="h-2.5" />
        <Shimmer w="w-64" h="h-7" />
        <Shimmer w="w-72" h="h-4" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="glass-card p-5 sm:p-6 min-h-[260px] animate-pulse bg-white/[0.02]" />
        <div className="glass-card p-5 sm:p-6 min-h-[260px] sm:col-span-1 lg:col-span-2 animate-pulse bg-white/[0.02]" />
        <div className="glass-card p-5 sm:p-6 min-h-[200px] animate-pulse bg-white/[0.02]" />
        <div className="glass-card p-5 sm:p-6 min-h-[200px] animate-pulse bg-white/[0.02]" />
        <div className="glass-card p-5 sm:p-6 min-h-[200px] animate-pulse bg-white/[0.02]" />
      </div>
    </section>
  );
}

// ─── DailyRitual ───────────────────────────────────────────────────────────

function DailyRitualSection({ data }: { data: DailyRitual }) {
  const stats = [
    { icon: Flame,    value: String(data.streakDays),         label: "Active streak" },
    { icon: Sparkles, value: String(data.totalRediscovered),  label: "Songs resurfaced" },
    { icon: Heart,    value: `${data.avgAffinityScore}`,      label: "Avg affinity" },
    { icon: Music2,   value: String(data.savedToLibrary),     label: "Saved to library" },
  ];

  return (
    <section className="pb-6">
      <div className="glass-card p-5 sm:p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-24 left-1/3 w-[400px] h-[300px] bg-spotify/12 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-7 sm:gap-8">
          <div className="max-w-sm">
            <SectionLabel>Daily ritual</SectionLabel>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mt-0.5 mb-2.5">
              Come back tomorrow for a new{" "}
              <span className="font-serif italic text-spotify/90">memory</span>.
            </h3>
            <p className="text-sm text-white/50 leading-relaxed">
              One resurfaced favorite each morning. Your streak grows every time you stop by.
            </p>
            <button className="mt-5 inline-flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors active:scale-95">
              Get a daily reminder <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-3 flex-1 md:max-w-2xl">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 sm:p-5"
              >
                <s.icon size={15} className="text-white/40 mb-3" strokeWidth={1.8} />
                <div className="text-xl sm:text-2xl font-serif mb-1">{s.value}</div>
                <div className="text-[11px] text-white/40 leading-tight">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function SongOfTheDayPage() {
  const { data, isLoading, error } = useSongOfTheDay();
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-white selection:bg-spotify/30 selection:text-white flex overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col overflow-x-hidden">
        <TopNav />
        <main className="flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-10 w-full">
          <div className="max-w-[1400px] mx-auto relative overflow-x-hidden">
            {/* Ambient background orbs */}
            <div className="absolute top-0 right-0 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
            <div className="absolute top-[40%] left-[-20%] w-[500px] sm:w-[600px] h-[500px] sm:h-[600px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 right-[-10%] w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

            {error && (
              <div className="relative z-10 flex items-center justify-center min-h-[60vh]">
                <p className="text-white/40 text-sm">Could not load today&apos;s song. Please try again.</p>
              </div>
            )}

            <div className="relative z-10 flex flex-col gap-10 sm:gap-12 md:gap-14">
              {isLoading || !data ? (
                <>
                  <SotdHeroSkeleton />
                  <TheStorySkeleton />
                  <MemorySnapshotSkeleton />
                  <WhySkeleton />
                  <RelatedSkeleton />
                  <MoodSkeleton />
                </>
              ) : (
                <>
                  <SotdHero
                    song={data.song}
                    stats={data.stats}
                    affinityScore={data.affinityScore}
                    affinityLabel={data.affinityLabel}
                    onShare={() => setShareOpen(true)}
                  />
                  <TheStory beats={data.storyBeats} song={data.song} />
                  <MemorySnapshotSection data={data.memorySnapshot} />
                  <WhyWePickedThis
                    reasons={data.algoReasons}
                    affinityScore={data.affinityScore}
                    affinityLabel={data.affinityLabel}
                  />
                  <RelatedForgotten related={data.related} />
                  <MoodReconstructionSection data={data.moodReconstruction} song={data.song} />
                  <DailyRitualSection data={data.dailyRitual} />

                  {/* Share modal */}
                  {shareOpen && (
                    <ShareModal
                      song={data.song}
                      stats={data.stats}
                      affinityScore={data.affinityScore}
                      affinityLabel={data.affinityLabel}
                      onClose={() => setShareOpen(false)}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}