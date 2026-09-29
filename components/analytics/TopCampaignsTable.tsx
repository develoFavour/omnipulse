"use client";

import { TopCampaignMetric } from "@/lib/services/analytics.service";
import { Megaphone, ExternalLink, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { APP_ROUTES } from "@/lib/constants/routes.const";
import { cn } from "@/lib/utils";

interface TopCampaignsTableProps {
  campaigns: TopCampaignMetric[];
}

export function TopCampaignsTable({ campaigns }: TopCampaignsTableProps) {
  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Megaphone className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Top Campaign Performance</h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Deliverability ranking for broadcasts launched in this time frame
          </p>
        </div>

        <Link
          href={APP_ROUTES.DASHBOARD.ACTIVITY}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
        >
          <span>All telemetry events</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              <th className="pb-3 pl-2">Campaign Title</th>
              <th className="pb-3">Date</th>
              <th className="pb-3 text-right">Targets</th>
              <th className="pb-3 text-right">Delivered</th>
              <th className="pb-3 text-right">Failed</th>
              <th className="pb-3 text-right pr-4">Success Rate</th>
              <th className="pb-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 font-medium">
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400 text-xs">
                  No campaign dispatches recorded for this time range.
                </td>
              </tr>
            ) : (
              campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 pl-2 font-bold text-gray-900 max-w-[200px] truncate">
                    {camp.title || <span className="text-gray-400 italic">Untitled Blast</span>}
                  </td>
                  <td className="py-3.5 text-gray-500 whitespace-nowrap">
                    {new Date(camp.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3.5 text-right font-semibold text-gray-700">
                    {camp.total_targets.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-right font-bold text-emerald-600">
                    {camp.delivered.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-right font-bold text-rose-500">
                    {camp.failed > 0 ? camp.failed.toLocaleString() : "0"}
                  </td>
                  <td className="py-3.5 text-right pr-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            camp.delivery_rate >= 95
                              ? "bg-emerald-500"
                              : camp.delivery_rate >= 80
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          )}
                          style={{ width: `${Math.min(100, camp.delivery_rate)}%` }}
                        />
                      </div>
                      <span className="font-bold text-gray-900 w-10 text-right">
                        {camp.delivery_rate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        camp.status === "completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : camp.status === "processing"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse"
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {camp.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
