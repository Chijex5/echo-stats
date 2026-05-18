"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRediscovery, type RediscoveryCard } from "@/lib/hooks/useDashboard";

function CardSkeleton({ index }: { index: number }) {
  return (
    <div className="glass-card p-6 animate-pulse" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="h-12 mb-6">
        <div className="w-10 h-10 rounded-md bg-white/10" />
      </div>
      <div className="h-10 w-20 rounded bg-white/10 mb-3" />
      <div className="h-3 w-32 rounded bg-white/10 mb-2" />
      <div className="h-2.5 w-24 rounded bg-white/[0.06]" />
    </div>
  );
}

function RediscoveryTile({ card, index }: { card: RediscoveryCard; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} rounded-full blur-[50px] opacity-20 group-hover:opacity-30 transition-opacity`} />

      <div className="relative h-12 mb-6">
        <div className={`absolute left-4 top-2 w-10 h-10 rounded-md bg-gradient-to-br ${card.color} opacity-60 rotate-12 ${card.shadow}`} />
        <div className={`absolute left-0 top-0 w-10 h-10 rounded-md bg-gradient-to-br ${card.color} shadow-lg ${card.shadow}`} />
      </div>

      <div className="text-5xl font-serif-display mb-2">{card.count.toLocaleString()}</div>
      <h3 className="font-semibold text-sm mb-1">{card.title}</h3>
      <p className="text-xs text-white/50">{card.desc}</p>
    </motion.div>
  );
}

export function RediscoverySection() {
  const { data, isLoading, error } = useRediscovery();

  return (
    <section className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Rediscover</h2>
        <p className="text-sm text-white/50">Songs your past self loved.</p>
      </div>

      {error && <p className="text-sm text-red-400/70 mb-4">Could not load rediscovery data. Please try again.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading || !data
          ? Array.from({ length: 4 }, (_, index) => <CardSkeleton key={index} index={index} />)
          : data.cards.map((card, index) => <RediscoveryTile key={card.key} card={card} index={index} />)}
      </div>
    </section>
  );
}
