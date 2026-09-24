"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarClock,
  Clock,
  Megaphone,
  RefreshCw,
  Search,
  Filter,
  Users,
  Radio,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Rocket,
  XCircle,
} from "lucide-react";
import {
  useScheduledCampaigns,
  ScheduledCampaignItem,
} from "@/lib/api/hooks/useScheduledCampaigns";
import { BroadcastSubNav } from "./BroadcastSubNav";
import { ScheduledPostCard } from "./ScheduledPostCard";
import { ScheduledCampaignDetailModal } from "./ScheduledCampaignDetailModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/constants/routes.const";
import { cn } from "@/lib/utils";

export function ScheduledBroadcastsView() {
  const {
    campaigns,
    isLoading,
    isRefreshing,
    cancellingId,
    dispatchingId,
    refetch,
    cancelSchedule,
    dispatchNow,
  } = useScheduledCampaigns();

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "later">("all");
  const [sortBy, setSortBy] = useState<"soonest" | "latest" | "title">("soonest");

  // Inspection Modal State
  const [inspectedCampaign, setInspectedCampaign] = useState<ScheduledCampaignItem | null>(null);

  // Confirmation Alert Dialog States
  const [campaignToCancel, setCampaignToCancel] = useState<ScheduledCampaignItem | null>(null);
  const [campaignToDispatch, setCampaignToDispatch] = useState<ScheduledCampaignItem | null>(null);

  // Compute stats for KPI banner
  const nearestCampaign = useMemo(() => {
    if (campaigns.length === 0) return null;
    const sorted = [...campaigns].sort((a, b) => a.timeRemainingMs - b.timeRemainingMs);
    return sorted[0];
  }, [campaigns]);

  const totalAudienceReach = useMemo(() => {
    return campaigns.reduce((acc, c) => {
      const contactCount = c.parsedContacts.length;
      const destCount = c.parsedDestinations.length;
      return acc + (contactCount > 0 ? contactCount : 0) + destCount;
    }, 0);
  }, [campaigns]);

  const activeChannelTypes = useMemo(() => {
    const set = new Set<string>();
    campaigns.forEach((c) => {
      c.parsedChannels.forEach((ch) => set.add(ch));
      if (c.parsedDestinations.length > 0) set.add("telegram_channel");
    });
    return Array.from(set);
  }, [campaigns]);

  // Filtered and sorted campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns
      .filter((c) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = c.title.toLowerCase().includes(q);
          const matchBody = c.message_body.toLowerCase().includes(q);
          if (!matchTitle && !matchBody) return false;
        }

        // Time window filter
        if (timeFilter === "today") {
          // Less than 24 hours
          return c.timeRemainingMs <= 1000 * 60 * 60 * 24;
        } else if (timeFilter === "later") {
          // More than 24 hours
          return c.timeRemainingMs > 1000 * 60 * 60 * 24;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "soonest") {
          return a.timeRemainingMs - b.timeRemainingMs;
        } else if (sortBy === "latest") {
          return b.timeRemainingMs - a.timeRemainingMs;
        } else {
          return a.title.localeCompare(b.title);
        }
      });
  }, [campaigns, searchQuery, timeFilter, sortBy]);

  // Cancel Handler
  const handleConfirmCancel = async () => {
    if (!campaignToCancel) return;
    const id = campaignToCancel.id;
    setCampaignToCancel(null);
    if (inspectedCampaign?.id === id) {
      setInspectedCampaign(null);
    }
    await cancelSchedule(id);
  };

  // Dispatch Now Handler
  const handleConfirmDispatch = async () => {
    if (!campaignToDispatch) return;
    const id = campaignToDispatch.id;
    setCampaignToDispatch(null);
    if (inspectedCampaign?.id === id) {
      setInspectedCampaign(null);
    }
    await dispatchNow(id);
  };

  return (
    <div className="max-w-[1440px] mx-auto pb-16">
      {/* Sub-Navigation Switcher */}
      <BroadcastSubNav scheduledCount={campaigns.length} />

      {/* Header Command Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            <span>Campaigns</span>
            <span>/</span>
            <span className="text-amber-600 font-bold">Scheduled Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Scheduled Broadcasts
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Monitor, inspect, and manage automated upcoming transmissions across all connected channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 text-xs font-bold text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin text-indigo-600")} />
            {isRefreshing ? "Refreshing..." : "Refresh Queue"}
          </Button>

          <Link href={APP_ROUTES.DASHBOARD.BROADCAST}>
            <Button
              type="button"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
            >
              <PlusCircle className="h-4 w-4" />
              Schedule New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Scheduled */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Total In Queue
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CalendarClock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900">
              {isLoading ? "—" : campaigns.length}
            </span>
            <span className="text-xs text-gray-500 font-medium">campaigns pending</span>
          </div>
        </div>

        {/* Nearest Dispatch */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Next Up
            </span>
            <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-base font-extrabold text-gray-900 truncate block">
              {isLoading
                ? "—"
                : nearestCampaign
                ? nearestCampaign.formattedCountdown
                : "Queue is empty"}
            </span>
            <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
              {nearestCampaign ? nearestCampaign.title : "No posts scheduled"}
            </p>
          </div>
        </div>

        {/* Audience Reach */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Target Reach
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900">
              {isLoading ? "—" : totalAudienceReach.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 font-medium">targeted entities</span>
          </div>
        </div>

        {/* Pipeline Channels */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Channels Utilized
            </span>
            <div className="h-8 w-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Radio className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900">
              {isLoading ? "—" : activeChannelTypes.length}
            </span>
            <span className="text-xs text-gray-500 font-medium">pipeline channels</span>
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200/90 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by campaign title or content..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter Pills */}
          <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200/60 text-xs">
            <button
              type="button"
              onClick={() => setTimeFilter("all")}
              className={cn(
                "px-3 py-1 rounded-lg font-bold transition-all",
                timeFilter === "all"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              All ({campaigns.length})
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter("today")}
              className={cn(
                "px-3 py-1 rounded-lg font-bold transition-all",
                timeFilter === "today"
                  ? "bg-white text-amber-800 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              Due Soon (&lt; 24h)
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter("later")}
              className={cn(
                "px-3 py-1 rounded-lg font-bold transition-all",
                timeFilter === "later"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              Later
            </button>
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="soonest">Sort: Soonest First</option>
            <option value="latest">Sort: Latest First</option>
            <option value="title">Sort: Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Main Content: Scheduled Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs space-y-4 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 bg-gray-200 rounded-full" />
                <div className="h-4 w-28 bg-gray-200 rounded-md" />
              </div>
              <div className="h-6 w-3/4 bg-gray-200 rounded-md" />
              <div className="h-16 w-full bg-gray-100 rounded-xl" />
              <div className="h-8 w-full bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 shadow-inner">
            <CalendarClock className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            {campaigns.length === 0
              ? "No scheduled broadcasts in queue"
              : "No scheduled posts match your filters"}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 leading-relaxed">
            {campaigns.length === 0
              ? "Plan automated marketing campaigns, newsletters, and announcements in advance. They will trigger automatically when their target time arrives."
              : "Try adjusting your search query or switching between time window filters."}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            {campaigns.length > 0 ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setTimeFilter("all");
                }}
                className="text-xs font-semibold"
              >
                Clear Filters
              </Button>
            ) : (
              <Link href={APP_ROUTES.DASHBOARD.BROADCAST}>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md">
                  <Megaphone className="h-4 w-4 mr-1.5" />
                  Open Broadcast Studio
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filteredCampaigns.map((campaign) => (
              <motion.div
                key={campaign.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                <ScheduledPostCard
                  campaign={campaign}
                  onInspect={(c) => setInspectedCampaign(c)}
                  onRequestCancel={(c) => setCampaignToCancel(c)}
                  onRequestDispatch={(c) => setCampaignToDispatch(c)}
                  isCancelling={cancellingId === campaign.id}
                  isDispatching={dispatchingId === campaign.id}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Inspect Campaign Modal */}
      <ScheduledCampaignDetailModal
        campaign={inspectedCampaign}
        isOpen={!!inspectedCampaign}
        onClose={() => setInspectedCampaign(null)}
        onCancelSchedule={(id) => {
          const item = campaigns.find((c) => c.id === id);
          if (item) setCampaignToCancel(item);
        }}
        onDispatchNow={(id) => {
          const item = campaigns.find((c) => c.id === id);
          if (item) setCampaignToDispatch(item);
        }}
        isCancelling={cancellingId === inspectedCampaign?.id}
        isDispatching={dispatchingId === inspectedCampaign?.id}
      />

      {/* Cancel Schedule Confirmation Dialog */}
      <AlertDialog
        open={!!campaignToCancel}
        onOpenChange={(open) => !open && setCampaignToCancel(null)}
      >
        <AlertDialogContent className="bg-white border border-gray-200 shadow-xl rounded-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <XCircle className="h-5 w-5" />
              <AlertDialogTitle className="text-base font-bold text-gray-900">
                Cancel Scheduled Broadcast?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to cancel the scheduled transmission for{" "}
              <strong className="text-gray-900">&ldquo;{campaignToCancel?.title}&rdquo;</strong>?
              This broadcast will be reverted back to <strong>Draft</strong> status and will NOT be
              sent automatically. You can edit or re-schedule it anytime from the studio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="text-xs font-semibold">
              Keep Scheduled
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
            >
              Yes, Cancel Schedule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dispatch Now Confirmation Dialog */}
      <AlertDialog
        open={!!campaignToDispatch}
        onOpenChange={(open) => !open && setCampaignToDispatch(null)}
      >
        <AlertDialogContent className="bg-white border border-gray-200 shadow-xl rounded-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Rocket className="h-5 w-5" />
              <AlertDialogTitle className="text-base font-bold text-gray-900">
                Dispatch Broadcast Immediately?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-gray-600 leading-relaxed">
              You are about to bypass the scheduled timer and launch{" "}
              <strong className="text-gray-900">&ldquo;{campaignToDispatch?.title}&rdquo;</strong>{" "}
              right now to all configured channels.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="text-xs font-semibold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDispatch}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
            >
              Dispatch Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
