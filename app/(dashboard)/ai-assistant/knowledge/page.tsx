"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft, ChevronLeft, ChevronRight, Library, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { aiAgentService } from "@/lib/services/ai-agent.service";

const PAGE_SIZE = 25;

export default function AIAssistantKnowledgePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [offset, setOffset] = useState(0);
  const { data, error, isLoading } = useSWR(["ai_knowledge_library", search, category, offset], () => aiAgentService.listKnowledgeItems({ search, category, limit: PAGE_SIZE, offset }));
  const total = data?.total ?? 0;
  const page = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6 lg:p-10">
      <Link href="/ai-assistant" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> AI Assistant</Link>
      <header><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-700"><Library className="h-6 w-6" /></div><h1 className="text-2xl font-bold tracking-tight text-gray-900">Knowledge library</h1><p className="mt-1 text-sm text-gray-600">Search and manage the approved answers available to your assistant.</p></header>
      <Card>
        <CardHeader><CardTitle>Published knowledge</CardTitle><CardDescription>{total} items · showing {total === 0 ? 0 : offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</CardDescription><div className="flex flex-col gap-2 pt-3 sm:flex-row"><Input value={search} onChange={(event) => { setSearch(event.target.value); setOffset(0); }} placeholder="Search topics and answers" /><select value={category} onChange={(event) => { setCategory(event.target.value); setOffset(0); }} className="rounded-md border border-gray-200 px-3 text-sm"><option value="">All categories</option><option value="faq">FAQ</option><option value="pricing">Pricing</option><option value="product">Product</option><option value="policy">Policy</option><option value="hours">Hours</option></select></div></CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#163300]" /></div> : error ? <div className="py-10 text-center text-sm text-red-600">The knowledge library could not be loaded. Please try again.</div> : !data?.items.length ? <div className="py-10 text-center text-sm text-gray-500">No matching knowledge items.</div> : <div className="divide-y divide-gray-100">{data.items.map((item) => <article key={item.id} className="py-4 first:pt-0"><div className="mb-1 flex items-center gap-2"><span className="rounded-full bg-[#e2f6d5] px-2 py-0.5 text-[11px] font-semibold capitalize text-[#163300]">{item.category}</span><span className="text-xs text-gray-400">{item.is_active ? "Active" : "Inactive"}</span></div><h2 className="text-sm font-semibold text-gray-900">{item.question_or_topic}</h2><p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">{item.answer_or_content}</p></article>)}</div>}
          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4"><span className="text-xs text-gray-500">Page {page}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}><ChevronLeft className="mr-1 h-4 w-4" />Previous</Button><Button variant="outline" size="sm" disabled={offset + PAGE_SIZE >= total} onClick={() => setOffset(offset + PAGE_SIZE)}>Next<ChevronRight className="ml-1 h-4 w-4" /></Button></div></div>
        </CardContent>
      </Card>
    </main>
  );
}

