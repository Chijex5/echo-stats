"use client";

import React from "react";
import { motion } from "framer-motion";
import { Flame, Sparkles, Disc3, Users, Activity, Moon, LucideIcon } from "lucide-react";
import { useDashboardStats, type DashboardStatsResponse } from "@/lib/hooks/useDashboard";

// ─── Types ─────────────────────────────────────────────────────────────────

interface WidgetConfig {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
  iconBg: string; // subtle tinted background behind the icon
}

// ─── Skeleton ──────────────────────────────────────────────────────────────

function WidgetSkeleton({ index }: { index: number }) {
  return (
    <div
      className="glass-card p-4 flex flex-col justify-between h-24 animate-pulse"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* icon + label row */}
      <div className="flex items-center gap-2">
        <div className="w-3.5 h-3.5 rounded bg-white/10 shrink-0" />
        <div className="h-2 w-24 rounded bg-white/10" />
      </div>
      {/* value */}
      <div className="h-7 w-20 rounded bg-white/10" />
    </div>
  );
}

// ─── Single Widget ─────────────────────────────────────────────────────────

interface WidgetCardProps {
  widget: WidgetConfig;
  index: number;
}

function WidgetCard({ widget, index }: WidgetCardProps) {
  const Icon = widget.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="glass-card p-4 flex flex-col justify-between h-24 hover:-translate-y-1 transition-transform duration-300"
    >
      <div className="flex items-center gap-2">
        <span className={`p-1 rounded ${widget.iconBg}`}>
          <Icon size={12} className={widget.color} />
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/40 truncate">
          {widget.label}
        </span>
      </div>

      <div className="text-2xl font-serif-display truncate">{widget.value}</div>
    </motion.div>
  );
}

// ─── Widget config builder ─────────────────────────────────────────────────

function buildWidgets(data: DashboardStatsResponse): WidgetConfig[] {
  return [
    {
      icon: Flame,
      label: "Listening Streak",
      value: `${data.streak} days`,
      color: "text-orange-400",
      iconBg: "bg-orange-400/10",
    },
    {
      icon: Sparkles,
      label: "Unique Tracks",
      value: data.uniqueTrackCount.toLocaleString(),
      color: "text-emerald-400",
      iconBg: "bg-emerald-400/10",
    },
    {
      icon: Activity,
      label: "Total Hours",
      value: `${data.totalHours.toLocaleString()}h`,
      color: "text-violet-400",
      iconBg: "bg-violet-400/10",
    },
    {
      icon: Users,
      label: "Artists Heard",
      value: data.uniqueArtistCount.toLocaleString(),
      color: "text-blue-400",
      iconBg: "bg-blue-400/10",
    },
    {
      icon: Moon,
      label: "Night Listening",
      value: `${data.nightPct}%`,
      color: "text-indigo-400",
      iconBg: "bg-indigo-400/10",
    },
    {
      icon: Disc3,
      label: "Total Plays",
      value: data.totalPlays.toLocaleString(),
      color: "text-pink-400",
      iconBg: "bg-pink-400/10",
    },
  ];
}

// ─── WidgetStrip ───────────────────────────────────────────────────────────

const SKELETON_COUNT = 6;

export function WidgetStrip() {
  const { data, isLoading, error } = useDashboardStats();

  return (
    <section className="mb-12">
      {error && (
        <p className="text-sm text-red-400/70 mb-4">
          Could not load stats. Please try again.
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {isLoading || !data
          ? Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <WidgetSkeleton key={i} index={i} />
            ))
          : buildWidgets(data).map((widget, index) => (
              <WidgetCard key={widget.label} widget={widget} index={index} />
            ))}
      </div>
    </section>
  );
}