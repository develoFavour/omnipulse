"use client";

import { PlatformAnalytics } from "@/lib/services/analytics.service";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";
import { CheckCircle2, AlertTriangle, Layers, Send, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformBreakdownCardsProps {
  platforms: PlatformAnalytics[];
}

export function PlatformBreakdownCards({ platforms }: PlatformBreakdownCardsProps) {
  // Ensure both WhatsApp and Telegram are represented even if 0 messages
  const defaultPlatforms = [
    {
      platform: "whatsapp",
      total: 0,
      delivered: 0,
      failed: 0,
      delivery_rate: 100,
      share_percentage: 50,
    },
    {
      platform: "telegram",
      total: 0,
      delivered: 0,
      failed: 0,
      delivery_rate: 100,
      share_percentage: 50,
    },
  ];

  const displayList = platforms.length > 0 ? platforms : defaultPlatforms;

  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-gray-900">Platform Deliverability & Share</h3>
          <p className="text-xs text-gray-500 mt-0.5">Performance breakdown by transport protocol</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
          <Layers className="h-3.5 w-3.5" />
          <span>Multi-channel</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayList.map((item) => {
          const isWhatsApp = item.platform.toLowerCase() === "whatsapp";
          const Icon = isWhatsApp ? FaWhatsapp : FaTelegram;
          const brandColor = isWhatsApp ? "text-[#25D366]" : "text-[#229ED9]";
          const brandBg = isWhatsApp ? "bg-[#25D366]/10" : "bg-[#229ED9]/10";
          const brandBorder = isWhatsApp ? "border-emerald-200/60" : "border-sky-200/60";
          const progressColor = isWhatsApp ? "bg-[#25D366]" : "bg-[#229ED9]";

          return (
            <div
              key={item.platform}
              className={cn(
                "rounded-xl border p-5 transition-all hover:shadow-md",
                brandBorder,
                "bg-gradient-to-br from-white to-gray-50/50"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", brandBg, brandColor)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 capitalize">
                      {item.platform === "whatsapp" ? "WhatsApp Direct" : "Telegram Network"}
                    </h4>
                    <span className="text-[11px] font-medium text-gray-400">
                      {item.share_percentage.toFixed(1)}% of total broadcast volume
                    </span>
                  </div>
                </div>

                <div
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold",
                    item.delivery_rate >= 95
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : item.delivery_rate >= 80
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{item.delivery_rate.toFixed(1)}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-500">Deliverability</span>
                  <span className="font-bold text-gray-800">{item.delivered} / {item.total} delivered</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={cn("h-full transition-all duration-500", progressColor)}
                    style={{ width: `${Math.min(100, item.delivery_rate)}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-center">
                <div className="rounded-lg bg-white p-2 border border-gray-100">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Sent</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{item.total.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-white p-2 border border-gray-100">
                  <p className="text-[10px] font-bold uppercase text-emerald-600">Delivered</p>
                  <p className="text-sm font-bold text-emerald-700 mt-0.5">{item.delivered.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-white p-2 border border-gray-100">
                  <p className="text-[10px] font-bold uppercase text-rose-500">Failed</p>
                  <p className="text-sm font-bold text-rose-600 mt-0.5">{item.failed.toLocaleString()}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
