"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

export function LandingFooter() {
  return (
    <>
      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#163300] text-white py-28 px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: EASE_EXPO }}
          className="max-w-4xl mx-auto"
        >
          <span className="text-xs font-black uppercase tracking-wider text-[#9fe870]">
            Get Started in 2 Minutes
          </span>
          <h2 className="text-4xl sm:text-6xl font-black uppercase text-[#9fe870] tracking-tight font-heading mt-4 leading-[0.95]">
            READY TO TRANSMIT<br />AT SCALE<span className="text-white">?</span>
          </h2>
          <p className="mt-6 text-base sm:text-lg text-white/80 max-w-xl mx-auto leading-relaxed">
            Create your isolated workspace, link your first bot, and experience seamless multi-channel broadcast power today.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/get-started"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#9fe870] px-8 py-3.5 text-base font-black text-[#163300] hover:brightness-105 transition-all shadow-md"
              >
                Open Your Free Workspace <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </Link>
            </motion.div>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3.5 text-base font-bold text-white hover:bg-white/10 transition-all"
            >
              Sign In to Existing Account
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-[#e8ebe6] py-12 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-full bg-[#163300] flex items-center justify-center text-[#9fe870] font-black text-xs">
              OP
            </div>
            <span className="text-base font-black text-[#0e0f0c] font-heading">
              OmniPulse Unified Communications
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e2f6d5] border border-[#9fe870]/60 px-3.5 py-1 text-xs font-bold text-[#163300]">
            <span className="h-2 w-2 rounded-full bg-[#163300] animate-pulse" />
            Go Concurrency Pipeline & Neon DB Operational
          </div>
          <p className="text-xs text-[#868685]">
            © {new Date().getFullYear()} OmniPulse. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
