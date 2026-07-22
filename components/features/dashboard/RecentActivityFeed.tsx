"use client";

import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

import { DashboardDeliveryActivity } from "@/lib/api/hooks/useDashboard";
import { STATUS_CONFIG } from "@/lib/constants/status.const";
import { formatRelativeTime } from "@/lib/utils/date.utils";
import { getPlatformIcon } from "@/lib/utils/platform.utils";

interface RecentActivityFeedProps {
  activities: DashboardDeliveryActivity[];
  delay?: number;
}

export function RecentActivityFeed({ activities, delay = 0 }: RecentActivityFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
          <p className="mt-1 text-xs text-gray-500">Your latest broadcast campaigns</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50">
          <Send className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 border border-gray-100 mb-4">
            <Send className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700">No broadcasts yet</p>
          <p className="mt-1 text-xs text-gray-500">Your campaign activity will appear here</p>
        </div>
      ) : (
        <div className="space-y-1">
          {activities.slice(0, 3).map((activity, index) => {
            const config = STATUS_CONFIG[activity.status] || STATUS_CONFIG.pending;
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: delay + index * 0.08 }}
                className="group flex items-center gap-4 rounded-xl p-3 transition-colors duration-200 hover:bg-gray-50"
                title={activity.error_message || ""}
              >
                {/* Channel Icon */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-base">
                  {getPlatformIcon(activity.platform)}
                </div>

                {/* Campaign Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {activity.campaign_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-medium text-gray-500 truncate max-w-[120px]">
                      {activity.contact_name}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs font-medium text-gray-500 capitalize">
                      {activity.platform}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1",
                  config.bg
                )}>
                  <StatusIcon className={cn("h-3 w-3", config.color)} />
                  <span className={cn("text-xs font-semibold", config.color)}>
                    {config.label}
                  </span>
                </div>

                {/* Timestamp */}
                <span className="text-xs font-medium text-gray-400 shrink-0 w-16 text-right">
                  {formatRelativeTime(activity.created_at)}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
