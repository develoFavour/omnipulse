"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Search } from "lucide-react";
import { useAdminWorkspaces } from "@/lib/api/hooks/useAdmin";
import { extractErrorMessage } from "@/lib/api/response";
import { APP_ROUTES } from "@/lib/constants/routes.const";
import {
	AdminPageHeader,
	EmptyState,
	SectionCard,
	StatusPill,
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
import { Input } from "@/components/ui/input";
import { formatRelativeTime } from "@/lib/utils/date.utils";

const SORT_OPTIONS = [
	{ value: "last_activity", label: "Last activity" },
	{ value: "created_at", label: "Created" },
	{ value: "company_name", label: "Name" },
	{ value: "contacts", label: "Recipients" },
	{ value: "campaigns", label: "Campaigns" },
];

export default function AdminWorkspacesPage() {
	const [search, setSearch] = useState("");
	const [query, setQuery] = useState("");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);
	const [sort, setSort] = useState("last_activity");
	const [direction, setDirection] = useState<"asc" | "desc">("desc");

	useEffect(() => {
		const timer = setTimeout(() => {
			setQuery(search.trim());
			setPage(1);
		}, 300);
		return () => clearTimeout(timer);
	}, [search]);

	const { list, isLoading, error } = useAdminWorkspaces({
		q: query,
		page,
		page_size: pageSize,
		sort,
		direction,
	});

	return (
		<div>
			<AdminPageHeader
				title="Workspaces"
				description="Every tenant on the platform, with plan and usage at a glance."
				actions={
					<Link
						href={APP_ROUTES.ADMIN.HEALTH}
						className="text-xs font-semibold text-[#163300] hover:underline"
					>
						System health
					</Link>
				}
			/>

			<SectionCard
				title="All workspaces"
				description={
					list
						? `${formatNumber(list.total)} workspace${list.total === 1 ? "" : "s"} · page ${list.page} of ${Math.max(1, list.total_pages)}`
						: "Loading directory..."
				}
				action={
					<div className="flex flex-wrap items-center gap-2">
						<div className="relative">
							<Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
							<Input
								value={search}
								onChange={(event) => setSearch(event.target.value)}
								placeholder="Search by name"
								className="h-8 w-48 pl-8 text-xs"
							/>
						</div>
						<select
							value={sort}
							onChange={(event) => {
								setSort(event.target.value);
								setPage(1);
							}}
							className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-600"
						>
							{SORT_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<button
							type="button"
							onClick={() => {
								setDirection((current) => (current === "desc" ? "asc" : "desc"));
								setPage(1);
							}}
							className="inline-flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
							title={`Sort ${direction === "desc" ? "descending" : "ascending"}`}
						>
							{direction === "desc" ? (
								<ArrowDownWideNarrow className="h-3.5 w-3.5" />
							) : (
								<ArrowUpNarrowWide className="h-3.5 w-3.5" />
							)}
							{direction === "desc" ? "Desc" : "Asc"}
						</button>
					</div>
				}
			>
				{isLoading && !list ? (
					<div className="space-y-2">
						{[0, 1, 2, 3, 4].map((i) => (
							<Skeleton key={i} className="h-12 rounded-xl" />
						))}
					</div>
				) : error && !list ? (
					<EmptyState
						message={extractErrorMessage(error, "Failed to load workspaces.")}
					/>
				) : !list || list.data.length === 0 ? (
					<EmptyState message={query ? "No workspace matches that search." : "No workspaces yet."} />
				) : (
					<>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Workspace</TableHead>
									<TableHead>Plan</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Members</TableHead>
									<TableHead className="text-right">Recipients</TableHead>
									<TableHead className="text-right">Campaigns</TableHead>
									<TableHead className="text-right">Channels</TableHead>
									<TableHead className="text-right">Last activity</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{list.data.map((workspace) => (
									<TableRow key={workspace.id}>
										<TableCell>
											<Link
												href={APP_ROUTES.ADMIN.WORKSPACE(workspace.id)}
												className="font-semibold text-[#163300] hover:underline"
											>
												{workspace.company_name || "Unnamed workspace"}
											</Link>
											<p className="text-[11px] text-gray-400">
												{workspace.onboarding_completed
													? "Onboarded"
													: "Onboarding incomplete"}
											</p>
										</TableCell>
										<TableCell>
											<span className="font-semibold">{planLabel(workspace.plan_tier)}</span>
											<p className="text-[11px] text-gray-400">
												{formatMoney(workspace.amount, workspace.currency)}
											</p>
										</TableCell>
										<TableCell>
											<StatusPill label={workspace.subscription_status} />
										</TableCell>
										<TableCell className="text-right">
											{formatNumber(workspace.members)}
										</TableCell>
										<TableCell className="text-right">
											{formatNumber(workspace.contacts)}
										</TableCell>
										<TableCell className="text-right">
											{formatNumber(workspace.campaigns)}
										</TableCell>
										<TableCell className="text-right">
											{formatNumber(workspace.active_channels)}
										</TableCell>
										<TableCell className="text-right text-gray-500">
											{formatRelativeTime(workspace.last_activity_at)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>

						<div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
							<div className="flex items-center gap-2 text-xs text-gray-500">
								<span>Rows</span>
								<select
									value={pageSize}
									onChange={(event) => {
										setPageSize(Number(event.target.value));
										setPage(1);
									}}
									className="h-7 rounded-lg border border-gray-200 bg-white px-1.5 text-xs font-semibold text-gray-600"
								>
									{[10, 25, 50, 100].map((size) => (
										<option key={size} value={size}>
											{size}
										</option>
									))}
								</select>
							</div>
							<div className="flex items-center gap-2">
								<button
									type="button"
									disabled={page <= 1}
									onClick={() => setPage((current) => Math.max(1, current - 1))}
									className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 disabled:opacity-40"
								>
									Previous
								</button>
								<span className="text-xs font-semibold text-gray-500">
									{list.page} / {Math.max(1, list.total_pages)}
								</span>
								<button
									type="button"
									disabled={page >= list.total_pages}
									onClick={() => setPage((current) => current + 1)}
									className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 disabled:opacity-40"
								>
									Next
								</button>
							</div>
						</div>
					</>
				)}
			</SectionCard>
		</div>
	);
}
