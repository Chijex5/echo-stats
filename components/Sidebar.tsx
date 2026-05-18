"use client";
import React from 'react';
import { motion } from 'framer-motion';
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
  Settings } from
'lucide-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
const navItems = [
{
  icon: LayoutDashboard,
  label: 'Overview',
  path: '/dashboard'
},
{
  icon: Music2,
  label: 'Top Tracks',
  path: '/dashboard/tracks'
},
{
  icon: Users,
  label: 'Top Artists',
  path: '/dashboard/artists'
},
{
  icon: Lightbulb,
  label: 'Insights',
  path: '/dashboard/insights'
},
{
  icon: History,
  label: 'Timeline',
  path: '/dashboard/timeline'
},
{
  icon: Sparkles,
  label: 'Song of the Day',
  path: '/dashboard/sotd'
},
{
  icon: Smartphone,
  label: 'Story Mode',
  path: '/dashboard/story'
},
{
  icon: UserRound,
  label: 'Profile',
  path: '/dashboard/profile'
}];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-black/40 backdrop-blur-2xl border-r border-white/5 z-40 flex flex-col hidden lg:flex">
      {/* Logo */}
      <div className="h-20 flex items-center px-8 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-spotify/10 text-spotify group-hover:bg-spotify/20 transition-colors">
            <AudioLines size={18} className="absolute" />
          </div>
          <span className="font-semibold text-lg tracking-tight">
            EchoStats
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1 hide-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.label}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive ? 'text-white bg-white/10' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
              
              {isActive &&
              <motion.div
                layoutId="sidebar-active"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-spotify rounded-r-full"
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30
                }} />

              }
              <item.icon
                size={18}
                className={
                isActive ? 'text-spotify' : 'group-hover:text-white/80'
                } />
              
              <span className="font-medium text-sm">{item.label}</span>
            </Link>);

        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/5">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors w-full">
          <Settings size={18} />
          <span className="font-medium text-sm">Settings</span>
        </button>
      </div>
    </aside>);

}
