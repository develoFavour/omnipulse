"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Send,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  RefreshCw,
  Download,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { useAnalytics } from "@/lib/api/hooks/useAnalytics";
import { DeliveryTrendChart } from "@/components/analytics/DeliveryTrendChart";
import { PlatformBreakdownCards } from "@/components/analytics/PlatformBreakdownCards";
import { HourlyHeatmap } from "@/components/analytics/HourlyHeatmap";
import { TopCampaignsTable } from "@/components/analytics/TopCampaignsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/lib/hooks/usePermissions";

const TIME_RANGES = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last 90 Days", days: 90 },
] as const;

export default function AnalyticsPage() {
  const { canExportData } = usePermissions();
  const [selectedDays, setSelectedDays] = useState<number>(30);
  const { report, isLoading, refetch } = useAnalytics(selectedDays);
  const [isExporting, setIsExporting] = useState(false);

  const overview = report?.overview || {
    total_sent: 0,
    total_delivered: 0,
    total_failed: 0,
    delivery_rate: 0,
    campaigns_count: 0,
    total_audience_reach: 0,
    period_growth_sent: 0,
    period_growth_rate: 0,
  };

  const handleExportCSV = () => {
    if (!canExportData) {
      toast.error("Exporting workspace analytics is restricted to Administrators and Owners.");
      return;
    }

    if (!report || report.daily_trend.length === 0) {
      toast.error("No analytics data available to export.");
      return;
    }

    setIsExporting(true);
    try {
      const headers = ["Date", "Sent", "Delivered", "Failed", "Delivery Rate (%)"];
      const rows = report.daily_trend.map((d) => [
        d.date,
        d.sent,
        d.delivered,
        d.failed,
        d.delivery_rate.toFixed(1),
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `omnipulse-analytics-${selectedDays}d.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Analytics CSV exported successfully!");
    } catch {
      toast.error("Failed to generate CSV export.");
    } finally {
      setIsExporting(false);
    }
  };

  const stagger = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6 pb-12"
    >
      {/* Page Header */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/80 pb-6"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-indigo-600 font-bold">Campaign Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-heading flex items-center gap-3">
            <span>Omnichannel Intelligence</span>
            <span className="rounded-full bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              Agency Suite
            </span>
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Continuous throughput, platform deliverability telemetry, and dispatch optimization.
          </p>
        </div>

        {/* Time range & action controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Days Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-gray-100/80 border border-gray-200/80">
            {TIME_RANGES.map((range) => (
              <button
                key={range.days}
                type="button"
                onClick={() => setSelectedDays(range.days)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  selectedDays === range.days
                    ? "bg-white text-gray-900 shadow-xs border border-gray-200/50"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={isExporting || isLoading || !canExportData}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-xs",
              canExportData
                ? "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 cursor-pointer disabled:opacity-50"
                : "border-gray-200/60 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
            )}
            title={canExportData ? "Download CSV export" : "Export restricted to Admins and Owners"}
          >
            <Download className="h-3.5 w-3.5 text-gray-400" />
            <span>Export</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Refresh telemetry"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </button>
        </div>
      </motion.div>

      {/* Hero KPI Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Messages Sent */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
            <span>Total Broadcasted</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Send className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {isLoading ? "—" : overview.total_sent.toLocaleString()}
            </span>
            {overview.period_growth_sent !== 0 && (
              <span
                className={cn(
                  "flex items-center gap-1 text-xs font-bold",
                  overview.period_growth_sent > 0 ? "text-emerald-600" : "text-rose-600"
                )}
              >
                {overview.period_growth_sent > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {overview.period_growth_sent > 0 ? "+" : ""}
                {overview.period_growth_sent}%
              </span>
            )}
          </div>
          <p className="text-[11px] font-medium text-gray-400 mt-1">
            vs. prior {selectedDays}-day period
          </p>
        </div>

        {/* Deliverability Rate */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
            <span>Deliverability Rate</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {isLoading ? "—" : `${overview.delivery_rate.toFixed(1)}%`}
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                overview.delivery_rate >= 95
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : overview.delivery_rate >= 80
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              )}
            >
              {overview.delivery_rate >= 95 ? "Optimal" : overview.delivery_rate >= 80 ? "Healthy" : "Attention"}
            </span>
          </div>
          <p className="text-[11px] font-medium text-gray-400 mt-1">
            {overview.total_delivered.toLocaleString()} delivered / {overview.total_failed} failed
          </p>
        </div>

        {/* Total Audience Reach */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
            <span>Audience Reach</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {isLoading ? "—" : overview.total_audience_reach.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-gray-400">Unique Targets</span>
          </div>
          <p className="text-[11px] font-medium text-gray-400 mt-1">
            Distinct contacts & channels engaged
          </p>
        </div>

        {/* Campaigns Executed */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
            <span>Campaigns Run</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {isLoading ? "—" : overview.campaigns_count.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              Active Missions
            </span>
          </div>
          <p className="text-[11px] font-medium text-gray-400 mt-1">
            Broadcast missions launched in {selectedDays}d
          </p>
        </div>
      </motion.div>

      {/* Main Delivery Trend Line Chart */}
      <motion.div variants={fadeUp}>
        {isLoading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 h-80 flex items-center justify-center">
            <Skeleton className="h-full w-full rounded-xl bg-gray-100" />
          </div>
        ) : (
          <DeliveryTrendChart
            data={report?.daily_trend || []}
            days={selectedDays}
          />
        )}
      </motion.div>

      {/* Grid: Platform Breakdown & Optimal Timing Heatmap */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <Skeleton className="h-72 w-full rounded-2xl bg-gray-100" />
            <Skeleton className="h-72 w-full rounded-2xl bg-gray-100" />
          </>
        ) : (
          <>
            <PlatformBreakdownCards
              platforms={report?.platform_breakdown || []}
            />
            <HourlyHeatmap
              hourlyData={report?.hourly_distribution || []}
            />
          </>
        )}
      </motion.div>

      {/* Top Campaigns Ranking Table */}
      <motion.div variants={fadeUp}>
        {isLoading ? (
          <Skeleton className="h-80 w-full rounded-2xl bg-gray-100" />
        ) : (
          <TopCampaignsTable
            campaigns={report?.top_campaigns || []}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
