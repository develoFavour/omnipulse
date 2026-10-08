"use client";

import { motion } from "framer-motion";
import { Megaphone, Bot, BarChart3, Users, CheckCircle2 } from "lucide-react";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";
import { FEATURE_ITEMS } from "./data";

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

export function FeatureShowcase() {
  const getIcon = (id: string) => {
    switch (id) {
      case "broadcast": return Megaphone;
      case "flywheel": return Bot;
      case "telemetry": return BarChart3;
      default: return Users;
    }
  };

  const getPreview = (id: string) => {
    switch (id) {
      case "broadcast":
        return (
          <div className="rounded-2xl bg-[#163300] p-6 text-white space-y-4 font-mono text-xs shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-[#9fe870] font-bold uppercase">Multi-Channel Dispatch</span>
              <span className="text-white/40">ID: cmp_spring_01</span>
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaWhatsapp className="h-4 w-4 text-[#25D366]" />
                  <span>WhatsApp Cloud API</span>
                </div>
                <span className="text-emerald-400 font-bold">● Rate-Safe Paced</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaTelegram className="h-4 w-4 text-[#229ED9]" />
                  <span>Telegram Bot Channel</span>
                </div>
                <span className="text-sky-400 font-bold">● Direct Dispatched</span>
              </div>
            </div>
            <div className="pt-2 text-[11px] text-white/50 flex justify-between">
              <span>Delivery Pacing: Meta & Telegram Safe</span>
              <span className="text-[#9fe870]">Active ✓</span>
            </div>
          </div>
        );
      case "flywheel":
        return (
          <div className="rounded-2xl bg-white p-6 border border-[#e8ebe6] shadow-sm space-y-3">
            <div className="text-xs font-bold text-[#0e0f0c] uppercase tracking-wider pb-2 border-b border-[#e8ebe6]">
              Inbound Contact Capture
            </div>
            {[
              { name: "Sarah Jenkins", handle: "@sarah_j", tag: "VIP Member", platform: "telegram", time: "Just now" },
              { name: "Marcus Reed", handle: "+1 (555) 0192", tag: "Client Lead", platform: "whatsapp", time: "12s ago" },
              { name: "Elena Rostova", handle: "@elena_growth", tag: "Partner", platform: "telegram", time: "45s ago" },
            ].map((c) => (
              <div key={c.name} className="p-3 rounded-xl bg-[#f4f5f2] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-[#163300] text-[#9fe870] font-black flex items-center justify-center text-[10px]">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-[#0e0f0c]">{c.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{c.handle}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#163300] border border-[#e8ebe6]">
                    {c.tag}
                  </span>
                  <span className="text-[10px] text-gray-400">{c.time}</span>
                </div>
              </div>
            ))}
          </div>
        );
      case "telemetry":
        return (
          <div className="rounded-2xl bg-[#0e0f0c] p-6 text-white space-y-4 shadow-lg font-mono text-xs">
            <div className="flex items-center justify-between text-white/60 pb-2 border-b border-white/10">
              <span className="text-[#9fe870] font-bold">CAMPAIGN MONITOR</span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/70">SAMPLE RUN</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] text-white/70">
                <span>Audience Target:</span>
                <span className="font-bold text-white">450 contacts</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div className="bg-[#9fe870] h-full rounded-full" style={{ width: "98%" }} />
              </div>
              <div className="flex justify-between text-[10px] text-white/50">
                <span className="text-[#9fe870]">441 Verified Receipts</span>
                <span>9 In Progress...</span>
              </div>
            </div>
            <div className="pt-2 border-t border-white/10 space-y-1 text-[11px] text-white/60">
              <div className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" /> WhatsApp Cloud: Verified Delivered
              </div>
              <div className="text-sky-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" /> Telegram Bot: Direct Dispatched
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="rounded-2xl bg-white p-6 border border-[#e8ebe6] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8ebe6]">
              <span className="text-xs font-bold text-[#0e0f0c] uppercase">Team Permissions</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { name: "Alex Chen", role: "Owner", email: "alex@agency.com" },
                { name: "Priya Patel", role: "Campaign Admin", email: "priya@agency.com" },
                { name: "Sam Wilson", role: "Broadcast Member", email: "sam@agency.com" },
              ].map((m) => (
                <div key={m.email} className="p-3 rounded-xl bg-[#f4f5f2] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#0e0f0c]">{m.name}</div>
                    <div className="text-[10px] text-gray-400">{m.email}</div>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#163300] border border-[#e8ebe6]">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <section className="py-24 max-w-[1200px] mx-auto px-4 sm:px-6 space-y-20">
      <motion.div
        className="text-center max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: EASE_EXPO }}
      >
        <span className="text-xs font-black uppercase tracking-wider text-[#163300]">
          Platform Capabilities
        </span>
        <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#0e0f0c] tracking-tight font-heading mt-2">
          Everything You Need<span className="text-[#9fe870]">.</span>
        </h2>
        <p className="mt-4 text-base text-[#454745]">
          From contact capture to broadcast analytics — one unified command surface.
        </p>
      </motion.div>

      {FEATURE_ITEMS.map((feat, i) => {
        const isReversed = i % 2 !== 0;
        const IconComponent = getIcon(feat.id);

        return (
          <motion.div
            key={feat.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: EASE_EXPO }}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
              isReversed ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#e2f6d5] border border-[#9fe870]/50 px-3 py-1 text-xs font-bold text-[#163300] mb-5">
                <IconComponent className="h-3.5 w-3.5" />
                {feat.tag}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#0e0f0c] font-heading leading-tight mb-4">
                {feat.headline}
              </h3>
              <p className="text-base text-[#454745] leading-relaxed mb-8">{feat.body}</p>
              <div className="flex gap-8">
                {feat.stats.map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-black text-[#163300] font-heading">{s.value}</div>
                    <div className="text-xs text-[#868685] font-medium mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }} className="rounded-2xl overflow-hidden">
              {getPreview(feat.id)}
            </motion.div>
          </motion.div>
        );
      })}
    </section>
  );
}
