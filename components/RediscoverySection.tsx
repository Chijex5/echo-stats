"use client";
import React from 'react';
import { motion } from 'framer-motion';
const cards = [
{
  title: 'Forgotten Favorites',
  count: '142',
  desc: 'See all tracks',
  color: 'from-peach-400 to-orange-400',
  shadow: 'shadow-orange-500/20'
},
{
  title: 'Comeback Songs',
  count: '23',
  desc: 'Returned to your rotation',
  color: 'from-cyan-400 to-blue-500',
  shadow: 'shadow-cyan-500/20'
},
{
  title: 'Suddenly Abandoned',
  count: '17',
  desc: 'Used to be on repeat',
  color: 'from-red-400 to-rose-500',
  shadow: 'shadow-red-500/20'
},
{
  title: 'Returning Recently',
  count: '38',
  desc: 'Slowly creeping back',
  color: 'from-yellow-400 to-amber-500',
  shadow: 'shadow-yellow-500/20'
}];

export function RediscoverySection() {
  return (
    <section className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Rediscover</h2>
        <p className="text-sm text-white/50">Songs your past self loved.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) =>
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
            delay: index * 0.1
          }}
          className="glass-card p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          
            {/* Gradient Accent */}
            <div
            className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} rounded-full blur-[50px] opacity-20 group-hover:opacity-30 transition-opacity`} />
          

            {/* Mini Album Art Stack */}
            <div className="relative h-12 mb-6">
              <div
              className={`absolute left-4 top-2 w-10 h-10 rounded-md bg-gradient-to-br ${card.color} opacity-60 rotate-12 ${card.shadow}`} />
            
              <div
              className={`absolute left-0 top-0 w-10 h-10 rounded-md bg-gradient-to-br ${card.color} shadow-lg ${card.shadow}`} />
            
            </div>

            <div className="text-5xl font-serif-display mb-2">{card.count}</div>
            <h3 className="font-semibold text-sm mb-1">{card.title}</h3>
            <p className="text-xs text-white/50">{card.desc}</p>
          </motion.div>
        )}
      </div>
    </section>);

}