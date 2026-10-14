"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Sparkles, Zap, ArrowRight, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuotaMetric } from "@/lib/hooks/usePlanUsage";
import type { PlanTier } from "@/lib/services/billing.service";

interface PlanQuotaBannerProps {
  metric: QuotaMetric;
  label: string;
  unit: string;
  tier: PlanTier;
  featureName?: string;
  onUpgrade: () => void;
  showOnlyWhenWarning?: boolean;
  className?: string;
}

export function PlanQuotaBanner({
  metric,
  label,
  unit,
  tier,
  featureName,
  onUpgrade,
  showOnlyWhenWarning = true,
  className,
}: PlanQuotaBannerProps) {
  // If unlimited or below threshold and configured to only show when warning, hide
  if (metric.isUnlimited) return null;
  if (showOnlyWhenWarning && !metric.isNearLimit && !metric.isAtLimit) return null;

  const isCritical = metric.isAtLimit;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all shadow-sm",
        isCritical
          ? "border-red-200 bg-gradient-to-r from-red-50 via-rose-50/60 to-white text-red-950"
          : "border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50/50 to-white text-amber-950",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Icon & Alert copy */}
        <div className="flex items-start gap-3.5">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs",
              isCritical
                ? "bg-red-600 text-white"
                : "bg-amber-500 text-white"
            )}
          >
            {isCritical ? (
              <ShieldAlert className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold tracking-tight">
                {isCritical
                  ? `${label} Limit Reached (${metric.current.toLocaleString()} / ${metric.limit.toLocaleString()})`
                  : `${label} Quota Warning (${metric.percent}% Used)`}
              </h4>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider",
                  isCritical
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800"
                )}
              >
                {tier} Plan
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              {isCritical
                ? `You have reached your limit of ${metric.limit.toLocaleString()} ${unit}. Upgrade to unlock higher capacity and prevent service disruptions.`
                : `You have ${metric.remaining.toLocaleString()} ${unit} remaining before hitting your ${tier} plan threshold.`}
            </p>

            {/* Meter Progress Bar */}
            <div className="mt-2.5 flex items-center gap-3">
              <div className="h-2 w-48 sm:w-64 rounded-full bg-black/10 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isCritical ? "bg-red-600" : "bg-amber-500"
                  )}
                  style={{ width: `${Math.min(100, metric.percent)}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-gray-500">
                {metric.current.toLocaleString()} / {metric.limit.toLocaleString()} {unit}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Upgrade CTA */}
        <div className="flex items-center gap-2 shrink-0 sm:self-center">
          <button
            type="button"
            onClick={onUpgrade}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-sm cursor-pointer",
              isCritical
                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-200"
                : "bg-[#163300] hover:bg-[#0d2000] text-[#9fe870] hover:text-white shadow-[#163300]/20"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Upgrade to {tier === "starter" ? "Growth" : "Agency"}</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-80" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

interface QuotaPillProps {
  current: number;
  limit: number;
  unit: string;
  isUnlimited: boolean;
  onUpgrade?: () => void;
  className?: string;
}

export function QuotaPill({
  current,
  limit,
  unit,
  isUnlimited,
  onUpgrade,
  className,
}: QuotaPillProps) {
  if (isUnlimited) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-xs font-semibold text-emerald-800",
          className
        )}
      >
        <Zap className="h-3 w-3 text-emerald-600" />
        Unlimited {unit}
      </span>
    );
  }

  const percent = Math.min(100, Math.round((current / limit) * 100));
  const isHigh = percent >= 80;
  const isMax = current >= limit;

  return (
    <button
      type="button"
      onClick={onUpgrade}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-2xs",
        isMax
          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
          : isHigh
          ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
        className
      )}
      title="Click to view plan upgrades"
    >
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            isMax ? "bg-red-500 animate-pulse" : isHigh ? "bg-amber-500" : "bg-emerald-500"
          )}
        />
        <span>
          <strong className="font-bold text-gray-900">{current.toLocaleString()}</strong> /{" "}
          {limit.toLocaleString()} {unit}
        </span>
      </div>
      {(isHigh || isMax) && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
          Upgrade
        </span>
      )}
    </button>
  );
}
