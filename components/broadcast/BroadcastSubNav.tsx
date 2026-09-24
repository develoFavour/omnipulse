"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Megaphone, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_ROUTES } from "@/lib/constants/routes.const";

interface BroadcastSubNavProps {
  scheduledCount?: number;
}

export function BroadcastSubNav({ scheduledCount }: BroadcastSubNavProps) {
  const pathname = usePathname();
  const isScheduledTab = pathname.startsWith(APP_ROUTES.DASHBOARD.SCHEDULED);
  const isStudioTab = !isScheduledTab && pathname.startsWith(APP_ROUTES.DASHBOARD.BROADCAST);

  return (
    <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl border border-gray-200/80 w-fit mb-6">
      <Link
        href={APP_ROUTES.DASHBOARD.BROADCAST}
        className={cn(
          "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
          isStudioTab
            ? "bg-white text-indigo-700 shadow-xs border border-gray-200/60"
            : "text-gray-500 hover:text-gray-900"
        )}
      >
        <Megaphone className={cn("h-3.5 w-3.5", isStudioTab ? "text-indigo-600" : "text-gray-400")} />
        Broadcast Studio
      </Link>

      <Link
        href={APP_ROUTES.DASHBOARD.SCHEDULED}
        className={cn(
          "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
          isScheduledTab
            ? "bg-white text-amber-800 shadow-xs border border-gray-200/60"
            : "text-gray-500 hover:text-gray-900"
        )}
      >
        <CalendarClock className={cn("h-3.5 w-3.5", isScheduledTab ? "text-amber-600" : "text-gray-400")} />
        Scheduled Queue
        {typeof scheduledCount === "number" && scheduledCount > 0 && (
          <span
            className={cn(
              "px-1.5 py-0.2 rounded-full text-[10px] font-extrabold",
              isScheduledTab
                ? "bg-amber-100 text-amber-800 border border-amber-200"
                : "bg-gray-200 text-gray-600"
            )}
          >
            {scheduledCount}
          </span>
        )}
      </Link>
    </div>
  );
}
