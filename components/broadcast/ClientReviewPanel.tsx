"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Check,
	Copy,
	ExternalLink,
	Link2,
	Loader2,
	MailCheck,
	RefreshCw,
	Trash2,
	Users,
	X,
} from "lucide-react";
import { toast } from "sonner";
import { apiMessage, apiStatus } from "@/lib/api/axios-error";
import { reviewService, ReviewLinkRecord } from "@/lib/services/review.service";
import { useAppStore } from "@/lib/store";

interface ClientReviewPanelProps {
	campaignId: string;
	compact?: boolean;
	campaignStatus?: string;
}

const REPORT_STATUSES = new Set(["scheduled", "processing", "completed", "paused", "cancelled"]);

function linkState(link: ReviewLinkRecord) {
	if (link.revoked_at) return { label: "Revoked", tone: "muted" as const };
	if (link.decision === "approved") return { label: "Approved", tone: "emerald" as const };
	if (link.decision === "changes_requested")
		return { label: "Changes requested", tone: "amber" as const };
	if (new Date(link.expires_at).getTime() < Date.now())
		return { label: "Expired", tone: "muted" as const };
	if (link.last_viewed_at) return { label: "Viewed", tone: "sky" as const };
	return { label: "Awaiting brand", tone: "neutral" as const };
}

export function ClientReviewPanel({ campaignId, compact = false, campaignStatus }: ClientReviewPanelProps) {
	const role = useAppStore((state) => state.user?.role);
	const isReport = campaignStatus ? REPORT_STATUSES.has(campaignStatus) : false;
	const [isOpen, setIsOpen] = useState(false);
	const [links, setLinks] = useState<ReviewLinkRecord[]>([]);
	const [isLoadingLinks, setIsLoadingLinks] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);

	const [label, setLabel] = useState("");
	const [expiresInDays, setExpiresInDays] = useState(7);
	const [isCreating, setIsCreating] = useState(false);
	const [newLink, setNewLink] = useState<{ token: string; label: string } | null>(null);
	const [copied, setCopied] = useState<string | null>(null);
	const [revokingId, setRevokingId] = useState<string | null>(null);

	const canShare = role === "owner" || role === "admin";

	const loadLinks = useCallback(async () => {
		setIsLoadingLinks(true);
		setLoadError(null);
		try {
			const data = await reviewService.listReviewLinks(campaignId);
			setLinks(data);
		} catch (err: unknown) {
			setLoadError(
				apiStatus(err) === 403
					? "Only workspace owners and admins can share review links."
					: apiMessage(err, "Could not load review links.")
			);
		} finally {
			setIsLoadingLinks(false);
		}
	}, [campaignId]);

	const openPanel = () => {
		setIsOpen(true);
		loadLinks();
	};

	useEffect(() => {
		if (!isOpen) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !isCreating) setIsOpen(false);
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [isOpen, isCreating]);

	const handleCreate = async () => {
		setIsCreating(true);
		try {
			const link = await reviewService.createReviewLink(campaignId, {
				label,
				expires_in_days: expiresInDays,
			});
			setNewLink({ token: link.token, label: link.label });
			setLabel("");
			await loadLinks();
		} catch (err: unknown) {
			toast.error(apiMessage(err, "Could not create the review link."));
		} finally {
			setIsCreating(false);
		}
	};

	const handleCopy = async (url: string, id: string) => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(id);
			toast.success(isReport ? "Report link copied" : "Review link copied");
			setTimeout(() => setCopied((current) => (current === id ? null : current)), 2000);
		} catch {
			toast.error("Your browser blocked clipboard access. Copy the link manually.");
		}
	};

	const handleRevoke = async (linkId: string) => {
		setRevokingId(linkId);
		try {
			await reviewService.revokeReviewLink(campaignId, linkId);
			toast.success("Review link revoked");
			setLinks((current) =>
				current.map((link) =>
					link.id === linkId ? { ...link, revoked_at: new Date().toISOString() } : link
				)
			);
		} catch (err: unknown) {
			toast.error(apiMessage(err, "Could not revoke the link."));
		} finally {
			setRevokingId(null);
		}
	};

	const close = () => {
		if (isCreating) return;
		setIsOpen(false);
		setNewLink(null);
		setCopied(null);
	};

	return (
		<>
			<button
				onClick={openPanel}
				className={
					compact
						? "flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-100 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300"
						: "flex items-center gap-2 px-5 py-3 rounded-xl border border-violet-300 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/40 text-violet-800 dark:text-violet-300 font-bold text-sm transition-all shadow-xs cursor-pointer"
				}
			>
				<Users className={compact ? "h-3.5 w-3.5" : "h-4 w-4 text-violet-600 dark:text-violet-400"} />
				{isReport ? "Campaign Report" : "Brand Review"}
			</button>

			<AnimatePresence>
				{isOpen && (
					<div
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
						role="dialog"
						aria-modal="true"
						aria-labelledby="brand-review-title"
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.96 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.96 }}
							className="w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
						>
							<div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 dark:border-zinc-800">
								<div className="flex items-start gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300">
										<MailCheck className="h-5 w-5" />
									</div>
									<div>
										<h3
											id="brand-review-title"
											className="text-lg font-bold text-gray-900 dark:text-zinc-50"
										>
											{isReport ? "Campaign report link" : "Brand review link"}
										</h3>
										<p className="text-xs text-gray-500 dark:text-zinc-400">
											{isReport
												? "Share the message, review trail and delivery results. Brands see counts — never names or phone numbers."
												: "Share a read-only preview. Brands see the message and audience counts — never names or phone numbers."}
										</p>
									</div>
								</div>
								<button
									onClick={close}
									className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-zinc-800"
									aria-label="Close"
								>
									<X className="h-4 w-4" />
								</button>
							</div>

							{!canShare ? (
								<p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
									Only workspace owners and admins can share review links.
								</p>
							) : newLink ? (
								<div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
									<p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
										Link ready{newLink.label ? ` for ${newLink.label}` : ""}
									</p>
									<input
										readOnly
										value={reviewService.reviewUrl(newLink.token)}
										onFocus={(event) => event.currentTarget.select()}
										className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-mono text-gray-700 dark:border-emerald-900 dark:bg-zinc-950 dark:text-zinc-200"
									/>
									<div className="flex flex-wrap gap-2">
										<button
											onClick={() => handleCopy(reviewService.reviewUrl(newLink.token), "new")}
											className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
										>
											{copied === "new" ? (
												<Check className="h-3.5 w-3.5" />
											) : (
												<Copy className="h-3.5 w-3.5" />
											)}
											Copy link
										</button>
										<a
											href={reviewService.reviewUrl(newLink.token)}
											target="_blank"
											rel="noreferrer"
											className="flex items-center gap-2 rounded-xl border border-emerald-300 px-4 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-900 dark:text-emerald-300"
										>
											<ExternalLink className="h-3.5 w-3.5" />
											Preview
										</a>
										<button
											onClick={() => setNewLink(null)}
											className="rounded-xl px-4 py-2 text-xs font-semibold text-emerald-800 underline dark:text-emerald-300"
										>
											Create another
										</button>
									</div>
									<p className="text-[11px] text-emerald-700 dark:text-emerald-400">
										Anyone with this link can respond. Revoke it below if it is shared by mistake.
									</p>
								</div>
							) : (
								<div className="space-y-3">
									<div>
										<label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
											Who is reviewing? (optional)
										</label>
										<input
											value={label}
											onChange={(event) => setLabel(event.target.value)}
											placeholder="Acme marketing lead"
											maxLength={120}
											className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
										/>
									</div>
									<div>
										<label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
											Link expires in
										</label>
										<select
											value={expiresInDays}
											onChange={(event) => setExpiresInDays(Number(event.target.value))}
											className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-violet-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
										>
											<option value={3}>3 days</option>
											<option value={7}>7 days</option>
											<option value={14}>14 days</option>
											<option value={30}>30 days</option>
										</select>
									</div>
									<button
										onClick={handleCreate}
										disabled={isCreating}
										className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
									>
										{isCreating ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<Link2 className="h-4 w-4" />
										)}
										{isReport ? "Generate report link" : "Generate review link"}
									</button>
									<p className="text-[11px] leading-relaxed text-gray-500 dark:text-zinc-400">
										{isReport
											? "The report updates as the campaign sends. Revoke the link any time."
											: "The brand sees the message and audience counts, never contact details. Their decision is recorded here. If the campaign is awaiting internal approval, approval also moves it to approved; a change request never changes the status."}
									</p>
								</div>
							)}

							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
										Shared links
									</p>
									<button
										onClick={loadLinks}
										disabled={isLoadingLinks}
										className="flex items-center gap-1 text-xs font-semibold text-gray-500 transition hover:text-gray-800 dark:text-zinc-400"
									>
										<RefreshCw
											className={`h-3.5 w-3.5 ${isLoadingLinks ? "animate-spin" : ""}`}
										/>
										Refresh
									</button>
								</div>

								{loadError && (
									<p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
										{loadError}
									</p>
								)}

								{!loadError && !isLoadingLinks && links.length === 0 && (
									<p className="rounded-xl border border-dashed border-gray-200 px-3 py-4 text-center text-xs text-gray-400 dark:border-zinc-700">
										No links yet.
									</p>
								)}

								{links.map((link) => {
									const state = linkState(link);
									return (
										<div
											key={link.id}
											className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-3 py-2.5 dark:border-zinc-800"
										>
											<div className="min-w-0">
												<p className="truncate text-sm font-semibold text-gray-800 dark:text-zinc-200">
													{link.label || "Unnamed recipient"}
												</p>
												<p className="text-[11px] text-gray-400">
													Created {new Date(link.created_at).toLocaleDateString()} · Expires{" "}
													{new Date(link.expires_at).toLocaleDateString()}
												</p>
											</div>
											<div className="flex items-center gap-2">
												<span
													className={[
														"rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
														state.tone === "emerald" &&
															"bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
														state.tone === "amber" &&
															"bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
														state.tone === "sky" &&
															"bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
														state.tone === "neutral" &&
															"bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300",
														state.tone === "muted" &&
															"bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-zinc-500",
													]
														.filter(Boolean)
														.join(" ")}
												>
													{state.label}
												</span>
												{!link.revoked_at && (
													<button
														onClick={() => handleRevoke(link.id)}
														disabled={revokingId === link.id}
														className="rounded-lg p-1.5 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-rose-950/40"
														aria-label="Revoke link"
													>
														{revokingId === link.id ? (
															<Loader2 className="h-3.5 w-3.5 animate-spin" />
														) : (
															<Trash2 className="h-3.5 w-3.5" />
														)}
													</button>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</>
	);
}
