"use client";

import { LucideIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChannelConnectCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  isConnected: boolean;
  onToggle: () => void;
  colorClass: string;
}

export function ChannelConnectCard({
  title,
  description,
  icon: Icon,
  isConnected,
  onToggle,
  colorClass,
}: ChannelConnectCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "w-full flex items-start justify-between p-4 rounded-xl border transition-all duration-300 text-left group",
        isConnected
          ? "border-white/30 bg-white/[0.08]"
          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
      )}
    >
      <div className="flex gap-4 min-w-0">
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-xl shrink-0 transition-colors",
            colorClass
          )}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="pt-1">
          <h4 className="text-sm font-semibold text-white tracking-wide truncate">
            {title}
          </h4>
          <p className="text-xs text-zinc-400 mt-1 max-w-[200px] leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 mt-1 mr-1",
          isConnected
            ? "border-white bg-white text-zinc-950"
            : "border-zinc-700 bg-transparent group-hover:border-zinc-500"
        )}
      >
        {isConnected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
      </div>
    </button>
  );
}
