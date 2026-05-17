"use client";
import React from 'react';
import { Search, Bell, ChevronDown, RefreshCw } from 'lucide-react';
export function TopNav() {
  return (
    <header className="sticky top-0 z-30 h-20 bg-background/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8">
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        
        <input
          type="text"
          placeholder="Search songs, artists, dates..."
          className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-spotify/50 focus:bg-white/10 transition-all" />
        
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        {/* Date Range */}
        <button className="hidden md:flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/10">
          Last 30 Days
          <ChevronDown size={14} />
        </button>

        {/* Sync Status */}
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

        {/* Profile */}
        <button className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 p-0.5">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-sm font-bold">
              C
            </div>
          </div>
          <ChevronDown
            size={14}
            className="text-white/40 group-hover:text-white transition-colors" />
          
        </button>
      </div>
    </header>);

}