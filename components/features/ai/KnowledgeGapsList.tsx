"use client";

import { useMemo, useState } from "react";
import { mutate } from "swr";
import {
	AlertCircle,
	ArrowRight,
	CheckCircle2,
	Clock,
	HelpCircle,
	Loader2,
	MessageCircle,
	RefreshCw,
	Send,
	Sparkles,
	Trash2,
	X,
} from "lucide-react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useKnowledgeGaps, useKnowledgeGapActions } from "@/lib/api/hooks/useKnowledgeGaps";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { extractErrorMessage } from "@/lib/api/response";
import type { AIKnowledgeGap } from "@/lib/services/ai-agent.service";

const CATEGORY_OPTIONS = [
	{ value: "faq", label: "FAQ / General" },
	{ value: "pricing", label: "Pricing & Plans" },
	{ value: "product", label: "Product & Services" },
	{ value: "policy", label: "Policy & Refunds" },
	{ value: "hours", label: "Hours & Contact" },
] as const;

function formatTimeAgo(dateStr: string): string {
	try {
		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / (1000 * 60));
		if (diffMins < 1) return "Just now";
		if (diffMins < 60) return `${diffMins}m ago`;
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours}h ago`;
		const diffDays = Math.floor(diffHours / 24);
		return `${diffDays}d ago`;
	} catch {
		return "Recently";
	}
}

export function KnowledgeGapsList() {
	const { canManageChannels } = usePermissions();
	const { gaps, isLoading, isError, refetch } = useKnowledgeGaps("pending");
	const { resolveGap, dismissGap, isSubmitting } = useKnowledgeGapActions();

	const [activeGap, setActiveGap] = useState<AIKnowledgeGap | null>(null);
	const [category, setCategory] = useState<string>("faq");
	const [question, setQuestion] = useState("");
	const [answer, setAnswer] = useState("");
	const [dismissingId, setDismissingId] = useState<string | null>(null);

	function openTeachModal(gap: AIKnowledgeGap) {
		setActiveGap(gap);
		setQuestion(gap.query);
		setAnswer("");
		setCategory("faq");
	}

	function closeTeachModal() {
		setActiveGap(null);
		setQuestion("");
		setAnswer("");
	}

	async function handleResolve(e: React.FormEvent) {
		e.preventDefault();
		if (!activeGap) return;
		if (!question.trim()) {
			toast.error("Question or topic cannot be empty.");
			return;
		}
		if (!answer.trim()) {
			toast.error("Please provide the answer your assistant should give.");
			return;
		}

		try {
			await resolveGap(activeGap.id, {
				category,
				question_or_topic: question.trim(),
				answer_or_content: answer.trim(),
			});
			toast.success("Trained successfully! Assistant will now answer this question.");
			closeTeachModal();
			refetch();
			// Revalidate the knowledge library SWR cache so the new item shows up there too
			mutate((key) => typeof key === "string" && key.startsWith("ai_knowledge_items"), undefined, { revalidate: true });
		} catch (err) {
			toast.error(extractErrorMessage(err, "Failed to save answer."));
		}
	}

	async function handleDismiss(gapId: string) {
		setDismissingId(gapId);
		try {
			await dismissGap(gapId);
			toast.info("Question dismissed from gaps list.");
			refetch();
		} catch (err) {
			toast.error(extractErrorMessage(err, "Failed to dismiss question."));
		} finally {
			setDismissingId(null);
		}
	}

	return (
		<div className="space-y-6">
			{/* Header with Title and Refresh */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<div className="flex items-center gap-2">
						<h2 className="text-lg font-bold text-gray-900 sm:text-xl">
							Unanswered Customer Inquiries
						</h2>
						{gaps.length > 0 && (
							<span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
								{gaps.length} pending {gaps.length === 1 ? "question" : "questions"}
							</span>
						)}
					</div>
					<p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
						Questions asked on WhatsApp and Telegram where your assistant lacked knowledge. Teach it once, and it answers autonomously forever.
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => refetch()}
						disabled={isLoading}
						className="h-9 gap-1.5 rounded-lg border-gray-200 text-xs text-gray-600 hover:text-gray-900"
					>
						<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
						<span>Refresh</span>
					</Button>
				</div>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200/80 bg-white py-16 shadow-xs">
					<Loader2 className="h-8 w-8 animate-spin text-[#163300]" />
					<p className="mt-3 text-xs font-medium text-gray-500">Checking for knowledge gaps...</p>
				</div>
			)}

			{/* Error State */}
			{!isLoading && isError && (
				<div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center">
					<AlertCircle className="mx-auto h-8 w-8 text-red-500" />
					<h3 className="mt-2 text-sm font-semibold text-red-900">Failed to load unanswered inquiries</h3>
					<p className="mt-1 text-xs text-red-700">Could not retrieve recent customer question gaps. Please retry.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => refetch()}
						className="mt-4 border-red-200 text-xs font-medium text-red-800 hover:bg-red-100"
					>
						Try Again
					</Button>
				</div>
			)}

			{/* Empty State (Inbox Zero) */}
			{!isLoading && !isError && gaps.length === 0 && (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200/70 bg-white px-6 py-16 text-center shadow-xs">
					<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e2f6d5] text-[#163300]">
						<CheckCircle2 className="h-8 w-8" />
					</div>
					<h3 className="mt-4 text-base font-semibold text-gray-900">All customer questions answered!</h3>
					<p className="mt-1.5 max-w-md text-xs leading-relaxed text-gray-500 sm:text-sm">
						Your AI assistant has enough trained knowledge to handle all recent customer inquiries. When a new question falls below your confidence threshold, it will appear here for you to train in 1 click.
					</p>
				</div>
			)}

			{/* Gaps List */}
			{!isLoading && !isError && gaps.length > 0 && (
				<div className="space-y-3">
					{gaps.map((gap) => {
						const isDismissing = dismissingId === gap.id;
						const isWhatsApp = gap.channel.toLowerCase().includes("whatsapp");
						const isTelegram = gap.channel.toLowerCase().includes("telegram");

						return (
							<div
								key={gap.id}
								className="group relative flex flex-col justify-between gap-4 rounded-xl border border-gray-200/90 bg-white p-4 shadow-xs transition-all hover:border-gray-300 hover:shadow-sm sm:flex-row sm:items-center sm:p-5"
							>
								{/* Left: Query & Metadata */}
								<div className="min-w-0 flex-1 space-y-2">
									<div className="flex items-start gap-2.5">
										<div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
											<HelpCircle className="h-4 w-4" />
										</div>
										<p className="text-sm font-semibold text-gray-900 sm:text-base">
											&ldquo;{gap.query}&rdquo;
										</p>
									</div>

									{/* Badges Ribbon */}
									<div className="flex flex-wrap items-center gap-2 pl-8 text-xs text-gray-500">
										{/* Channel */}
										<span
											className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
												isWhatsApp
													? "bg-emerald-50 text-emerald-800"
													: isTelegram
													? "bg-sky-50 text-sky-800"
													: "bg-gray-100 text-gray-700"
											}`}
										>
											{isWhatsApp ? (
												<MessageCircle className="h-3 w-3 text-emerald-600" />
											) : isTelegram ? (
												<Send className="h-3 w-3 text-sky-600" />
											) : (
												<Sparkles className="h-3 w-3 text-gray-500" />
											)}
											<span className="capitalize">{gap.channel}</span>
										</span>

										{/* Frequency */}
										{gap.occurrences > 1 && (
											<span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
												Asked {gap.occurrences} times
											</span>
										)}

										{/* Timestamp */}
										<span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
											<Clock className="h-3 w-3" />
											{formatTimeAgo(gap.last_asked_at)}
										</span>

										{/* Confidence */}
										{gap.ai_confidence > 0 && (
											<span className="text-[11px] text-gray-400">
												Confidence: {(gap.ai_confidence * 100).toFixed(0)}%
											</span>
										)}
									</div>
								</div>

								{/* Right: Actions */}
								<div className="flex items-center gap-2 self-end pl-8 sm:self-center sm:pl-0">
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => handleDismiss(gap.id)}
										disabled={isDismissing || isSubmitting}
										className="h-9 px-2.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-700"
										title="Dismiss question"
									>
										{isDismissing ? (
											<Loader2 className="h-3.5 w-3.5 animate-spin" />
										) : (
											<Trash2 className="h-4 w-4" />
										)}
									</Button>

									<Button
										type="button"
										size="sm"
										disabled={!canManageChannels || isSubmitting}
										onClick={() => openTeachModal(gap)}
										className="h-9 gap-1.5 rounded-lg bg-[#163300] px-3.5 text-xs font-semibold text-[#9fe870] shadow-xs hover:bg-[#1f4700]"
									>
										<span>Teach Assistant</span>
										<ArrowRight className="h-3.5 w-3.5" />
									</Button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Teach Modal */}
			<Dialog open={!!activeGap} onOpenChange={(open) => !open && closeTeachModal()}>
				<DialogContent className="max-w-lg p-6">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-base font-bold text-gray-900 sm:text-lg">
							<Sparkles className="h-5 w-5 text-emerald-600" />
							<span>Teach Your Assistant</span>
						</DialogTitle>
						<DialogDescription className="text-xs text-gray-500 sm:text-sm">
							Add this answer to your knowledge base so future customers asking this will receive an instant, accurate response.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleResolve} className="mt-4 space-y-4">
						{/* Category */}
						<div>
							<label className="block text-xs font-semibold text-gray-700">
								Knowledge Category
							</label>
							<select
								value={category}
								onChange={(e) => setCategory(e.target.value)}
								className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-900 shadow-xs focus:border-[#163300] focus:ring-1 focus:ring-[#163300]"
							>
								{CATEGORY_OPTIONS.map((cat) => (
									<option key={cat.value} value={cat.value}>
										{cat.label}
									</option>
								))}
							</select>
						</div>

						{/* Question */}
						<div>
							<label className="block text-xs font-semibold text-gray-700">
								Question or Topic
							</label>
							<Input
								value={question}
								onChange={(e) => setQuestion(e.target.value)}
								placeholder="e.g. Do you deliver to Port Harcourt?"
								className="mt-1.5 h-9 text-xs"
								required
							/>
						</div>

						{/* Answer */}
						<div>
							<label className="block text-xs font-semibold text-gray-700">
								Your Answer / Business Policy
							</label>
							<textarea
								rows={4}
								value={answer}
								onChange={(e) => setAnswer(e.target.value)}
								placeholder="e.g. Yes, we deliver nationwide. Delivery to Port Harcourt takes 2-3 business days and costs ₦4,500 via GIG Logistics."
								className="mt-1.5 w-full rounded-lg border border-gray-200 p-3 text-xs text-gray-900 shadow-xs focus:border-[#163300] focus:ring-1 focus:ring-[#163300]"
								required
							/>
							<p className="mt-1 text-[11px] text-gray-400">
								Keep it clear and factual. Your assistant will adapt the tone dynamically when replying to customers.
							</p>
						</div>

						<DialogFooter className="mt-6 flex flex-row items-center justify-end gap-2 pt-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={closeTeachModal}
								disabled={isSubmitting}
								className="h-9 text-xs"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								size="sm"
								disabled={isSubmitting || !question.trim() || !answer.trim()}
								className="h-9 gap-1.5 bg-[#163300] text-xs font-semibold text-[#9fe870] hover:bg-[#1f4700]"
							>
								{isSubmitting ? (
									<>
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
										<span>Saving &amp; Training...</span>
									</>
								) : (
									<>
										<Sparkles className="h-3.5 w-3.5" />
										<span>Publish &amp; Resolve</span>
									</>
								)}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}

