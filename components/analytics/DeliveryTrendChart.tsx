"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { DailyDeliveryPoint } from "@/lib/services/analytics.service";
import { TrendingUp, Activity, CheckCircle2 } from "lucide-react";

interface DeliveryTrendChartProps {
  data: DailyDeliveryPoint[];
  days: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const delivered = payload.find((p: any) => p.dataKey === "delivered")?.value ?? 0;
    const failed = payload.find((p: any) => p.dataKey === "failed")?.value ?? 0;
    const total = delivered + failed;
    const rate = total > 0 ? ((delivered / total) * 100).toFixed(1) : "0.0";

    return (
      <div className="rounded-xl border border-gray-100 bg-white/95 backdrop-blur-md p-3.5 shadow-xl min-w-[180px]">
        <p className="text-xs font-bold text-gray-500 font-mono mb-2">
          {new Date(label).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-gray-600 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Delivered:
            </span>
            <span className="font-bold text-gray-900">{delivered.toLocaleString()}</span>
          </div>
          {failed > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-rose-500 font-medium">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Failed:
              </span>
              <span className="font-bold text-rose-600">{failed.toLocaleString()}</span>
            </div>
          )}
          <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
            <span className="text-gray-500">Delivery Rate:</span>
            <span className="text-emerald-700">{rate}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function DeliveryTrendChart({ data, days }: DeliveryTrendChartProps) {
  const totalDelivered = data.reduce((sum, d) => sum + d.delivered, 0);
  const totalFailed = data.reduce((sum, d) => sum + d.failed, 0);
  const overallRate =
    totalDelivered + totalFailed > 0
      ? ((totalDelivered / (totalDelivered + totalFailed)) * 100).toFixed(1)
      : "100.0";

  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Delivery Volume & Reliability Trend</h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Daily throughput across connected platforms over the last {days} days
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-gray-700">Delivered</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="text-gray-700">Failed</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Avg {overallRate}% Success</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-xs font-medium">
            No delivery records for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="deliveredGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="failedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tickFormatter={(val) => {
                  try {
                    const d = new Date(val);
                    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                  } catch {
                    return val;
                  }
                }}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="delivered"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#deliveredGrad)"
              />
              <Area
                type="monotone"
                dataKey="failed"
                stroke="#f43f5e"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#failedGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
