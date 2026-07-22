"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
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
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden flex flex-col">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-white/[0.04] rounded-full blur-[120px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.07, 0.04] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[100px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center flex-1 px-4 sm:px-6 lg:px-8"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="w-full max-w-xl pt-10 pb-8" variants={fadeUp}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/[0.12] flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm" />
              </div>
              <span className="text-sm font-semibold tracking-widest uppercase text-zinc-300">
                OmniPulse
              </span>
            </div>
          </div>
        </motion.div>

        {/* Progress bars */}
        <motion.div className="w-full max-w-xl mb-10" variants={fadeUp}>
          <div className="flex items-center gap-2.5">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex-1">
                <motion.div
                  className="h-1 rounded-full bg-white/[0.08] overflow-hidden"
                >
                  <motion.div
                    className="h-full rounded-full bg-white"
                    initial={{ width: i < currentStep ? "100%" : "0%" }}
                    animate={{ width: i < currentStep ? "100%" : "0%" }}
                    transition={{ duration: 0.6, ease: "easeOut" as const, delay: i * 0.1 }}
                  />
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Content container */}
        <div className="w-full max-w-xl flex-1 flex flex-col">
          {/* Step badge + heading */}
          <motion.div className="mb-10" variants={fadeUp}>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/[0.1] flex items-center justify-center">
                <StepIcon className="w-4 h-4 text-zinc-400" />
              </div>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
                {stepLabel}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-white leading-tight mb-4">
              {title}
            </h1>
            <p className="text-zinc-400 text-lg font-light leading-relaxed max-w-md">
              {description}
            </p>
          </motion.div>

          {/* Form card */}
          <motion.div
            className="rounded-2xl border border-white/[0.1] bg-white/[0.04] backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-black/20"
            variants={fadeUp}
          >
            {children}
          </motion.div>

          {/* Footer */}
          <div className="flex items-center justify-center py-10 mt-auto">
            <p className="text-xs text-zinc-600 tracking-wide">
              Your data is encrypted and never shared with third parties.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
