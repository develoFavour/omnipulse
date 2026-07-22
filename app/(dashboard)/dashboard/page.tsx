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

      {/* Welcome Banner */}
      <motion.div 
        variants={fadeUp}
        className="mb-8 flex items-center justify-between rounded-xl bg-indigo-50 px-6 py-4 border border-indigo-100"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
          </div>
          <span className="text-sm font-semibold text-indigo-900">
            Welcome to the newly designed OmniPulse Dashboard
          </span>
        </div>
        <button className="rounded-lg bg-indigo-200/50 px-4 py-2 text-xs font-bold text-indigo-800 hover:bg-indigo-200 transition-colors">
          Check it out
        </button>
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

      {/* Bottom Wide Panels (Funding rounds / Total options equivalent) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Campaign Progress Panel (2 cols) */}
        <motion.div
          variants={fadeUp}
          className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="flex justify-between items-start mb-12">
            <h3 className="text-sm font-bold text-gray-900">Campaign progress</h3>
            <a
              href={APP_ROUTES.DASHBOARD.BROADCAST}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-sm"
            >
              Update
            </a>
          </div>

          <div className="relative pt-6">
            <div className="absolute top-0 left-0 text-xs font-bold text-gray-900">
              Q3 Marketing Push
            </div>
            
            {/* Progress Bar */}
            <div className="relative mt-8">
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div className="h-full w-[45%] rounded-full bg-indigo-600 relative">
                  <div className="absolute -top-6 right-0 text-xs font-bold text-indigo-900">
                    ▼ 45% delivered
                  </div>
                </div>
              </div>
              <div className="absolute top-4 left-0 flex items-center gap-1 text-[10px] font-bold text-indigo-600">
                ▲ 0% bounced
              </div>
              <div className="absolute top-4 right-0 text-xs font-bold text-indigo-600">
                12 days left
              </div>
            </div>
          </div>
        </motion.div>

        {/* Audience Growth Panel (1 col) */}
        <motion.div
          variants={fadeUp}
          className="lg:col-span-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-8">
            <h3 className="text-sm font-bold text-gray-900">Audience health</h3>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
              Optimal
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-indigo-900">▼ 8%</span>
                <span className="text-gray-500">Opt-outs</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div className="h-full w-[8%] rounded-full bg-indigo-200" />
              </div>
            </div>
            
            <div className="flex justify-between items-baseline pt-4 border-t border-gray-100">
              <span className="text-3xl font-extrabold text-gray-900">24</span>
              <span className="text-xs font-medium text-gray-500">New contacts this week</span>
            </div>
          </div>
        </motion.div>
      </div>
      
    </motion.div>
  );
}
