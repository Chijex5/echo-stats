"use client";
import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, X, Clock, Users, Zap } from "lucide-react";

// ─── Re-use the Period type from your page file ───────────────
// (copy from your existing file or import it)
type Period = {
  id: string;
  label: string;
  year: number;
  monthIdx: number;
  monthName: string;
  topGenre: string;
  mood: string;
  moodScore: number;
  totalHours: number;
  uniqueArtists: number;
  topArtist: string;
  topArtistColor: string;
  accent: string;
  tracks: { title: string; albumImageUrl?: string; artist: string; color: string }[];
  story?: { tag: string; line: string };
};

// ─── Time Warp Loader ────────────────────────────────────────
function TimeWarpLoader() {
  const rings = [0, 1, 2, 3, 4];
  const lines = ["Rewinding your timeline…", "Surfacing a forgotten moment…", "Almost there…"];
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-14 select-none">
      <div className="relative w-28 h-28 flex items-center justify-center">
        {rings.map((n) => (
          <motion.div
            key={n}
            className="absolute rounded-full border border-spotify/50"
            style={{ inset: 0 }}
            initial={{ scale: 0.15, opacity: 0.9 }}
            animate={{ scale: 0.3 + n * 0.38, opacity: 0 }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              delay: n * 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
        <motion.div
          className="relative w-14 h-14 rounded-full bg-spotify/10 border border-spotify/40 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-spotify/20"
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <Clock size={20} className="text-spotify relative z-10" />
        </motion.div>
      </div>

      {/* Cycling status text */}
      <div className="h-5 overflow-hidden">
        {lines.map((text, i) => (
          <motion.p
            key={text}
            className="text-sm text-white/45 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, -8] }}
            transition={{
              duration: 1.8,
              times: [0, 0.15, 0.75, 1],
              delay: i * 1.8,
              repeat: Infinity,
              repeatDelay: lines.length * 1.8 - 1.8,
            }}
          >
            {text}
          </motion.p>
        ))}
      </div>

      {/* Acceleration bar */}
      <div className="w-44 h-px bg-white/[0.08] rounded-full overflow-hidden relative">
        <motion.div
          className="absolute top-0 h-full bg-gradient-to-r from-transparent via-spotify to-transparent rounded-full"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          style={{ width: "60%" }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: [0.4, 0, 0.6, 1],
          }}
        />
      </div>
    </div>
  );
}

// ─── Memory Card (shown after loading) ──────────────────────
function MemoryCard({
  period,
  onRetry,
  onClose,
}: {
  period: Period;
  onRetry: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -16 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-0.5">
            Random memory
          </p>
          <h2 className="text-3xl font-bold tracking-tight leading-none">
            {period.monthName}{" "}
            <span className="font-serif-display italic font-normal text-white/65">
              {period.year}
            </span>
          </h2>
          <p className="text-sm text-white/50 mt-1.5">
            You felt{" "}
            <span className="text-white/90 font-medium">{period.mood.toLowerCase()}</span>.
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-center justify-center w-[58px] h-[58px] rounded-2xl bg-white/[0.04] border border-white/[0.08]">
          <span className="text-[18px] font-bold text-spotify leading-none">
            {period.moodScore.toFixed(1)}
          </span>
          <span className="text-[9px] uppercase tracking-widest text-white/35 mt-0.5">mood</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { Icon: Clock, label: "Hours", value: `${period.totalHours}h` },
          { Icon: Users, label: "Artists", value: String(period.uniqueArtists) },
          { Icon: Zap, label: "Genre", value: period.topGenre },
        ].map(({ Icon, label, value }) => (
          <div
            key={label}
            className="bg-white/[0.025] border border-white/[0.06] rounded-xl px-3 py-2.5 flex flex-col gap-1"
          >
            <div className="flex items-center gap-1">
              <Icon size={10} className="text-white/35" />
              <span className="text-[9px] uppercase tracking-widest text-white/35">{label}</span>
            </div>
            <span className="text-sm font-semibold truncate">{value}</span>
          </div>
        ))}
      </div>

      {/* Top artist */}
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.025] border border-white/[0.06]">
        <div
          className={`w-9 h-9 rounded-full bg-gradient-to-br ${period.topArtistColor} flex items-center justify-center text-xs font-bold ring-1 ring-white/10 shrink-0`}
        >
          {period.topArtist
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-widest text-white/35">Top artist</p>
          <p className="text-sm font-semibold">{period.topArtist}</p>
        </div>
      </div>

      {/* Tracks */}
      {period.tracks.length > 0 && (
        <div>
          <p className="text-[9px] uppercase tracking-widest text-white/35 mb-2">Top songs</p>
          <div className="space-y-2">
            {period.tracks.slice(0, 3).map((t, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-[11px] text-white/20 w-4 font-mono shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg shrink-0 overflow-hidden ring-1 ring-white/10 ${
                    t.albumImageUrl ? "" : `bg-gradient-to-br ${t.color}`
                  }`}
                >
                  {t.albumImageUrl && (
                    <img
                      src={t.albumImageUrl}
                      alt={t.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{t.title}</p>
                  <p className="text-xs text-white/40 truncate">{t.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Story */}
      {period.story && (
        <div className="flex items-start gap-3 pt-4 border-t border-white/[0.06]">
          <span className="mt-0.5 shrink-0 px-2 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[9px] uppercase tracking-widest text-white/50">
            {period.story.tag}
          </span>
          <span className="text-sm text-white/65 italic font-serif-display">
            {period.story.line}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={onRetry}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-spotify hover:bg-[#1ed760] active:scale-95 text-black text-sm font-semibold px-5 py-3 rounded-full transition-all shadow-[0_0_28px_-6px_rgba(29,185,84,0.7)]"
        >
          <Shuffle size={13} />
          Another random memory
        </button>
        <button
          onClick={onClose}
          className="inline-flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/10 active:scale-95 border border-white/10 text-white/75 text-sm font-medium px-5 py-3 rounded-full transition-all"
        >
          <X size={13} />
          Close
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main: RandomNostalgiaModal ───────────────────────────────
// Usage in TimelinePage.tsx:
//   Replace <RandomNostalgia setActiveIdx={...} periods={periods} />
//   with    <RandomNostalgiaModal periods={periods} />
export function RandomNostalgiaModal({ periods }: { periods: Period[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<Period | null>(null);

  const pickRandom = useCallback(async () => {
    setLoading(true);
    setPeriod(null);

    // Minimum "travel time" so the loader animation gets a moment to breathe
    const minDelay = new Promise((r) => setTimeout(r, 1900));

    try {
      const res = await fetch("/api/dashboard/timeline-page");
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const pool: Period[] = data?.periods?.length ? data.periods : periods;
      await minDelay;
      const idx = Math.floor(Math.random() * pool.length);
      setPeriod(pool[idx]);
    } catch {
      await minDelay;
      const idx = Math.floor(Math.random() * periods.length);
      setPeriod(periods[idx] ?? null);
    } finally {
      setLoading(false);
    }
  }, [periods]);

  const openModal = useCallback(() => {
    setOpen(true);
    pickRandom();
  }, [pickRandom]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Escape to close
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <>
      {/* ── Trigger section (replaces old RandomNostalgia) ── */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="glass-card p-8 md:p-12 relative overflow-hidden"
        >
          <div className="absolute -top-32 left-1/3 w-[500px] h-[400px] bg-spotify/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-pink-500/15 rounded-full blur-[120px] pointer-events-none" />

          <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 pointer-events-none hidden md:flex">
            {["from-pink-500 to-orange-400", "from-emerald-400 to-cyan-500", "from-purple-500 to-indigo-500"].map(
              (c, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -10, 0], rotate: i % 2 === 0 ? -6 : 6 }}
                  transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${c} shadow-2xl shadow-black/40 ring-1 ring-white/10`}
                  style={{ marginLeft: i === 0 ? 0 : -16 }}
                >
                  <div className="w-full h-full rounded-2xl bg-black/15" />
                </motion.div>
              )
            )}
          </div>

          <div className="relative max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-[10px] uppercase tracking-widest text-white/60 mb-6">
              <Shuffle size={11} className="text-spotify" />
              Surprise me
            </div>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
              Take me somewhere{" "}
              <span className="font-serif-display italic text-spotify/90">random</span>.
            </h3>
            <p className="text-white/60 leading-relaxed mb-8 max-w-md">
              Close your eyes. We&apos;ll drop you into a forgotten week, with the songs, the mood,
              and the hidden memories that came with it.
            </p>
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 bg-spotify hover:bg-[#1ed760] active:scale-95 text-black text-sm font-semibold px-6 py-3 rounded-full transition-all shadow-[0_0_32px_-6px_rgba(29,185,84,0.7)] hover:-translate-y-0.5"
            >
              <Shuffle size={14} />
              Jump to a random memory
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── Modal ── */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 56, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.97 }}
              transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md bg-[#0D1117] border border-white/[0.08] rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden"
              style={{ maxHeight: "90dvh", overflowY: "auto" }}
            >
              {/* Ambient glow tracks the period color */}
              <motion.div
                className="absolute -top-40 -right-24 w-[380px] h-[380px] rounded-full blur-[90px] opacity-50 pointer-events-none"
                animate={{
                  background: period
                    ? undefined
                    : "radial-gradient(circle, rgba(29,185,84,0.25), transparent)",
                }}
                style={{
                  background: period
                    ? undefined
                    : "radial-gradient(circle, rgba(29,185,84,0.2), transparent)",
                }}
              />
              {period && (
                <div
                  className={`absolute -top-40 -right-24 w-[380px] h-[380px] rounded-full blur-[90px] opacity-40 pointer-events-none bg-gradient-to-br ${period.accent}`}
                />
              )}
              <div className="absolute -bottom-16 -left-16 w-[260px] h-[260px] bg-violet-600/15 rounded-full blur-[70px] pointer-events-none" />

              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
              >
                <X size={13} />
              </button>

              <div className="relative p-6 md:p-7">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TimeWarpLoader />
                    </motion.div>
                  ) : period ? (
                    <motion.div
                      key={period.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MemoryCard
                        period={period}
                        onRetry={pickRandom}
                        onClose={() => setOpen(false)}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}