"use client";

import { Bot, Loader2, Power } from "lucide-react";
import { toast } from "sonner";
import { useAIAssistantConfig } from "@/lib/api/hooks/useAIAssistant";
import { extractErrorMessage } from "@/lib/api/response";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { cn } from "@/lib/utils";

export function AIAssistanceToggle({ compact = false }: { compact?: boolean }) {
  const { canManageChannels } = usePermissions();
  const { config, isLoading, isUpdating, toggleEnabled } = useAIAssistantConfig();

  if (!canManageChannels) return null;

  const enabled = config?.is_enabled === true;
  const providerReady = config?.provider_available !== false;

  async function handleToggle() {
    if (isUpdating || isLoading) return;
    try {
      await toggleEnabled(!enabled);
      toast.success(!enabled ? "AI assistance enabled for this workspace" : "AI assistance disabled for this workspace");
    } catch (error) {
      toast.error(extractErrorMessage(error, "The AI assistance setting could not be updated."));
    }
  }

  return (
    <div className={cn("flex items-center gap-3", compact ? "rounded-lg border border-gray-200 bg-white px-3 py-2" : "rounded-xl border border-[#9fe870]/50 bg-[#f8fcf5] p-4")}>
      <div className={cn("flex shrink-0 items-center justify-center rounded-lg", compact ? "h-8 w-8 bg-[#e2f6d5]" : "h-10 w-10 bg-[#e2f6d5]")}>
        <Bot className={cn("text-[#163300]", compact ? "h-4 w-4" : "h-5 w-5")} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("font-semibold text-gray-900", compact ? "text-xs" : "text-sm")}>AI assistance</p>
        {!compact && <p className="mt-0.5 text-xs text-gray-600">Allow the assistant to respond to new customer messages in this workspace.</p>}
        {compact && <p className="text-[10px] text-gray-500">{enabled ? "Workspace enabled" : "Workspace disabled"}</p>}
        {!providerReady && <p className="mt-1 text-[11px] text-amber-700">Provider setup is required before enabling.</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={enabled ? "Disable AI assistance" : "Enable AI assistance"}
        onClick={() => void handleToggle()}
        disabled={isLoading || isUpdating || (!providerReady && !enabled)}
        className={cn("relative shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50", compact ? "h-6 w-11" : "h-7 w-12", enabled ? "bg-[#163300]" : "bg-gray-300")}
      >
        <span className={cn("absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-white shadow transition-transform", compact ? "h-5 w-5" : "h-6 w-6", enabled ? "translate-x-5" : "translate-x-1")}>
          {isUpdating ? <Loader2 className="h-3 w-3 animate-spin text-[#163300]" /> : <Power className="h-3 w-3 text-gray-500" />}
        </span>
      </button>
    </div>
  );
}
