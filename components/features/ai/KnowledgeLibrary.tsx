"use client";

import { FormEvent, useMemo, useState } from "react";
import useSWR from "swr";
import {
	Archive,
	CheckSquare,
	ChevronLeft,
	ChevronRight,
	Edit3,
	FilePlus2,
	Loader2,
	Plus,
	RotateCcw,
	Search,
	Square,
	Trash2,
	X,
} from "lucide-react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { extractErrorMessage } from "@/lib/api/response";
import { usePermissions } from "@/lib/hooks/usePermissions";
import {
	aiAgentService,
	type AIKnowledgeItem,
	type KnowledgePage,
} from "@/lib/services/ai-agent.service";

const PAGE_SIZE = 25;
const CATEGORY_OPTIONS = [
	"faq",
	"pricing",
	"product",
	"policy",
	"hours",
] as const;

type KnowledgeForm = {
	category: string;
	question_or_topic: string;
	answer_or_content: string;
};

const EMPTY_FORM: KnowledgeForm = {
	category: "faq",
	question_or_topic: "",
	answer_or_content: "",
};

function formFromItem(item: AIKnowledgeItem): KnowledgeForm {
	return {
		category: item.category || "faq",
		question_or_topic: item.question_or_topic,
		answer_or_content: item.answer_or_content,
	};
}

export function KnowledgeLibrary() {
	const { canManageChannels } = usePermissions();
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("");
	const [offset, setOffset] = useState(0);

	// Create / Edit modal state
	const [editorOpen, setEditorOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<AIKnowledgeItem | null>(null);
	const [form, setForm] = useState<KnowledgeForm>(EMPTY_FORM);
	const [isSaving, setIsSaving] = useState(false);
	const [updatingId, setUpdatingId] = useState<string | null>(null);

	// Single Delete state
	const [deleteItem, setDeleteItem] = useState<AIKnowledgeItem | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	// Multi-select & Bulk Delete state
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
	const [isBulkDeleting, setIsBulkDeleting] = useState(false);

	const { data, error, isLoading, mutate } = useSWR<KnowledgePage>(
		["ai_knowledge_library", search, category, offset],
		() =>
			aiAgentService.listKnowledgeItems({
				search,
				category,
				limit: PAGE_SIZE,
				offset,
			}),
	);

	const items = useMemo(() => data?.items ?? [], [data?.items]);
	const total = data?.total ?? 0;
	const page = Math.floor(offset / PAGE_SIZE) + 1;

	// Multi-select helpers for visible items
	const visibleValidIds = useMemo(
		() => items.map((i) => i.id).filter(Boolean) as string[],
		[items],
	);

	const allVisibleSelected =
		visibleValidIds.length > 0 &&
		visibleValidIds.every((id) => selectedIds.includes(id));

	const someVisibleSelected =
		visibleValidIds.some((id) => selectedIds.includes(id)) &&
		!allVisibleSelected;

	function handleToggleSelectAll() {
		if (allVisibleSelected) {
			const toRemove = new Set(visibleValidIds);
			setSelectedIds((prev) => prev.filter((id) => !toRemove.has(id)));
		} else {
			setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleValidIds])));
		}
	}

	function handleToggleSelectItem(id: string) {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
		);
	}

	function handleClearSelection() {
		setSelectedIds([]);
	}

	function openCreate() {
		setEditingItem(null);
		setForm(EMPTY_FORM);
		setEditorOpen(true);
	}

	function openEdit(item: AIKnowledgeItem) {
		setEditingItem(item);
		setForm(formFromItem(item));
		setEditorOpen(true);
	}

	async function handleSave(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const topic = form.question_or_topic.trim();
		const answer = form.answer_or_content.trim();
		if (!topic || !answer) {
			toast.error("Add a topic and an answer before saving.");
			return;
		}
		setIsSaving(true);
		try {
			if (editingItem?.id) {
				await aiAgentService.updateKnowledgeItem(editingItem.id, {
					...editingItem,
					category: form.category,
					question_or_topic: topic,
					answer_or_content: answer,
				});
				toast.success("Knowledge item updated.");
			} else {
				await aiAgentService.createKnowledgeItem({
					category: form.category,
					question_or_topic: topic,
					answer_or_content: answer,
					is_active: true,
				});
				toast.success("Knowledge item published.");
				setOffset(0);
			}
			setEditorOpen(false);
			await mutate();
		} catch (saveError) {
			toast.error(
				extractErrorMessage(
					saveError,
					"The knowledge item could not be saved. Please try again.",
				),
			);
		} finally {
			setIsSaving(false);
		}
	}

	async function handleToggleActive(item: AIKnowledgeItem) {
		if (!item.id) return;
		setUpdatingId(item.id);
		try {
			await aiAgentService.updateKnowledgeItem(item.id, {
				...item,
				is_active: !item.is_active,
			});
			toast.success(
				item.is_active ? "Knowledge item archived." : "Knowledge item published.",
			);
			await mutate();
		} catch (updateError) {
			toast.error(
				extractErrorMessage(
					updateError,
					"The knowledge item status could not be updated.",
				),
			);
		} finally {
			setUpdatingId(null);
		}
	}

	async function handleDeleteSingle() {
		if (!deleteItem?.id) return;
		setIsDeleting(true);
		try {
			await aiAgentService.deleteKnowledgeItem(deleteItem.id);
			toast.success("Knowledge item permanently deleted.");
			setSelectedIds((prev) => prev.filter((id) => id !== deleteItem.id));
			setDeleteItem(null);
			if (items.length === 1 && offset > 0) {
				setOffset(Math.max(0, offset - PAGE_SIZE));
			}
			await mutate();
		} catch (deleteError) {
			toast.error(
				extractErrorMessage(
					deleteError,
					"The knowledge item could not be deleted.",
				),
			);
		} finally {
			setIsDeleting(false);
		}
	}

	async function handleBulkDelete() {
		if (!selectedIds.length) return;
		setIsBulkDeleting(true);
		try {
			const { succeeded, failed } =
				await aiAgentService.deleteKnowledgeItems(selectedIds);

			if (succeeded > 0) {
				toast.success(
					`${succeeded} knowledge ${succeeded === 1 ? "item" : "items"} permanently deleted.`,
				);
			}
			if (failed > 0) {
				toast.error(`Failed to delete ${failed} items. Please try again.`);
			}

			setSelectedIds([]);
			setBulkDeleteDialogOpen(false);

			if (items.length <= selectedIds.length && offset > 0) {
				setOffset(Math.max(0, offset - PAGE_SIZE));
			}
			await mutate();
		} catch (deleteError) {
			toast.error(
				extractErrorMessage(
					deleteError,
					"Failed to delete selected items. Please try again.",
				),
			);
		} finally {
			setIsBulkDeleting(false);
		}
	}

	return (
		<>
			<Card className="border-gray-200 shadow-sm">
				<CardHeader className="border-b border-gray-100">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<CardTitle className="text-base font-semibold text-gray-900">
								Knowledge Library
							</CardTitle>
							<CardDescription className="mt-1 text-xs">
								Manage verified answers available to your assistant. Use multi-select to quickly review and remove outdated facts.
							</CardDescription>
						</div>
						{canManageChannels && (
							<Button
								onClick={openCreate}
								className="bg-[#163300] text-[#9fe870] hover:bg-[#1f4700] text-xs h-9"
							>
								<Plus className="mr-1.5 h-4 w-4" /> Add Knowledge
							</Button>
						)}
					</div>

					{/* Search & Category Filter Controls */}
					<div className="flex flex-col gap-2.5 pt-3 sm:flex-row">
						<div className="relative flex-1">
							<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
							<Input
								className="pl-9 text-xs h-9"
								value={search}
								onChange={(event) => {
									setSearch(event.target.value);
									setOffset(0);
									setSelectedIds([]);
								}}
								placeholder="Search topics and answers…"
							/>
						</div>
						<select
							value={category}
							onChange={(event) => {
								setCategory(event.target.value);
								setOffset(0);
								setSelectedIds([]);
							}}
							className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 focus:border-[#163300] focus:outline-none"
						>
							<option value="">All categories</option>
							{CATEGORY_OPTIONS.map((option) => (
								<option key={option} value={option}>
									{option[0].toUpperCase() + option.slice(1)}
								</option>
							))}
						</select>
					</div>

					{/* Bulk Actions Floating Banner */}
					{selectedIds.length > 0 && canManageChannels && (
						<div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200/80 bg-red-50/70 p-3 shadow-xs animate-in fade-in slide-in-from-top-1">
							<div className="flex items-center gap-2.5">
								<span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-bold text-white">
									{selectedIds.length}
								</span>
								<span className="text-xs font-semibold text-red-950">
									{selectedIds.length === 1 ? "item selected" : "items selected"}
								</span>
							</div>

							<div className="flex items-center gap-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={handleClearSelection}
									className="h-8 text-xs text-gray-600 hover:text-gray-900"
								>
									<X className="mr-1 h-3.5 w-3.5" />
									Clear selection
								</Button>
								<Button
									variant="destructive"
									size="sm"
									onClick={() => setBulkDeleteDialogOpen(true)}
									className="h-8 bg-red-600 text-xs font-semibold text-white hover:bg-red-700 shadow-sm"
								>
									<Trash2 className="mr-1.5 h-3.5 w-3.5" />
									Delete Selected ({selectedIds.length})
								</Button>
							</div>
						</div>
					)}

					{/* Header summary and Select All row */}
					<div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-gray-500">
						<div className="flex items-center gap-2">
							{canManageChannels && items.length > 0 && (
								<label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 select-none hover:text-gray-900">
									<input
										type="checkbox"
										checked={allVisibleSelected}
										ref={(el) => {
											if (el) el.indeterminate = someVisibleSelected;
										}}
										onChange={handleToggleSelectAll}
										className="h-4 w-4 rounded border-gray-300 text-[#163300] focus:ring-[#9fe870] cursor-pointer"
									/>
									<span>Select all on this page ({items.length})</span>
								</label>
							)}
						</div>
						<div>
							{total} items · showing {total === 0 ? 0 : offset + 1}–
							{Math.min(offset + PAGE_SIZE, total)}
						</div>
					</div>
				</CardHeader>

				<CardContent className="pt-2">
					{isLoading ? (
						<div className="flex justify-center py-12">
							<Loader2 className="h-6 w-6 animate-spin text-[#163300]" />
						</div>
					) : error ? (
						<div className="py-10 text-center text-sm text-red-600">
							The knowledge library could not be loaded. Please try again.
						</div>
					) : !items.length ? (
						<div className="flex flex-col items-center gap-3 py-12 text-center">
							<FilePlus2 className="h-8 w-8 text-gray-300" />
							<p className="text-sm text-gray-500">No matching knowledge items found.</p>
							{canManageChannels && (
								<Button variant="outline" size="sm" onClick={openCreate} className="text-xs">
									<Plus className="mr-1.5 h-4 w-4" /> Add your first item
								</Button>
							)}
						</div>
					) : (
						<div className="divide-y divide-gray-100">
							{items.map((item) => {
								const isSelected = item.id ? selectedIds.includes(item.id) : false;
								return (
									<article
										key={item.id}
										className={`group py-4 transition-colors ${
											isSelected ? "bg-red-50/30 -mx-3 px-3 rounded-xl" : ""
										}`}
									>
										<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
											<div className="flex items-start gap-3 min-w-0 flex-1">
												{canManageChannels && item.id && (
													<div className="pt-0.5 shrink-0">
														<input
															type="checkbox"
															id={`select-item-${item.id}`}
															aria-label={`Select ${item.question_or_topic}`}
															checked={isSelected}
															onChange={() => handleToggleSelectItem(item.id!)}
															className="h-4 w-4 rounded border-gray-300 text-[#163300] focus:ring-[#9fe870] cursor-pointer"
														/>
													</div>
												)}
												<div className="min-w-0 flex-1">
													<div className="mb-1 flex flex-wrap items-center gap-2">
														<span className="rounded-full bg-[#e2f6d5] px-2 py-0.5 text-[11px] font-semibold capitalize text-[#163300]">
															{item.category}
														</span>
														<span
															className={`text-xs font-medium ${
																item.is_active ? "text-emerald-700" : "text-gray-400"
															}`}
														>
															{item.is_active ? "Published" : "Archived"}
														</span>
													</div>
													<h2 className="text-sm font-semibold text-gray-900 leading-snug">
														{item.question_or_topic}
													</h2>
													<p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-gray-600">
														{item.answer_or_content}
													</p>
												</div>
											</div>

											{/* Hover actions */}
											{canManageChannels && item.id && (
												<div className="flex shrink-0 items-center gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => openEdit(item)}
														className="h-8 text-xs text-gray-600 hover:text-gray-900"
														aria-label={`Edit ${item.question_or_topic}`}
													>
														<Edit3 className="mr-1 h-3.5 w-3.5" /> Edit
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleToggleActive(item)}
														disabled={updatingId === item.id}
														className="h-8 text-xs text-gray-600 hover:text-gray-900"
														aria-label={
															item.is_active
																? `Archive ${item.question_or_topic}`
																: `Publish ${item.question_or_topic}`
														}
													>
														{updatingId === item.id ? (
															<Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
														) : item.is_active ? (
															<Archive className="mr-1 h-3.5 w-3.5" />
														) : (
															<RotateCcw className="mr-1 h-3.5 w-3.5" />
														)}
														{item.is_active ? "Archive" : "Publish"}
													</Button>
													<Button
														variant="ghost"
														size="sm"
														className="h-8 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
														onClick={() => setDeleteItem(item)}
														aria-label={`Delete ${item.question_or_topic}`}
													>
														<Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
													</Button>
												</div>
											)}
										</div>
									</article>
								);
							})}
						</div>
					)}

					{/* Pagination footer */}
					<div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
						<span className="text-xs text-gray-500">Page {page}</span>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								className="text-xs h-8"
								disabled={offset === 0}
								onClick={() => {
									setOffset(Math.max(0, offset - PAGE_SIZE));
									setSelectedIds([]);
								}}
							>
								<ChevronLeft className="mr-1 h-4 w-4" /> Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="text-xs h-8"
								disabled={offset + PAGE_SIZE >= total}
								onClick={() => {
									setOffset(offset + PAGE_SIZE);
									setSelectedIds([]);
								}}
							>
								Next <ChevronRight className="ml-1 h-4 w-4" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Create / Edit Dialog */}
			<Dialog
				open={editorOpen}
				onOpenChange={(open) => {
					if (!open && !isSaving) setEditorOpen(false);
				}}
			>
				<DialogContent className="sm:max-w-xl">
					<DialogHeader>
						<DialogTitle>
							{editingItem ? "Edit Knowledge Item" : "Add Knowledge Item"}
						</DialogTitle>
						<DialogDescription>
							{editingItem
								? "Update the verified answer used by your assistant."
								: "Add a verified business answer manually without uploading another document."}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSave} className="space-y-4">
						<label className="block space-y-1.5 text-sm font-medium text-gray-700">
							Category
							<select
								value={form.category}
								onChange={(event) =>
									setForm((current) => ({
										...current,
										category: event.target.value,
									}))
								}
								className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-normal focus:border-[#163300] focus:outline-none"
							>
								<option value="faq">FAQ</option>
								<option value="pricing">Pricing</option>
								<option value="product">Product</option>
								<option value="policy">Policy</option>
								<option value="hours">Hours</option>
							</select>
						</label>
						<label className="block space-y-1.5 text-sm font-medium text-gray-700">
							Topic or question
							<Input
								value={form.question_or_topic}
								onChange={(event) =>
									setForm((current) => ({
										...current,
										question_or_topic: event.target.value,
									}))
								}
								placeholder="What products or services do you offer?"
								autoFocus
							/>
						</label>
						<label className="block space-y-1.5 text-sm font-medium text-gray-700">
							Approved answer
							<textarea
								value={form.answer_or_content}
								onChange={(event) =>
									setForm((current) => ({
										...current,
										answer_or_content: event.target.value,
									}))
								}
								placeholder="Write the exact verified information the assistant can share..."
								rows={7}
								className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#163300] focus:ring-2 focus:ring-[#9fe870]/40"
							/>
						</label>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setEditorOpen(false)}
								disabled={isSaving}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isSaving}
								className="bg-[#163300] text-[#9fe870] hover:bg-[#1f4700]"
							>
								{isSaving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
								{editingItem ? "Save Changes" : "Publish Item"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Single Item Delete Confirmation */}
			<AlertDialog
				open={!!deleteItem}
				onOpenChange={(open) => {
					if (!open && !isDeleting) setDeleteItem(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2 text-red-600">
							<Trash2 className="h-5 w-5" /> Delete knowledge item?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This permanently removes <strong>{deleteItem?.question_or_topic}</strong> from your assistant&apos;s knowledge base. If you might need it later, archive it instead.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteSingle}
							disabled={isDeleting}
							className="bg-red-600 text-white hover:bg-red-700"
						>
							{isDeleting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
							Delete permanently
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Bulk Delete Confirmation Dialog */}
			<AlertDialog
				open={bulkDeleteDialogOpen}
				onOpenChange={(open) => {
					if (!open && !isBulkDeleting) setBulkDeleteDialogOpen(false);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2 text-red-600">
							<Trash2 className="h-5 w-5" />
							Delete {selectedIds.length} knowledge {selectedIds.length === 1 ? "item" : "items"}?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently remove <strong>{selectedIds.length}</strong> selected items from your workspace knowledge base. Your assistant will no longer use these facts when answering customers. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isBulkDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleBulkDelete}
							disabled={isBulkDeleting}
							className="bg-red-600 text-white hover:bg-red-700"
						>
							{isBulkDeleting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
							Delete {selectedIds.length} permanently
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
