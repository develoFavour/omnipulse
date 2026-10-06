"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { NAV_LINKS } from "./data";

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

interface LandingNavProps {
  introComplete: boolean;
}

export function LandingNav({ introComplete }: LandingNavProps) {
  return (
    <motion.header
      suppressHydrationWarning
      className="sticky top-0 z-50 h-16 w-full bg-white/90 backdrop-blur-md border-b border-[#e8ebe6]"
      initial={false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: introComplete ? 0 : 2.5, ease: EASE_EXPO }}
    >
      <div className="max-w-[1200px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="h-8 w-8 rounded-full bg-[#163300] flex items-center justify-center text-[#9fe870] font-black text-sm"
          >
            OP
          </motion.div>
          <span className="text-xl font-black tracking-tight text-[#0e0f0c] font-heading">
            OmniPulse<span className="text-[#9fe870]">.</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center bg-[#f4f5f2] rounded-full p-1">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#454745] hover:text-[#0e0f0c] hover:bg-white transition-all"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-xs font-bold text-[#163300] hover:underline underline-offset-4 px-2 py-1.5 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="hidden sm:inline-flex items-center justify-center rounded-full border border-[#163300] bg-white px-4 py-2 text-xs font-bold text-[#163300] hover:bg-[#e8ebe6] transition-all"
          >
            Open Account
          </Link>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-full bg-[#163300] px-4 sm:px-5 py-2 text-xs font-black text-[#9fe870] hover:bg-[#054d28] transition-all"
            >
              Launch Studio →
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
