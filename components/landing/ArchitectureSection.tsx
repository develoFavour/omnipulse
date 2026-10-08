"use client";

import { motion } from "framer-motion";
import { PIPELINE_STEPS } from "./data";

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

export function ArchitectureSection() {
  return (
    <section id="workflow" className="py-24 bg-[#f4f5f2] border-y border-[#e8ebe6]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: EASE_EXPO }}
        >
          <span className="text-xs font-black uppercase tracking-wider text-[#163300]">
            The Campaign Delivery Lifecycle
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#0e0f0c] tracking-tight font-heading mt-2">
            Plan. Route. Deliver<span className="text-[#9fe870]">.</span>
          </h2>
          <p className="mt-4 text-base text-[#454745]">
            From audience opt-in to verified delivery — a predictable, compliant system for managing client campaigns without account flags.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PIPELINE_STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: EASE_EXPO }}
              className="rounded-2xl bg-white p-8 border border-white hover:border-[#163300]/15 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-12 w-12 rounded-xl bg-[#e2f6d5] text-[#163300] flex items-center justify-center font-black text-lg">
                    {s.step}
                  </div>
                  <span className="text-xs font-bold font-mono text-[#868685]">{s.tag}</span>
                </div>
                <h3 className="text-xl font-bold text-[#0e0f0c] font-heading mb-3">{s.title}</h3>
                <p className="text-sm text-[#454745] leading-relaxed">{s.body}</p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#e8ebe6] flex items-center gap-2 text-xs font-bold text-[#163300]">
                <span>{s.tags[0]}</span>
                <span className="text-[#9fe870] font-black">•</span>
                <span>{s.tags[1]}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
