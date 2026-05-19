"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AudioLines,
  LayoutDashboard,
  Music2,
  Users,
  Lightbulb,
  History,
  Sparkles,
  Smartphone,
  UserRound,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMobileNav } from "./mobile-nav-context";

const navItems = [
  { icon: LayoutDashboard, label: "Overview",       path: "/dashboard" },
  { icon: Music2,          label: "Top Tracks",     path: "/dashboard/tracks" },
  { icon: Users,           label: "Top Artists",    path: "/dashboard/artists" },
  { icon: Lightbulb,       label: "Insights",       path: "/dashboard/insights" },
  { icon: History,         label: "Timeline",       path: "/dashboard/timeline" },
  { icon: Sparkles,        label: "Song of the Day",path: "/dashboard/sotd" },
  { icon: Smartphone,      label: "Story Mode",     path: "/dashboard/story" },
  { icon: UserRound,       label: "Profile",        path: "/dashboard/profile" },
];

// ─── Shared nav content ──────────────────────────────────────────────────────
function NavContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Logo */}
      <div className="h-16 lg:h-20 flex items-center px-6 lg:px-8 border-b border-white/5 shrink-0">
        <Link
          href="/"
          onClick={onNavClick}
          className="flex items-center gap-2 group"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-spotify/10 text-spotify group-hover:bg-spotify/20 transition-colors">
            <AudioLines size={18} className="absolute" />
          </div>
          <span className="font-semibold text-lg tracking-tight">EchoStats</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 lg:py-8 px-4 space-y-1 hide-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.label}
              href={item.path}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? "text-white bg-white/10"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-spotify rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon
                size={18}
                className={isActive ? "text-spotify" : "group-hover:text-white/80"}
              />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/5 shrink-0">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors w-full">
          <Settings size={18} />
          <span className="font-medium text-sm">Settings</span>
        </button>
      </div>
    </>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export function Sidebar() {
  const { open, setOpen } = useMobileNav();

  return (
    <>
      {/* ── Desktop sidebar (lg+): always visible ── */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-black/40 backdrop-blur-2xl border-r border-white/5 z-40 flex-col hidden lg:flex">
        <NavContent />
      </aside>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Drawer */}
            <motion.aside
              key="mobile-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-[#0d0d0d] border-r border-white/5 z-50 flex flex-col lg:hidden"
            >
              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>

              <NavContent onNavClick={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
