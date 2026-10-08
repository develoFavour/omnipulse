"use client";

import { RefObject } from "react";
import Link from "next/link";
import { motion, MotionValue } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ParticleGrid } from "./ParticleGrid";
import { TRUST_BADGES } from "./data";

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

interface HeroSectionProps {
  heroRef: RefObject<HTMLDivElement | null>;
  heroLine1Y: MotionValue<string>;
  heroLine2Y: MotionValue<string>;
  heroLine3Y: MotionValue<string>;
  hasMounted: boolean;
  introComplete: boolean;
}

export function HeroSection({
  heroRef,
  heroLine1Y,
  heroLine2Y,
  heroLine3Y,
  hasMounted,
  introComplete,
}: HeroSectionProps) {
  return (
    <section
      ref={heroRef}
      className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center pt-10 sm:pt-14 pb-14 sm:pb-16 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <ParticleGrid />
      </div>

      <motion.div
        suppressHydrationWarning
        initial={false}
        animate={
          introComplete
            ? { opacity: 1, y: 0 }
            : hasMounted
            ? { opacity: 0, y: 20 }
            : { opacity: 1, y: 0 }
        }
        transition={{ duration: 0.6, delay: 0.1, ease: EASE_EXPO }}
        className="inline-flex items-center gap-2 rounded-full bg-[#e2f6d5] border border-[#9fe870]/70 px-4 py-1.5 mb-8 z-10"
      >
        <span className="h-2 w-2 rounded-full bg-[#163300] animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-wider text-[#163300]">
          Multi-Channel Operations · Unified Provider Routing
        </span>
      </motion.div>

      <div suppressHydrationWarning className="relative z-10 text-center px-4 overflow-visible">
        <motion.div style={{ y: heroLine1Y }} suppressHydrationWarning>
          <motion.h1
            suppressHydrationWarning
            className="text-[clamp(44px,8vw,108px)] font-black uppercase text-[#0e0f0c] tracking-[-0.04em] leading-[0.88] font-heading"
            initial={false}
            animate={
              introComplete
                ? { opacity: 1, y: 0 }
                : hasMounted
                ? { opacity: 0, y: 40 }
                : { opacity: 1, y: 0 }
            }
            transition={{ duration: 0.8, delay: 0.15, ease: EASE_EXPO }}
          >
            MESSAGING
          </motion.h1>
        </motion.div>
        <motion.div style={{ y: heroLine2Y }} suppressHydrationWarning>
          <motion.div
            suppressHydrationWarning
            className="flex items-center justify-center gap-4"
            initial={false}
            animate={
              introComplete
                ? { opacity: 1, y: 0 }
                : hasMounted
                ? { opacity: 0, y: 40 }
                : { opacity: 1, y: 0 }
            }
            transition={{ duration: 0.8, delay: 0.25, ease: EASE_EXPO }}
          >
            <span className="text-[clamp(44px,8vw,108px)] font-black uppercase text-[#163300] tracking-[-0.04em] leading-[0.88] font-heading">
              WITHOUT
            </span>
            <span className="hidden sm:inline-block rounded-full bg-[#9fe870] px-6 py-2 text-[clamp(14px,2vw,22px)] font-black text-[#163300] uppercase tracking-tight self-center">
              Borders
            </span>
          </motion.div>
        </motion.div>
        <motion.div style={{ y: heroLine3Y }} suppressHydrationWarning>
          <motion.h1
            suppressHydrationWarning
            className="text-[clamp(44px,8vw,108px)] font-black uppercase text-[#0e0f0c] tracking-[-0.04em] leading-[0.88] font-heading"
            initial={false}
            animate={
              introComplete
                ? { opacity: 1, y: 0 }
                : hasMounted
                ? { opacity: 0, y: 40 }
                : { opacity: 1, y: 0 }
            }
            transition={{ duration: 0.8, delay: 0.35, ease: EASE_EXPO }}
          >
            BORDERS<span className="text-[#9fe870]">.</span>
          </motion.h1>
        </motion.div>
      </div>

      <motion.div
        suppressHydrationWarning
        className="mt-8 sm:mt-10 z-10 text-center px-4"
        initial={false}
        animate={
          introComplete
            ? { opacity: 1, y: 0 }
            : hasMounted
            ? { opacity: 0, y: 24 }
            : { opacity: 1, y: 0 }
        }
        transition={{ duration: 0.8, delay: 0.45, ease: EASE_EXPO }}
      >
        <p className="text-base sm:text-xl text-[#454745] max-w-2xl mx-auto leading-relaxed">
          A multi-channel campaign workspace for agencies and modern teams managing compliant outreach across multiple clients.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#9fe870] px-8 py-3.5 text-base font-black text-[#163300] hover:brightness-105 transition-all shadow-md"
            >
              Start Free — No Card Needed <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </Link>
          </motion.div>
          <a
            href="#engine"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#163300] hover:text-[#0e0f0c] underline underline-offset-4 decoration-2 transition-colors py-2"
          >
            Explore Live Studio →
          </a>
        </div>
      </motion.div>

      <motion.div
        suppressHydrationWarning
        className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-[#868685] px-4 z-10"
        initial={false}
        animate={
          introComplete
            ? { opacity: 1 }
            : hasMounted
            ? { opacity: 0 }
            : { opacity: 1 }
        }
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        {TRUST_BADGES.map((t) => (
          <div key={t} className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#163300]" />
            <span>{t}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
