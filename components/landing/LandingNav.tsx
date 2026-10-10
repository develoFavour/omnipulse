"use client";

import Link from "next/link";
import Image from "next/image";
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
      <div className="max-w-[1200px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-7 sm:h-8 items-center justify-center"
          >
            <Image
              src="/logos/messagerail-icon.svg"
              alt="MessageRail"
              width={54}
              height={30}
              className="h-6 sm:h-7 w-auto object-contain"
              priority
            />
          </motion.div>
          <span className="text-lg sm:text-xl font-black tracking-tight text-[#0e0f0c] font-heading">
            MessageRail<span className="text-[#9fe870]">.</span>
          </span>
        </Link>

        {/* Desktop nav pills */}
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

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sign In – hidden on xs, visible sm+ */}
          <Link
            href="/sign-in"
            className="hidden sm:inline-flex text-xs font-bold text-[#163300] hover:underline underline-offset-4 px-2 py-1.5 transition-colors"
          >
            Sign In
          </Link>

          {/* Open Account – hidden on mobile, visible md+ */}
          <Link
            href="/sign-up"
            className="hidden md:inline-flex items-center justify-center rounded-full border border-[#163300] bg-white px-4 py-2 text-xs font-bold text-[#163300] hover:bg-[#e8ebe6] transition-all"
          >
            Open Account
          </Link>

          {/* Primary CTA – always visible */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-full bg-[#163300] px-3.5 sm:px-5 py-2 text-xs font-black text-[#9fe870] hover:bg-[#054d28] transition-all whitespace-nowrap"
            >
              Launch Studio →
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
