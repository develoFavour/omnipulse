"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PillTone = "green" | "blue" | "amber" | "red" | "gray";

const PILL_CLASSES: Record<PillTone, string> = {
	green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
	blue: "bg-sky-50 text-sky-700 ring-sky-200",
	amber: "bg-amber-50 text-amber-700 ring-amber-200",
	red: "bg-rose-50 text-rose-700 ring-rose-200",
	gray: "bg-gray-100 text-gray-600 ring-gray-200",
};

export function statusTone(status: string): PillTone {
	switch (status.toLowerCase()) {
		case "active":
		case "healthy":
		case "delivered":
		case "sent":
		case "completed":
		case "granted":
		case "approved":
			return "green";
		case "trialing":
		case "scheduled":
		case "processing":
		case "pending":
		case "queued":
		case "in_flight":
		case "pending_approval":
			return "blue";
		case "past_due":
		case "rate_limited":
		case "paused":
		case "degraded":
		case "reconnect_required":
			return "amber";
		case "canceled":
		case "failed":
		case "suspended":
		case "rejected":
		case "revoked":
			return "red";
		default:
			return "gray";
	}
}

export function StatusPill({
	label,
	tone,
}: {
	label: string;
	tone?: PillTone;
}) {
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ring-1 ring-inset",
				PILL_CLASSES[tone ?? statusTone(label)],
			)}
		>
			{label.replace(/_/g, " ")}
		</span>
	);
}

export function formatNumber(value: number | undefined | null): string {
	return (value ?? 0).toLocaleString();
}

const CURRENCY_SYMBOLS: Record<string, string> = {
	USD: "$",
	NGN: "₦",
	GBP: "£",
	EUR: "€",
};

// Subscription amounts are stored in minor units (cents / kobo).
export function formatMoney(minorUnits: number | undefined | null, currency: string): string {
	const amount = (minorUnits ?? 0) / 100;
	const symbol = CURRENCY_SYMBOLS[currency];
	const formatted = amount.toLocaleString(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
	if (!symbol) {
		return currency === "UNSET" ? formatted : `${formatted} ${currency}`;
	}
	return `${symbol}${formatted}`;
}

export function formatPercent(value: number | undefined | null): string {
	return `${(value ?? 0).toFixed(1)}%`;
}

export function planLabel(tier: string): string {
	switch (tier.toLowerCase()) {
		case "starter":
			return "Starter";
		case "growth":
			return "Growth";
		case "agency":
			return "Agency";
		case "free":
			return "No plan";
		default:
			return tier;
	}
}

export function AdminPageHeader({
	title,
	description,
	actions,
}: {
	title: string;
	description?: string;
	actions?: ReactNode;
}) {
	return (
		<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
				{description ? (
					<p className="mt-1 text-sm text-gray-500">{description}</p>
				) : null}
			</div>
			{actions ? <div className="flex items-center gap-2">{actions}</div> : null}
		</div>
	);
}

export function StatCard({
	label,
	value,
	hint,
	icon: Icon,
	tone = "gray",
}: {
	label: string;
	value: string;
	hint?: ReactNode;
	icon?: React.ComponentType<{ className?: string }>;
	tone?: PillTone;
}) {
	return (
		<div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm">
			<div className="flex items-start justify-between gap-3">
				<p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
					{label}
				</p>
				{Icon ? (
					<div
						className={cn(
							"flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset",
							PILL_CLASSES[tone],
						)}
					>
						<Icon className="h-4 w-4" />
					</div>
				) : null}
			</div>
			<p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
			{hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
		</div>
	);
}

export function SectionCard({
	title,
	description,
	action,
	children,
	className,
}: {
	title: string;
	description?: string;
	action?: ReactNode;
	children: ReactNode;
	className?: string;
}) {
	return (
		<section className={cn("rounded-2xl border border-gray-200/90 bg-white shadow-sm", className)}>
			<div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-sm font-bold text-gray-900">{title}</h2>
					{description ? (
						<p className="mt-0.5 text-xs text-gray-500">{description}</p>
					) : null}
				</div>
				{action}
			</div>
			<div className="p-5">{children}</div>
		</section>
	);
}

export function EmptyState({ message }: { message: string }) {
	return (
		<p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-6 text-center text-sm text-gray-500">
			{message}
		</p>
	);
}

export function DeltaHint({ current, previous }: { current: number; previous: number }) {
	if (previous === 0) {
		return current > 0 ? <span className="text-emerald-600">new this window</span> : <>no movement</>;
	}
	const delta = ((current - previous) / previous) * 100;
	const positive = delta >= 0;
	return (
		<span className={positive ? "text-emerald-600" : "text-rose-600"}>
			{positive ? "+" : ""}
			{delta.toFixed(1)}% vs previous window
		</span>
	);
}

export function WindowSelector({
	days,
	onChange,
	options = [7, 30, 90],
}: {
	days: number;
	onChange: (days: number) => void;
	options?: number[];
}) {
	return (
		<div className="inline-flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-xs">
			{options.map((option) => (
				<button
					key={option}
					type="button"
					onClick={() => onChange(option)}
					className={cn(
						"rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
						days === option
							? "bg-[#163300] text-white"
							: "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
					)}
				>
					{option}d
				</button>
			))}
		</div>
	);
}
