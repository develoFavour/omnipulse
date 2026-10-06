"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { StatCounter } from "./StatCounter";
import { BENCHMARK_STATS } from "./data";

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

export function BenchmarkSection() {
  const [calcVolume, setCalcVolume] = useState(25000);
  const dispatchTime = ((calcVolume / 1200) * 0.95).toFixed(1);

  return (
    <section id="benchmark" className="py-16 px-4 sm:px-6 max-w-[1200px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.65, ease: EASE_EXPO }}
        className="rounded-[28px] bg-[#163300] text-white p-8 sm:p-14 shadow-xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <span className="text-xs font-black uppercase tracking-wider text-[#9fe870]">
              High-Concurrency Engine
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#9fe870] tracking-tight font-heading mt-2 leading-[0.95]">
              ZERO LATENCY<span className="text-white">.</span><br />
              ZERO DROPPED PACKETS<span className="text-white">.</span>
            </h2>
            <p className="mt-6 text-base text-white/80 leading-relaxed">
              Built with parallel Go micro-workers, Neon Postgres relational integrity, and automated rate-limiting that keeps your senders in pristine standing.
            </p>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/10 items-start">
              {BENCHMARK_STATS.map((stat) => (
                <StatCounter
                  key={stat.label}
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  label={stat.label}
                  color={stat.color}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-[10px] bg-white text-[#454745] p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#e8ebe6]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#163300]">
                  Dispatch Velocity Estimator
                </span>
                <span className="rounded-full bg-[#e2f6d5] text-[#163300] px-2 py-0.5 text-[10px] font-black uppercase">
                  Go Workers
                </span>
              </div>
              <div className="mt-5 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#0e0f0c] mb-1.5">
                    <span>Audience Size:</span>
                    <span className="font-mono font-bold text-[#163300]">
                      {calcVolume.toLocaleString()} recipients
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={calcVolume}
                    onChange={(e) => setCalcVolume(Number(e.target.value))}
                    className="w-full accent-[#163300] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                    <span>1k</span>
                    <span>50k</span>
                    <span>100k</span>
                  </div>
                </div>
                <div className="rounded-xl bg-[#f4f5f2] p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pipelines:</span>
                    <span className="font-bold text-[#0e0f0c]">WhatsApp + Telegram</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Worker Concurrency:</span>
                    <span className="font-bold text-[#163300]">1,200 msg/min</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#e8ebe6]">
                    <span className="font-bold text-[#0e0f0c]">Estimated Dispatch:</span>
                    <span className="font-black text-[#163300] font-mono text-sm">
                      {dispatchTime} min
                    </span>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/get-started"
                    className="w-full inline-flex items-center justify-center rounded-full bg-[#163300] px-4 py-2.5 text-xs font-black text-[#9fe870] hover:bg-[#054d28] transition-all"
                  >
                    Deploy For Your Agency →
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
