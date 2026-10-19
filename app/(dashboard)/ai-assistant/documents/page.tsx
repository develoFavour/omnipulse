"use client";

import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft, FileText, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { aiAgentService, type KnowledgeIngestionStatus } from "@/lib/services/ai-agent.service";

const PAGE_SIZE = 25;

function statusLabel(status: KnowledgeIngestionStatus) {
  return status === "ready" ? "Ready for review" : status === "processing" ? "Processing" : status === "queued" ? "Queued" : "Needs attention";
}

export default function AIAssistantDocumentsPage() {
  const { data, error, isLoading, mutate } = useSWR("ai_knowledge_documents", () => aiAgentService.listKnowledgeIngestionJobs({ limit: PAGE_SIZE, offset: 0 }));

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6 lg:p-10">
      <Link href="/ai-assistant" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> AI Assistant</Link>
      <header><h1 className="text-2xl font-bold tracking-tight text-gray-900">Document library</h1><p className="mt-1 text-sm text-gray-600">A durable, paginated view of the documents your agency has submitted for knowledge extraction.</p></header>
      <Card>
        <CardHeader className="flex-row items-center justify-between"><div><CardTitle>Documents</CardTitle><CardDescription>{data?.total ?? 0} uploaded documents</CardDescription></div><Button variant="outline" size="sm" onClick={() => void mutate()}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button></CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#163300]" /></div> : error ? <div className="py-10 text-center text-sm text-red-600">The document library could not be loaded. Please try again.</div> : !data?.jobs.length ? <div className="py-10 text-center text-sm text-gray-500">No documents have been uploaded yet.</div> : <div className="divide-y divide-gray-100">{data.jobs.map((job) => <div key={job.id} className="flex items-center gap-4 py-4"><FileText className="h-5 w-5 shrink-0 text-[#163300]" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-gray-900">{job.filename}</p><p className="mt-1 text-xs text-gray-500">{job.item_count ?? 0} suggestions · {new Date(job.created_at).toLocaleString()}</p>{job.error_message && <p className="mt-1 text-xs text-red-600">{job.error_message}</p>}</div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${job.status === "ready" ? "bg-emerald-50 text-emerald-700" : job.status === "failed" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{statusLabel(job.status)}</span></div>)}</div>}
        </CardContent>
      </Card>
    </main>
  );
}

