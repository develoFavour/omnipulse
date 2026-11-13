"use client";

import { useState } from "react";
import { CreditCard, RefreshCw } from "lucide-react";
import { useAdminRevenue } from "@/lib/api/hooks/useAdmin";
import { extractErrorMessage } from "@/lib/api/response";
import {
	AdminPageHeader,
	EmptyState,
	SectionCard,
	StatCard,
	StatusPill,
	WindowSelector,
	formatMoney,
	formatNumber,
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

export default function AdminRevenuePage() {
	const [days, setDays] = useState(30);
	const { revenue, isLoading, error, refetch } = useAdminRevenue(days);

	const payingTotal =
		revenue?.summary.by_currency.reduce((sum, entry) => sum + entry.paying_workspaces, 0) ?? 0;

	return (
		<div>
			<AdminPageHeader
				title="Revenue"
				description="Currencies are reported separately; there is no blended total."
				actions={
					<>
						<WindowSelector days={days} onChange={setDays} options={[30, 90, 365]} />
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

			{isLoading && !revenue ? (
				<div className="space-y-4">
					<Skeleton className="h-32 rounded-2xl" />
					<Skeleton className="h-72 rounded-2xl" />
				</div>
			) : error && !revenue ? (
				<SectionCard title="Revenue unavailable">
					<EmptyState message={extractErrorMessage(error, "Failed to load revenue data.")} />
				</SectionCard>
			) : revenue ? (
				<div className="space-y-5">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
						{revenue.summary.by_currency.length === 0 ? (
							<StatCard label="Recurring revenue" value="—" hint="No subscriptions yet" />
						) : (
							revenue.summary.by_currency.map((entry) => (
								<StatCard
									key={entry.currency}
									label={`${entry.currency} MRR`}
									value={formatMoney(entry.monthly_recurring, entry.currency)}
									icon={CreditCard}
									tone="green"
									hint={`${formatNumber(entry.paying_workspaces)} paying workspaces`}
								/>
							))
						)}
						<StatCard
							label="Paying workspaces"
							value={formatNumber(payingTotal)}
							hint="Active, non-zero subscriptions only"
						/>
					</div>

					<div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
						<SectionCard className="xl:col-span-2" title="Plan mix">
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div>
									<p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
										By plan
									</p>
									<div className="space-y-1.5">
										{Object.entries(revenue.summary.by_plan).map(([plan, count]) => (
											<div
												key={plan}
												className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
											>
												<span className="font-semibold text-gray-700">{planLabel(plan)}</span>
												<span className="font-bold text-gray-900">{formatNumber(count)}</span>
											</div>
										))}
									</div>
								</div>
								<div>
									<p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
										By status
									</p>
									<div className="space-y-1.5">
										{Object.entries(revenue.summary.by_status).map(([status, count]) => (
											<div
												key={status}
												className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
											>
												<StatusPill label={status} />
												<span className="font-bold text-gray-900">{formatNumber(count)}</span>
											</div>
										))}
									</div>
								</div>
							</div>
						</SectionCard>

						<SectionCard
							title="Recent cancellations"
							description={`Cancelled in the last ${revenue.window_days} days.`}
						>
							{revenue.recent_cancellations.length === 0 ? (
								<EmptyState message="No cancellations in this window." />
							) : (
								<div className="space-y-2">
									{revenue.recent_cancellations.map((entry) => (
										<div
											key={`${entry.tenant_id}-${entry.cancelled_at}`}
											className="rounded-xl border border-gray-100 px-3 py-2"
										>
											<div className="flex items-center justify-between gap-2">
												<span className="truncate text-sm font-semibold text-gray-800">
													{entry.company_name || "Unnamed workspace"}
												</span>
												<span className="shrink-0 text-sm font-bold text-gray-900">
													{formatMoney(entry.amount, entry.currency)}
												</span>
											</div>
											<p className="mt-0.5 text-[11px] text-gray-500">
												{planLabel(entry.plan_tier)} ·{" "}
												{formatDateTime(entry.cancelled_at)}
											</p>
										</div>
									))}
								</div>
							)}
						</SectionCard>
					</div>

					<SectionCard title="Revenue by plan & status">
						{revenue.slices.length === 0 ? (
							<EmptyState message="No subscription rows yet." />
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Plan</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Currency</TableHead>
										<TableHead className="text-right">Workspaces</TableHead>
										<TableHead className="text-right">Monthly equivalent</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{revenue.slices.map((slice) => (
										<TableRow
											key={`${slice.plan_tier}-${slice.status}-${slice.currency}`}
										>
											<TableCell className="font-semibold">
												{planLabel(slice.plan_tier)}
											</TableCell>
											<TableCell>
												<StatusPill label={slice.status} />
											</TableCell>
											<TableCell>{slice.currency}</TableCell>
											<TableCell className="text-right">
												{formatNumber(slice.workspaces)}
											</TableCell>
											<TableCell className="text-right font-semibold">
												{formatMoney(slice.monthly_equivalent, slice.currency)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</SectionCard>

					<SectionCard
						title="Renewals due"
						description={`Active and trial subscriptions renewing in the next ${revenue.window_days} days.`}
					>
						{revenue.renewals_due.length === 0 ? (
							<EmptyState message="No renewals due in this window." />
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Workspace</TableHead>
										<TableHead>Plan</TableHead>
										<TableHead>Cycle</TableHead>
										<TableHead className="text-right">Amount</TableHead>
										<TableHead className="text-right">Renews</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{revenue.renewals_due.map((renewal) => (
										<TableRow key={renewal.tenant_id}>
											<TableCell className="font-semibold">
												{renewal.company_name || "Unnamed workspace"}
											</TableCell>
											<TableCell>{planLabel(renewal.plan_tier)}</TableCell>
											<TableCell className="capitalize">{renewal.billing_cycle}</TableCell>
											<TableCell className="text-right font-semibold">
												{formatMoney(renewal.amount, renewal.currency)}
											</TableCell>
											<TableCell className="text-right text-gray-500">
												{renewal.renews_at ? formatDateTime(renewal.renews_at) : "—"}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</SectionCard>
				</div>
			) : null}
		</div>
	);
}
