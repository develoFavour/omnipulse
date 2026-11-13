"use client";

import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	CartesianGrid,
} from "recharts";
import type { AdminGrowthPoint } from "@/lib/services/admin.service";

export function GrowthChart({ data }: { data: AdminGrowthPoint[] }) {
	return (
		<div className="h-72 w-full">
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
					<defs>
						<linearGradient id="adminWorkspaces" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#163300" stopOpacity={0.28} />
							<stop offset="100%" stopColor="#163300" stopOpacity={0.02} />
						</linearGradient>
						<linearGradient id="adminUsers" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#9fe870" stopOpacity={0.35} />
							<stop offset="100%" stopColor="#9fe870" stopOpacity={0.02} />
						</linearGradient>
					</defs>
					<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0ec" />
					<XAxis
						dataKey="date"
						tickFormatter={(value: string) => value.slice(5)}
						tick={{ fontSize: 11, fill: "#9ca3af" }}
						axisLine={false}
						tickLine={false}
						minTickGap={24}
					/>
					<YAxis
						allowDecimals={false}
						tick={{ fontSize: 11, fill: "#9ca3af" }}
						axisLine={false}
						tickLine={false}
					/>
					<Tooltip
						contentStyle={{
							borderRadius: 12,
							border: "1px solid #e5e7eb",
							fontSize: 12,
							boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
						}}
					/>
					<Area
						type="monotone"
						dataKey="new_workspaces"
						name="New workspaces"
						stroke="#163300"
						strokeWidth={2}
						fill="url(#adminWorkspaces)"
					/>
					<Area
						type="monotone"
						dataKey="new_users"
						name="New users"
						stroke="#72c23a"
						strokeWidth={2}
						fill="url(#adminUsers)"
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
