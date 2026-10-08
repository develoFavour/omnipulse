"use client";

import { RefObject, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";
import { Megaphone, Activity, Rocket } from "lucide-react";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";
import { TRANSMISSIONS } from "./data";

interface CommandDeckProps {
  heroCardRef: RefObject<HTMLDivElement | null>;
  cardScale: MotionValue<number>;
  cardRotateX: MotionValue<number>;
  cardOpacity: MotionValue<number>;
  cardY: MotionValue<number>;
}

export function CommandDeck({
  heroCardRef,
  cardScale,
  cardRotateX,
  cardOpacity,
  cardY,
}: CommandDeckProps) {
  const [tickerIdx, setTickerIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setTickerIdx((p) => (p + 1) % TRANSMISSIONS.length),
      2800
    );
    return () => clearInterval(t);
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cardTiltX = useSpring(useTransform(mouseY, [-1, 1], [6, -6]), { stiffness: 200, damping: 20 });
  const cardTiltY = useSpring(useTransform(mouseX, [-1, 1], [-6, 6]), { stiffness: 200, damping: 20 });

  const handleCardMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
      mouseY.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
    },
    [mouseX, mouseY]
  );

  const handleCardMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <section id="engine" className="px-4 sm:px-6 max-w-[1200px] mx-auto pb-20 pt-2 sm:pt-4">
      <div ref={heroCardRef} style={{ perspective: "1400px" }}>
        <motion.div
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          style={{
            scale: cardScale,
            rotateX: cardRotateX,
            rotateY: cardTiltY,
            opacity: cardOpacity,
            y: cardY,
            transformStyle: "preserve-3d",
          }}
          className="rounded-[32px] bg-[#163300] text-white p-6 sm:p-10 shadow-2xl text-left relative overflow-hidden will-change-transform"
        >
          <div className="absolute top-0 right-0 p-12 opacity-[0.04] pointer-events-none">
            <Megaphone className="h-80 w-80 text-[#9fe870]" />
          </div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="h-3 w-3 rounded-full bg-[#9fe870] block" />
                  <span className="absolute inset-0 rounded-full bg-[#9fe870] animate-ping opacity-75" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#9fe870] font-heading">
                    Campaign Operations Studio
                  </h3>
                  <p className="text-xs text-white/60 font-medium">
                    Multi-Channel Delivery Ready · Automated Rate Pacing
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 border border-white/15 flex items-center gap-1.5">
                  <FaWhatsapp className="h-3.5 w-3.5 text-[#25D366]" /> WhatsApp API
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 border border-white/15 flex items-center gap-1.5">
                  <FaTelegram className="h-3.5 w-3.5 text-[#229ED9]" /> Telegram Native
                </span>
                <span className="rounded-full bg-[#9fe870] text-[#163300] px-3 py-1 text-xs font-black uppercase">
                  Live Receipts
                </span>
              </div>
            </div>

            <div className="mt-4 py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs overflow-hidden">
              <div className="flex items-center gap-2.5 truncate">
                <Activity className="h-4 w-4 text-[#9fe870] shrink-0 animate-pulse" />
                <span className="text-white/50 font-mono text-[11px] shrink-0">ACTIVITY LOG:</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={tickerIdx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="font-medium text-white truncate"
                  >
                    {TRANSMISSIONS[tickerIdx].text}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono text-[#9fe870]">
                  ⚡ {TRANSMISSIONS[tickerIdx].latency}
                </span>
                <span className="hidden sm:inline-block text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/60">
                  {TRANSMISSIONS[tickerIdx].channel}
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#9fe870] mb-2">
                    Active Client Campaign
                  </label>
                  <div className="rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-sm font-semibold text-white font-mono flex items-center justify-between">
                    <span>Spring VIP Product Announcement</span>
                    <span className="text-[10px] bg-[#9fe870]/20 text-[#9fe870] px-2 py-0.5 rounded font-bold uppercase">
                      Scheduled · 11:00 AM
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#9fe870]">
                      Message Composer
                    </label>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-white/50">
                      <span className="bg-white/10 px-2 py-0.5 rounded text-[#9fe870]">
                        {"{{first_name}}"}
                      </span>
                      <span className="bg-white/10 px-2 py-0.5 rounded text-[#9fe870]">
                        {"{{company}}"}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/15 p-4 text-sm text-white/90 leading-relaxed min-h-[90px]">
                    {"Hey "}<span className="text-[#9fe870] font-bold">{"{{first_name}}"}</span>{"! Your exclusive agency pass for "}
                    <span className="text-[#9fe870] font-bold">{"{{company}}"}</span>{" is unlocked."}
                  </div>
                </div>
                <div className="rounded-xl bg-white/10 border border-white/15 p-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-white/50 uppercase font-semibold">Opted-In Audience Target</div>
                    <div className="text-2xl font-black text-white font-heading">
                      1,250 <span className="text-xs font-semibold text-[#9fe870]">contacts</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-[#25D366]/20 text-[#25D366] px-2.5 py-1 text-xs font-bold flex items-center gap-1">
                      <FaWhatsapp className="h-3 w-3" /> 820 WhatsApp
                    </span>
                    <span className="rounded-lg bg-[#229ED9]/20 text-[#229ED9] px-2.5 py-1 text-xs font-bold flex items-center gap-1">
                      <FaTelegram className="h-3 w-3" /> 430 Telegram
                    </span>
                  </div>
                </div>
                <div className="pt-1 flex items-center gap-4">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/sign-up"
                      className="inline-flex items-center gap-2 rounded-full bg-[#9fe870] px-7 py-3 text-sm font-black text-[#163300] hover:brightness-105 transition-all"
                    >
                      <Rocket className="h-4 w-4" /> Simulate Launch (14,280)
                    </Link>
                  </motion.div>
                  <span className="text-xs text-white/50 font-medium">Est. ~11.9 mins</span>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-xs rounded-[32px] border-4 border-white/20 bg-[#0e0f0c] p-4 shadow-2xl">
                  <div className="w-20 h-4 bg-white/20 rounded-full mx-auto mb-4" />
                  <div className="rounded-xl bg-[#e8ebe6] p-3 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-[#25D366] flex items-center justify-center">
                        <FaWhatsapp className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0e0f0c]">MessageRail Verified</div>
                        <div className="text-[10px] text-gray-500">Official Business Sender</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ✓ Verified
                    </span>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 space-y-2">
                    <div className="text-xs text-gray-800 leading-relaxed">
                      {"Hey "}<span className="font-bold text-[#163300]">Sarah</span>{"! Your exclusive agency pass for "}
                      <span className="font-bold text-[#163300]">Apex Media</span>{" is unlocked."}
                    </div>
                    <div className="text-[10px] text-gray-400 text-right">10:50 AM · Delivered ✓✓</div>
                  </div>
                  <div className="mt-3 rounded-2xl bg-[#229ED9]/15 p-3 border border-[#229ED9]/25 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FaTelegram className="h-4 w-4 text-[#229ED9]" />
                      <span className="font-bold text-white text-[11px]">Mirrored to 6 Channels</span>
                    </div>
                    <span className="text-[10px] text-[#9fe870] font-mono font-bold">100% Synced</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
