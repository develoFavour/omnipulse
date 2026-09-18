"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Radio,
  Clock,
  Sparkles,
  RefreshCw,
  Send,
  ExternalLink,
  ChevronRight,
  Filter,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { FaTelegramPlane, FaWhatsapp } from "react-icons/fa";
import {
  campaignService,
  CampaignStats,
  CampaignDeliveryItem,
} from "@/lib/services/campaign.service";
import { APP_ROUTES } from "@/lib/constants/routes.const";

interface LiveMissionTrackerProps {
  campaignId: string;
  campaignTitle: string;
  initialTargetCount: number;
  selectedPlacements: string[];
  mediaUrl?: string;
  isWhatsAppStory?: boolean;
  onReset: () => void;
  onOpenStoryModal?: () => void;
}

export function LiveMissionTracker({
  campaignId,
  campaignTitle,
  initialTargetCount,
  selectedPlacements,
  mediaUrl,
  isWhatsAppStory,
  onReset,
  onOpenStoryModal,
}: LiveMissionTrackerProps) {
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [deliveries, setDeliveries] = useState<CampaignDeliveryItem[]>([]);
  const [filter, setFilter] = useState<"all" | "delivered" | "failed">("all");
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [pollError, setPollError] = useState<string | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Elapsed timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Real-time polling function
  const fetchTelemetry = async () => {
    try {
      const [fetchedStats, fetchedDeliveries] = await Promise.all([
        campaignService.getCampaignStats(campaignId),
        campaignService.getCampaignDeliveries(campaignId, 1, 50).catch(() => []),
      ]);

      setStats(fetchedStats);
      if (Array.isArray(fetchedDeliveries)) {
        setDeliveries(fetchedDeliveries);
      }

      // Check if finished
      const status = fetchedStats.status?.toLowerCase();
      if (status === "completed" || status === "failed") {
        setIsPolling(false);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } catch (err: any) {
      console.warn("[LIVE-TRACKER] Telemetry poll failed:", err);
      setPollError("Connection glitch; retrying feed...");
    }
  };

  useEffect(() => {
    fetchTelemetry();
    pollIntervalRef.current = setInterval(fetchTelemetry, 1500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [campaignId]);

  // Derived metrics
  const totalTargets = stats?.total_targets ?? initialTargetCount;
  const processedTargets = stats?.processed_targets ?? (stats?.delivered ?? 0) + (stats?.failed ?? 0);
  const deliveredCount = stats?.delivered ?? 0;
  const failedCount = stats?.failed ?? 0;
  const inFlightCount = Math.max(0, totalTargets - (deliveredCount + failedCount));
  
  const rawProgress = stats?.progress_percent ?? (totalTargets > 0 ? (processedTargets / totalTargets) * 100 : 0);
  const isCompleted = stats?.status?.toLowerCase() === "completed" || (totalTargets > 0 && processedTargets >= totalTargets);
  const progressPercent = isCompleted ? 100 : Math.min(Math.round(rawProgress), 99);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const filteredDeliveries = deliveries.filter((item) => {
    if (filter === "delivered") return item.status === "delivered";
    if (filter === "failed") return item.status === "failed";
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500 space-y-6">
      {/* Top Banner Card: Mission Command */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/90 dark:border-white/10 bg-white/95 dark:bg-zinc-950/90 p-8 shadow-2xl backdrop-blur-xl">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/10 via-teal-500/10 to-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-white/5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              {isCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Broadcast Mission Accomplished
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
                  </span>
                  Live Dispatch in Flight
                </span>
              )}

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-[11px] font-mono text-gray-600 dark:text-zinc-300">
                <Clock className="h-3 w-3 text-gray-400" />
                {formatTimer(elapsedSeconds)}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              &quot;{campaignTitle}&quot;
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 font-mono">
              Campaign ID: <span className="select-all text-gray-700 dark:text-zinc-300">{campaignId}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {isPolling && (
              <button
                onClick={fetchTelemetry}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 hover:bg-gray-100 text-xs font-medium text-gray-600 dark:text-zinc-400 transition-colors"
                title="Force refresh"
              >
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Live Syncing
              </button>
            )}
          </div>
        </div>

        {/* Hero Progress Bar */}
        <div className="py-6 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white font-mono">
                {progressPercent}%
              </span>
              <span className="ml-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Delivered & Confirmed
              </span>
            </div>
            <div className="text-xs sm:text-sm font-mono text-gray-500 dark:text-zinc-400">
              <span className="font-bold text-gray-900 dark:text-white">{processedTargets}</span> of{" "}
              <span>{totalTargets}</span> recipients
            </div>
          </div>

          <div className="relative w-full h-3.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-teal-500 to-emerald-500 shadow-sm relative overflow-hidden"
            >
              {!isCompleted && (
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)]" />
              )}
            </motion.div>
          </div>
        </div>

        {/* KPI Telemetry Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Total Targets */}
          <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-zinc-900/50 p-4">
            <span className="text-[11px] font-semibold text-gray-400 dark:text-zinc-400 uppercase tracking-wider block mb-1">
              Targets
            </span>
            <div className="text-2xl font-black text-gray-900 dark:text-white font-mono">
              {totalTargets}
            </div>
            <span className="text-[11px] text-gray-400">Enqueued</span>
          </div>

          {/* Delivered */}
          <div className="rounded-2xl border border-emerald-100 dark:border-emerald-500/10 bg-emerald-50/50 dark:bg-emerald-500/5 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                Delivered
              </span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
              {deliveredCount}
            </div>
            <span className="text-[11px] text-emerald-600/80">Success receipts</span>
          </div>

          {/* In-Flight */}
          <div className="rounded-2xl border border-amber-100 dark:border-amber-500/10 bg-amber-50/50 dark:bg-amber-500/5 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                In-Flight
              </span>
              <Radio className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
            </div>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono">
              {inFlightCount}
            </div>
            <span className="text-[11px] text-amber-600/80">Dispatched in queue</span>
          </div>

          {/* Failed / Expired */}
          <div className="rounded-2xl border border-rose-100 dark:border-rose-500/10 bg-rose-50/50 dark:bg-rose-500/5 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
                Failed
              </span>
              <AlertCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-700 dark:text-rose-400 font-mono">
              {failedCount}
            </div>
            <span className="text-[11px] text-rose-600/80">Rejected or Expired</span>
          </div>
        </div>
      </div>

      {/* Real-time Delivery Audit Ticker */}
      <div className="rounded-3xl border border-gray-200/90 dark:border-white/10 bg-white/95 dark:bg-zinc-950/90 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-white/5">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Send className="h-4 w-4 text-indigo-500" />
              Live Delivery Audit Stream
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Deterministic return receipts verified by the worker nodes
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-zinc-900 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === "all"
                  ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              All ({deliveries.length})
            </button>
            <button
              onClick={() => setFilter("delivered")}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === "delivered"
                  ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Delivered ({deliveredCount})
            </button>
            <button
              onClick={() => setFilter("failed")}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === "failed"
                  ? "bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Failed ({failedCount})
            </button>
          </div>
        </div>

        {/* Informative Diagnostic Banner if Worker Pickup is Slow */}
        {elapsedSeconds >= 35 && processedTargets === 0 && (
          <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3 animate-in fade-in duration-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
            <div className="space-y-1">
              <p className="font-semibold">Worker Node Dispatch In Progress</p>
              <p className="text-[11px] opacity-90">
                Tasks are safely buffered in the NATS message stream. If the outbound delivery worker is initializing or reconnecting to channel gateways, confirmed return receipts will stream in automatically.
              </p>
              <div className="pt-1 flex items-center gap-3">
                <button
                  onClick={fetchTelemetry}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-[11px] font-bold text-amber-700 dark:text-amber-300 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" /> Force Poll Telemetry
                </button>
                <span className="text-[11px] opacity-70">
                  Elapsed: {formatTimer(elapsedSeconds)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Deliveries List */}
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {filteredDeliveries.length === 0 ? (
            <div className="py-12 text-center text-gray-400 dark:text-zinc-500 text-sm">
              {deliveries.length === 0 ? (
                <div className="flex flex-col items-center gap-2.5">
                  <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
                  <span className="font-medium text-gray-700 dark:text-zinc-300">
                    {elapsedSeconds < 15
                      ? "Dispatched tasks to NATS JetStream fabric..."
                      : elapsedSeconds < 45
                      ? "Workers negotiating delivery handshakes with platform gateways..."
                      : "Awaiting delivery confirmation receipts from worker nodes..."}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-zinc-500 font-mono">
                    Live stream polling active (every 1.5s) &bull; {formatTimer(elapsedSeconds)}
                  </span>
                </div>
              ) : (
                <span>No delivery events matching the &quot;{filter}&quot; filter.</span>
              )}
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filteredDeliveries.map((item) => {
                const isDelivered = item.status === "delivered";
                const isTelegram = item.platform === "telegram";
                const isWhatsApp = item.platform === "whatsapp";

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/60 dark:bg-zinc-900/40 hover:bg-gray-50 dark:hover:bg-zinc-900/80 transition-colors text-xs font-mono"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200/60 dark:border-white/5 shrink-0">
                        {isTelegram && <FaTelegramPlane className="h-4 w-4 text-[#229ED9]" />}
                        {isWhatsApp && <FaWhatsapp className="h-4 w-4 text-[#25D366]" />}
                        {!isTelegram && !isWhatsApp && <Radio className="h-4 w-4 text-indigo-500" />}
                      </div>

                      <div className="truncate">
                        <span className="font-bold text-gray-900 dark:text-white block truncate">
                          {item.routing_value}
                        </span>
                        {item.error_message ? (
                          <span className="text-[11px] text-rose-600 dark:text-rose-400 block truncate" title={item.error_message}>
                            Reason: {item.error_message}
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400">
                            {item.target_type === "telegram_destination" ? "Channel broadcast" : "Direct message"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="text-[11px] text-gray-400 hidden sm:inline">
                        {new Date(item.created_at).toLocaleTimeString()}
                      </span>

                      {isDelivered ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="h-3 w-3" />
                          Delivered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 font-semibold text-[11px]">
                          <AlertCircle className="h-3 w-3" />
                          Failed
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl border border-gray-200/90 dark:border-white/10 bg-white/95 dark:bg-zinc-950/90 shadow-xl">
        <a
          href={APP_ROUTES.DASHBOARD.ACTIVITY}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-800 dark:text-zinc-200 font-bold text-sm transition-all shadow-xs"
        >
          View in Global Activity Log
          <ExternalLink className="h-4 w-4 text-gray-400" />
        </a>

        <div className="flex items-center gap-3">
          {isWhatsAppStory && onOpenStoryModal && (
            <button
              onClick={onOpenStoryModal}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm transition-all shadow-md shadow-emerald-500/20"
            >
              <FaWhatsapp className="h-4 w-4" />
              Post to WhatsApp Story
            </button>
          )}

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md shadow-indigo-600/25"
          >
            Compose New Broadcast
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
