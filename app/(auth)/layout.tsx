"use client";

import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { ParticleGrid } from "@/components/landing/ParticleGrid";
import { TRUST_BADGES } from "@/components/landing/data";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-[#fafbf8] text-[#0e0f0c] selection:bg-[#9fe870] selection:text-[#163300] overflow-x-hidden">
      {/* ── Landing Page Shared Particle Grid ── */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <ParticleGrid />
      </div>

      {/* ── Soft Ambient Radial Glow (Wise Palette) ── */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[650px] rounded-full blur-[140px] pointer-events-none opacity-50"
          style={{
            background:
              "radial-gradient(circle, rgba(159, 232, 112, 0.25) 0%, rgba(226, 246, 213, 0.45) 40%, transparent 75%)",
          }}
        />
      </div>

      {/* ── Top Navigation Bar ── */}
      <header className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
          <div className="flex h-7 items-center justify-center transition-transform group-hover:scale-105">
            <Image
              src="/logos/messagerail-icon.svg"
              alt="MessageRail"
              width={50}
              height={28}
              className="h-5 sm:h-6 w-auto object-contain"
              priority
            />
          </div>
          <span className="text-lg sm:text-xl font-black tracking-tight text-[#0e0f0c] font-heading">
            MessageRail<span className="text-[#9fe870]">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#e2f6d5] border border-[#9fe870]/70 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#163300]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#163300] animate-pulse" />
            <span>Multi-Channel Operations</span>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#163300] hover:text-[#054d28] hover:underline underline-offset-4 px-2 sm:px-3 py-1.5 transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Back to website</span>
            <span className="xs:hidden">Back</span>
          </Link>
        </div>
      </header>

      {/* ── Main Architectural Showcase Card ── */}
      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[460px]">
          {/* Centered Pill Badge Above Card */}
          {/* <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e2f6d5] border border-[#9fe870]/70 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#163300] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#163300]" />
              <span>Multi-Channel Gateway</span>
            </div>
          </div> */}

          {/* Floating Monolithic Glass Card */}
          <div className="relative rounded-3xl bg-white/95 backdrop-blur-xl border border-[#e8ebe6] shadow-[0_24px_70px_rgba(22,51,0,0.07),0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
            {/* Top Lime Voltage Accent Bar */}
            <div className="h-1.5 w-full bg-[#9fe870]" />

            {/* Clerk Form Slot */}
            <div className="p-7 sm:p-9">{children}</div>
          </div>

          {/* Trust Badges Row (Identical to Landing Hero) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {TRUST_BADGES.slice(0, 3).map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-1.5 text-[11px] font-bold text-[#454745]"
              >
                <CheckCircle2 size={13} className="text-[#163300] shrink-0" />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── Minimal Footer ── */}
      <footer className="relative z-10 w-full py-6 px-6 text-center text-xs text-[#868685]">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span>Client Tenant Isolation</span>
          <span className="w-1 h-1 rounded-full bg-[#d0d3cd]" />
          <span>Opt-In Consent Safeguards</span>
          <span className="w-1 h-1 rounded-full bg-[#d0d3cd]" />
          <span>© {new Date().getFullYear()} MessageRail Inc.</span>
        </div>
      </footer>
    </div>
  );
}
