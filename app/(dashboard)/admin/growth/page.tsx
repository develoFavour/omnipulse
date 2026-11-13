"use client";

import { useState } from "react";
import { RefreshCw, TrendingUp } from "lucide-react";
import { useAdminGrowth } from "@/lib/api/hooks/useAdmin";
import { extractErrorMessage } from "@/lib/api/response";
import { GrowthChart } from "@/components/admin/GrowthChart";
import {
	AdminPageHeader,
	EmptyState,
	SectionCard,
	StatCard,
	WindowSelector,
	formatNumber,
	formatPercent,
} from "@/components/admin/AdminUI";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminGrowthPage() {
	const [days, setDays] = useState(30);
	const { growth, isLoading, error, refetch } = useAdminGrowth(days);

	const maxFunnel = Math.max(1, ...(growth?.funnel.map((step) => step.workspaces) ?? [1]));

	return (
		<div>
			<AdminPageHeader
				title="Growth & activation"
				description="Reconstructed from row timestamps — directional, not an event ledger."
				actions={
					<>
						<WindowSelector days={days} onChange={setDays} options={[7, 30, 90, 180]} />
						<button
							type="button"
							onClick={() => refetch()}
							className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900"
						>
							<RefreshCw className="h-3.5 w-3.5" />
							Refresh
						</button>
					</>
				}
			/>

			{isLoading && !growth ? (
				<div className="space-y-4">
					<Skeleton className="h-32 rounded-2xl" />
					<Skeleton className="h-80 rounded-2xl" />
				</div>
			) : error && !growth ? (
				<SectionCard title="Growth unavailable">
					<EmptyState message={extractErrorMessage(error, "Failed to load growth data.")} />
				</SectionCard>
			) : growth ? (
				<div className="space-y-5">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<StatCard
							label="Total workspaces"
							value={formatNumber(growth.workspaces_total)}
							icon={TrendingUp}
							tone="green"
							hint={`Cumulative at ${new Date(growth.generated_at).toLocaleString()}`}
						/>
						<StatCard
							label={`New in ${growth.window_days}d`}
							value={formatNumber(
								growth.series.reduce((sum, point) => sum + point.new_workspaces, 0),
							)}
							tone="blue"
							hint={`Users: ${formatNumber(
								growth.series.reduce((sum, point) => sum + point.new_users, 0),
							)}`}
						/>
						<StatCard
							label="Second campaign rate"
							value={formatPercent(
								growth.workspaces_total > 0
									? (growth.funnel.find((step) => step.key === "repeat")?.workspaces ?? 0) /
											growth.workspaces_total *
											100
									: 0,
							)}
							hint="Share of workspaces that sent twice within 14 days"
						/>
					</div>

					<SectionCard
						title="New workspaces & users"
						description="Daily signups in the selected window."
					>
						{growth.series.length === 0 ? (
							<EmptyState message="No activity in this window." />
						) : (
							<GrowthChart data={growth.series} />
						)}
					</SectionCard>

					<SectionCard
						title="Activation funnel"
						description="Each bar counts workspaces that reached that step at least once. Steps are not strictly ordered by time."
					>
						<div className="space-y-3">
							{growth.funnel.map((step) => {
								const share =
									growth.workspaces_total > 0
										? (step.workspaces / growth.workspaces_total) * 100
										: 0;
								return (
									<div key={step.key}>
										<div className="flex items-center justify-between text-xs">
											<span className="font-semibold text-gray-700">{step.label}</span>
											<span className="text-gray-500">
												<span className="font-bold text-gray-900">
													{formatNumber(step.workspaces)}
												</span>{" "}
												· {formatPercent(share)}
											</span>
										</div>
										<div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
											<div
												className="h-full rounded-full bg-gradient-to-r from-[#163300] to-[#9fe870]"
												style={{ width: `${(step.workspaces / maxFunnel) * 100}%` }}
											/>
										</div>
									</div>
								);
							})}
						</div>
					</SectionCard>
				</div>
			) : null}
		</div>
	);
}
