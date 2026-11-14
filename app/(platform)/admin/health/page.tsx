"use client";

import { Activity, AlertTriangle, RefreshCw } from "lucide-react";
import { useAdminHealth } from "@/lib/api/hooks/useAdmin";
import { extractErrorMessage } from "@/lib/api/response";
import {
	AdminPageHeader,
	EmptyState,
	SectionCard,
	StatCard,
	StatusPill,
	formatMoney,
	formatNumber,
	formatPercent,
	planLabel,
} from "@/components/admin/AdminUI";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils/date.utils";

export default function AdminHealthPage() {
	const { health, isLoading, error, refetch } = useAdminHealth();

	const queueTotal = health?.queue.reduce((sum, row) => sum + row.dispatches, 0) ?? 0;

	return (
		<div>
			<AdminPageHeader
				title="System health"
				description={
					health
						? `Checked ${formatDateTime(health.generated_at)} · refreshes every 30s`
						: "Background loops, delivery queue and channel state."
				}
				actions={
					<button
						type="button"
						onClick={() => refetch()}
						className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900"
					>
						<RefreshCw className="h-3.5 w-3.5" />
						Refresh
					</button>
				}
			/>

			{isLoading && !health ? (
				<div className="space-y-4">
					<Skeleton className="h-32 rounded-2xl" />
					<Skeleton className="h-72 rounded-2xl" />
				</div>
			) : error && !health ? (
				<SectionCard title="Health unavailable">
					<EmptyState message={extractErrorMessage(error, "Failed to load system health.")} />
				</SectionCard>
			) : health ? (
				<div className="space-y-5">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
						<StatCard
							label="Overall status"
							value={health.status === "healthy" ? "Healthy" : "Degraded"}
							icon={health.status === "healthy" ? Activity : AlertTriangle}
							tone={health.status === "healthy" ? "green" : "red"}
							hint={
								health.status === "healthy"
									? "All loops and consumers reporting"
									: "At least one loop, consumer or campaign needs attention"
							}
						/>
						<StatCard
							label="Queued dispatches"
							value={formatNumber(queueTotal)}
							hint="Queued, in flight and rate-limited"
						/>
						<StatCard
							label="Stuck campaigns"
							value={formatNumber(health.stuck_campaigns.length)}
							icon={AlertTriangle}
							tone={health.stuck_campaigns.length > 0 ? "red" : "green"}
							hint="Processing >15m with no confirmed delivery"
						/>
						<StatCard
							label="Past-due subscriptions"
							value={formatNumber(health.past_due.length)}
							tone={health.past_due.length > 0 ? "amber" : "green"}
						/>
					</div>

					<div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
						<SectionCard
							title="Background loops"
							description="In-process heartbeats. A stale loop means silent failure."
						>
							{health.heartbeats.length === 0 ? (
								<EmptyState message="No heartbeats registered." />
							) : (
								<div className="space-y-2">
									{health.heartbeats.map((beat) => (
										<div
											key={beat.service}
											className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2.5"
										>
											<div>
												<p className="text-sm font-semibold text-gray-800">
													{beat.service}
												</p>
												<p className="text-[11px] text-gray-500">
													Last beat {formatDateTime(beat.last_beat)} · age {beat.age_seconds}s
													{" / stale after "}
													{beat.stale_after_seconds}s
												</p>
											</div>
											<StatusPill label={beat.healthy ? "healthy" : "stale"} />
										</div>
									))}
								</div>
							)}
						</SectionCard>

						<SectionCard
							title="NATS consumers"
							description="A missing consumer means broadcasts queue with no worker attached."
						>
							{health.consumers.length === 0 ? (
								<EmptyState message="NATS is not connected in this instance." />
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Worker</TableHead>
											<TableHead>Consumer</TableHead>
											<TableHead className="text-right">Pending</TableHead>
											<TableHead className="text-right">Ack pending</TableHead>
											<TableHead className="text-right">Delivered</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{health.consumers.map((consumer) => (
											<TableRow key={consumer.service}>
												<TableCell className="font-semibold">
													{consumer.service}
												</TableCell>
												<TableCell>
													<StatusPill label={consumer.exists ? "subscribed" : "missing"} />
												</TableCell>
												<TableCell className="text-right">
													{formatNumber(consumer.pending)}
												</TableCell>
												<TableCell className="text-right">
													{formatNumber(consumer.ack_pending)}
												</TableCell>
												<TableCell className="text-right">
													{formatNumber(consumer.delivered)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</SectionCard>
					</div>

					<div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
						<SectionCard title="Delivery queue depth">
							{health.queue.length === 0 ? (
								<EmptyState message="Queue is empty." />
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Status</TableHead>
											<TableHead className="text-right">Dispatches</TableHead>
											<TableHead className="text-right">Oldest</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{health.queue.map((row) => (
											<TableRow key={row.status}>
												<TableCell>
													<StatusPill label={row.status} />
												</TableCell>
												<TableCell className="text-right font-semibold">
													{formatNumber(row.dispatches)}
												</TableCell>
												<TableCell className="text-right text-gray-500">
													{row.oldest_at ? formatDateTime(row.oldest_at) : "—"}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</SectionCard>

						<SectionCard title="Failures in the last 24h">
							{health.failures_by_platform.length === 0 ? (
								<EmptyState message="No deliveries in the last 24 hours." />
							) : (
								<>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Platform</TableHead>
												<TableHead className="text-right">Total</TableHead>
												<TableHead className="text-right">Failed</TableHead>
												<TableHead className="text-right">Success</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{health.failures_by_platform.map((row) => (
												<TableRow key={row.platform}>
													<TableCell className="font-semibold capitalize">
														{row.platform}
													</TableCell>
													<TableCell className="text-right">
														{formatNumber(row.total)}
													</TableCell>
													<TableCell className="text-right text-rose-600">
														{formatNumber(row.failed)}
													</TableCell>
													<TableCell className="text-right">
														{formatPercent(row.delivery_rate)}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
									{health.top_failure_codes.length > 0 && (
										<div className="mt-4 border-t border-gray-100 pt-3">
											<p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
												Top failure codes
											</p>
											<div className="flex flex-wrap gap-1.5">
												{health.top_failure_codes.map((code) => (
													<span
														key={code.code}
														className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-200"
													>
														{code.code}
														<span className="text-rose-900">{formatNumber(code.count)}</span>
													</span>
												))}
											</div>
										</div>
									)}
								</>
							)}
						</SectionCard>
					</div>

					<SectionCard
						title="Stuck campaigns"
						description="Same definition as the watchdog alert."
					>
						{health.stuck_campaigns.length === 0 ? (
							<EmptyState message="No stuck campaigns." />
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Workspace</TableHead>
										<TableHead>Campaign</TableHead>
										<TableHead className="text-right">Targets</TableHead>
										<TableHead className="text-right">Last update</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{health.stuck_campaigns.map((row) => (
										<TableRow key={row.campaign_id}>
											<TableCell className="font-semibold">
												{row.company_name || row.tenant_id.slice(0, 8)}
											</TableCell>
											<TableCell className="max-w-[260px] truncate">
												{row.title || "Untitled campaign"}
											</TableCell>
											<TableCell className="text-right">
												{formatNumber(row.total_targets)}
											</TableCell>
											<TableCell className="text-right text-gray-500">
												{formatDateTime(row.updated_at)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</SectionCard>

					<div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
						<SectionCard title="Channel health">
							{health.channels.length === 0 ? (
								<EmptyState message="No channels connected." />
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Platform</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Health</TableHead>
											<TableHead className="text-right">Count</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{health.channels.map((row) => (
											<TableRow key={`${row.platform}-${row.status}-${row.health}`}>
												<TableCell className="font-semibold capitalize">
													{row.platform}
												</TableCell>
												<TableCell>
													<StatusPill label={row.status} />
												</TableCell>
												<TableCell>
													<StatusPill label={row.health} />
												</TableCell>
												<TableCell className="text-right font-semibold">
													{formatNumber(row.count)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</SectionCard>

						<SectionCard title="Past-due subscriptions">
							{health.past_due.length === 0 ? (
								<EmptyState message="Nothing past due." />
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Workspace</TableHead>
											<TableHead>Plan</TableHead>
											<TableHead className="text-right">Amount</TableHead>
											<TableHead className="text-right">Updated</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{health.past_due.map((row) => (
											<TableRow key={row.tenant_id}>
												<TableCell className="font-semibold">
													{row.company_name || row.tenant_id.slice(0, 8)}
												</TableCell>
												<TableCell>{planLabel(row.plan_tier)}</TableCell>
												<TableCell className="text-right font-semibold">
													{formatMoney(row.amount, row.currency)}
												</TableCell>
												<TableCell className="text-right text-gray-500">
													{formatDateTime(row.updated_at)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</SectionCard>
					</div>
				</div>
			) : null}
		</div>
	);
}
