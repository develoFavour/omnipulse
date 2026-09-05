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
  Sparkles
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
}

export function ChannelPlacementSelector({
  selectedPlacements,
  onTogglePlacement,
  telegramContactCount,
  whatsappContactCount,
  telegramDestinationCount,
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
      reach: `${telegramContactCount} contact${telegramContactCount === 1 ? "" : "s"}`,
      disabled: telegramContactCount === 0,
      badge: "Automated Gateway",
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
      reach: `${telegramDestinationCount} group${telegramDestinationCount === 1 ? "" : "s"}`,
      disabled: telegramDestinationCount === 0,
      badge: "Multi-Destination",
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
      reach: `${whatsappContactCount} subscriber${whatsappContactCount === 1 ? "" : "s"}`,
      disabled: whatsappContactCount === 0,
      badge: "Verified Gateway",
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
      badge: "Direct Social Share",
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
                  ? "opacity-50 cursor-not-allowed bg-gray-50/50 border-gray-200"
                  : "cursor-pointer hover:shadow-sm",
                isSelected
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
                      <span className="text-[11px] font-semibold text-gray-400">
                        {item.type}
                      </span>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "h-5 w-5 rounded-md border flex items-center justify-center transition-all duration-200",
                      isSelected
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-gray-300 bg-white group-hover:border-gray-400"
                    )}
                  >
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </div>
                </div>

                <p className="text-xs font-medium text-gray-600 leading-relaxed mb-3">
                  {item.description}
                </p>
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
