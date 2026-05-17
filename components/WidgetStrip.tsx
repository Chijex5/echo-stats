"use client";
import React from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Sparkles,
  Disc3,
  TrendingUp,
  Activity,
  Moon } from
'lucide-react';
const widgets = [
{
  icon: Flame,
  label: 'Listening Streak',
  value: '14 days',
  color: 'text-orange-400'
},
{
  icon: Sparkles,
  label: 'Discovered this month',
  value: '47',
  color: 'text-emerald-400'
},
{
  icon: Disc3,
  label: 'Oldest favorite',
  value: '2009',
  color: 'text-blue-400'
},
{
  icon: TrendingUp,
  label: 'Newest obsession',
  value: 'Saoirse',
  color: 'text-pink-400'
},
{
  icon: Activity,
  label: 'Average BPM',
  value: '118',
  color: 'text-violet-400'
},
{
  icon: Moon,
  label: 'Night listening',
  value: '38%',
  color: 'text-indigo-400'
}];

export function WidgetStrip() {
  return (
    <section className="mb-12">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {widgets.map((widget, index) =>
        <motion.div
          key={index}
          initial={{
            opacity: 0,
            y: 20
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: true,
            margin: '-50px'
          }}
          transition={{
            duration: 0.5,
            delay: index * 0.05
          }}
          className="glass-card p-4 flex flex-col justify-between h-24 hover:-translate-y-1 transition-transform duration-300">
          
            <div className="flex items-center gap-2">
              <widget.icon size={14} className={widget.color} />
              <span className="text-[10px] font-medium uppercase tracking-wider text-white/40 truncate">
                {widget.label}
              </span>
            </div>
            <div className="text-2xl font-serif-display truncate">
              {widget.value}
            </div>
          </motion.div>
        )}
      </div>
    </section>);

}