"use client";

import { HourlyPerformance } from "@/lib/services/analytics.service";
import { Clock, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface HourlyHeatmapProps {
  hourlyData: HourlyPerformance[];
}

export function HourlyHeatmap({ hourlyData }: HourlyHeatmapProps) {
  // Find peak hour by total sent volume
  let peakHour = 14;
  let peakVolume = 0;
  let maxVolumeInAnyHour = 1;

  for (const item of hourlyData) {
    if (item.total > peakVolume) {
      peakVolume = item.total;
      peakHour = item.hour;
    }
    if (item.total > maxVolumeInAnyHour) {
      maxVolumeInAnyHour = item.total;
    }
  }

  const formatHourLabel = (h: number) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour}${ampm}`;
  };

  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Optimal Dispatch Timing (24h Heatmap)</h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Dispatch volume and deliverability by hour of day (UTC)
          </p>
        </div>

        {peakVolume > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/60 px-3 py-1 text-xs font-bold text-amber-800">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Peak Activity: {formatHourLabel(peakHour)} ({peakVolume} messages)</span>
          </div>
        )}
      </div>

      {/* 24 Hour Bar Matrix */}
      <div className="grid grid-cols-6 sm:grid-cols-12 md:grid-cols-24 gap-1.5 pt-2">
        {hourlyData.map((item) => {
          const heightPercent = maxVolumeInAnyHour > 0 && item.total > 0
            ? Math.max(15, Math.round((item.total / maxVolumeInAnyHour) * 100))
            : 8;

          const isPeak = item.hour === peakHour && item.total > 0;

          return (
            <div
              key={item.hour}
              className="flex flex-col items-center group relative cursor-pointer"
            >
              {/* Tooltip on hover */}
              <div className="absolute -top-12 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                <div className="rounded-lg bg-gray-900 text-white px-2 py-1 text-[10px] font-bold shadow-lg whitespace-nowrap">
                  {formatHourLabel(item.hour)}: {item.total} sent ({item.delivery_rate.toFixed(0)}% delivered)
                </div>
                <div className="w-1.5 h-1.5 bg-gray-900 rotate-45 -mt-1" />
              </div>

              {/* Bar track */}
              <div className="h-24 w-full bg-gray-50 rounded-lg flex items-end justify-center p-1 border border-gray-100 group-hover:border-[#9fe870]/60 transition-colors">
                <div
                  className={cn(
                    "w-full rounded-md transition-all duration-300",
                    isPeak
                      ? "bg-amber-500 shadow-xs shadow-amber-500/30"
                      : item.total > 0
                      ? "bg-[#163300] hover:bg-[#1f4700]"
                      : "bg-gray-200/50"
                  )}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              {/* Hour label */}
              <span className="text-[10px] font-mono text-gray-400 mt-1 font-semibold">
                {item.hour % 3 === 0 ? item.hour : ""}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
        <span className="flex items-center gap-1.5 text-gray-400">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          Higher bars indicate greater message volume; hover for delivery success rate.
        </span>
        <div className="flex items-center gap-4 text-[11px] font-semibold">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Peak Hour
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#163300]" /> Active Hours
          </span>
        </div>
      </div>
    </div>
  );
}
