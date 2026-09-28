"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Megaphone, Activity, Zap, MoreHorizontal, CheckCircle2, AlertCircle, Clock, Filter, AlertTriangle } from "lucide-react";
import { FaTelegramPlane, FaWhatsapp, FaInstagram } from "react-icons/fa";

import { useDashboard, DashboardDeliveryActivity } from "@/lib/api/hooks/useDashboard";
import { useDeliveries } from "@/lib/api/hooks/useDeliveries";
import { MetricCard } from "@/components/features/dashboard/MetricCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "@/lib/constants/status.const";
import { formatDateTime } from "@/lib/utils/date.utils";
import { getPlatformIcon } from "@/lib/utils/platform.utils";

export default function ActivityPage() {
  const { stats, isLoading: isStatsLoading } = useDashboard();
  const { deliveries, isLoading: isDeliveriesLoading } = useDeliveries(100, 0); // Limit 100 for now
  const [selectedActivity, setSelectedActivity] = useState<DashboardDeliveryActivity | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "delivered" | "failed">("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  const failedCount = useMemo(() => deliveries.filter((d) => d.status === "failed").length, [deliveries]);
  const deliveredCount = useMemo(
    () => deliveries.filter((d) => d.status === "delivered" || d.status === "sent").length,
    [deliveries]
  );

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((item) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "failed"
          ? item.status === "failed"
          : item.status === "delivered" || item.status === "sent";
      const matchesPlatform = platformFilter === "all" || item.platform === platformFilter;
      return matchesStatus && matchesPlatform;
    });
  }, [deliveries, statusFilter, platformFilter]);

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
      transition: { duration: 0.5, ease: "easeOut" as const } 
    },
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto pb-10"
    >
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Activity</h1>
        <p className="mt-2 text-zinc-500 text-base">Detailed logs of all your campaign deliveries.</p>
      </motion.div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard
          title="Total Audience"
          value={isStatsLoading ? "—" : (stats?.total_audience?.toString() || "0")}
          icon={Users}
          iconColor="text-indigo-400"
          delay={0.1}
        />
        <MetricCard
          title="Broadcasts Sent"
          value={isStatsLoading ? "—" : (stats?.broadcasts_sent?.toString() || "0")}
          icon={Megaphone}
          iconColor="text-emerald-400"
          delay={0.15}
        />
        <MetricCard
          title="Delivery Rate"
          value={isStatsLoading ? "—" : `${(stats?.delivery_rate || 0).toFixed(1)}%`}
          icon={Activity}
          iconColor="text-amber-400"
          delay={0.2}
        />
        <MetricCard
          title="Active Channels"
          value={isStatsLoading ? "—" : (stats?.active_channels?.toString() || "0")}
          icon={Zap}
          iconColor="text-cyan-400"
          delay={0.25}
        />
      </div>

      {/* Deliveries & DLQ Table */}
      <motion.div variants={fadeUp}>
        <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-md">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
            <div>
              <CardTitle className="text-xl text-zinc-100 flex items-center gap-2">
                <span>Delivery History & Audit Logs</span>
                {failedCount > 0 && (
                  <span className="rounded-full bg-red-500/20 border border-red-500/30 px-2 py-0.5 text-xs font-bold text-red-400">
                    {failedCount} failed in DLQ
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-zinc-500 mt-1">
                Detailed telemetry and dead letter queue review for all outgoing broadcasts.
              </CardDescription>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  statusFilter === "all"
                    ? "bg-white/[0.1] text-zinc-100 shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                All ({deliveries.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("delivered")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  statusFilter === "delivered"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                Delivered ({deliveredCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("failed")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                  statusFilter === "failed"
                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                    : "text-zinc-400 hover:text-red-300"
                )}
              >
                <AlertTriangle className="h-3 w-3 text-red-400" />
                <span>Failed / DLQ ({failedCount})</span>
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {isDeliveriesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full bg-white/[0.05]" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.08] hover:bg-transparent">
                    <TableHead className="text-zinc-400">Campaign</TableHead>
                    <TableHead className="text-zinc-400">Contact</TableHead>
                    <TableHead className="text-zinc-400">Platform</TableHead>
                    <TableHead className="text-zinc-400">Status</TableHead>
                    <TableHead className="text-zinc-400">Date</TableHead>
                    <TableHead className="text-right text-zinc-400"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.length === 0 ? (
                    <TableRow className="border-white/[0.08] hover:bg-white/[0.02]">
                      <TableCell colSpan={6} className="text-center py-10 text-zinc-500">
                        {statusFilter === "failed" ? (
                          <div className="flex flex-col items-center justify-center">
                            <CheckCircle2 className="h-7 w-7 text-emerald-400/80 mb-2" />
                            <p className="font-semibold text-zinc-300">Clean Dead Letter Queue</p>
                            <p className="text-xs text-zinc-500 mt-0.5">No failed delivery events found.</p>
                          </div>
                        ) : (
                          "No deliveries found matching current filters."
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDeliveries.map((activity) => {
                      const config = STATUS_CONFIG[activity.status] || STATUS_CONFIG.pending;
                      const StatusIcon = config.icon;
                      
                      return (
                        <TableRow key={activity.id} className="border-white/[0.08] hover:bg-white/[0.04]">
                          <TableCell className="font-medium text-zinc-200">
                            <div>
                              <p className="font-semibold text-zinc-100">{activity.campaign_name}</p>
                              {activity.status === "failed" && activity.error_message && (
                                <p className="text-[11px] text-red-400 font-mono mt-0.5 line-clamp-1">
                                  {activity.error_message}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-zinc-300">
                            {activity.contact_name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-zinc-300 capitalize">
                              {getPlatformIcon(activity.platform)}
                              {activity.platform}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
                              config.bg
                            )}>
                              <StatusIcon className={cn("h-3 w-3", config.color)} />
                              <span className={cn("text-xs font-medium", config.color)}>
                                {config.label}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-zinc-400">
                            {formatDateTime(activity.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.08]"
                              onClick={() => setSelectedActivity(activity)}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Details Sheet */}
      <Sheet open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
        <SheetContent className="bg-zinc-950 border-white/[0.08] text-zinc-200 w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="text-zinc-100">Delivery Details</SheetTitle>
            <SheetDescription className="text-zinc-400">
              Technical information for this delivery event.
            </SheetDescription>
          </SheetHeader>
          
          {selectedActivity && (
            <div className="mt-8 space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
                    STATUS_CONFIG[selectedActivity.status]?.bg || STATUS_CONFIG.pending.bg
                  )}>
                    <span className={cn("text-sm font-medium", STATUS_CONFIG[selectedActivity.status]?.color || STATUS_CONFIG.pending.color)}>
                      {STATUS_CONFIG[selectedActivity.status]?.label || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Campaign</span>
                  <p className="text-sm text-zinc-200 font-medium">{selectedActivity.campaign_name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Contact</span>
                  <p className="text-sm text-zinc-200 font-medium">{selectedActivity.contact_name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Platform</span>
                  <div className="flex items-center gap-2 text-sm text-zinc-200 capitalize font-medium">
                    {getPlatformIcon(selectedActivity.platform)}
                    {selectedActivity.platform}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Time</span>
                  <p className="text-sm text-zinc-200 font-medium">{formatDateTime(selectedActivity.created_at)}</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Event ID</span>
                <p className="text-xs font-mono text-zinc-400 bg-black/40 p-2 rounded-md border border-white/[0.05]">
                  {selectedActivity.id}
                </p>
              </div>

              {selectedActivity.error_message && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-red-400 uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Error Details
                  </span>
                  <div className="text-sm text-red-200 bg-red-950/30 p-3 rounded-md border border-red-500/20 whitespace-pre-wrap font-mono mt-1">
                    {selectedActivity.error_message}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
