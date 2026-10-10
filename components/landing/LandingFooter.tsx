"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

export function LandingFooter() {
  return (
    <>
      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#163300] text-white py-24 sm:py-28 px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: EASE_EXPO }}
          className="max-w-4xl mx-auto"
        >
          <span className="text-xs font-black uppercase tracking-wider text-[#9fe870]">
            Start in 2 Minutes · No Credit Card Required
          </span>
          <h2 className="text-4xl sm:text-6xl font-black uppercase text-[#9fe870] tracking-tight font-heading mt-4 leading-[0.95]">
            PLAN. ROUTE. DELIVER<span className="text-white">.</span>
          </h2>
          <p className="mt-6 text-base sm:text-lg text-white/80 max-w-xl mx-auto leading-relaxed">
            Create an isolated workspace, connect your communication channels, and orchestrate compliant campaigns across your clients today.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#9fe870] px-8 py-3.5 text-base font-black text-[#163300] hover:brightness-105 transition-all shadow-md"
              >
                Open Free Workspace <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </Link>
            </motion.div>
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3.5 text-base font-bold text-white hover:bg-white/10 transition-all"
            >
              Read Product Overview
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-[#e8ebe6] pt-16 pb-12 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#e8ebe6]">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 items-center justify-center">
                <Image
                  src="/logos/messagerail-icon.svg"
                  alt="MessageRail"
                  width={50}
                  height={28}
                  className="h-6 w-auto object-contain"
                />
              </div>
              <span className="text-xl font-black text-[#0e0f0c] font-heading">
                MessageRail<span className="text-[#9fe870]">.</span>
              </span>
            </div>
            <p className="text-sm text-[#454745] max-w-sm leading-relaxed">
              The multi-channel campaign workspace for agencies managing compliant outreach across multiple clients.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e2f6d5] border border-[#9fe870]/60 px-3.5 py-1 text-xs font-bold text-[#163300]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#163300]" />
              Multi-Client Isolation · Real-Time Delivery Tracking
            </div>
          </div>

          {/* Product links */}
          <div className="md:col-span-2 sm:col-span-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#0e0f0c]">Product</div>
            <ul className="space-y-2 text-sm text-[#454745]">
              <li><a href="#engine" className="hover:text-[#163300] transition-colors">Campaign Studio</a></li>
              <li><a href="#workflow" className="hover:text-[#163300] transition-colors">How It Works</a></li>
              <li><a href="#channels" className="hover:text-[#163300] transition-colors">Channels</a></li>
              <li><a href="#capabilities" className="hover:text-[#163300] transition-colors">Pacing Planner</a></li>
              <li><Link href="/get-started" className="hover:text-[#163300] transition-colors">Product Overview</Link></li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div className="md:col-span-3 sm:col-span-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#0e0f0c]">Trust & Legal</div>
            <ul className="space-y-2 text-sm text-[#454745]">
              <li><Link href="/privacy" className="hover:text-[#163300] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#163300] transition-colors">Terms of Service</Link></li>
              <li><Link href="/terms#anti-spam" className="hover:text-[#163300] transition-colors">Acceptable Use & Anti-Spam</Link></li>
              <li><Link href="/security" className="hover:text-[#163300] transition-colors">Security & Data Safeguards</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div className="md:col-span-2 sm:col-span-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#0e0f0c]">Account</div>
            <ul className="space-y-2 text-sm text-[#454745]">
              <li><Link href="/sign-up" className="hover:text-[#163300] transition-colors">Open Workspace</Link></li>
              <li><Link href="/sign-in" className="hover:text-[#163300] transition-colors">Sign In</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#163300] transition-colors">Client Console</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#868685]">
          <p>© {new Date().getFullYear()} MessageRail Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[#163300] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#163300] transition-colors">Terms</Link>
            <Link href="/security" className="hover:text-[#163300] transition-colors">Security</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

