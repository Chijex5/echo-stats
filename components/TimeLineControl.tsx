"use client";
import React, {
  useMemo, useRef, useCallback, useEffect, useState,
} from "react";
import { Calendar } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Period } from "@/app/dashboard/timeline/page";

const YEAR_HOURS = Array.from({ length: 12 }).map((_, i) => ({
  v: Math.round(50 + Math.sin(i * 0.55) * 30 + (i === 6 ? 25 : 0)),
}));

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const QUICK_JUMPS = [
  { label: "Random nostalgia", emoji: "🎲" },
  { label: "First play", emoji: "▶" },
  { label: "Last summer", emoji: "☀" },
  { label: "Rainy season", emoji: "🌧" },
];

// ── Custom dropdown ────────────────────────────────────────────────────────────
type SelectOption = { value: string; label: string };

function CustomSelect({
  id,
  floatLabel,
  options,
  value,
  onChange,
  width = "w-[110px]",
}: {
  id: string;
  floatLabel: string;
  options: SelectOption[];
  value: string;
  onChange: (v: string) => void;
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // keyboard nav
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((o) => !o); }
    if (e.key === "Escape") setOpen(false);
    if (e.key === "ArrowDown" && open) {
      e.preventDefault();
      const idx = options.findIndex((o) => o.value === value);
      if (idx < options.length - 1) onChange(options[idx + 1].value);
    }
    if (e.key === "ArrowUp" && open) {
      e.preventDefault();
      const idx = options.findIndex((o) => o.value === value);
      if (idx > 0) onChange(options[idx - 1].value);
    }
  };

  return (
    <div ref={ref} className={`relative flex-1 sm:flex-none ${width}`}>
      {/* Trigger */}
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={floatLabel}
        onKeyDown={handleKeyDown}
        onClick={() => setOpen((o) => !o)}
        className={[
          "w-full text-left",
          "bg-white/[0.06] hover:bg-white/[0.09]",
          "border transition-colors",
          open
            ? "border-spotify/70 ring-2 ring-spotify/25"
            : "border-white/[0.14] hover:border-white/30",
          "rounded-2xl",
          "pt-[26px] pb-[10px] pl-3.5 pr-8",
          "focus:outline-none",
        ].join(" ")}
      >
        <span className="absolute top-[9px] left-3.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/40 pointer-events-none">
          {floatLabel}
        </span>
        <span className="block text-[13px] font-semibold text-white truncate leading-none">
          {selected?.label ?? "—"}
        </span>
      </button>

      {/* Chevron */}
      <svg
        className={[
          "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-150",
          open ? "rotate-180 text-spotify" : "text-white/40",
        ].join(" ")}
        width="11" height="11" viewBox="0 0 12 12" fill="none"
        aria-hidden="true"
      >
        <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Dropdown panel */}
      {open && (
        <ul
          role="listbox"
          aria-label={floatLabel}
          className={[
            "absolute z-50 mt-2 w-full",
            "bg-[#1a1a1a] border border-white/[0.12]",
            "rounded-2xl overflow-hidden",
            "shadow-[0_8px_32px_rgba(0,0,0,0.6)]",
            "py-1",
            // flip up if it would overflow — handled by CSS-only trick below
          ].join(" ")}
          style={{ maxHeight: "220px", overflowY: "auto" }}
        >
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isActive}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={[
                  "flex items-center justify-between",
                  "px-3.5 py-2.5 mx-1 rounded-xl",
                  "text-[13px] font-medium cursor-pointer transition-colors",
                  isActive
                    ? "bg-spotify/20 text-spotify"
                    : "text-white/70 hover:bg-white/[0.07] hover:text-white",
                ].join(" ")}
              >
                <span>{opt.label}</span>
                {isActive && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6L5 9L10 3" stroke="#1DB954" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
// ── End CustomSelect ───────────────────────────────────────────────────────────

export function TimelineControl({
  activeIdx,
  setActiveIdx,
  periods,
  yearHours,
}: {
  activeIdx: number;
  setActiveIdx: (n: number) => void;
  periods: Period[];
  yearHours: { year?: string; v: number }[];
  yearLabels: string[];
  startYear: number;
  endYear: number;
}) {
  const activePeriod = periods[activeIdx] ?? periods[0];
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [draggingVisual, setDraggingVisual] = useState(false);

  const years = useMemo(
    () => [...new Set(periods.map((p) => p.year))].sort((a, b) => a - b),
    [periods]
  );

  const selectedYear = activePeriod?.year ?? years[0];

  const monthsForYear = useMemo(
    () =>
      periods
        .filter((p) => p.year === selectedYear)
        .sort((a, b) => a.monthIdx - b.monthIdx),
    [periods, selectedYear]
  );

  const yearOptions: SelectOption[] = years.map((y) => ({
    value: String(y),
    label: String(y),
  }));

  const monthOptions: SelectOption[] = monthsForYear.map((p) => ({
    value: p.id,
    label: p.monthName,
  }));

  // progress 0–1 across all periods
  const progress = periods.length > 1 ? activeIdx / (periods.length - 1) : 0;

  function handleYearChange(nextYearStr: string) {
    const nextYear = Number(nextYearStr);
    const sameMonth = periods.find(
      (p) => p.year === nextYear && p.monthIdx === activePeriod?.monthIdx
    );
    const first = periods.find((p) => p.year === nextYear);
    const target = sameMonth ?? first;
    if (!target) return;
    const idx = periods.findIndex((p) => p.id === target.id);
    if (idx >= 0) setActiveIdx(idx);
  }

  function handleMonthChange(id: string) {
    const idx = periods.findIndex((p) => p.id === id);
    if (idx >= 0) setActiveIdx(idx);
  }

  const setFromPct = useCallback(
    (pct: number) => {
      const clamped = Math.max(0, Math.min(1, pct));
      const idx = Math.round(clamped * (periods.length - 1));
      setActiveIdx(idx);
    },
    [periods.length, setActiveIdx]
  );

  const getPctFromEvent = useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return (clientX - rect.left) / rect.width;
  }, []);

  const handleTrackMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      setDraggingVisual(true);
      setFromPct(getPctFromEvent(e.clientX));
    },
    [setFromPct, getPctFromEvent]
  );

  const handleTrackTouchStart = useCallback(
    (e: React.TouchEvent) => {
      isDragging.current = true;
      setDraggingVisual(true);
      setFromPct(getPctFromEvent(e.touches[0].clientX));
    },
    [setFromPct, getPctFromEvent]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      setFromPct(getPctFromEvent(e.clientX));
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      setFromPct(getPctFromEvent(e.touches[0].clientX));
    };
    const onUp = () => { isDragging.current = false; setDraggingVisual(false); };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchend", onUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchend", onUp);
    };
  }, [setFromPct, getPctFromEvent]);

  const handleThumbKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActiveIdx(Math.min(periods.length - 1, activeIdx + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveIdx(Math.max(0, activeIdx - 1));
    }
  };

  const handleYearMarkClick = (year: number) => {
    const first = periods.find((p) => p.year === year);
    if (!first) return;
    const idx = periods.findIndex((p) => p.id === first.id);
    if (idx >= 0) setActiveIdx(idx);
  };

  const handleQuickJump = (i: number) => {
    if (i === 0) {
      const r = (activeIdx * 7 + 3) % periods.length;
      setActiveIdx(r === activeIdx ? (r + 1) % periods.length : r);
    } else if (i === 1) {
      setActiveIdx(0);
    } else if (i === 2) {
      const summer = [...periods].reverse().find((p) => [5, 6, 7].includes(p.monthIdx));
      if (summer) {
        const idx = periods.findIndex((p) => p.id === summer.id);
        if (idx >= 0) setActiveIdx(idx);
      }
    } else if (i === 3) {
      const rainy = [...periods].reverse().find((p) => [9, 10].includes(p.monthIdx));
      if (rainy) {
        const idx = periods.findIndex((p) => p.id === rainy.id);
        if (idx >= 0) setActiveIdx(idx);
      }
    }
  };

  const thumbPct = `${(progress * 100).toFixed(2)}%`;

  return (
    <section>
      <div className="glass-card p-6 md:p-8 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] bg-spotify/15 rounded-full blur-[120px] pointer-events-none" />

        {/* ── Header ── */}
        <div className="relative flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
              Now exploring
            </p>
            <p className="text-xl font-semibold tracking-tight">
              {activePeriod?.monthName} {activePeriod?.year}
            </p>
          </div>

          {/* ── Custom dropdowns ── */}
          <div className="flex w-full sm:w-auto items-center gap-3">
            <CustomSelect
              id="year-select"
              floatLabel="Year"
              options={yearOptions}
              value={String(selectedYear)}
              onChange={handleYearChange}
              width="flex-1 sm:flex-none sm:w-[110px]"
            />
            <CustomSelect
              id="month-select"
              floatLabel="Month"
              options={monthOptions}
              value={activePeriod?.id ?? ""}
              onChange={handleMonthChange}
              width="flex-1 sm:flex-none sm:w-[155px]"
            />
          </div>
        </div>

        {/* ── Timeline Scrubber ── */}
        <div className="relative mb-8">
          <p className="text-[10px] uppercase tracking-widest text-white/35 mb-3">
            Timeline
          </p>

          <div className="px-3">
            {/* Track */}
            <div
              ref={trackRef}
              className="relative h-1 bg-white/10 rounded-full cursor-pointer select-none"
              onMouseDown={handleTrackMouseDown}
              onTouchStart={handleTrackTouchStart}
            >
              {/* Fill */}
              <div
                className="absolute inset-y-0 left-0 bg-spotify rounded-full pointer-events-none"
                style={{ width: thumbPct }}
              />
              {/* Thumb */}
              <div
                role="slider"
                tabIndex={0}
                aria-label="Timeline position"
                aria-valuemin={0}
                aria-valuemax={periods.length - 1}
                aria-valuenow={activeIdx}
                onKeyDown={handleThumbKeyDown}
                className={[
                  "absolute top-1/2 -translate-x-1/2 -translate-y-1/2",
                  "w-5 h-5 rounded-full bg-spotify border-[2.5px] border-white",
                  "cursor-grab focus:outline-none focus:ring-2 focus:ring-spotify/50 z-10",
                  "transition-transform duration-100",
                  draggingVisual
                    ? "scale-125 cursor-grabbing shadow-[0_0_0_6px_rgba(29,185,84,0.2)]"
                    : "hover:scale-110",
                ].join(" ")}
                style={{ left: thumbPct }}
              />
            </div>

            {/* Year marks */}
            <div className="flex justify-between mt-2.5">
              {years.map((y) => (
                <button
                  key={y}
                  onClick={() => handleYearMarkClick(y)}
                  className={[
                    "text-[11px] font-semibold transition-colors px-0.5 focus:outline-none",
                    y === selectedYear
                      ? "text-spotify"
                      : "text-white/35 hover:text-white/70",
                  ].join(" ")}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Month pills */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {monthsForYear.map((p) => (
              <button
                key={p.id}
                onClick={() => handleMonthChange(p.id)}
                className={[
                  "text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors focus:outline-none",
                  p.id === activePeriod?.id
                    ? "bg-spotify/20 border-spotify/60 text-spotify"
                    : "bg-white/[0.05] border-white/10 text-white/55 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                {MONTH_SHORT[p.monthIdx] ?? p.monthName}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}