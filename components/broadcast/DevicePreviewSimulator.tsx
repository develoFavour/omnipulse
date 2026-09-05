"use client";

import { useState } from "react";
import { 
  Radio, 
  Smartphone, 
  CheckCheck, 
  Eye, 
  Share2, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  MoreVertical, 
  ArrowLeft, 
  Smile, 
  Paperclip, 
  Mic,
  Camera
} from "lucide-react";
import { FaTelegram, FaWhatsapp } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { ChannelPlacement } from "./ChannelPlacementSelector";

interface DevicePreviewSimulatorProps {
  messageBody: string;
  mediaUrl: string;
  selectedPlacements: ChannelPlacement[];
  botUsername?: string;
  verifiedWhatsAppName?: string;
}

export function DevicePreviewSimulator({
  messageBody,
  mediaUrl,
  selectedPlacements,
  botUsername = "@OmnipulsengBot",
  verifiedWhatsAppName = "Omnipulse Business",
}: DevicePreviewSimulatorProps) {
  // Determine default tab based on selected placements
  const [activeTab, setActiveTab] = useState<ChannelPlacement>("telegram_dm");

  const effectiveTab = selectedPlacements.includes(activeTab)
    ? activeTab
    : selectedPlacements[0] || "telegram_dm";

  const previewName = "Alex Rivera";
  const displayMessage = messageBody.trim()
    ? messageBody
        .replace(/\{first_name\}/g, previewName)
        .replace(/\{username\}/g, "alex_rivera")
    : "Compose your message on the left to see live rendering across mobile client touchpoints...";

  const charCount = messageBody.length;
  const isOverTelegramPhotoLimit = mediaUrl && charCount > 1024;
  const isOverWhatsAppLimit = charCount > 4096;

  return (
    <div className="space-y-4">
      {/* Platform Switcher Tabs */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
          <Smartphone className="h-3.5 w-3.5 text-indigo-600" />
          Live Omnichannel Simulator
        </span>
        <span className="text-[11px] font-mono text-gray-400">
          Real-Time Rendering
        </span>
      </div>

      <div className="flex items-center p-1 bg-gray-100 rounded-xl gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("telegram_dm")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all select-none",
            effectiveTab === "telegram_dm"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-500 hover:text-gray-800"
          )}
        >
          <FaTelegram className="h-3 w-3 text-[#0088cc]" />
          TG DM
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("telegram_channel")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all select-none",
            effectiveTab === "telegram_channel"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-500 hover:text-gray-800"
          )}
        >
          <FaTelegram className="h-3 w-3 text-sky-600" />
          TG Group
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("whatsapp_dm")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all select-none",
            effectiveTab === "whatsapp_dm"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-500 hover:text-gray-800"
          )}
        >
          <FaWhatsapp className="h-3 w-3 text-[#25D366]" />
          WA DM
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("whatsapp_story")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all select-none",
            effectiveTab === "whatsapp_story"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-500 hover:text-gray-800"
          )}
        >
          <Share2 className="h-3 w-3 text-emerald-600" />
          WA Story
        </button>
      </div>

      {/* Phone Hardware Chassis */}
      <div className="relative mx-auto max-w-[340px] rounded-[40px] border-[8px] border-gray-900 bg-black shadow-2xl overflow-hidden aspect-[9/18.5] flex flex-col select-none">
        {/* Dynamic Island / Camera Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 h-4 w-24 bg-gray-950 rounded-full z-50 flex items-center justify-end pr-2">
          <div className="h-2 w-2 rounded-full bg-[#111] border border-gray-800" />
        </div>

        {/* Screen Viewport */}
        <div className="flex-1 bg-white overflow-hidden flex flex-col relative text-gray-900">
          {/* iOS Top Status Bar */}
          <div className="h-8 pt-1.5 px-6 flex items-center justify-between text-[11px] font-bold z-40 bg-transparent text-gray-800">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span>5G</span>
              <div className="h-2.5 w-4 rounded-xs border border-gray-800 p-0.5 flex items-center">
                <div className="h-full w-full bg-gray-800 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Tab 1: TELEGRAM DM */}
          {effectiveTab === "telegram_dm" && (
            <div className="flex-1 flex flex-col bg-[#0e1621] text-white">
              {/* Telegram Header */}
              <div className="bg-[#17212b] px-3 py-2.5 flex items-center gap-2.5 border-b border-gray-800/80 shrink-0">
                <ArrowLeft className="h-4 w-4 text-gray-400" />
                <div className="h-8 w-8 rounded-full bg-[#5288c1] flex items-center justify-center text-xs font-bold text-white shadow-xs">
                  {botUsername[1]?.toUpperCase() || "B"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate leading-tight">
                    {botUsername}
                  </div>
                  <div className="text-[10px] text-sky-400 font-medium">
                    bot
                  </div>
                </div>
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </div>

              {/* Chat Canvas */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-[radial-gradient(#1e2c3a_1px,transparent_1px)] [background-size:12px_12px] flex flex-col justify-end">
                <div className="max-w-[86%] self-start rounded-2xl rounded-tl-sm bg-[#182533] border border-gray-800/60 overflow-hidden shadow-md">
                  {mediaUrl && (
                    <div className="relative aspect-video w-full bg-gray-950 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mediaUrl} alt="Attached Media" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="p-3">
                    <p className="text-xs font-normal leading-relaxed text-gray-100 whitespace-pre-wrap">
                      {displayMessage}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1.5 text-[9px] text-gray-400 font-mono">
                      <span>9:42 AM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fake Telegram Input Bar */}
              <div className="bg-[#17212b] px-3 py-2 flex items-center gap-2 border-t border-gray-800/80">
                <div className="flex-1 bg-[#242f3d] rounded-full px-3 py-1.5 text-[11px] text-gray-400">
                  Message
                </div>
                <div className="h-7 w-7 rounded-full bg-[#5288c1] flex items-center justify-center text-white">
                  <Send className="h-3 w-3" />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: TELEGRAM CHANNEL */}
          {effectiveTab === "telegram_channel" && (
            <div className="flex-1 flex flex-col bg-[#0e1621] text-white">
              {/* Telegram Channel Header */}
              <div className="bg-[#17212b] px-3 py-2.5 flex items-center gap-2.5 border-b border-gray-800/80 shrink-0">
                <ArrowLeft className="h-4 w-4 text-gray-400" />
                <div className="h-8 w-8 rounded-full bg-sky-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                  📢
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate leading-tight">
                    Official Announcements
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium">
                    1,240 subscribers
                  </div>
                </div>
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </div>

              {/* Channel Post Canvas */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-[radial-gradient(#1e2c3a_1px,transparent_1px)] [background-size:12px_12px] flex flex-col justify-end">
                <div className="w-full rounded-2xl bg-[#182533] border border-gray-800/60 overflow-hidden shadow-md">
                  {mediaUrl && (
                    <div className="relative aspect-video w-full bg-gray-950 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mediaUrl} alt="Attached Media" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="p-3">
                    <p className="text-xs font-normal leading-relaxed text-gray-100 whitespace-pre-wrap">
                      {displayMessage}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-800/50 text-[10px] text-gray-400">
                      <div className="flex items-center gap-1 font-mono">
                        <Eye className="h-3 w-3 text-gray-400" />
                        <span>1.4K</span>
                      </div>
                      <span className="font-mono">9:42 AM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Muted Broadcast Bar */}
              <div className="bg-[#17212b] px-4 py-2.5 text-center text-xs font-bold text-[#5288c1] border-t border-gray-800">
                MUTE NOTIFICATIONS
              </div>
            </div>
          )}

          {/* Tab 3: WHATSAPP DM */}
          {effectiveTab === "whatsapp_dm" && (
            <div className="flex-1 flex flex-col bg-[#efeae2]">
              {/* WhatsApp Header */}
              <div className="bg-[#075E54] text-white px-3 py-2 flex items-center gap-2 shrink-0">
                <ArrowLeft className="h-4 w-4 text-white" />
                <div className="h-8 w-8 rounded-full bg-[#128C7E] flex items-center justify-center text-xs font-bold text-white shadow-xs">
                  {verifiedWhatsAppName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate leading-tight">
                    {verifiedWhatsAppName}
                  </div>
                  <div className="text-[10px] text-emerald-200 font-medium">
                    Verified Business
                  </div>
                </div>
                <MoreVertical className="h-4 w-4 text-white" />
              </div>

              {/* WhatsApp Chat Canvas */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-[#efeae2] flex flex-col justify-end">
                <div className="max-w-[88%] self-end rounded-2xl rounded-tr-xs bg-[#D9FDD3] border border-emerald-100/60 overflow-hidden shadow-xs text-gray-900">
                  {mediaUrl && (
                    <div className="relative aspect-video w-full bg-gray-200 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mediaUrl} alt="Attached Media" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="p-2.5">
                    <p className="text-xs font-normal leading-relaxed text-gray-900 whitespace-pre-wrap">
                      {displayMessage}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-gray-500 font-mono">
                      <span>9:42 AM</span>
                      <CheckCheck className="h-3 w-3 text-sky-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Bottom Bar */}
              <div className="bg-[#f0f2f5] px-3 py-2 flex items-center gap-2">
                <Smile className="h-4 w-4 text-gray-500" />
                <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[11px] text-gray-400">
                  Message
                </div>
                <div className="h-7 w-7 rounded-full bg-[#00a884] flex items-center justify-center text-white">
                  <Mic className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: WHATSAPP STORY / STATUS (Full 9:16 Vertical) */}
          {effectiveTab === "whatsapp_story" && (
            <div className="flex-1 relative bg-gray-900 flex flex-col justify-between text-white overflow-hidden">
              {/* Media Background */}
              {mediaUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaUrl}
                  alt="Story Creative"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950 flex items-center justify-center" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 pointer-events-none" />

              {/* Top Status Indicators & Author */}
              <div className="relative z-10 pt-2 px-3 space-y-2">
                {/* Progress Bar */}
                <div className="h-1 w-full bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-white rounded-full" />
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full p-0.5 bg-gradient-to-tr from-[#25D366] to-[#128C7E]">
                    <div className="h-full w-full rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-bold">
                      {verifiedWhatsAppName[0]}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-none drop-shadow-sm">
                      {verifiedWhatsAppName}
                    </div>
                    <div className="text-[10px] text-gray-300 drop-shadow-sm">
                      Just now
                    </div>
                  </div>
                </div>
              </div>

              {/* Story Floating Content Card */}
              <div className="relative z-10 p-4 mb-2">
                <div className="rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 p-3.5 shadow-2xl">
                  <p className="text-xs font-medium text-white leading-relaxed whitespace-pre-wrap text-center">
                    {displayMessage}
                  </p>
                </div>
              </div>

              {/* Story Bottom Reply Pill */}
              <div className="relative z-10 px-4 pb-3 flex items-center justify-center">
                <div className="w-full py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-center text-[11px] font-semibold text-white/90">
                  Reply to Status
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pre-Flight Compliance Inspector */}
      <div className="rounded-2xl border border-gray-200 bg-white p-3.5 space-y-2 text-xs">
        <div className="flex items-center justify-between font-bold text-gray-700">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Pre-Flight Quality Score
          </span>
          <span className="font-mono text-emerald-600 font-extrabold">
            100% READY
          </span>
        </div>

        <div className="space-y-1 text-[11px] text-gray-500 font-medium">
          <div className="flex items-center justify-between">
            <span>Character Payload:</span>
            <span className={cn("font-mono font-bold", isOverTelegramPhotoLimit ? "text-amber-600" : "text-gray-700")}>
              {charCount} / {mediaUrl ? "1024" : "4096"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Creative Media Asset:</span>
            <span className="font-semibold text-gray-700">
              {mediaUrl ? "Attached & Responsive" : "Text Only"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Variable Personalization:</span>
            <span className="font-semibold text-emerald-700">
              {messageBody.includes("{first_name}") ? "Dynamic {first_name} Active" : "Static Broadcast"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
