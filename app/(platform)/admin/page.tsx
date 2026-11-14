"use client";

import { useState } from "react";
import Link from "next/link";
import {
	AlertTriangle,
	Building2,
	CreditCard,
	Plug,
	RefreshCw,
	Send,
	Users,
} from "lucide-react";
import { useAdminOverview } from "@/lib/api/hooks/useAdmin";
import { extractErrorMessage } from "@/lib/api/response";
import { APP_ROUTES } from "@/lib/constants/routes.const";
import {
	AdminPageHeader,
	DeltaHint,
	EmptyState,
	SectionCard,
	StatCard,
	StatusPill,
	WindowSelector,
	formatMoney,
	formatNumber,
	formatPercent,
	planLabel,
} from "@/components/admin/AdminUI";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function AdminOverviewPage() {
	const [days, setDays] = useState(30);
	const { overview, isLoading, error, refetch } = useAdminOverview(days);

	return (
		<div>
			<AdminPageHeader
				title="Platform overview"
				description={
					overview
						? `Cross-tenant snapshot, last ${overview.window_days} days · generated ${new Date(overview.generated_at).toLocaleString()}`
						: "Cross-tenant snapshot of every workspace on the platform."
				}
				actions={
					<>
						<WindowSelector days={days} onChange={setDays} />
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

			{isLoading && !overview ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{[0, 1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-32 rounded-2xl" />
					))}
				</div>
			) : error && !overview ? (
				<SectionCard title="Overview unavailable">
					<EmptyState message={extractErrorMessage(error, "Failed to load the platform overview.")} />
				</SectionCard>
			) : overview ? (
				<div className="space-y-5">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
						<StatCard
							label="Workspaces"
							value={formatNumber(overview.workspaces.total)}
							icon={Building2}
							tone="green"
							hint={
								<span className="flex flex-wrap gap-1">
									<span className="text-emerald-600">
										+{formatNumber(overview.workspaces.new_in_window)} new
									</span>
									<DeltaHint
										current={overview.workspaces.new_in_window}
										previous={overview.workspaces.new_previous_window}
									/>
								</span>
							}
						/>
						<StatCard
							label="Users"
							value={formatNumber(overview.users.total)}
							icon={Users}
							tone="blue"
							hint={
								<span className="flex flex-wrap gap-1">
									<span className="text-sky-600">
										+{formatNumber(overview.users.new_in_window)} new
									</span>
									<DeltaHint
										current={overview.users.new_in_window}
										previous={overview.users.new_previous_window}
									/>
								</span>
							}
						/>
						<StatCard
							label="Messages delivered"
							value={formatNumber(overview.messages.successful)}
							icon={Send}
							tone="green"
							hint={
								<span>
									<span className="font-semibold text-gray-700">
										{formatPercent(overview.messages.delivery_rate)}
									</span>{" "}
									success · {formatNumber(overview.messages.failed)} failed
								</span>
							}
						/>
						<StatCard
							label="Active channels"
							value={formatNumber(overview.channels.active_connections)}
							icon={Plug}
							tone="green"
							hint={
								<span>
									across {formatNumber(overview.channels.workspaces_with_channel)} workspaces
								</span>
							}
						/>
					</div>

					<div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
						<SectionCard
							className="xl:col-span-2"
							title="Recurring revenue"
							description="Active subscriptions only. Currencies are reported separately and never summed."
							action={
								<Link
									href={APP_ROUTES.ADMIN.REVENUE}
									className="text-xs font-semibold text-[#163300] hover:underline"
								>
									Revenue detail
								</Link>
							}
						>
							{overview.revenue.by_currency.length === 0 ? (
								<EmptyState message="No subscriptions yet." />
							) : (
								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
									{overview.revenue.by_currency.map((entry) => (
										<div
											key={entry.currency}
											className="rounded-xl border border-gray-100 bg-gray-50/60 p-4"
										>
											<div className="flex items-center justify-between">
												<span className="text-xs font-bold uppercase tracking-wide text-gray-500">
													{entry.currency}
												</span>
												<CreditCard className="h-4 w-4 text-gray-400" />
											</div>
											<p className="mt-1 text-xl font-bold text-gray-900">
												{formatMoney(entry.monthly_recurring, entry.currency)}
												<span className="text-xs font-medium text-gray-500"> /mo</span>
											</p>
											<p className="mt-0.5 text-xs text-gray-500">
												{formatNumber(entry.paying_workspaces)} paying workspaces
											</p>
										</div>
									))}
								</div>
							)}

							<div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div>
									<p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
										By plan
									</p>
									<div className="flex flex-wrap gap-1.5">
										{Object.entries(overview.revenue.by_plan).map(([plan, count]) => (
											<span
												key={plan}
												className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600"
											>
												{planLabel(plan)}
												<span className="text-gray-900">{formatNumber(count)}</span>
											</span>
										))}
									</div>
								</div>
								<div>
									<p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
										By status
									</p>
									<div className="flex flex-wrap gap-1.5">
										{Object.entries(overview.revenue.by_status).map(([status, count]) => (
											<span key={status} className="inline-flex items-center gap-1">
												<StatusPill label={status} />
												<span className="text-[11px] font-bold text-gray-700">
													{formatNumber(count)}
												</span>
											</span>
										))}
									</div>
								</div>
							</div>
						</SectionCard>

						<SectionCard
							title="Needs attention"
							description="Sort by urgency; every item links to the detail behind it."
						>
							<div className="space-y-2">
								<AttentionRow
									label="Past-due subscriptions"
									value={overview.attention.past_due_subscriptions}
									href={APP_ROUTES.ADMIN.HEALTH}
									tone="amber"
								/>
								<AttentionRow
									label="Stuck campaigns"
									value={overview.attention.stuck_campaigns}
									href={APP_ROUTES.ADMIN.HEALTH}
									tone="red"
								/>
								<AttentionRow
									label="Degraded channels"
									value={overview.attention.degraded_channels}
									href={APP_ROUTES.ADMIN.HEALTH}
									tone="amber"
								/>
							</div>

							<div className="mt-5 border-t border-gray-100 pt-4">
								<p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
									Active channels by platform
								</p>
								{Object.keys(overview.channels.by_platform).length === 0 ? (
									<p className="text-xs text-gray-500">No active channels.</p>
								) : (
									<div className="space-y-2">
										{Object.entries(overview.channels.by_platform).map(([platform, count]) => {
											const max = Math.max(
												...Object.values(overview.channels.by_platform),
												1,
											);
											return (
												<div key={platform}>
													<div className="flex items-center justify-between text-xs">
														<span className="font-semibold capitalize text-gray-700">
															{platform}
														</span>
														<span className="font-bold text-gray-900">{count}</span>
													</div>
													<div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
														<div
															className="h-full rounded-full bg-[#9fe870]"
															style={{ width: `${(count / max) * 100}%` }}
														/>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>
						</SectionCard>
					</div>

					<SectionCard
						title="Activation"
						description={`${formatNumber(overview.workspaces.onboarded)} of ${formatNumber(overview.workspaces.total)} workspaces completed onboarding.`}
						action={
							<Link
								href={APP_ROUTES.ADMIN.GROWTH}
								className="text-xs font-semibold text-[#163300] hover:underline"
							>
								Growth detail
							</Link>
						}
					>
						<div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
							<div
								className="h-full rounded-full bg-[#163300]"
								style={{
									width: `${
										overview.workspaces.total > 0
											? (overview.workspaces.onboarded / overview.workspaces.total) * 100
											: 0
									}%`,
								}}
							/>
						</div>
					</SectionCard>
				</div>
			) : null}
		</div>
	);
}

function AttentionRow({
	label,
	value,
	href,
	tone,
}: {
	label: string;
	value: number;
	href: string;
	tone: "amber" | "red";
}) {
	const urgent = value > 0;
	return (
		<Link
			href={href}
			className={cn(
				"flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-colors",
				urgent
					? "border-gray-200 bg-white hover:border-gray-300"
					: "border-transparent bg-gray-50/60",
			)}
		>
			<span className="flex items-center gap-2 text-gray-600">
				<AlertTriangle
					className={cn(
						"h-4 w-4",
						urgent && tone === "red"
							? "text-rose-500"
							: urgent
								? "text-amber-500"
								: "text-gray-300",
					)}
				/>
				{label}
			</span>
			<span
				className={cn(
					"text-sm font-bold",
					urgent ? (tone === "red" ? "text-rose-600" : "text-amber-600") : "text-gray-400",
				)}
			>
				{formatNumber(value)}
			</span>
		</Link>
	);
}
