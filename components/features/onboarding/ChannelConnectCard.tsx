"use client";

import Image from "next/image";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChannelConnectCardProps {
  title: string;
  description: string;
  logoSrc: string;
  isConnected: boolean;
  onToggle: () => void;
  colorClass: string;
}

export function ChannelConnectCard({
  title,
  description,
  logoSrc,
  isConnected,
  onToggle,
  colorClass,
}: ChannelConnectCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "w-full flex items-start justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-200 text-left group active:scale-[0.99]",
        isConnected
          ? "border-[#163300] bg-[#e2f6d5]/40 shadow-sm"
          : "border-[#e8ebe6] bg-[#f8faf7] hover:border-[#163300]/30 hover:bg-white hover:shadow-sm"
      )}
    >
      <div className="flex gap-3.5 min-w-0">
        <div
          className={cn(
            "flex items-center justify-center w-11 h-11 rounded-xl shrink-0 transition-transform group-hover:scale-105 overflow-hidden",
            colorClass
          )}
        >
          <Image
            src={logoSrc}
            alt={title}
            width={28}
            height={28}
            className="object-contain"
          />
        </div>
        <div className="pt-0.5">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-[#0e0f0c] group-hover:text-[#163300] transition-colors">
              {title}
            </h4>
            {isConnected && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#163300] bg-[#e2f6d5] border border-[#9fe870]/70 rounded-full px-2 py-0.5">
                Connected
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-[#454745] mt-1 max-w-[220px] leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "w-6 h-6 rounded-full border flex items-center justify-center transition-all shrink-0 mt-0.5",
          isConnected
            ? "border-[#163300] bg-[#163300] text-[#9fe870]"
            : "border-[#d0d3cd] bg-white text-[#868685] group-hover:border-[#163300]"
        )}
      >
        {isConnected ? (
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        ) : (
          <Plus className="w-3.5 h-3.5 stroke-[2]" />
        )}
      </div>
    </button>
  );
}
