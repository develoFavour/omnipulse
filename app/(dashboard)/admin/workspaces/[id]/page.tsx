"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, MessageSquare, Plug, Send, Users } from "lucide-react";
import { useAdminWorkspace } from "@/lib/api/hooks/useAdmin";
import { extractErrorMessage } from "@/lib/api/response";
import { APP_ROUTES } from "@/lib/constants/routes.const";
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

export default function AdminWorkspaceDetailPage() {
	const params = useParams<{ id: string }>();
	const tenantId = Array.isArray(params?.id) ? params.id[0] : params?.id;
	const { detail, isLoading, error } = useAdminWorkspace(tenantId);

	if (isLoading && !detail) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-16 rounded-2xl" />
				<Skeleton className="h-32 rounded-2xl" />
				<Skeleton className="h-72 rounded-2xl" />
			</div>
		);
	}

	if (error && !detail) {
		return (
			<SectionCard title="Workspace unavailable">
				<EmptyState
					message={extractErrorMessage(error, "This workspace could not be loaded.")}
				/>
			</SectionCard>
		);
	}

	if (!detail) {
		return null;
	}

	const workspace = detail.workspace;

	return (
		<div>
			<Link
				href={APP_ROUTES.ADMIN.WORKSPACES}
				className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900"
			>
				<ArrowLeft className="h-3.5 w-3.5" />
				All workspaces
			</Link>

			<AdminPageHeader
				title={workspace.company_name || "Unnamed workspace"}
				description={`Created ${formatDateTime(workspace.created_at)} · last activity ${formatDateTime(workspace.last_activity_at)} · ${workspace.onboarding_completed ? "onboarding complete" : "onboarding incomplete"}`}
				actions={
					<div className="flex items-center gap-2">
						<StatusPill label={planLabel(workspace.plan_tier)} tone="blue" />
						<StatusPill label={workspace.subscription_status} />
					</div>
				}
			/>

			<div className="space-y-5">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
					<StatCard
						label="Members"
						value={formatNumber(workspace.members)}
						icon={Users}
						tone="blue"
					/>
					<StatCard
						label="Recipients"
						value={formatNumber(workspace.contacts)}
						icon={Building2}
						tone="green"
					/>
					<StatCard
						label="Campaigns"
						value={formatNumber(workspace.campaigns)}
						icon={Send}
						tone="blue"
					/>
					<StatCard
						label="Active channels"
						value={formatNumber(workspace.active_channels)}
						icon={Plug}
						tone="green"
					/>
					<StatCard
						label="Delivery rate (30d)"
						value={formatPercent(detail.deliveries.delivery_rate)}
						icon={MessageSquare}
						tone="green"
						hint={`${formatNumber(detail.deliveries.delivered)} of ${formatNumber(detail.deliveries.total)} deliveries`}
					/>
				</div>

				<div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
					<SectionCard className="xl:col-span-2" title="Subscription">
						{detail.subscription ? (
							<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
								<Field label="Plan" value={planLabel(detail.subscription.plan_tier)} />
								<Field label="Status" value={<StatusPill label={detail.subscription.status} />} />
								<Field
									label="Amount"
									value={formatMoney(detail.subscription.amount, detail.subscription.currency)}
								/>
								<Field label="Cycle" value={detail.subscription.billing_cycle} />
								<Field label="Provider" value={detail.subscription.provider} />
								<Field
									label="Current period"
									value={
										detail.subscription.current_period_end
											? `ends ${formatDateTime(detail.subscription.current_period_end)}`
											: "open-ended"
									}
								/>
								<Field
									label="Message limit"
									value={formatNumber(detail.subscription.monthly_message_limit)}
								/>
								<Field
									label="Contact limit"
									value={formatNumber(detail.subscription.contacts_limit)}
								/>
								<Field
									label="Channel limit"
									value={formatNumber(detail.subscription.channels_limit)}
								/>
							</div>
						) : (
							<EmptyState message="No subscription row for this workspace." />
						)}
					</SectionCard>

					<SectionCard title="Consent ledger">
						<div className="grid grid-cols-2 gap-3 text-sm">
							<Field label="Recipients" value={formatNumber(detail.consent.contacts)} />
							<Field label="Opted out" value={formatNumber(detail.consent.opted_out)} />
							<Field label="Grants" value={formatNumber(detail.consent.granted_events)} />
							<Field label="Revocations" value={formatNumber(detail.consent.revoked_events)} />
						</div>
						<div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
							Deliveries (30d): {formatNumber(detail.deliveries.total)} total ·{" "}
							<span className="text-rose-600">
								{formatNumber(detail.deliveries.failed)} failed
							</span>
						</div>
					</SectionCard>
				</div>

				<SectionCard title="Members">
					{detail.members.length === 0 ? (
						<EmptyState message="No members." />
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Member</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Role</TableHead>
									<TableHead className="text-right">Joined</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{detail.members.map((member) => (
									<TableRow key={member.user_id}>
										<TableCell className="font-semibold">
											{member.name || "Unnamed member"}
										</TableCell>
										<TableCell className="text-gray-500">{member.email || "—"}</TableCell>
										<TableCell>
											<StatusPill label={member.role} tone={member.role === "owner" ? "green" : "gray"} />
										</TableCell>
										<TableCell className="text-right text-gray-500">
											{formatDateTime(member.joined_at)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</SectionCard>

				<SectionCard title="Channels">
					{detail.channels.length === 0 ? (
						<EmptyState message="No channels connected." />
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Platform</TableHead>
									<TableHead>Identity</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Health</TableHead>
									<TableHead>Last heartbeat</TableHead>
									<TableHead>Last success</TableHead>
									<TableHead>Last error</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{detail.channels.map((channel) => (
									<TableRow key={`${channel.platform}-${channel.created_at}`}>
										<TableCell className="font-semibold capitalize">
											{channel.platform}
										</TableCell>
										<TableCell className="max-w-[180px] truncate text-gray-500">
											{channel.account_identity || "—"}
										</TableCell>
										<TableCell>
											<StatusPill label={channel.status} />
										</TableCell>
										<TableCell>
											<StatusPill label={channel.health} />
										</TableCell>
										<TableCell className="text-gray-500">
											{channel.last_heartbeat_at
												? formatDateTime(channel.last_heartbeat_at)
												: "—"}
										</TableCell>
										<TableCell className="text-gray-500">
											{channel.last_successful_at
												? formatDateTime(channel.last_successful_at)
												: "—"}
										</TableCell>
										<TableCell className="max-w-[220px] truncate text-xs text-rose-600">
											{channel.last_error || "—"}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</SectionCard>

				<SectionCard title="Recent campaigns" description="Ten most recent, newest first.">
					{detail.recent_campaigns.length === 0 ? (
						<EmptyState message="No campaigns yet." />
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Campaign</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Targets</TableHead>
									<TableHead className="text-right">Processed</TableHead>
									<TableHead className="text-right">Created</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{detail.recent_campaigns.map((campaign) => (
									<TableRow key={campaign.id}>
										<TableCell className="max-w-[280px] truncate font-semibold">
											{campaign.title || "Untitled campaign"}
										</TableCell>
										<TableCell>
											<StatusPill label={campaign.status} />
										</TableCell>
										<TableCell className="text-right">
											{formatNumber(campaign.total_targets)}
										</TableCell>
										<TableCell className="text-right">
											{formatNumber(campaign.processed_targets)}
										</TableCell>
										<TableCell className="text-right text-gray-500">
											{formatDateTime(campaign.created_at)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</SectionCard>
			</div>
		</div>
	);
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div>
			<p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
			<div className="mt-0.5 text-sm font-semibold capitalize text-gray-900">{value}</div>
		</div>
	);
}
