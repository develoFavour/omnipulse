"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
	AlertCircle,
	BrainCircuit,
	Check,
	CheckCircle2,
	FileText,
	Loader2,
	RefreshCw,
	Trash2,
	UploadCloud,
	Library,
	FolderOpen,
	Sparkles,
	Search,
	FileCode,
	Zap,
	ShieldCheck,
	Layers,
	ChevronDown,
	ChevronUp,
	FileUp,
	AlignLeft,
	ArrowRight,
	Bot,
	Filter,
	Cpu,
	Plus,
	HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	useKnowledgeIngestionActions,
	useKnowledgeIngestionJob,
} from "@/lib/api/hooks";
import { useKnowledgeGaps } from "@/lib/api/hooks/useKnowledgeGaps";
import {
	aiAgentService,
	type AIKnowledgeItem,
} from "@/lib/services/ai-agent.service";
import { extractErrorMessage } from "@/lib/api/response";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { AIAssistanceToggle } from "@/components/features/ai/AIAssistanceToggle";
import { KnowledgeLibrary } from "@/components/features/ai/KnowledgeLibrary";
import { AISimulatorPlayground } from "@/components/features/ai/AISimulatorPlayground";
import { KnowledgeGapsList } from "@/components/features/ai/KnowledgeGapsList";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES =
	".pdf,.docx,.txt,.md,.csv,.png,.jpg,.jpeg,.tif,.tiff,.bmp";
const CATEGORY_OPTIONS = [
	"faq",
	"pricing",
	"product",
	"policy",
	"hours",
] as const;

type ActiveTab = "training" | "simulator" | "library" | "documents" | "gaps";

type DraftItem = AIKnowledgeItem & {
	draftId: string;
	showExcerpt?: boolean;
	isSelected?: boolean;
};

function toDraftItems(items: AIKnowledgeItem[] = []): DraftItem[] {
	return items.map((item, index) => ({
		...item,
		draftId: item.id ?? `${item.category}-${index}-${Date.now()}`,
		is_active: true,
		isSelected: true,
		showExcerpt: false,
	}));
}

export default function AIAssistantPage() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { canManageChannels, isLoading: isPermissionsLoading } =
		usePermissions();
	const { total: gapsCount } = useKnowledgeGaps("pending");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const loadedJobRef = useRef<string | null>(null);
	const discardedJobIdsRef = useRef<Set<string>>(new Set());

	const [activeTab, setActiveTab] = useState<ActiveTab>("training");
	const [jobId, setJobId] = useState<string | null>(null);
	const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [isDragging, setIsDragging] = useState(false);

	// Paste text mode
	const [ingestMode, setIngestMode] = useState<"upload" | "paste">("upload");
	const [pasteTitle, setPasteTitle] = useState("");
	const [pasteContent, setPasteContent] = useState("");

	// Filter & Search inside review items
	const [reviewCategoryFilter, setReviewCategoryFilter] = useState<string>("all");
	const [reviewSearchQuery, setReviewSearchQuery] = useState("");

	useEffect(() => {
		const requestedJobId = searchParams.get("job");
		if (
			requestedJobId &&
			requestedJobId !== jobId &&
			!discardedJobIdsRef.current.has(requestedJobId)
		) {
			setJobId(requestedJobId);
			setDraftItems([]);
			loadedJobRef.current = null;
			setActiveTab("training");
		}
	}, [jobId, searchParams]);

	const {
		uploadDocument,
		uploadText,
		approveItems,
		isUploading,
		error: actionError,
	} = useKnowledgeIngestionActions();

	const {
		job,
		isLoading: isJobLoading,
		isError: isJobError,
		refetch: refetchJob,
	} = useKnowledgeIngestionJob(jobId);

	useEffect(() => {
		if (
			job?.status === "ready" &&
			loadedJobRef.current !== job.id &&
			!discardedJobIdsRef.current.has(job.id)
		) {
			loadedJobRef.current = job.id;
			const timer = window.setTimeout(
				() => setDraftItems(toDraftItems(job.items)),
				0,
			);
			return () => window.clearTimeout(timer);
		}
	}, [job]);

	const activeJob = Boolean(
		job &&
			!discardedJobIdsRef.current.has(job.id) &&
			(job.status === "queued" || job.status === "processing"),
	);
	const canReview = Boolean(
		job &&
			!discardedJobIdsRef.current.has(job.id) &&
			job.status === "ready" &&
			draftItems.length > 0,
	);

	// Filtered drafts in review
	const filteredDrafts = useMemo(() => {
		return draftItems.filter((item) => {
			const matchesCat =
				reviewCategoryFilter === "all" || item.category === reviewCategoryFilter;
			const query = reviewSearchQuery.toLowerCase().trim();
			const matchesSearch =
				!query ||
				item.question_or_topic.toLowerCase().includes(query) ||
				item.answer_or_content.toLowerCase().includes(query);
			return matchesCat && matchesSearch;
		});
	}, [draftItems, reviewCategoryFilter, reviewSearchQuery]);

	// Category counts
	const categoryCounts = useMemo(() => {
		const counts: Record<string, number> = { all: draftItems.length };
		for (const it of draftItems) {
			const cat = it.category || "faq";
			counts[cat] = (counts[cat] || 0) + 1;
		}
		return counts;
	}, [draftItems]);

	if (isPermissionsLoading) {
		return (
			<div className="flex h-96 w-full flex-col items-center justify-center gap-3">
				<Loader2 className="h-8 w-8 animate-spin text-[#163300]" />
				<p className="text-sm font-medium text-gray-500">
					Loading AI Assistant...
				</p>
			</div>
		);
	}

	if (!canManageChannels) {
		return (
			<main className="mx-auto max-w-5xl p-6 lg:p-10">
				<Card className="border-amber-200 bg-amber-50/50">
					<CardContent className="flex items-start gap-3.5 p-6">
						<AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
						<div>
							<h1 className="font-semibold text-gray-900">
								AI Assistant Knowledge Base
							</h1>
							<p className="mt-1 text-sm text-gray-600">
								Only workspace owners and administrators have permission to train
								and manage the autonomous business assistant.
							</p>
						</div>
					</CardContent>
				</Card>
			</main>
		);
	}

	async function handleUpload(file: File) {
		if (file.size > MAX_FILE_SIZE) {
			toast.error(
				"This file is too large. Please upload a file no larger than 10 MB.",
			);
			return;
		}

		try {
			const accepted = await uploadDocument(file);
			setJobId(accepted.job_id);
			setDraftItems([]);
			toast.success(
				"Document submitted. Background pipeline is extracting knowledge items.",
			);
		} catch (error) {
			toast.error(
				extractErrorMessage(
					error,
					"The document could not be uploaded. Please try again.",
				),
			);
		}
	}

	async function handlePasteSubmit() {
		if (!pasteContent.trim()) {
			toast.error("Please enter some text or notes to extract knowledge from.");
			return;
		}
		try {
			const accepted = await uploadText(
				pasteContent.trim(),
				pasteTitle.trim() || "Pasted Knowledge Notes",
			);
			setJobId(accepted.job_id);
			setDraftItems([]);
			setPasteContent("");
			setPasteTitle("");
			toast.success(
				"Content submitted. Background worker is analyzing and chunking items.",
			);
		} catch (error) {
			toast.error(
				extractErrorMessage(
					error,
					"Failed to process text. Please try again.",
				),
			);
		}
	}

	function updateDraft(draftId: string, update: Partial<DraftItem>) {
		setDraftItems((items) =>
			items.map((item) =>
				item.draftId === draftId ? { ...item, ...update } : item,
			),
		);
	}

	function removeDraft(draftId: string) {
		setDraftItems((items) => items.filter((d) => d.draftId !== draftId));
		toast.info("Item discarded from review queue.");
	}

	function handleDiscardAll() {
		if (jobId) {
			discardedJobIdsRef.current.add(jobId);
		}
		if (job?.id) {
			discardedJobIdsRef.current.add(job.id);
		}
		setDraftItems([]);
		setJobId(null);
		loadedJobRef.current = null;

		// Clear query parameter from the browser URL so it doesn't re-trigger loading
		const params = new URLSearchParams(searchParams.toString());
		params.delete("job");
		const newQuery = params.toString();
		router.replace(newQuery ? `${pathname}?${newQuery}` : pathname, { scroll: false });

		toast.info("Staged knowledge items have been discarded.");
	}

	async function handleApproveAll() {
		const validItems = draftItems.filter(
			(item) => item.question_or_topic.trim() && item.answer_or_content.trim(),
		);
		if (!validItems.length) {
			toast.error("Add a topic and answer to at least one item before saving.");
			return;
		}

		setIsSaving(true);
		try {
			await approveItems(
				validItems.map((item) => ({
					id: item.id,
					tenant_id: item.tenant_id,
					question_or_topic: item.question_or_topic,
					answer_or_content: item.answer_or_content,
					source_document: item.source_document,
					source_section: item.source_section,
					source_excerpt: item.source_excerpt,
					category: item.category || "faq",
					is_active: true,
				})),
			);
			toast.success(
				`${validItems.length} knowledge items published and activated for your assistant.`,
			);
			if (jobId) {
				discardedJobIdsRef.current.add(jobId);
			}
			if (job?.id) {
				discardedJobIdsRef.current.add(job.id);
			}
			setDraftItems([]);
			setJobId(null);
			loadedJobRef.current = null;

			// Clear query parameter
			const params = new URLSearchParams(searchParams.toString());
			params.delete("job");
			const newQuery = params.toString();
			router.replace(newQuery ? `${pathname}?${newQuery}` : pathname, { scroll: false });
		} catch (error) {
			toast.error(
				extractErrorMessage(
					error,
					"The reviewed knowledge could not be saved. Please try again.",
				),
			);
		} finally {
			setIsSaving(false);
		}
	}

	if (isPermissionsLoading) {
		return (
			<div className="flex h-[60vh] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-[#163300]" />
			</div>
		);
	}

	return (
		<main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-10">
			{/* Top Executive Header */}
			<header className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
					<div className="space-y-2">
						<div className="flex flex-wrap items-center gap-2.5">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#163300] text-[#9fe870] shadow-sm">
								<BrainCircuit className="h-6 w-6" />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
										AI Business Assistant
									</h1>
									<span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
										<span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
										Active Assistant
									</span>
								</div>
								<p className="text-xs text-gray-500 sm:text-sm">
									Autonomous customer support &amp; messaging across WhatsApp &amp; Telegram powered by your business knowledge.
								</p>
							</div>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-3">
						<div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/80 px-3.5 py-2 text-xs font-medium text-gray-700">
							<Sparkles className="h-4 w-4 text-[#163300]" />
							<span>Engine:</span>
							<strong className="text-emerald-700">Powered by Gemini &amp; Groq</strong>
						</div>
						<div className="w-full sm:w-auto">
							<AIAssistanceToggle compact />
						</div>
					</div>
				</div>

				{/* High-Level Feature KPI Badges */}
				<div className="mt-6 grid grid-cols-2 gap-3 border-t border-gray-100 pt-5 sm:grid-cols-4">
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e2f6d5] text-[#163300]">
							<ShieldCheck className="h-4 w-4" />
						</div>
						<div className="min-w-0">
							<p className="text-[11px] font-medium text-gray-500">AI Intelligence</p>
							<p className="truncate text-xs font-semibold text-gray-900">Powered by Gemini &amp; Groq</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
							<Zap className="h-4 w-4" />
						</div>
						<div className="min-w-0">
							<p className="text-[11px] font-medium text-gray-500">Knowledge Matching</p>
							<p className="truncate text-xs font-semibold text-gray-900">Smart Context Retrieval</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
							<Layers className="h-4 w-4" />
						</div>
						<div className="min-w-0">
							<p className="text-[11px] font-medium text-gray-500">Human Handover</p>
							<p className="truncate text-xs font-semibold text-gray-900">Auto-Transfers Complex Chats</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
							<Sparkles className="h-4 w-4" />
						</div>
						<div className="min-w-0">
							<p className="text-[11px] font-medium text-gray-500">Lead Extraction</p>
							<p className="truncate text-xs font-semibold text-gray-900">Auto-Captures Contacts</p>
						</div>
					</div>
				</div>
			</header>

			{/* Agency Command Center Navigation Tabs */}
			<div className="flex overflow-x-auto rounded-xl border border-gray-200 bg-gray-100/70 p-1 text-sm font-semibold text-gray-600">
				<button
					type="button"
					onClick={() => setActiveTab("training")}
					className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
						activeTab === "training"
							? "bg-white text-gray-900 shadow-sm"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					<FileUp className="h-4 w-4 text-[#163300]" />
					<span>Training & Ingestion</span>
					{canReview && (
						<span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white animate-pulse">
							{draftItems.length} ready
						</span>
					)}
				</button>

				<button
					type="button"
					onClick={() => setActiveTab("simulator")}
					className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
						activeTab === "simulator"
							? "bg-white text-gray-900 shadow-sm"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					<Sparkles className="h-4 w-4 text-emerald-600" />
					<span>AI Sandbox Playground</span>
				</button>

				<button
					type="button"
					onClick={() => setActiveTab("library")}
					className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
						activeTab === "library"
							? "bg-white text-gray-900 shadow-sm"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					<Library className="h-4 w-4 text-gray-500" />
					<span>Knowledge Base</span>
				</button>

				<button
					type="button"
					onClick={() => setActiveTab("documents")}
					className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
						activeTab === "documents"
							? "bg-white text-gray-900 shadow-sm"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					<FolderOpen className="h-4 w-4 text-gray-500" />
					<span>Document Vault</span>
				</button>

				<button
					type="button"
					onClick={() => setActiveTab("gaps")}
					className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
						activeTab === "gaps"
							? "bg-white text-gray-900 shadow-sm"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					<HelpCircle className="h-4 w-4 text-amber-600" />
					<span>Unanswered Gaps</span>
					{gapsCount > 0 && (
						<span className="rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white">
							{gapsCount}
						</span>
					)}
				</button>
			</div>

			{/* ============================================================ */}
			{/* TAB 1: TRAINING & INGESTION                                  */}
			{/* ============================================================ */}
			{activeTab === "training" && (
				<div className="space-y-6">
					{/* Upload & Pipeline Staging Grid */}
					<div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
						{/* Left: Interactive Ingestion Dropzone & Paste Box */}
						<Card className="border-gray-200 shadow-sm">
							<CardHeader className="border-b border-gray-100 pb-4">
								<div className="flex items-center justify-between">
									<div>
										<CardTitle className="text-base font-semibold text-gray-900">
											Ingest Business Knowledge
										</CardTitle>
										<CardDescription className="text-xs">
											Extract structured Q&amp;As, pricing, policies, and hours automatically.
										</CardDescription>
									</div>
									<div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-xs font-semibold">
										<button
											type="button"
											onClick={() => setIngestMode("upload")}
											className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 ${
												ingestMode === "upload"
													? "bg-white text-gray-900 shadow-sm"
													: "text-gray-500 hover:text-gray-900"
											}`}
										>
											<UploadCloud className="h-3.5 w-3.5" />
											Upload Document
										</button>
										<button
											type="button"
											onClick={() => setIngestMode("paste")}
											className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 ${
												ingestMode === "paste"
													? "bg-white text-gray-900 shadow-sm"
													: "text-gray-500 hover:text-gray-900"
											}`}
										>
											<AlignLeft className="h-3.5 w-3.5" />
											Paste Text
										</button>
									</div>
								</div>
							</CardHeader>

							<CardContent className="p-5">
								{ingestMode === "upload" ? (
									<div>
										<div
											onDragOver={(e) => {
												e.preventDefault();
												setIsDragging(true);
											}}
											onDragLeave={() => setIsDragging(false)}
											onDrop={(e) => {
												e.preventDefault();
												setIsDragging(false);
												const file = e.dataTransfer.files?.[0];
												if (file) void handleUpload(file);
											}}
											onClick={() => fileInputRef.current?.click()}
											className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
												isDragging
													? "border-[#163300] bg-[#f8fcf5] scale-[0.99]"
													: "border-gray-200 bg-gray-50/60 hover:border-[#9fe870] hover:bg-[#f8fcf5]"
											} ${isUploading || activeJob ? "pointer-events-none opacity-60" : ""}`}
										>
											{isUploading ? (
												<div className="flex flex-col items-center gap-2">
													<Loader2 className="h-9 w-9 animate-spin text-[#163300]" />
													<p className="text-sm font-semibold text-gray-900">
														Uploading &amp; queueing document…
													</p>
													<p className="text-xs text-gray-500">
														Transferring to durable NATS pipeline
													</p>
												</div>
											) : (
												<>
													<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e2f6d5] text-[#163300] shadow-sm">
														<UploadCloud className="h-6 w-6" />
													</div>
													<p className="text-sm font-semibold text-gray-900">
														Drag &amp; drop document or{" "}
														<span className="text-[#163300] underline underline-offset-2">
															browse
														</span>
													</p>
													<p className="mt-1 text-xs text-gray-500">
														Supports PDF, DOCX, TXT, CSV, MD, or scanned images (up to 10 MB)
													</p>

													<div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
														{["PDF", "Word (.docx)", "Markdown", "CSV", "OCR Images"].map(
															(fmt) => (
																<span
																	key={fmt}
																	className="rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600 shadow-2xs"
																>
																	{fmt}
																</span>
															),
														)}
													</div>
												</>
											)}
											<input
												ref={fileInputRef}
												type="file"
												accept={ACCEPTED_FILE_TYPES}
												className="hidden"
												onChange={(e) => {
													const file = e.target.files?.[0];
													if (file) void handleUpload(file);
													e.target.value = "";
												}}
											/>
										</div>

										{actionError && (
											<div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">
												<AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
												<span>{actionError}</span>
											</div>
										)}
									</div>
								) : (
									/* Paste Text Directly */
									<div className="space-y-3">
										<div>
											<label className="block text-xs font-semibold text-gray-700">
												Topic or Document Title (Optional)
											</label>
											<Input
												value={pasteTitle}
												onChange={(e) => setPasteTitle(e.target.value)}
												placeholder="e.g. Return Policy 2026, Holiday Promo, Lagos Delivery Notes"
												className="mt-1 text-xs"
											/>
										</div>
										<div>
											<label className="block text-xs font-semibold text-gray-700">
												Knowledge Content / FAQ Text
											</label>
											<textarea
												rows={6}
												value={pasteContent}
												onChange={(e) => setPasteContent(e.target.value)}
												placeholder="Paste raw customer service FAQs, delivery fees, business hours, bank account numbers, or agency policies here..."
												className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-xs leading-relaxed text-gray-900 outline-none focus:border-[#9fe870] focus:bg-white"
											/>
										</div>
										<div className="flex justify-end">
											<Button
												onClick={() => void handlePasteSubmit()}
												disabled={isUploading || !pasteContent.trim()}
												className="bg-[#163300] hover:bg-[#163300]/90 text-xs"
											>
												{isUploading ? (
													<Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
												) : (
													<Sparkles className="mr-2 h-3.5 w-3.5" />
												)}
												Extract Knowledge Items
											</Button>
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Right: Real-time Ingestion Stepper & Pipeline Status */}
						<Card className="border-gray-200 shadow-sm">
							<CardHeader className="border-b border-gray-100 pb-4">
								<CardTitle className="text-base font-semibold text-gray-900">
									Processing &amp; Vector Pipeline
								</CardTitle>
								<CardDescription className="text-xs">
									Automated background pipeline powered by NATS JetStream &amp; Gemini.
								</CardDescription>
							</CardHeader>
							<CardContent className="p-5">
								{!jobId ? (
									/* Idle State with Feature Overview */
									<div className="flex min-h-[220px] flex-col justify-center space-y-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4 text-xs">
										<p className="font-semibold text-gray-800">
											How Knowledge Ingestion Works:
										</p>
										<div className="space-y-2 text-gray-600">
											<div className="flex items-start gap-2">
												<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#163300] text-[10px] font-bold text-white">
													1
												</span>
												<p>
													<strong>Document Normalization:</strong> Raw files (PDF, DOCX, Images via OCR) are converted into structured text.
												</p>
											</div>
											<div className="flex items-start gap-2">
												<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#163300] text-[10px] font-bold text-white">
													2
												</span>
												<p>
													<strong>AI Fact Extraction:</strong> Content is analyzed and structured into clear Q&amp;As.
												</p>
											</div>
											<div className="flex items-start gap-2">
												<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#163300] text-[10px] font-bold text-white">
													3
												</span>
												<p>
													<strong>Smart Search Indexing:</strong> Knowledge is indexed for lightning-fast matching and contextual answers.
												</p>
											</div>
											<div className="flex items-start gap-2">
												<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
													4
												</span>
												<p>
													<strong>Human Gatekeeper:</strong> Nothing is published until your team reviews and approves it.
												</p>
											</div>
										</div>
									</div>
								) : isJobLoading && !job ? (
									<div className="flex min-h-[220px] flex-col items-center justify-center text-center">
										<Loader2 className="h-8 w-8 animate-spin text-[#163300]" />
										<p className="mt-3 text-sm font-semibold text-gray-800">
											Checking pipeline status…
										</p>
									</div>
								) : isJobError ? (
									<div className="flex min-h-[220px] flex-col items-center justify-center text-center">
										<AlertCircle className="h-8 w-8 text-red-500" />
										<p className="mt-2 text-sm font-semibold text-gray-800">
											Could not load job status
										</p>
										<Button
											variant="outline"
											size="sm"
											className="mt-3 text-xs"
											onClick={() => void refetchJob()}
										>
											<RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Try again
										</Button>
									</div>
								) : job ? (
									/* Active / Finished Job Pipeline Stepper */
									<div className="space-y-4">
										<div className="flex items-center justify-between rounded-xl bg-gray-50 p-3.5 border border-gray-200/70">
											<div className="flex items-center gap-3">
												<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e2f6d5] text-[#163300]">
													<FileText className="h-5 w-5" />
												</div>
												<div className="min-w-0">
													<p className="truncate text-sm font-semibold text-gray-900 max-w-[190px] sm:max-w-[280px]">
														{job.filename}
													</p>
													<p className="text-xs text-gray-500">
														Submitted {new Date(job.created_at).toLocaleTimeString()}
													</p>
												</div>
											</div>
											<span
												className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
													job.status === "ready"
														? "bg-emerald-50 text-emerald-700 border border-emerald-200"
														: job.status === "failed"
															? "bg-red-50 text-red-700 border border-red-200"
															: "bg-amber-50 text-amber-700 border border-amber-200"
												}`}
											>
												{job.status === "ready"
													? "Ready for Review"
													: job.status === "processing"
														? "Processing…"
														: job.status === "queued"
															? "Queued for Processing"
															: "Failed"}
											</span>
										</div>

										{/* Multi-Step Pipeline Indicator */}
										<div className="space-y-2.5 rounded-xl border border-gray-100 bg-white p-3.5 text-xs">
											<div className="flex items-center gap-2.5">
												<CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
												<span className="font-medium text-gray-800">
													1. Document uploaded &amp; text normalized
												</span>
											</div>
											<div className="flex items-center gap-2.5">
												{activeJob ? (
													<Loader2 className="h-4 w-4 animate-spin text-[#163300] shrink-0" />
												) : job.status === "ready" ? (
													<CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
												) : (
													<AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
												)}
												<span
													className={
														activeJob
															? "font-semibold text-[#163300]"
															: "font-medium text-gray-800"
													}
												>
													2. AI content analysis &amp; Q&amp;A extraction
												</span>
											</div>
											<div className="flex items-center gap-2.5">
												{job.status === "ready" ? (
													<CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
												) : activeJob ? (
													<span className="h-4 w-4 rounded-full border border-gray-300 shrink-0" />
												) : (
													<span className="h-4 w-4 rounded-full border border-gray-300 shrink-0" />
												)}
												<span className="text-gray-600">
													3. Instant search indexing &amp; verification
												</span>
											</div>
										</div>

										{activeJob && (
											<p className="text-xs text-gray-500 leading-relaxed">
												Background workers are processing your content in the cloud. You can leave this page
												or browse other tabs; we will notify you when it finishes.
											</p>
										)}

										{job.status === "failed" && (
											<div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
												<strong>Processing Error: </strong>
												{job.error_message ||
													"Could not extract discrete facts. Please upload a clearer text or PDF file."}
											</div>
										)}

										{job.status === "ready" && (
											<div className="flex items-center justify-between rounded-xl bg-emerald-50/70 p-3 border border-emerald-200/80">
												<p className="text-xs font-semibold text-emerald-900">
													{draftItems.length} items extracted and ready for review.
												</p>
												<div className="flex items-center gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={handleDiscardAll}
														disabled={isSaving}
														className="text-xs h-8 text-red-600 hover:bg-red-50 hover:text-red-700"
													>
														<Trash2 className="mr-1.5 h-3.5 w-3.5" />
														Discard
													</Button>
													<Button
														size="sm"
														onClick={() => void handleApproveAll()}
														disabled={isSaving || !draftItems.length}
														className="bg-[#163300] hover:bg-[#163300]/90 text-xs h-8"
													>
														{isSaving ? (
															<Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
														) : (
															<Check className="mr-1.5 h-3.5 w-3.5" />
														)}
														Publish All
													</Button>
												</div>
											</div>
										)}
									</div>
								) : null}
							</CardContent>
						</Card>
					</div>

					{/* ============================================================ */}
					{/* REVIEW STAGED KNOWLEDGE SECTION                             */}
					{/* ============================================================ */}
					{canReview && (
						<Card className="border-gray-200 shadow-sm">
							<CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
								<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
									<div>
										<div className="flex items-center gap-2">
											<CardTitle className="text-base font-semibold text-gray-900">
												Review &amp; Curate Staged Knowledge
											</CardTitle>
											<span className="rounded-full bg-[#e2f6d5] px-2.5 py-0.5 text-xs font-bold text-[#163300]">
												{filteredDrafts.length} of {draftItems.length} items
											</span>
										</div>
										<CardDescription className="text-xs">
											Edit, approve, or discard extracted facts before they are activated for your live assistant.
										</CardDescription>
									</div>

									{/* Action buttons */}
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={handleDiscardAll}
											className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
										>
											<Trash2 className="mr-1.5 h-3.5 w-3.5" />
											Discard All
										</Button>
										<Button
											size="sm"
											onClick={() => void handleApproveAll()}
											disabled={isSaving || !draftItems.length}
											className="bg-[#163300] hover:bg-[#163300]/90 text-xs"
										>
											{isSaving ? (
												<Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
											) : (
												<Check className="mr-1.5 h-3.5 w-3.5" />
											)}
											Approve &amp; Publish ({draftItems.length})
										</Button>
									</div>
								</div>

								{/* Category Filter Pills & Search */}
								<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
									<div className="flex flex-wrap items-center gap-1.5">
										{["all", ...CATEGORY_OPTIONS].map((cat) => {
											const count = categoryCounts[cat] || 0;
											return (
												<button
													key={cat}
													type="button"
													onClick={() => setReviewCategoryFilter(cat)}
													className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition ${
														reviewCategoryFilter === cat
															? "bg-[#163300] text-white"
															: "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
													}`}
												>
													<span>{cat}</span>
													<span
														className={`rounded-full px-1.5 py-0.2 text-[10px] ${
															reviewCategoryFilter === cat
																? "bg-white/20 text-white"
																: "bg-gray-100 text-gray-500"
														}`}
													>
														{count}
													</span>
												</button>
											);
										})}
									</div>

									<div className="relative w-full sm:w-64">
										<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
										<Input
											value={reviewSearchQuery}
											onChange={(e) => setReviewSearchQuery(e.target.value)}
											placeholder="Search drafted items..."
											className="h-8 pl-8 text-xs bg-white"
										/>
									</div>
								</div>
							</CardHeader>

							<CardContent className="p-5">
								<div className="grid gap-4 md:grid-cols-2">
									{filteredDrafts.map((item, idx) => (
										<div
											key={item.draftId}
											className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-xs"
										>
											<div className="space-y-3">
												{/* Category & Discard Header */}
												<div className="flex items-center justify-between gap-2">
													<div className="flex items-center gap-2">
														<span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
															{idx + 1}
														</span>
														<select
															value={item.category}
															onChange={(e) =>
																updateDraft(item.draftId, {
																	category: e.target.value,
																})
															}
															className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold capitalize text-gray-700 outline-none focus:border-[#9fe870]"
														>
															{CATEGORY_OPTIONS.map((c) => (
																<option key={c} value={c}>
																	{c}
																</option>
															))}
														</select>
													</div>

													<button
														type="button"
														onClick={() => removeDraft(item.draftId)}
														className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
														title="Discard suggestion"
													>
														<Trash2 className="h-4 w-4" />
													</button>
												</div>

												{/* Provenance source badge */}
												{item.source_document && (
													<div className="rounded-lg border border-[#dcebd2] bg-[#f8fcf5] px-3 py-1.5 text-[11px] text-gray-600">
														<div className="flex items-center justify-between">
															<span className="font-semibold text-[#163300] truncate max-w-[200px]">
																Source: {item.source_document}
																{item.source_section ? ` · ${item.source_section}` : ""}
															</span>
															{item.source_excerpt && (
																<button
																	type="button"
																	onClick={() =>
																		updateDraft(item.draftId, {
																			showExcerpt: !item.showExcerpt,
																		})
																	}
																	className="text-[10px] font-semibold text-[#163300] hover:underline"
																>
																	{item.showExcerpt ? "Hide Excerpt" : "View Excerpt"}
																</button>
															)}
														</div>
														{item.showExcerpt && item.source_excerpt && (
															<p className="mt-1 border-t border-[#dcebd2] pt-1 text-[11px] text-gray-500 italic leading-relaxed">
																&ldquo;{item.source_excerpt}&rdquo;
															</p>
														)}
													</div>
												)}

												{/* Topic input */}
												<div>
													<label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
														Question or Topic
													</label>
													<Input
														value={item.question_or_topic}
														onChange={(e) =>
															updateDraft(item.draftId, {
																question_or_topic: e.target.value,
															})
														}
														className="text-xs font-semibold text-gray-900 bg-gray-50/50 focus:bg-white"
													/>
												</div>

												{/* Answer textarea */}
												<div>
													<label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
														Answer or Business Content
													</label>
													<textarea
														rows={3}
														value={item.answer_or_content}
														onChange={(e) =>
															updateDraft(item.draftId, {
																answer_or_content: e.target.value,
															})
														}
														className="w-full resize-y rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-800 outline-none focus:border-[#9fe870] focus:bg-white"
													/>
												</div>
											</div>
										</div>
									))}
								</div>

								{filteredDrafts.length === 0 && (
									<div className="py-12 text-center text-xs text-gray-500">
										No items matched your category filter or search query.
									</div>
								)}
							</CardContent>
						</Card>
					)}
				</div>
			)}

			{/* ============================================================ */}
			{/* TAB 2: AI SANDBOX PLAYGROUND                                 */}
			{/* ============================================================ */}
			{activeTab === "simulator" && <AISimulatorPlayground />}

			{/* ============================================================ */}
			{/* TAB 3: KNOWLEDGE BASE LIBRARY                                */}
			{/* ============================================================ */}
			{activeTab === "library" && <KnowledgeLibrary />}

			{/* ============================================================ */}
			{/* TAB 4: DOCUMENT VAULT                                        */}
			{/* ============================================================ */}
			{activeTab === "documents" && (
				<Card className="border-gray-200 shadow-sm">
					<CardHeader className="border-b border-gray-100 pb-4">
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-base font-semibold">
									Historical Ingestions &amp; Document Vault
								</CardTitle>
								<CardDescription className="text-xs">
									Audit every document submitted for knowledge extraction.
								</CardDescription>
							</div>
							<Link
								href="/ai-assistant/documents"
								className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#163300] hover:underline"
							>
								Open Full Screen Vault <ArrowRight className="h-3.5 w-3.5" />
							</Link>
						</div>
					</CardHeader>
					<CardContent className="p-5">
						<p className="text-xs text-gray-600">
							Visit the{" "}
							<Link
								href="/ai-assistant/documents"
								className="font-semibold text-[#163300] underline"
							>
								Dedicated Document Vault
							</Link>{" "}
							to inspect raw timestamps, error logs, and re-review previous extraction jobs.
						</p>
					</CardContent>
				</Card>
			)}

			{/* ============================================================ */}
			{/* TAB 5: UNANSWERED KNOWLEDGE GAPS                             */}
			{/* ============================================================ */}
			{activeTab === "gaps" && <KnowledgeGapsList />}
		</main>
	);
}
