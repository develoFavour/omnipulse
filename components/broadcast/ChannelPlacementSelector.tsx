"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  Megaphone, 
  Smartphone, 
  Share2, 
  CheckCircle2, 
  Radio, 
  Info, 
  Sparkles,
  RefreshCw,
  PlusCircle,
  Loader2,
  AlertCircle
} from "lucide-react";
import { FaTelegram, FaWhatsapp } from "react-icons/fa";
import { cn } from "@/lib/utils";

export type ChannelPlacement = "telegram_dm" | "telegram_channel" | "whatsapp_dm" | "whatsapp_story";

interface ChannelPlacementSelectorProps {
  selectedPlacements: ChannelPlacement[];
  onTogglePlacement: (placement: ChannelPlacement) => void;
  telegramContactCount: number;
  whatsappContactCount: number;
  telegramDestinationCount: number;
  isTelegramConnected?: boolean;
  isWhatsAppConnected?: boolean;
  telegramSender?: string;
  whatsappSender?: string;
  onConnectTelegram?: () => void;
  onConnectWhatsApp?: () => void;
  onSyncWhatsApp?: () => void;
  onSyncTelegram?: () => void;
  isSyncingWhatsApp?: boolean;
  isSyncingTelegram?: boolean;
}

export function ChannelPlacementSelector({
  selectedPlacements,
  onTogglePlacement,
  telegramContactCount,
  whatsappContactCount,
  telegramDestinationCount,
  isTelegramConnected = true,
  isWhatsAppConnected = true,
  telegramSender,
  whatsappSender,
  onConnectTelegram,
  onConnectWhatsApp,
  onSyncWhatsApp,
  onSyncTelegram,
  isSyncingWhatsApp = false,
  isSyncingTelegram = false,
}: ChannelPlacementSelectorProps) {
  const placements = [
    {
      id: "telegram_dm" as ChannelPlacement,
      title: "Telegram Direct (DM)",
      channel: "Telegram",
      icon: FaTelegram,
      brandColor: "text-[#0088cc]",
      brandBg: "bg-[#0088cc]/10",
      accentBorder: "border-[#0088cc]",
      activeBadge: "bg-[#0088cc]/10 text-[#0088cc]",
      type: "1-on-1 Automated",
      description: "Direct personalized message to all subscribers who started your bot.",
      reach: !isTelegramConnected 
        ? "Bot not linked" 
        : `${telegramContactCount} subscriber${telegramContactCount === 1 ? "" : "s"}`,
      disabled: !isTelegramConnected,
      connected: isTelegramConnected,
      identity: telegramSender,
      badge: isTelegramConnected ? "Active Gateway" : "Action Required",
      actionType: !isTelegramConnected ? "connect_telegram" : telegramContactCount === 0 ? "sync_telegram" : null,
    },
    {
      id: "telegram_channel" as ChannelPlacement,
      title: "Telegram Community",
      channel: "Telegram",
      icon: Megaphone,
      brandColor: "text-sky-600",
      brandBg: "bg-sky-50",
      accentBorder: "border-sky-500",
      activeBadge: "bg-sky-100 text-sky-800",
      type: "Group Announcement",
      description: "Broadcast to channels & supergroups where your bot has admin privileges.",
      reach: !isTelegramConnected 
        ? "Bot not linked" 
        : `${telegramDestinationCount} group${telegramDestinationCount === 1 ? "" : "s"}`,
      disabled: !isTelegramConnected || telegramDestinationCount === 0,
      connected: isTelegramConnected,
      identity: telegramSender,
      badge: isTelegramConnected ? "Multi-Destination" : "Action Required",
      actionType: !isTelegramConnected ? "connect_telegram" : null,
    },
    {
      id: "whatsapp_dm" as ChannelPlacement,
      title: "WhatsApp Direct (DM)",
      channel: "WhatsApp",
      icon: FaWhatsapp,
      brandColor: "text-[#25D366]",
      brandBg: "bg-[#25D366]/10",
      accentBorder: "border-[#25D366]",
      activeBadge: "bg-[#25D366]/10 text-[#128C7E]",
      type: "1-on-1 Automated",
      description: "High-engagement private broadcast to your verified WhatsApp subscribers.",
      reach: !isWhatsAppConnected 
        ? "WhatsApp not linked" 
        : `${whatsappContactCount} subscriber${whatsappContactCount === 1 ? "" : "s"}`,
      disabled: !isWhatsAppConnected,
      connected: isWhatsAppConnected,
      identity: whatsappSender,
      badge: isWhatsAppConnected ? "Verified Gateway" : "Action Required",
      actionType: !isWhatsAppConnected ? "connect_whatsapp" : whatsappContactCount === 0 ? "sync_whatsapp" : null,
    },
    {
      id: "whatsapp_story" as ChannelPlacement,
      title: "WhatsApp Story / Status",
      channel: "WhatsApp",
      icon: Share2,
      brandColor: "text-emerald-600",
      brandBg: "bg-emerald-50",
      accentBorder: "border-emerald-500",
      activeBadge: "bg-emerald-100 text-emerald-800",
      type: "Social Status",
      description: "Format high-converting 9:16 vertical story & 1-click launch to WhatsApp Status.",
      reach: "Public Status Audience",
      disabled: false,
      connected: true,
      identity: undefined,
      badge: "Direct Social Share",
      actionType: null,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 text-indigo-600" />
          Delivery Channels & Placements
          <span className="text-[10px] font-mono text-gray-400">
            ({selectedPlacements.length} selected)
          </span>
        </label>
        <span className="text-xs font-semibold text-gray-500">
          Target multiple touchpoints simultaneously
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {placements.map((item) => {
          const isSelected = selectedPlacements.includes(item.id);
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              onClick={() => {
                if (!item.disabled) {
                  onTogglePlacement(item.id);
                }
              }}
              className={cn(
                "relative group flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 select-none text-left",
                item.disabled
                  ? "opacity-60 bg-gray-50/70 border-gray-200 cursor-not-allowed"
                  : "cursor-pointer hover:shadow-sm",
                isSelected && !item.disabled
                  ? cn("bg-white shadow-sm ring-2 ring-indigo-600/10", item.accentBorder)
                  : "bg-white border-gray-200 hover:border-gray-300"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("p-2 rounded-xl flex items-center justify-center shrink-0", item.brandBg)}>
                      <Icon className={cn("h-4 w-4", item.brandColor)} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] font-semibold text-gray-400">
                          {item.type}
                        </span>
                        {item.connected && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "h-5 w-5 rounded-md border flex items-center justify-center transition-all duration-200",
                      isSelected && !item.disabled
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-gray-300 bg-white group-hover:border-gray-400"
                    )}
                  >
                    {isSelected && !item.disabled && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </div>
                </div>

                <p className="text-xs font-medium text-gray-600 leading-relaxed mb-3">
                  {item.description}
                </p>

                {/* Inline Action Bar for Connect / Sync */}
                {item.actionType === "connect_telegram" && onConnectTelegram && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onConnectTelegram();
                    }}
                    className="w-full mb-3 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors border border-indigo-200"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Connect Telegram Bot
                  </button>
                )}

                {item.actionType === "connect_whatsapp" && onConnectWhatsApp && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onConnectWhatsApp();
                    }}
                    className="w-full mb-3 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] text-xs font-bold transition-colors border border-[#25D366]/30"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Link WhatsApp Phone
                  </button>
                )}

                {item.actionType === "sync_whatsapp" && onSyncWhatsApp && (
                  <button
                    type="button"
                    disabled={isSyncingWhatsApp}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSyncWhatsApp();
                    }}
                    className="w-full mb-3 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors border border-emerald-200 disabled:opacity-50"
                  >
                    {isSyncingWhatsApp ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    Sync WhatsApp Contacts
                  </button>
                )}

                {item.actionType === "sync_telegram" && onSyncTelegram && (
                  <button
                    type="button"
                    disabled={isSyncingTelegram}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSyncTelegram();
                    }}
                    className="w-full mb-3 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-colors border border-sky-200 disabled:opacity-50"
                  >
                    {isSyncingTelegram ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    Sync Telegram Contacts
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-gray-700">
                  <Users className="h-3 w-3 text-gray-400" />
                  {item.reach}
                </span>

                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md", item.activeBadge)}>
                  {item.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
