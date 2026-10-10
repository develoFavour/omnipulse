"use client";

import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { ParticleGrid } from "@/components/landing/ParticleGrid";

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps?: number;
  title: string;
  description: string;
  stepIcon: LucideIcon;
  stepLabel: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps = 3,
  title,
  description,
  stepIcon: StepIcon,
  stepLabel,
}: OnboardingLayoutProps) {
  return (
    <div className="relative min-h-screen bg-[#fafbf8] text-[#0e0f0c] overflow-x-hidden flex flex-col justify-between selection:bg-[#9fe870] selection:text-[#163300]">
      {/* ── Background: Particle Grid & Ambient Glow ── */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <ParticleGrid />
      </div>

      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-45"
          style={{
            background:
              "radial-gradient(circle, rgba(159, 232, 112, 0.25) 0%, rgba(226, 246, 213, 0.45) 45%, transparent 75%)",
          }}
        />
      </div>

      {/* ── Layout Wrapper ── */}
      <motion.div
        className="relative z-10 flex flex-col items-center flex-1 px-4 sm:px-6 lg:px-8"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* ── Brand Header ── */}
        <motion.div className="w-full max-w-xl pt-8 pb-6" variants={fadeUp}>
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-7 items-center justify-center transition-transform group-hover:scale-105">
                <Image
                  src="/logos/messagerail-icon.svg"
                  alt="MessageRail"
                  width={50}
                  height={28}
                  className="h-6 w-auto object-contain"
                  priority
                />
              </div>
              <span className="text-xl font-black tracking-tight text-[#0e0f0c] font-heading">
                MessageRail<span className="text-[#9fe870]">.</span>
              </span>
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full bg-[#e2f6d5] border border-[#9fe870]/70 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#163300] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#163300] animate-pulse" />
              <span>{stepLabel}</span>
            </div>
          </div>
        </motion.div>

        {/* ── Progress Indicators ── */}
        <motion.div className="w-full max-w-xl mb-8" variants={fadeUp}>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => {
              const isPastOrCurrent = i < currentStep;
              return (
                <div key={i} className="flex-1">
                  <div className="h-1.5 rounded-full bg-[#e8ebe6] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[#163300]"
                      initial={{ width: isPastOrCurrent ? "100%" : "0%" }}
                      animate={{ width: isPastOrCurrent ? "100%" : "0%" }}
                      transition={{
                        duration: 0.6,
                        ease: [0.16, 1, 0.3, 1] as const,
                        delay: i * 0.1,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Main Container ── */}
        <div className="w-full max-w-xl flex-1 flex flex-col pb-12">
          {/* Step Icon & Headings */}
          <motion.div className="mb-8" variants={fadeUp}>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f4f5f2] border border-[#e8ebe6] px-3 py-1 mb-4">
              <StepIcon className="w-3.5 h-3.5 text-[#163300]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#454745]">
                {stepLabel}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-[#163300] uppercase leading-tight mb-2.5">
              {title}
            </h1>
            <p className="text-[#454745] text-base font-medium leading-relaxed max-w-lg">
              {description}
            </p>
          </motion.div>

          {/* Elevated Floating White Card */}
          <motion.div
            className="rounded-3xl bg-white/95 backdrop-blur-xl border border-[#e8ebe6] shadow-[0_24px_70px_rgba(22,51,0,0.07),0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden"
            variants={fadeUp}
          >
            {/* Top Lime Voltage Accent Line */}
            <div className="h-1.5 w-full bg-[#9fe870]" />

            <div className="p-7 sm:p-9">{children}</div>
          </motion.div>

          {/* Footer note */}
          <div className="flex items-center justify-center py-8 mt-auto">
            <p className="text-xs font-semibold text-[#868685] tracking-wide flex items-center gap-2">
              <span>Enterprise-grade encryption</span>
              <span className="w-1 h-1 rounded-full bg-[#d0d3cd]" />
              <span>SOC 2 Type II Certified</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
