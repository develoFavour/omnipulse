"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Megaphone, Activity, Zap, CheckCircle2, Sun, Moon, Sunset, Clock } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useAppStore } from "@/lib/store";
import { MetricCard } from "@/components/features/dashboard/MetricCard";
import { ChannelDistributionChart } from "@/components/features/dashboard/ChannelDistributionChart";
import { RecentActivityFeed } from "@/components/features/dashboard/RecentActivityFeed";

import { useDashboard } from "@/lib/api/hooks/useDashboard";
import { APP_ROUTES } from "@/lib/constants/routes.const";

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

export default function DashboardPage() {
  const { user: clerkUser } = useUser();
  const storeUser = useAppStore((state) => state.user);
  const tenant = useAppStore((state) => state.tenant);
  const { stats, isLoading } = useDashboard();

  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const userName = clerkUser?.firstName || storeUser?.email?.split("@")[0] || "there";

  const getGreetingData = (date: Date | null) => {
    if (!date) return { greeting: "Good day", Icon: Sun, color: "text-amber-500" };
    const hours = date.getHours();
    if (hours >= 0 && hours < 12) {
      return { greeting: "Good morning", Icon: Sun, color: "text-amber-500" };
    } else if (hours >= 12 && hours < 17) {
      return { greeting: "Good afternoon", Icon: Sun, color: "text-orange-500" };
    } else {
      return { greeting: "Good evening", Icon: Sunset, color: "text-indigo-400" };
    }
  };

  const { greeting, Icon: GreetingIcon, color: iconColor } = getGreetingData(currentTime);

  const formattedTime = currentTime
    ? currentTime.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "";

  const formattedDate = currentTime
    ? currentTime.toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  // Ensure channel data has vibrant Cake-style colors
  const enhancedChannelData = (stats?.channel_data || []).map((c, i) => {
    const colors = ["#c8ff55", "#6366f1", "#a855f7", "#3b82f6"];
    return {
      ...c,
      color: colors[i % colors.length]
    };
  });
  const recentActivities = stats?.recent_activities || [];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto pb-12"
    >
      {/* Dynamic Header Section */}
      <motion.div variants={fadeUp} className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-heading">
            Hey, <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{userName}</span> 👋
          </h1>
          
          <div className="mt-1.5 flex items-center gap-2 text-sm font-medium text-gray-600">
            <span className="flex items-center gap-1.5 font-semibold text-gray-700">
              <GreetingIcon className={`h-4 w-4 ${iconColor}`} />
              {greeting}
            </span>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1.5 text-gray-500 font-mono text-xs">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
              <span>{formattedDate}</span>
              {formattedTime && <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200/60">{formattedTime}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto rounded-full bg-gray-100/80 px-3.5 py-1.5 border border-gray-200/80 backdrop-blur-sm">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-gray-700">
            {tenant?.company_name || "Workspace"}
          </span>
        </div>
      </motion.div>

      {/* Dynamic Action / Onboarding Banner */}
      <motion.div 
        variants={fadeUp}
        className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-indigo-50 via-white to-indigo-50/50 px-6 py-4 border border-indigo-100/80 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold shadow-sm">
            {stats?.onboarding_progress?.completion_percentage === 100 ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Zap className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">
              {stats?.onboarding_progress?.completion_percentage === 100
                ? "Workspace ready for high-throughput broadcast missions"
                : !stats?.onboarding_progress?.channels_connected
                ? "Step 1: Connect your messaging channels"
                : !stats?.onboarding_progress?.contacts_imported
                ? "Step 2: Add or import audience contacts"
                : "Step 3: Dispatch your first omnichannel broadcast"}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {stats?.onboarding_progress?.completion_percentage === 100
                ? "Omnichannel delivery pipeline active across WhatsApp and Telegram"
                : `${stats?.onboarding_progress?.completion_percentage || 25}% of setup completed • Next action recommended`}
            </p>
          </div>
        </div>
        <a
          href={
            !stats?.onboarding_progress?.channels_connected
              ? APP_ROUTES.DASHBOARD.CONNECTIONS
              : !stats?.onboarding_progress?.contacts_imported
              ? APP_ROUTES.DASHBOARD.AUDIENCE
              : APP_ROUTES.DASHBOARD.BROADCAST
          }
          className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-sm shrink-0"
        >
          {!stats?.onboarding_progress?.channels_connected
            ? "Connect Channel →"
            : !stats?.onboarding_progress?.contacts_imported
            ? "Add Contacts →"
            : "Launch Broadcast →"}
        </a>
      </motion.div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 mb-6">
        
        {/* Column 1: Metrics Stack (3 cols width) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <MetricCard
            title="Total Audience"
            value={isLoading ? "—" : (stats?.total_audience?.toString() || "0")}
            icon={Users}
            iconColor="text-gray-400"
            delay={0.1}
            className="flex-row-reverse items-center p-4 !bg-white border-gray-100 shadow-sm"
          />
          <MetricCard
            title="Broadcasts Sent"
            value={isLoading ? "—" : (stats?.broadcasts_sent?.toString() || "0")}
            icon={Megaphone}
            iconColor="text-gray-400"
            delay={0.15}
            className="flex-row-reverse items-center p-4 !bg-white border-gray-100 shadow-sm"
          />
          <MetricCard
            title="Delivery Rate"
            value={isLoading ? "—" : `${(stats?.delivery_rate || 0).toFixed(1)}%`}
            icon={Activity}
            iconColor="text-gray-400"
            delay={0.2}
            className="flex-row-reverse items-center p-4 !bg-white border-gray-100 shadow-sm"
          />
          <MetricCard
            title="Active Channels"
            value={isLoading ? "—" : (stats?.active_channels?.toString() || "0")}
            icon={Zap}
            iconColor="text-gray-400"
            delay={0.25}
            className="flex-row-reverse items-center p-4 !bg-white border-gray-100 shadow-sm"
          />
        </div>

        {/* Column 2: Channel Distribution (5 cols width) */}
        <div className="lg:col-span-5 h-full">
          <ChannelDistributionChart data={enhancedChannelData} delay={0.3} />
        </div>

        {/* Column 3: Recent Activity (4 cols width) */}
        <div className="lg:col-span-4 h-full">
          <RecentActivityFeed activities={recentActivities} delay={0.35} />
        </div>
      </div>

      {/* Bottom Wide Panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Campaign Progress Panel (2 cols) */}
        <motion.div
          variants={fadeUp}
          className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">Campaign progress</h3>
                {stats?.latest_campaign && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      stats.latest_campaign.status === "completed"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : stats.latest_campaign.status === "processing"
                        ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                        : "bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                  >
                    {stats.latest_campaign.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.latest_campaign
                  ? `Telemetry for "${stats.latest_campaign.title}"`
                  : "Live dispatch progress for your most recent campaign"}
              </p>
            </div>
            <a
              href={APP_ROUTES.DASHBOARD.BROADCAST}
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-sm"
            >
              New Broadcast
            </a>
          </div>

          {stats?.latest_campaign ? (
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-900 mb-3">
                <span className="truncate max-w-[280px] font-semibold text-gray-800">
                  {stats.latest_campaign.title}
                </span>
                <span className="text-indigo-600 font-mono">
                  {stats.latest_campaign.delivered_count} / {stats.latest_campaign.total_targets} dispatched
                </span>
              </div>
              
              {/* Real Progress Bar */}
              <div className="relative">
                <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(5, stats.latest_campaign.delivery_rate || 0))}%`,
                    }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-gray-500">
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    ✓ {(stats.latest_campaign.delivery_rate || 0).toFixed(1)}% delivered
                  </span>
                  {stats.latest_campaign.failed_count > 0 ? (
                    <span className="text-red-500 font-semibold">
                      ✕ {stats.latest_campaign.failed_count} failed
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      0 errors
                    </span>
                  )}
                  <span className="text-gray-400 font-mono text-[10px]">
                    {new Date(stats.latest_campaign.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
                <Megaphone className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-gray-800">No campaigns dispatched yet</p>
              <p className="text-xs text-gray-500 max-w-sm mt-0.5 mb-3">
                Send your first message across WhatsApp and Telegram to track real-time delivery telemetry here.
              </p>
              <a
                href={APP_ROUTES.DASHBOARD.BROADCAST}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Launch your first broadcast →
              </a>
            </div>
          )}
        </motion.div>

        {/* Audience Growth & Health Panel (1 col) */}
        <motion.div
          variants={fadeUp}
          className="lg:col-span-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Audience health</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  (stats?.audience_health?.status || "Optimal") === "Optimal"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : (stats?.audience_health?.status || "Optimal") === "Healthy"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {stats?.audience_health?.status || "Optimal"}
              </span>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-indigo-900 font-mono">
                    {(stats?.audience_health?.opt_out_rate || 0).toFixed(1)}%
                  </span>
                  <span className="text-gray-500 font-medium">
                    {stats?.audience_health?.opt_out_count || 0} Opt-outs
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(2, stats?.audience_health?.opt_out_rate || 0))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-baseline pt-4 border-t border-gray-100 mt-4">
            <div>
              <span className="text-3xl font-extrabold text-gray-900 font-mono">
                {stats?.audience_health?.new_contacts_this_week ?? 0}
              </span>
              <span className="block text-xs font-medium text-gray-500 mt-0.5">
                New contacts (7d)
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-600">
                {stats?.audience_health?.active_contacts ?? stats?.total_audience ?? 0} active
              </span>
              <span className="block text-[10px] text-gray-400">
                of {stats?.audience_health?.total_contacts ?? stats?.total_audience ?? 0} total
              </span>
            </div>
          </div>
        </motion.div>
      </div>
      
    </motion.div>
  );
}
