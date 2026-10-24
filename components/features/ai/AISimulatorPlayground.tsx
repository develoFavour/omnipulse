"use client";

import { useState } from "react";
import {
  Bot,
  Send,
  User,
  Sparkles,
  AlertTriangle,
  UserCheck,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { aiAgentService } from "@/lib/services/ai-agent.service";
import { extractErrorMessage } from "@/lib/api/response";
import { toast } from "sonner";

interface SimMessage {
  id: string;
  sender: "customer" | "assistant";
  text: string;
  timestamp: string;
  meta?: {
    needsHuman?: boolean;
    confidence?: number;
    leadInfo?: { name?: string; email?: string };
  };
}

const SAMPLE_PROMPTS = [
  "How much do you charge for delivery?",
  "What is your return or refund policy?",
  "Can I speak with a human support agent?",
  "My name is Sarah and my email is sarah@acme.com, send me pricing.",
];

export function AISimulatorPlayground() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<SimMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello! I am your AI Business Assistant. Try asking me anything about your business, pricing, or policies to test how I respond using your hybrid knowledge base.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastMeta, setLastMeta] = useState<{
    needsHuman?: boolean;
    leadInfo?: { name?: string; email?: string };
    query?: string;
  } | null>(null);

  async function handleSend(queryText?: string) {
    const textToSend = (queryText ?? query).trim();
    if (!textToSend || isSimulating) return;

    const userMsg: SimMessage = {
      id: `user-${Date.now()}`,
      sender: "customer",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setIsSimulating(true);

    try {
      const result = await aiAgentService.simulateResponse(textToSend);
      const assistantMsg: SimMessage = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        text: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        meta: {
          needsHuman: result.needs_human,
          leadInfo: result.lead_info,
        },
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setLastMeta({
        needsHuman: result.needs_human,
        leadInfo: result.lead_info,
        query: textToSend,
      });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Simulation request failed. Check your AI provider keys."));
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          text: "⚠️ [Error] The AI assistant could not generate a reply. Ensure GEMINI_API_KEY or GROQ_API_KEY is configured on the backend.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsSimulating(false);
    }
  }

  function handleReset() {
    setMessages([
      {
        id: "welcome",
        sender: "assistant",
        text: "Sandbox session reset. Ask a question or click one of the suggested prompts below to test.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setLastMeta(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* Left Chat Stream Pane */}
      <Card className="flex flex-col border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e2f6d5] text-[#163300]">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Live Sandbox Playground</CardTitle>
                <CardDescription className="text-xs">
                  Simulate live conversations with your published knowledge base in real-time.
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-gray-500 hover:text-gray-900"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Reset chat
            </Button>
          </div>
        </CardHeader>

        {/* Message feed */}
        <CardContent className="flex flex-1 flex-col justify-between p-4 sm:p-6">
          <div className="space-y-4 overflow-y-auto max-h-[460px] pr-2 pb-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.sender === "customer" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-[#163300] text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.sender === "customer"
                      ? "bg-[#163300] text-white rounded-tr-none shadow-sm"
                      : "bg-gray-100/80 text-gray-900 rounded-tl-none border border-gray-200/60"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span
                    className={`mt-1.5 block text-[10px] ${
                      m.sender === "customer" ? "text-emerald-200/80 text-right" : "text-gray-400"
                    }`}
                  >
                    {m.timestamp}
                  </span>

                  {m.meta?.needsHuman && (
                    <div className="mt-2.5 flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>Human escalation trigger activated</span>
                    </div>
                  )}

                  {m.meta?.leadInfo && (m.meta.leadInfo.name || m.meta.leadInfo.email) && (
                    <div className="mt-2 flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      <UserCheck className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Lead captured: {m.meta.leadInfo.name} ({m.meta.leadInfo.email})
                      </span>
                    </div>
                  )}
                </div>
                {m.sender === "customer" && (
                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-gray-200 text-gray-700">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isSimulating && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#163300] text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-none border border-gray-200/60 bg-gray-100/80 px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.4s]" />
                  <span className="text-xs text-gray-500 font-medium ml-1">Searching hybrid knowledge base…</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick prompt pills */}
          <div className="border-t border-gray-100 pt-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Try a sample inquiry
            </p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {SAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isSimulating}
                  onClick={() => handleSend(prompt)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 transition hover:border-[#9fe870] hover:bg-[#f8fcf5] hover:text-[#163300] disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask your assistant anything (e.g. pricing, hours, policies)..."
                disabled={isSimulating}
                className="h-11 rounded-xl border-gray-200 bg-gray-50/50 px-4 text-sm focus:border-[#9fe870] focus:bg-white"
              />
              <Button
                type="submit"
                disabled={!query.trim() || isSimulating}
                className="h-11 rounded-xl bg-[#163300] px-5 hover:bg-[#163300]/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Right Telemetry & Inspection Sidebar */}
      <div className="space-y-4">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#163300]">
              <Sparkles className="h-4 w-4" />
              <span>Inspection Inspector</span>
            </div>
            <CardTitle className="text-sm">Behind the Scenes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <span className="font-semibold text-gray-700">Retrieval Pipeline:</span>
              <p className="mt-1 text-gray-600 leading-relaxed">
                Queries first run through <strong className="text-[#163300]">pgvector cosine similarity</strong> (768-dim) merged with <strong className="text-[#163300]">Postgres tsvector GIN</strong> rankings via Reciprocal Rank Fusion.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-gray-600">
                <span>Semantic Indexing:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" /> HNSW Active
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Dual Engine Failover:</span>
                <span className="font-semibold text-gray-900">Gemini ➔ Groq</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Quota Circuit Breaker:</span>
                <span className="font-semibold text-emerald-700">Armed (60s cooldown)</span>
              </div>
            </div>

            {lastMeta && (
              <div className="border-t border-gray-100 pt-3">
                <span className="font-semibold text-gray-800">Last Response Telemetry</span>
                <div className="mt-2 space-y-1.5 rounded-lg border border-gray-200 bg-white p-2.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Human Handoff:</span>
                    <span className={`font-semibold ${lastMeta.needsHuman ? "text-amber-600" : "text-emerald-600"}`}>
                      {lastMeta.needsHuman ? "Triggered" : "Automated"}
                    </span>
                  </div>
                  {lastMeta.leadInfo && (lastMeta.leadInfo.name || lastMeta.leadInfo.email) && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Captured Lead:</span>
                      <span className="font-semibold text-emerald-700 truncate max-w-[130px]">
                        {lastMeta.leadInfo.name ?? lastMeta.leadInfo.email}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pro Tip Card */}
        <Card className="border-[#9fe870]/40 bg-[#f8fcf5] shadow-none">
          <CardContent className="p-4 text-xs text-gray-700 leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-[#163300] mb-1">
              <Flame className="h-4 w-4" />
              <span>Agency Pro-Tip</span>
            </div>
            Test synonyms and conversational slang here before deploying. If the assistant doesn&apos;t match an obscure question, upload the document containing the answer or add it in the Knowledge Library.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
