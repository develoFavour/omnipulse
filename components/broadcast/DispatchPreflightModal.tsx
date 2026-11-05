"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2, Send, ShieldCheck, UserX, FileWarning } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CampaignPreflight } from "@/lib/services/campaign.service";

interface DispatchPreflightModalProps {
	isOpen: boolean;
	preflight: CampaignPreflight | null;
	isLoading?: boolean;
	isDispatching?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

function StatCard({
	label,
	value,
	tone,
}: {
	label: string;
	value: number;
	tone: "neutral" | "warn" | "danger";
}) {
	return (
		<div
			className={cn(
				"rounded-2xl border p-3",
				tone === "neutral" && "border-gray-200 bg-gray-50",
				tone === "warn" && "border-amber-200 bg-amber-50",
				tone === "danger" && "border-rose-200 bg-rose-50",
			)}
		>
			<p
				className={cn(
					"text-[11px] font-semibold uppercase tracking-wide",
					tone === "neutral" && "text-gray-500",
					tone === "warn" && "text-amber-700",
					tone === "danger" && "text-rose-700",
				)}
			>
				{label}
			</p>
			<p className="mt-1 font-mono text-xl font-bold text-gray-900">
				{value.toLocaleString()}
			</p>
		</div>
	);
}

export function DispatchPreflightModal({
	isOpen,
	preflight,
	isLoading = false,
	isDispatching = false,
	onConfirm,
	onCancel,
}: DispatchPreflightModalProps) {
	useEffect(() => {
		if (!isOpen) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !isDispatching) onCancel();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [isOpen, isDispatching, onCancel]);

	const blockedTotal = preflight
		? preflight.opted_out + preflight.blocked + preflight.quiet_hours
		: 0;
	const nobodyToSend = !!preflight && preflight.sendable === 0;
	const cannotSend =
		!!preflight && (preflight.sendable === 0 || !preflight.whatsapp_connected);

	return (
		<AnimatePresence>
			{isOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
					role="dialog"
					aria-modal="true"
					aria-labelledby="preflight-title"
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.96 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.96 }}
						className="w-full max-w-lg space-y-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl"
					>
						<div className="flex items-start gap-3 border-b border-gray-100 pb-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
								<ShieldCheck className="h-5 w-5" />
							</div>
							<div>
								<h3 id="preflight-title" className="text-lg font-bold text-gray-900">
									Pre-send check
								</h3>
								<p className="text-xs text-gray-500">
									This is exactly what will be delivered. Nothing has been sent yet.
								</p>
							</div>
						</div>

						{isLoading || !preflight ? (
							<div className="flex items-center justify-center gap-3 py-10 text-sm text-gray-500">
								<Loader2 className="h-5 w-5 animate-spin" />
								Checking your audience…
							</div>
						) : (
							<>
								<div className="rounded-2xl bg-gray-900 px-4 py-4 text-white">
									<p className="text-xs uppercase tracking-wide text-gray-400">Will be sent</p>
									<p className="mt-1 flex items-baseline gap-2">
										<span className="font-mono text-3xl font-bold">
											{preflight.sendable.toLocaleString()}
										</span>
										<span className="text-sm text-gray-400">
											of {preflight.total_targets.toLocaleString()} targets
										</span>
									</p>
								</div>

								<div className="grid grid-cols-2 gap-2.5">
									<StatCard
										label="Opted out"
										value={preflight.opted_out}
										tone={preflight.opted_out > 0 ? "danger" : "neutral"}
									/>
									<StatCard
										label="No consent evidence"
										value={preflight.no_consent}
										tone={preflight.no_consent > 0 ? "warn" : "neutral"}
									/>
									<StatCard
										label="Unreachable"
										value={preflight.unreachable}
										tone={preflight.unreachable > 0 ? "danger" : "neutral"}
									/>
								</div>

								{!preflight.whatsapp_connected && (
									<div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
										<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
										<p>
											WhatsApp is not connected, so these recipients cannot be reached.
											Reconnect the WhatsApp channel in Channels before dispatching.
										</p>
									</div>
								)}

								{nobodyToSend && (
									<div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
										<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
										<p>
											There is nobody to send to. Dispatch would be rejected — adjust the
											audience or re-check your contacts.
										</p>
									</div>
								)}

								{preflight.unreachable > 0 && (
									<div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
										<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
										<p>
											{preflight.unreachable.toLocaleString()} Telegram contact
											{preflight.unreachable === 1 ? "" : "s"} never started a chat with
											your bot. They will be skipped instead of failing after dispatch.
										</p>
									</div>
								)}

								{!cannotSend && blockedTotal > 0 && (
									<div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
										<UserX className="mt-0.5 h-4 w-4 shrink-0" />
										<p>
											{blockedTotal.toLocaleString()} recipient
											{blockedTotal === 1 ? "" : "s"} will be skipped for compliance
											reasons (opt-outs, suppressions, or quiet hours).
										</p>
									</div>
								)}

								{preflight.no_consent > 0 && (
									<div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
										<FileWarning className="mt-0.5 h-4 w-4 shrink-0" />
										<p>
											{preflight.no_consent.toLocaleString()} contact
											{preflight.no_consent === 1 ? "" : "s"} have no recorded consent
											evidence. They will still be messaged, but export a consent bundle if
											the brand needs the audit trail.
										</p>
									</div>
								)}

								{preflight.reasons.length > 0 && (
									<ul className="space-y-1 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
										{preflight.reasons.map((reason) => (
											<li key={reason.code} className="flex gap-2">
												<span className="font-mono text-[10px] text-gray-400">
													{reason.code}
												</span>
												<span>{reason.message}</span>
											</li>
										))}
									</ul>
								)}
							</>
						)}

						<div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
							<button
								type="button"
								onClick={onCancel}
								disabled={isDispatching}
								className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
							>
								Keep as draft
							</button>
							<button
								type="button"
								onClick={onConfirm}
								disabled={isLoading || isDispatching || cannotSend || !preflight}
								className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
							>
								{isDispatching ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Send className="h-4 w-4" />
								)}
								{isDispatching
									? "Sending…"
									: `Send to ${(preflight?.sendable ?? 0).toLocaleString()}`}
							</button>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
