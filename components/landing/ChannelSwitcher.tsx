"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, CheckCircle2, Copy, Check } from "lucide-react";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

export function ChannelSwitcher() {
  const [activeTab, setActiveTab] = useState<"whatsapp" | "telegram" | "flywheel">("whatsapp");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("https://api.messagerail.io/v1/webhooks/inbound");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="channels" className="py-24 bg-[#f4f5f2] border-y border-[#e8ebe6]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: EASE_EXPO }}
        >
          <span className="text-xs font-black uppercase tracking-wider text-[#163300]">
            Channel Integrations
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#0e0f0c] tracking-tight font-heading mt-2">
            Native Connectors<span className="text-[#9fe870]">.</span>
          </h2>
          <p className="text-base text-[#454745] mt-4">
            Connect verified APIs in under 60 seconds with QR codes, OAuth, and secure bot tokens.
          </p>
          <div className="mt-8 inline-flex items-center rounded-full bg-white p-1 border border-[#e8ebe6] shadow-xs">
            {(["whatsapp", "telegram", "flywheel"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
                  activeTab === tab
                    ? "bg-[#163300] text-[#9fe870] shadow-sm"
                    : "text-[#454745] hover:text-[#0e0f0c]"
                }`}
              >
                {tab === "whatsapp" ? "WhatsApp Cloud" : tab === "telegram" ? "Telegram Bot" : "Webhook Flywheel"}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: EASE_EXPO }}
          className="rounded-[28px] bg-white border border-[#e8ebe6] p-8 sm:p-12 shadow-xs"
        >
          <AnimatePresence mode="wait">
            {activeTab === "whatsapp" && (
              <motion.div
                key="whatsapp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
              >
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#25D366]/10 text-[#25D366] px-3 py-1 text-xs font-bold mb-4">
                    <FaWhatsapp className="h-4 w-4" /> Official Meta Cloud Partner
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0e0f0c] font-heading mb-4">
                    1-Click Meta OAuth & WhatsApp QR Link
                  </h3>
                  <p className="text-base text-[#454745] leading-relaxed mb-6">
                    Deploy verified WhatsApp senders without managing infrastructure. Send DMs, target opt-in lists, and preview Status updates from your browser.
                  </p>
                  <ul className="space-y-3 text-sm text-[#454745] font-medium">
                    {[
                      "Official Meta WABA & Phone Number ID support",
                      "Automated contact sync & verification telemetry",
                      "WhatsApp Story Bridge with media asset support",
                    ].map((t) => (
                      <li key={t} className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#163300] shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-[#f4f5f2] p-6 border border-[#e8ebe6] space-y-3 font-mono text-xs">
                  {[
                    { label: "WABA ID:", value: "waba_991823901928" },
                    { label: "Phone ID:", value: "+1 (555) 912-8821" },
                    { label: "Quality Rating:", value: "High (Green Tier)", extra: "text-emerald-600" },
                  ].map((r) => (
                    <div key={r.label} className="p-3 rounded-xl bg-white border border-[#e8ebe6] flex justify-between">
                      <span className="text-gray-400">{r.label}</span>
                      <span className={`font-bold text-[#0e0f0c] ${r.extra || ""}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            {activeTab === "telegram" && (
              <motion.div
                key="telegram"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
              >
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#229ED9]/10 text-[#229ED9] px-3 py-1 text-xs font-bold mb-4">
                    <FaTelegram className="h-4 w-4" /> BotFather Native Integration
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0e0f0c] font-heading mb-4">
                    Automatic Telegram Group & Channel Discovery
                  </h3>
                  <p className="text-base text-[#454745] leading-relaxed mb-6">
                    Add your bot as admin to any community. MessageRail listens, registers Chat IDs, and exposes them in your broadcast studio selector.
                  </p>
                  <ul className="space-y-3 text-sm text-[#454745] font-medium">
                    {[
                      "Real-time destination webhook listener",
                      "Supports both 1:1 DMs and Public Channels",
                      "Automatic reconnect & webhook health monitoring",
                    ].map((t) => (
                      <li key={t} className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#163300] shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-[#f4f5f2] p-6 border border-[#e8ebe6] space-y-2 text-xs">
                  {[
                    { title: "VIP Announcements", type: "channel" },
                    { title: "Growth Marketing Community", type: "supergroup" },
                    { title: "Daily Product Releases", type: "channel" },
                  ].map((d, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white border border-[#e8ebe6] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaTelegram className="h-3.5 w-3.5 text-[#229ED9]" />
                        <span className="font-bold text-[#0e0f0c]">{d.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-gray-400">{d.type}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            {activeTab === "flywheel" && (
              <motion.div
                key="flywheel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
              >
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#163300] text-[#9fe870] px-3 py-1 text-xs font-bold mb-4">
                    <Bot className="h-4 w-4" /> Inbound Webhook Flywheel
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0e0f0c] font-heading mb-4">
                    Zero Manual CSV Imports. Contacts Flow In Live.
                  </h3>
                  <p className="text-base text-[#454745] leading-relaxed mb-6">
                    Every user interaction triggers instantaneous webhook ingestion. Route incoming phone numbers, Telegram usernames, and metadata into segmented cohorts.
                  </p>
                  <div className="p-3.5 rounded-xl bg-[#f4f5f2] border border-[#e8ebe6] flex items-center justify-between gap-2">
                    <code className="text-xs font-mono font-bold text-[#163300] truncate">
                      https://api.messagerail.io/v1/webhooks/inbound
                    </code>
                    <button
                      onClick={handleCopy}
                      className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-[#163300] hover:bg-[#e8ebe6] transition-colors"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="rounded-2xl bg-[#f4f5f2] p-6 border border-[#e8ebe6]">
                  <div className="text-xs font-bold text-[#0e0f0c] pb-3 mb-3 border-b border-[#e8ebe6]">
                    Live Segment Tags
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: "VIP Customer", color: "#163300" },
                      { name: "Inbound Lead", color: "#10b981" },
                      { name: "Enterprise Tier", color: "#f59e0b" },
                      { name: "Beta Tester", color: "#8b5cf6" },
                      { name: "Telegram Direct", color: "#229ED9" },
                    ].map((tag) => (
                      <span
                        key={tag.name}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: `${tag.color}15`,
                          color: tag.color,
                          border: `1px solid ${tag.color}35`,
                        }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
