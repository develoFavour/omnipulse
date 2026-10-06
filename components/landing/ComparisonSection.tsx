"use client";

import { motion } from "framer-motion";
import { COMPARISON_ROWS } from "./data";

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

export function ComparisonSection() {
  return (
    <section className="py-20 max-w-[1200px] mx-auto px-4 sm:px-6">
      <motion.div
        className="text-center max-w-2xl mx-auto mb-14"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: EASE_EXPO }}
      >
        <span className="text-xs font-black uppercase tracking-wider text-[#163300]">
          The Agency Standard
        </span>
        <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#0e0f0c] tracking-tight font-heading mt-2">
          Why Unified Wins<span className="text-[#9fe870]">.</span>
        </h2>
        <p className="text-base text-[#454745] mt-4">
          Compare OmniPulse against juggling multiple standalone bots and disconnected browser extensions.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.65, ease: EASE_EXPO }}
        className="rounded-2xl border border-[#e8ebe6] bg-white overflow-hidden shadow-xs"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#454745]">
            <thead className="bg-[#f4f5f2] text-xs uppercase font-bold text-[#0e0f0c] tracking-wider">
              <tr>
                <th className="px-6 py-4">Capability</th>
                <th className="px-6 py-4 bg-[#e2f6d5] text-[#163300] font-black">
                  OmniPulse Command Center
                </th>
                <th className="px-6 py-4">Legacy Extension / Bots</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8ebe6]">
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-[#0e0f0c]">{row.feature}</td>
                  <td className="px-6 py-4 font-bold text-[#163300] bg-[#e2f6d5]/40">
                    {row.omni}
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-medium">{row.legacy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </section>
  );
}
