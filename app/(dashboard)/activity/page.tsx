"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Megaphone, 
  Activity, 
  Zap, 
  MoreHorizontal, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Filter, 
  AlertTriangle,
  Search,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  Eye
} from "lucide-react";
import { toast } from "sonner";

import { useDashboard, DashboardDeliveryActivity } from "@/lib/api/hooks/useDashboard";
import { useDeliveries } from "@/lib/api/hooks/useDeliveries";
import { dashboardService } from "@/lib/services/dashboard.service";
import { MetricCard } from "@/components/features/dashboard/MetricCard";
import { ActivityDetailsSheet } from "@/components/features/activity/ActivityDetailsSheet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "@/lib/constants/status.const";
import { formatDateTime } from "@/lib/utils/date.utils";
import { getPlatformIcon } from "@/lib/utils/platform.utils";
import { exportToCsv } from "@/lib/utils/csv.utils";

export default function ActivityPage() {
  const { stats, isLoading: isStatsLoading } = useDashboard();
  const { deliveries, isLoading: isDeliveriesLoading, refetch } = useDeliveries(250, 0);
  
  // State for inspector sheet
  const [selectedActivity, setSelectedActivity] = useState<DashboardDeliveryActivity | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "delivered" | "failed">("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [isExporting, setIsExporting] = useState(false);

  // Derived counts
  const failedCount = useMemo(() => deliveries.filter((d) => d.status === "failed").length, [deliveries]);
  const deliveredCount = useMemo(
    () => deliveries.filter((d) => d.status === "delivered" || d.status === "sent").length,
    [deliveries]
  );

  // Filtered & Searched deliveries
  const filteredDeliveries = useMemo(() => {
    return deliveries
      .filter((item) => {
        // Status matching
        const matchesStatus =
          statusFilter === "all"
            ? true
            : statusFilter === "failed"
            ? item.status === "failed"
            : item.status === "delivered" || item.status === "sent";

        // Platform matching
        const matchesPlatform = platformFilter === "all" || item.platform.toLowerCase() === platformFilter.toLowerCase();

        // Search matching
        if (!searchQuery.trim()) return matchesStatus && matchesPlatform;

        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          item.campaign_name?.toLowerCase().includes(query) ||
          item.contact_name?.toLowerCase().includes(query) ||
          (item.routing_value && item.routing_value.toLowerCase().includes(query)) ||
          (item.error_message && item.error_message.toLowerCase().includes(query)) ||
          item.id.toLowerCase().includes(query);

        return matchesStatus && matchesPlatform && matchesSearch;
      })
      .sort((a, b) => {
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
      });
  }, [deliveries, statusFilter, platformFilter, searchQuery, sortOrder]);

  // Pagination calculation
  const totalItems = filteredDeliveries.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedDeliveries = useMemo(() => {
    return filteredDeliveries.slice(startIndex, endIndex);
  }, [filteredDeliveries, startIndex, endIndex]);

  // Handler for search change (resets page)
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // Handler for status filter change
  const handleStatusFilterChange = (status: "all" | "delivered" | "failed") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Handler for platform filter change
  const handlePlatformFilterChange = (platform: string) => {
    setPlatformFilter(platform);
    setCurrentPage(1);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPlatformFilter("all");
    setCurrentPage(1);
  };

  // Export CSV handler (Server streaming with client fallback)
  const handleExportCSV = async () => {
    if (filteredDeliveries.length === 0) {
      toast.error("No deliveries available to export.");
      return;
    }

    setIsExporting(true);
    try {
      // First attempt true server-side streaming export (pulls full database dataset matching filters)
      await dashboardService.exportDeliveries({
        status: statusFilter,
        platform: platformFilter,
        search: searchQuery,
      });
      toast.success("Delivery audit CSV downloaded successfully!");
    } catch {
      // Graceful fallback to client-side export if backend route is unavailable
      try {
        const headers = [
          "Delivery ID",
          "Campaign Title",
          "Contact Name",
          "Destination Address",
          "Platform",
          "Status",
          "Error Trace",
          "Timestamp (ISO)"
        ];

        const rows = filteredDeliveries.map((item) => [
          item.id,
          item.campaign_name || "Untitled Campaign",
          item.contact_name || "Unknown",
          item.routing_value || "—",
          item.platform || "—",
          item.status || "—",
          item.error_message || "",
          item.created_at || ""
        ]);

        const nowStr = new Date().toISOString().split("T")[0];
        exportToCsv(`messagerail-activity-audit-${nowStr}`, headers, rows);
        toast.success(`Exported ${filteredDeliveries.length} delivery records to CSV.`);
      } catch {
        toast.error("Failed to generate delivery CSV export.");
      }
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
      transition: { duration: 0.5, ease: "easeOut" as const } 
    },
  };

  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "all" || platformFilter !== "all";

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto pb-12"
    >
      {/* Page Header */}
      <motion.div variants={fadeUp} className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-heading">Activity & Audit Logs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time delivery telemetry, dead letter queue (DLQ) tracking, and dispatch audit records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-9 px-3 text-xs text-gray-700 bg-white hover:bg-gray-50 border-gray-200 cursor-pointer shadow-2xs gap-1.5"
            title="Refresh logs"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isDeliveriesLoading && "animate-spin text-[#163300]")} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={isExporting || filteredDeliveries.length === 0}
            className="h-9 px-3.5 text-xs font-semibold text-[#163300] bg-[#e2f6d5]/70 hover:bg-[#e2f6d5] border-[#9fe870]/60 cursor-pointer shadow-2xs gap-1.5 transition-all"
            title="Download CSV"
          >
            <Download className={cn("h-3.5 w-3.5", isExporting && "animate-bounce")} />
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </Button>
        </div>
      </motion.div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard
          title="Total Audience"
          value={isStatsLoading ? "—" : (stats?.total_audience?.toString() || "0")}
          icon={Users}
          iconColor="text-[#163300]"
          delay={0.1}
        />
        <MetricCard
          title="Broadcasts Sent"
          value={isStatsLoading ? "—" : (stats?.broadcasts_sent?.toString() || "0")}
          icon={Megaphone}
          iconColor="text-[#163300]"
          delay={0.15}
        />
        <MetricCard
          title="Delivery Rate"
          value={isStatsLoading ? "—" : `${(stats?.delivery_rate || 0).toFixed(1)}%`}
          icon={Activity}
          iconColor="text-[#163300]"
          delay={0.2}
        />
        <MetricCard
          title="Active Channels"
          value={isStatsLoading ? "—" : (stats?.active_channels?.toString() || "0")}
          icon={Zap}
          iconColor="text-[#163300]"
          delay={0.25}
        />
      </div>

      {/* Main Delivery Table Card */}
      <motion.div variants={fadeUp}>
        <Card className="border-gray-100 bg-white shadow-sm rounded-2xl overflow-hidden">
          {/* Table Header & Controls */}
          <CardHeader className="p-5 pb-4 border-b border-gray-100 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-gray-900 font-bold flex items-center gap-2.5">
                  <span>Delivery Telemetry</span>
                  {failedCount > 0 ? (
                    <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-xs font-bold text-rose-700 inline-flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-rose-600" />
                      {failedCount} in DLQ
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#f2faee] border border-[#c8ebbc] px-2.5 py-0.5 text-xs font-bold text-[#163300] inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-[#163300]" />
                      Healthy
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-500 mt-1 text-xs">
                  Showing {totalItems} delivery events recorded across all integrated channels.
                </CardDescription>
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100/80 border border-gray-200/60 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => handleStatusFilterChange("all")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    statusFilter === "all"
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  All ({deliveries.length})
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusFilterChange("delivered")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    statusFilter === "delivered"
                      ? "bg-[#e2f6d5] text-[#163300] border border-[#9fe870]/50"
                      : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  Delivered ({deliveredCount})
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusFilterChange("failed")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                    statusFilter === "failed"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "text-gray-500 hover:text-rose-600"
                  )}
                >
                  <AlertTriangle className="h-3 w-3 text-rose-600" />
                  <span>Failed ({failedCount})</span>
                </button>
              </div>
            </div>

            {/* Search & Secondary Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by campaign, recipient, error, or ID..."
                  className="w-full h-9 pl-9 pr-8 text-xs bg-gray-50/80 hover:bg-white focus:bg-white border border-gray-200 focus:border-[#9fe870] focus:ring-2 focus:ring-[#9fe870]/20 rounded-xl transition-all outline-hidden text-gray-900 placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Platform & Sort Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {/* Platform Selector Pills */}
                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1.5">
                    Platform:
                  </span>
                  {[
                    { key: "all", label: "All" },
                    { key: "whatsapp", label: "WhatsApp" },
                    { key: "telegram", label: "Telegram" },
                    { key: "instagram", label: "Instagram" },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => handlePlatformFilterChange(p.key)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                        platformFilter === p.key
                          ? "bg-white text-gray-900 shadow-2xs font-semibold"
                          : "text-gray-500 hover:text-gray-800"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Sort Order Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                  className="h-9 px-2.5 text-xs text-gray-600 bg-white border-gray-200 cursor-pointer hover:bg-gray-50 gap-1"
                  title={sortOrder === "desc" ? "Showing newest first" : "Showing oldest first"}
                >
                  <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  <span>{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
                </Button>

                {/* Reset Filters button */}
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="h-9 px-2 text-xs text-gray-500 hover:text-rose-600 cursor-pointer gap-1"
                  >
                    <X className="h-3 w-3" />
                    <span>Reset</span>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          {/* Table Content */}
          <CardContent className="p-0">
            {isDeliveriesLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full bg-gray-100 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-100 bg-[#fbfdfa]/80 hover:bg-[#fbfdfa]/80">
                      <TableHead className="text-gray-500 font-bold text-xs pl-6 py-3.5">Campaign</TableHead>
                      <TableHead className="text-gray-500 font-bold text-xs py-3.5">Recipient</TableHead>
                      <TableHead className="text-gray-500 font-bold text-xs py-3.5">Platform</TableHead>
                      <TableHead className="text-gray-500 font-bold text-xs py-3.5">Status</TableHead>
                      <TableHead className="text-gray-500 font-bold text-xs py-3.5">Timestamp</TableHead>
                      <TableHead className="text-right text-gray-500 font-bold text-xs pr-6 py-3.5">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedDeliveries.length === 0 ? (
                      <TableRow className="border-gray-100 hover:bg-transparent">
                        <TableCell colSpan={6} className="text-center py-16">
                          <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                            {statusFilter === "failed" ? (
                              <>
                                <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3 text-emerald-600">
                                  <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm">Clean Dead Letter Queue</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                  No failed delivery events found. All outgoing broadcasts have processed cleanly.
                                </p>
                              </>
                            ) : hasActiveFilters ? (
                              <>
                                <div className="h-12 w-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-3 text-gray-400">
                                  <Search className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm">No Matching Deliveries</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                  No records matched your search query or active filter settings.
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleResetFilters}
                                  className="mt-4 text-xs font-semibold cursor-pointer"
                                >
                                  Clear Filters
                                </Button>
                              </>
                            ) : (
                              <>
                                <div className="h-12 w-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-3 text-gray-400">
                                  <Megaphone className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm">No Delivery Records Yet</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                  When you schedule and dispatch broadcast campaigns, real-time telemetry will appear here.
                                </p>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedDeliveries.map((activity) => {
                        const config = STATUS_CONFIG[activity.status] || STATUS_CONFIG.pending;
                        const StatusIcon = config.icon;
                        
                        return (
                          <TableRow 
                            key={activity.id} 
                            onClick={() => setSelectedActivity(activity)}
                            className="border-gray-100 hover:bg-[#f8faf7] cursor-pointer transition-colors group"
                          >
                            {/* Campaign */}
                            <TableCell className="font-medium text-gray-900 pl-6 py-4">
                              <div className="max-w-xs">
                                <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-[#163300] transition-colors">
                                  {activity.campaign_name || "Broadcast Message"}
                                </p>
                                {activity.status === "failed" && activity.error_message ? (
                                  <p className="text-[11px] text-rose-600 font-mono mt-0.5 truncate flex items-center gap-1">
                                    <AlertCircle className="h-2.5 w-2.5 flex-shrink-0" />
                                    <span>{activity.error_message}</span>
                                  </p>
                                ) : (
                                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                                    ID: {activity.id.slice(0, 8)}...
                                  </p>
                                )}
                              </div>
                            </TableCell>

                            {/* Recipient */}
                            <TableCell className="text-gray-700 text-sm py-4">
                              <div>
                                <p className="font-medium text-gray-900">{activity.contact_name}</p>
                                {activity.routing_value && (
                                  <p className="text-xs text-gray-400 font-mono">{activity.routing_value}</p>
                                )}
                              </div>
                            </TableCell>

                            {/* Platform */}
                            <TableCell className="py-4">
                              <div className="inline-flex items-center gap-1.5 text-gray-700 capitalize text-xs font-medium bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                                {getPlatformIcon(activity.platform)}
                                <span>{activity.platform}</span>
                              </div>
                            </TableCell>

                            {/* Status */}
                            <TableCell className="py-4">
                              <div className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
                                config.bg
                              )}>
                                <StatusIcon className={cn("h-3 w-3", config.color)} />
                                <span className={cn("text-xs font-semibold", config.color)}>
                                  {config.label}
                                </span>
                              </div>
                            </TableCell>

                            {/* Date */}
                            <TableCell className="text-gray-500 font-mono text-xs py-4">
                              {formatDateTime(activity.created_at)}
                            </TableCell>

                            {/* Inspect Action */}
                            <TableCell className="text-right pr-6 py-4" onClick={(e) => e.stopPropagation()}>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 px-2.5 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer gap-1.5"
                                onClick={() => setSelectedActivity(activity)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Inspect</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination & Footer Controls */}
            {!isDeliveriesLoading && filteredDeliveries.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 bg-[#fbfdfa] flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Result count & Page size selector */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    Showing <strong className="text-gray-900 font-semibold">{totalItems === 0 ? 0 : startIndex + 1}</strong> to{" "}
                    <strong className="text-gray-900 font-semibold">{endIndex}</strong> of{" "}
                    <strong className="text-gray-900 font-semibold">{totalItems}</strong> deliveries
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">Rows:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="h-7 text-xs bg-white border border-gray-200 rounded-lg px-2 text-gray-700 outline-hidden cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safeCurrentPage <= 1}
                    className="h-8 px-2.5 text-xs border-gray-200 text-gray-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                    <span>Previous</span>
                  </Button>

                  {/* Page number buttons */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5 && safeCurrentPage > 3) {
                        pageNum = safeCurrentPage - 3 + i;
                        if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                      }
                      if (pageNum <= 0 || pageNum > totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={cn(
                            "h-8 min-w-[32px] px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                            safeCurrentPage === pageNum
                              ? "bg-[#163300] text-white shadow-2xs"
                              : "text-gray-600 hover:bg-gray-100"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safeCurrentPage >= totalPages}
                    className="h-8 px-2.5 text-xs border-gray-200 text-gray-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Redesigned Activity Details Sheet */}
      <ActivityDetailsSheet
        activity={selectedActivity}
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </motion.div>
  );
}
