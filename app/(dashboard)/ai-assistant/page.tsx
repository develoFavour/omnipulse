"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import {
  AlertCircle,
  BrainCircuit,
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useKnowledgeIngestionActions, useKnowledgeIngestionJob } from "@/lib/api/hooks";
import { aiAgentService, type AIKnowledgeItem } from "@/lib/services/ai-agent.service";
import { extractErrorMessage } from "@/lib/api/response";
import { usePermissions } from "@/lib/hooks/usePermissions";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ".pdf,.docx,.txt,.md,.csv,.png,.jpg,.jpeg,.tif,.tiff,.bmp";
const CATEGORY_OPTIONS = ["faq", "pricing", "product", "policy", "hours"] as const;

type DraftItem = AIKnowledgeItem & { draftId: string };

function statusLabel(status: string) {
  return status === "queued" ? "Queued" : status === "processing" ? "Processing" : status === "ready" ? "Ready for review" : "Could not process";
}

function toDraftItems(items: AIKnowledgeItem[] = []): DraftItem[] {
  return items.map((item, index) => ({
    ...item,
    draftId: item.id ?? `${item.category}-${index}-${Date.now()}`,
    is_active: true,
  }));
}

export default function AIAssistantPage() {
  const { canManageChannels } = usePermissions();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadedJobRef = useRef<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { uploadDocument, approveItems, isUploading, error: actionError } = useKnowledgeIngestionActions();
  const { job, isLoading: isJobLoading, isError: isJobError, refetch: refetchJob } = useKnowledgeIngestionJob(jobId);
  const { data: knowledgeItems = [], isLoading: isKnowledgeLoading, mutate: refreshKnowledge } = useSWR(
    "ai_agent_knowledge_items",
    () => aiAgentService.listKnowledgeItems()
  );

  useEffect(() => {
    if (job?.status === "ready" && loadedJobRef.current !== job.id) {
      loadedJobRef.current = job.id;
      const timer = window.setTimeout(() => setDraftItems(toDraftItems(job.items)), 0);
      return () => window.clearTimeout(timer);
    }
  }, [job]);

  const activeJob = job?.status === "queued" || job?.status === "processing";
  const canReview = canManageChannels && job?.status === "ready" && draftItems.length > 0;
  const fileTypes = useMemo(() => ACCEPTED_FILE_TYPES.replaceAll(".", "").replaceAll(",", ", "), []);

  if (!canManageChannels) {
    return (
      <main className="mx-auto max-w-5xl p-6 lg:p-10">
        <Card>
          <CardContent className="flex items-start gap-3 p-6">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <h1 className="font-semibold text-gray-900">AI Assistant knowledge base</h1>
              <p className="mt-1 text-sm text-gray-600">Only workspace owners and administrators can manage business knowledge.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  async function handleUpload(file: File) {
    if (file.size > MAX_FILE_SIZE) {
      toast.error("This file is too large. Please upload a file no larger than 10 MB.");
      return;
    }

    try {
      const accepted = await uploadDocument(file);
      setJobId(accepted.job_id);
      setDraftItems([]);
      toast.success("Document uploaded. We’ll prepare its knowledge for review.");
    } catch (error) {
      toast.error(extractErrorMessage(error, "The document could not be uploaded. Please try again."));
    }
  }

  function updateDraft(draftId: string, update: Partial<DraftItem>) {
    setDraftItems((items) => items.map((item) => item.draftId === draftId ? { ...item, ...update } : item));
  }

  async function handleApprove() {
    const validItems = draftItems.filter((item) => item.question_or_topic.trim() && item.answer_or_content.trim());
    if (!validItems.length) {
      toast.error("Add a topic and answer to at least one item before saving.");
      return;
    }

    setIsSaving(true);
    try {
      await approveItems(validItems.map((item) => ({
        id: item.id,
        tenant_id: item.tenant_id,
        question_or_topic: item.question_or_topic,
        answer_or_content: item.answer_or_content,
        category: item.category || "faq",
        is_active: true,
      })));
      await refreshKnowledge();
      toast.success(`${validItems.length} knowledge ${validItems.length === 1 ? "item" : "items"} added to your assistant.`);
      setDraftItems([]);
      setJobId(null);
    } catch (error) {
      toast.error(extractErrorMessage(error, "The reviewed knowledge could not be saved. Please try again."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6 lg:p-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#e2f6d5] text-[#163300]"><BrainCircuit className="h-6 w-6" /></div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">AI Business Assistant</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">Teach your assistant about your business so it can give customers helpful, consistent answers in your inbox.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#9fe870]/60 bg-[#f4fbeF] px-3 py-1.5 text-xs font-semibold text-[#163300]">
          <Sparkles className="h-3.5 w-3.5" /> Human review before publishing
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Import business knowledge</CardTitle>
            <CardDescription>Upload a document and we’ll extract suggested FAQs, policies, products, pricing, and hours for your review.</CardDescription>
          </CardHeader>
          <CardContent>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || activeJob}
              className="flex min-h-44 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/70 px-5 text-center transition hover:border-[#9fe870] hover:bg-[#f8fcf5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#163300]" /> : <UploadCloud className="mb-3 h-8 w-8 text-[#163300]" />}
              <span className="font-semibold text-gray-900">{isUploading ? "Uploading document…" : activeJob ? "Document is being processed…" : "Choose a document"}</span>
              <span className="mt-1 text-xs text-gray-500">PDF, DOCX, TXT, MD, CSV, or images · 10 MB maximum</span>
              <input ref={fileInputRef} type="file" accept={ACCEPTED_FILE_TYPES} className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleUpload(file); event.target.value = ""; }} />
            </button>
            <p className="mt-3 text-xs text-gray-500">Supported files: {fileTypes}. Scanned PDFs and images may take a little longer while they are read.</p>
            {actionError && <p className="mt-3 text-sm text-red-600">{actionError}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processing status</CardTitle>
            <CardDescription>Uploads run in the background so your inbox stays responsive.</CardDescription>
          </CardHeader>
          <CardContent>
            {!jobId ? (
              <div className="flex min-h-44 flex-col items-center justify-center text-center text-gray-500"><FileText className="mb-3 h-8 w-8 text-gray-300" /><p className="text-sm">Upload a document to start.</p></div>
            ) : isJobLoading && !job ? (
              <div className="flex min-h-44 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#163300]" /></div>
            ) : isJobError ? (
              <div className="flex min-h-44 flex-col items-center justify-center text-center"><AlertCircle className="mb-3 h-8 w-8 text-red-500" /><p className="text-sm text-gray-700">We couldn’t load this upload’s status.</p><Button variant="outline" size="sm" className="mt-3" onClick={() => void refetchJob()}><RefreshCw className="mr-2 h-4 w-4" /> Try again</Button></div>
            ) : job ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"><FileText className="h-5 w-5 text-[#163300]" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-gray-900">{job.filename}</p><p className="text-xs text-gray-500">{statusLabel(job.status)}</p></div>{activeJob ? <Loader2 className="h-5 w-5 animate-spin text-[#163300]" /> : job.status === "ready" ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-red-500" />}</div>
                {activeJob && <p className="text-sm text-gray-600">Your document is being read and converted into suggested knowledge items. You can leave this page and come back.</p>}
                {job.status === "failed" && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{job.error_message || "We couldn’t process this document. Try a clearer file or a supported format."}</div>}
                {job.status === "ready" && <p className="text-sm text-gray-600">{draftItems.length} suggested {draftItems.length === 1 ? "item is" : "items are"} ready. Review them below before publishing.</p>}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      {canReview && (
        <Card>
          <CardHeader className="border-b border-gray-100"><CardTitle>Review suggested knowledge</CardTitle><CardDescription>Correct anything needed before your assistant uses these answers.</CardDescription></CardHeader>
          <CardContent className="space-y-4 pt-5">
            {draftItems.map((item) => (
              <div key={item.draftId} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3"><select value={item.category} onChange={(event) => updateDraft(item.draftId, { category: event.target.value })} className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold capitalize text-gray-700 focus:border-[#9fe870] focus:outline-none">{CATEGORY_OPTIONS.map((category) => <option key={category} value={category}>{category}</option>)}</select><button type="button" onClick={() => setDraftItems((items) => items.filter((draft) => draft.draftId !== item.draftId))} className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove suggestion"><Trash2 className="h-4 w-4" /></button></div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Topic or question<input value={item.question_or_topic} onChange={(event) => updateDraft(item.draftId, { question_or_topic: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#9fe870] focus:ring-2 focus:ring-[#9fe870]/20" /></label>
                <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-gray-500">Answer or content<textarea value={item.answer_or_content} onChange={(event) => updateDraft(item.draftId, { answer_or_content: event.target.value })} rows={3} className="mt-1.5 w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#9fe870] focus:ring-2 focus:ring-[#9fe870]/20" /></label>
              </div>
            ))}
            <div className="flex justify-end"><Button onClick={() => void handleApprove()} disabled={isSaving || !draftItems.length}>{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} Publish reviewed knowledge</Button></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between"><div><CardTitle>Published knowledge</CardTitle><CardDescription>These are the approved answers available to your AI assistant.</CardDescription></div><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">{knowledgeItems.length} items</span></CardHeader>
        <CardContent>
          {isKnowledgeLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-[#163300]" /></div> : knowledgeItems.length === 0 ? <div className="py-8 text-center text-sm text-gray-500">No published knowledge yet. Upload a business document to get started.</div> : <div className="divide-y divide-gray-100">{knowledgeItems.map((item) => <div key={item.id ?? `${item.category}-${item.question_or_topic}`} className="py-4 first:pt-0 last:pb-0"><div className="mb-1 flex items-center gap-2"><span className="rounded-full bg-[#e2f6d5] px-2 py-0.5 text-[11px] font-semibold capitalize text-[#163300]">{item.category}</span><span className="text-xs text-gray-400">{item.is_active ? "Active" : "Inactive"}</span></div><p className="text-sm font-semibold text-gray-900">{item.question_or_topic}</p><p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">{item.answer_or_content}</p></div>)}</div>}
        </CardContent>
      </Card>
    </main>
  );
}
