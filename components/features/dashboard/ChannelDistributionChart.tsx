"use client";

import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface ChannelData {
  name: string;
  value: number;
  color: string;
  icon: string;
}

interface ChannelDistributionChartProps {
  data: ChannelData[];
  delay?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload;
    return (
      <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="text-base">{entry.icon}</span>
          <span className="text-sm font-bold text-gray-900">{entry.name}</span>
        </div>
        <p className="mt-1 text-lg font-bold text-gray-900">
          {entry.value.toLocaleString()} <span className="text-xs font-medium text-gray-500">contacts</span>
        </p>
      </div>
    );
  }
  return null;
};

export function ChannelDistributionChart({ data, delay = 0 }: ChannelDistributionChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm h-full"
    >
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Ownership</h3>
          <p className="mt-1 text-xs text-gray-500">Audience distribution by platform</p>
        </div>
        <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline decoration-indigo-200 underline-offset-4">
          Download report
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Donut Chart */}
        <div className="relative h-48 w-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
                animationBegin={delay * 1000}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Label (Cake style cake emoji icon) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl">🎂</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-1 flex-col gap-4 w-full">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Top Platforms
          </div>
          {data.map((item) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(2) : "0";
            return (
              <div key={item.name} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.name.substring(0,2).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-gray-900">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-600">{percentage}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${percentage}%`, backgroundColor: item.color }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-gray-500">
        <span className="text-gray-900">Active</span>
        <div className="w-8 h-4 rounded-full bg-[#c8ff55] flex items-center p-0.5 shadow-inner">
          <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
        </div>
        <span>Inactive</span>
      </div>
    </motion.div>
  );
}
