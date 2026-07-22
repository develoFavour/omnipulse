"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number; // percentage change, e.g. +12.5 or -3.2
  icon: LucideIcon;
  iconColor?: string;
  delay?: number;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-indigo-600",
  delay = 0,
  className,
}: MetricCardProps) {
  const TrendIcon = change && change > 0 ? TrendingUp : change && change < 0 ? TrendingDown : Minus;
  const trendColor = change && change > 0 ? "text-emerald-600" : change && change < 0 ? "text-red-600" : "text-gray-500";
  const trendBg = change && change > 0 ? "bg-emerald-50" : change && change < 0 ? "bg-red-50" : "bg-gray-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-gray-200 hover:shadow-md",
        className
      )}
    >
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-indigo-50 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500 mb-2 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </span>
          <span className="text-sm font-medium text-gray-500">
            {title}
          </span>
        </div>
      </div>

      {change !== undefined && (
        <div className="mt-4 flex items-center gap-2">
          <div className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", trendBg, trendColor)}>
            <TrendIcon className="h-3 w-3" />
            {Math.abs(change)}%
          </div>
          <span className="text-xs font-medium text-gray-400">vs. last month</span>
        </div>
      )}
    </motion.div>
  );
}
