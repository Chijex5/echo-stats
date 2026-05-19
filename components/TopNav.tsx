"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  RefreshCw,
  User,
  LogOut,
  ExternalLink,
  Menu,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useMobileNav } from "./mobile-nav-context";

export function TopNav() {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toggle } = useMobileNav();

  const name = session?.user?.name ?? "User";
  const email = session?.user?.email ?? "";
  const initial = name.trim()[0]?.toUpperCase() ?? "?";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 lg:h-20 bg-background/80 backdrop-blur-xl border-b border-white/5 flex items-center gap-3 px-4 lg:px-8">
      {/* Hamburger — mobile only */}
      <button
        onClick={toggle}
        aria-label="Open navigation menu"
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors shrink-0"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          placeholder="Search songs, artists, dates..."
          className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-spotify/50 focus:bg-white/10 transition-all"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 lg:gap-6 ml-auto">
        {/* Date Range — desktop only */}
        <button className="hidden md:flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/10">
          Last 30 Days
          <ChevronDown size={14} />
        </button>

        {/* Sync Status — desktop only */}
        <div className="hidden md:flex items-center gap-2 text-xs text-white/40">
          <RefreshCw size={12} className="animate-spin-slow" />
          Synced 2h ago
        </div>

        <div className="w-px h-6 bg-white/10 hidden md:block" />

        {/* Notifications */}
        <button className="relative text-white/70 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-spotify rounded-full border border-background" />
        </button>

        {/* Profile + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 lg:gap-3 group"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 p-0.5">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-sm font-bold">
                {initial}
              </div>
            </div>
            <ChevronDown
              size={14}
              className={`text-white/40 group-hover:text-white transition-all duration-200 hidden sm:block ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown panel */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-[#1a1a1a] border border-white/10 shadow-2xl shadow-black/60 overflow-hidden z-50">
              {/* User identity */}
              <div className="px-4 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm font-bold shrink-0">
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{name}</p>
                  <p className="text-xs text-white/40 truncate">{email}</p>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-2">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User size={15} className="shrink-0" />
                  Profile
                  <ExternalLink size={11} className="ml-auto text-white/30" />
                </Link>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    void signOut({ callbackUrl: "/auth" });
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-400/5 transition-colors"
                >
                  <LogOut size={15} className="shrink-0" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
