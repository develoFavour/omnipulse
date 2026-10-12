"use client";

import { useState } from "react";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Copy, 
  Check, 
  Download, 
  Share2, 
  ExternalLink, 
  Terminal, 
  ShieldCheck, 
  Users, 
  Megaphone, 
  Send,
  Hash,
  Calendar,
  Layers
} from "lucide-react";
import { toast } from "sonner";

import { DashboardDeliveryActivity } from "@/lib/services/dashboard.service";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { STATUS_CONFIG } from "@/lib/constants/status.const";
import { formatDateTime, formatRelativeTime } from "@/lib/utils/date.utils";
import { getPlatformIcon } from "@/lib/utils/platform.utils";
import { cn } from "@/lib/utils";

interface ActivityDetailsSheetProps {
  activity: DashboardDeliveryActivity | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityDetailsSheet({ activity, isOpen, onClose }: ActivityDetailsSheetProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  if (!activity) return null;

  const config = STATUS_CONFIG[activity.status] || STATUS_CONFIG.pending;
  const isFailed = activity.status === "failed";
  const isDelivered = activity.status === "delivered" || activity.status === "sent";

  const handleCopy = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  const handleDownloadJson = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activity, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `delivery-event-${activity.id.slice(0, 8)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success("Event JSON exported successfully");
    } catch {
      toast.error("Failed to export event JSON");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-xl bg-white border-l border-gray-200 p-0 flex flex-col h-full shadow-2xl z-50 overflow-hidden"
      >
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-gray-100 bg-[#fbfdfa] flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-white border border-gray-200/80 shadow-xs flex items-center justify-center text-gray-700">
                {getPlatformIcon(activity.platform)}
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Delivery Telemetry
                </span>
                <SheetTitle className="text-lg font-extrabold text-gray-900 tracking-tight font-heading leading-tight">
                  Audit Event Details
                </SheetTitle>
              </div>
            </div>
          </div>
          <SheetDescription className="text-xs text-gray-500">
            Real-time dispatch telemetry, payload metadata, and carrier acknowledgement.
          </SheetDescription>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Status Hero Card */}
          <div
            className={cn(
              "rounded-2xl p-4.5 border transition-all",
              isFailed
                ? "bg-rose-50/70 border-rose-200/80"
                : isDelivered
                ? "bg-[#f2faee] border-[#c8ebbc]"
                : "bg-amber-50/70 border-amber-200/80"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shadow-xs",
                    isFailed
                      ? "bg-rose-100 text-rose-700 border border-rose-200"
                      : isDelivered
                      ? "bg-[#d8f4c7] text-[#163300] border border-[#aee496]"
                      : "bg-amber-100 text-amber-700 border border-amber-200"
                  )}
                >
                  {isFailed ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : isDelivered ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-bold tracking-tight",
                        isFailed ? "text-rose-900" : isDelivered ? "text-[#163300]" : "text-amber-900"
                      )}
                    >
                      {config.label}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                        isFailed
                          ? "bg-rose-200/60 text-rose-800 border-rose-300"
                          : isDelivered
                          ? "bg-[#e2f6d5] text-[#163300] border-[#9fe870]/60"
                          : "bg-amber-200/60 text-amber-800 border-amber-300"
                      )}
                    >
                      {isFailed ? "DLQ Queued" : isDelivered ? "Carrier ACK" : "In Flight"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {isFailed
                      ? "Message failed delivery pipeline or was rejected by downstream provider."
                      : isDelivered
                      ? "Message successfully routed and acknowledged by the destination network."
                      : "Delivery is queued for dispatch by the background worker."}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick action buttons row inside status card */}
            <div className="mt-4 pt-3 border-t border-black/5 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(activity.id, "Event ID", "id")}
                className="h-7 px-2.5 text-xs bg-white/80 hover:bg-white text-gray-700 border-gray-200 font-mono gap-1.5 cursor-pointer"
              >
                {copiedKey === "id" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>ID: {activity.id.slice(0, 8)}...</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadJson}
                className="h-7 px-2.5 text-xs bg-white/80 hover:bg-white text-gray-700 border-gray-200 gap-1.5 cursor-pointer ml-auto"
              >
                <Download className="h-3 w-3" />
                <span>Export JSON</span>
              </Button>
            </div>
          </div>

          {/* Error Trace Card (if failed) */}
          {isFailed && activity.error_message && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-rose-600" />
                  Dead Letter Exception & Error Trace
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(activity.error_message || "", "Error trace", "err")}
                  className="h-6 px-2 text-[11px] text-rose-700 hover:text-rose-900 hover:bg-rose-100/60 cursor-pointer"
                >
                  {copiedKey === "err" ? <Check className="h-3 w-3 mr-1 text-emerald-600" /> : <Copy className="h-3 w-3 mr-1" />}
                  Copy trace
                </Button>
              </div>
              <div className="bg-white/90 border border-rose-200/90 rounded-xl p-3 font-mono text-xs text-rose-800 leading-relaxed whitespace-pre-wrap break-all shadow-2xs">
                {activity.error_message}
              </div>
              <p className="text-[11px] text-rose-700/80">
                Failed delivery events are preserved in the Dead Letter Queue for audit and automated replay attempts.
              </p>
            </div>
          )}

          {/* Primary Metadata Sections */}
          <div className="grid grid-cols-1 gap-4">
            {/* Campaign Information */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-3 text-gray-500">
                <Megaphone className="h-4 w-4 text-[#163300]" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Campaign Details</span>
              </div>
              <div className="space-y-2.5">
                <div>
                  <span className="text-[11px] text-gray-400 font-medium">Broadcast Title</span>
                  <p className="text-sm font-bold text-gray-900">{activity.campaign_name}</p>
                </div>
                {activity.campaign_id && (
                  <div>
                    <span className="text-[11px] text-gray-400 font-medium">Campaign ID</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <code className="text-xs font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                        {activity.campaign_id}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-gray-700"
                        onClick={() => handleCopy(activity.campaign_id!, "Campaign ID", "camp_id")}
                      >
                        {copiedKey === "camp_id" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recipient Information */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-3 text-gray-500">
                <Users className="h-4 w-4 text-[#163300]" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Target Recipient</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] text-gray-400 font-medium">Contact Name</span>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{activity.contact_name}</p>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 font-medium">Platform Channel</span>
                  <div className="flex items-center gap-2 mt-0.5 capitalize text-sm font-medium text-gray-800">
                    {getPlatformIcon(activity.platform)}
                    <span>{activity.platform}</span>
                  </div>
                </div>

                {activity.routing_value && (
                  <div className="col-span-2">
                    <span className="text-[11px] text-gray-400 font-medium">Destination Routing Address</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs font-mono text-gray-800 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200 flex-1">
                        {activity.routing_value}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2.5 cursor-pointer text-gray-600"
                        onClick={() => handleCopy(activity.routing_value!, "Destination address", "routing")}
                      >
                        {copiedKey === "routing" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                )}

                {activity.target_type && (
                  <div>
                    <span className="text-[11px] text-gray-400 font-medium">Destination Type</span>
                    <p className="text-xs font-semibold text-gray-700 capitalize mt-0.5">
                      {activity.target_type.replace(/_/g, " ")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Timing & Security Audit */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-3 text-gray-500">
                <Calendar className="h-4 w-4 text-[#163300]" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Timestamp & Audit</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] text-gray-400 font-medium">Logged At</span>
                  <p className="text-xs font-semibold text-gray-900 mt-0.5">
                    {formatDateTime(activity.created_at)}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 font-medium">Age</span>
                  <div className="inline-flex items-center gap-1.5 mt-0.5 bg-gray-100 px-2 py-0.5 rounded-md text-xs font-mono text-gray-700">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span>{formatRelativeTime(activity.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Developer Raw Telemetry JSON Box */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-xs font-bold text-gray-700">Raw Telemetry JSON</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="h-6 text-xs text-gray-500 hover:text-gray-900 px-2 cursor-pointer"
                >
                  {showRawJson ? "Collapse" : "Expand"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(JSON.stringify(activity, null, 2), "Telemetry JSON", "json")}
                  className="h-6 text-xs text-gray-500 hover:text-gray-900 px-2 cursor-pointer"
                >
                  {copiedKey === "json" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            {showRawJson ? (
              <pre className="p-3 bg-gray-900 text-emerald-400 text-[11px] font-mono rounded-xl overflow-x-auto max-h-56 leading-relaxed border border-gray-800 shadow-inner">
                {JSON.stringify(activity, null, 2)}
              </pre>
            ) : (
              <p className="text-xs text-gray-500 font-mono bg-white p-2.5 rounded-xl border border-gray-200">
                Event ID: {activity.id} • Status: {activity.status} • Platform: {activity.platform}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between gap-3 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy(activity.id, "Event ID", "id_footer")}
            className="text-xs h-9 text-gray-700 cursor-pointer"
          >
            {copiedKey === "id_footer" ? <Check className="h-3.5 w-3.5 text-emerald-600 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            Copy ID
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={onClose}
            className="text-xs h-9 bg-[#163300] hover:bg-[#1f4700] text-white px-5 cursor-pointer rounded-xl font-semibold shadow-xs"
          >
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
