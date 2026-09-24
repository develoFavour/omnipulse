"use client";

import { useState } from "react";
import {
  CalendarClock,
  Loader2,
  CheckCircle2,
  Globe,
  AlarmClock,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ScheduleCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Campaign context (read-only — already composed on the studio)
  campaignTitle: string;
  targetCount: number;
  channelsSummary: string; // e.g. "Telegram DM, WhatsApp DM"

  // Scheduling state — lifted up so BroadcastStudio can access scheduledAt
  scheduledAt: string;
  onScheduledAtChange: (value: string) => void;

  // Action
  isScheduling: boolean;
  onConfirm: () => Promise<void>;
}

export function ScheduleCampaignModal({
  open,
  onOpenChange,
  campaignTitle,
  targetCount,
  channelsSummary,
  scheduledAt,
  onScheduledAtChange,
  isScheduling,
  onConfirm,
}: ScheduleCampaignModalProps) {
  const [localError, setLocalError] = useState("");
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const minDateTime = new Date(Date.now() + 2 * 60_000).toISOString().slice(0, 16);

  const parsedDate = scheduledAt ? new Date(scheduledAt) : null;
  const isValidDate = parsedDate && parsedDate > new Date();

  const handleConfirm = async () => {
    setLocalError("");
    if (!scheduledAt) {
      setLocalError("Please select a dispatch date and time.");
      return;
    }
    if (!isValidDate) {
      setLocalError("Scheduled time must be at least 2 minutes in the future.");
      return;
    }
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-[520px] p-0 overflow-hidden rounded-2xl border border-gray-200/80",
          "bg-white shadow-2xl"
        )}
        showCloseButton
      >
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 shrink-0">
                <CalendarClock className="h-4.5 w-4.5 text-amber-600" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 font-heading">
                  Schedule Broadcast
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 font-medium mt-0.5">
                  Set a future dispatch time for this campaign.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Campaign Summary Card */}
        <div className="px-6 py-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  Campaign
                </p>
                <p className="text-sm font-bold text-gray-900 line-clamp-1">
                  {campaignTitle || <span className="text-gray-400 italic">Untitled Campaign</span>}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  Audience
                </p>
                <p className="text-sm font-bold text-indigo-700">{targetCount} recipients</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 pt-1 border-t border-gray-200/80">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-medium text-gray-500">{channelsSummary}</span>
            </div>
          </div>

          {/* DateTime Picker Section */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlarmClock className="h-3.5 w-3.5 text-amber-500" />
                Dispatch Time
              </label>
              <span className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
                <Globe className="h-3 w-3" />
                {timezone}
              </span>
            </div>

            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => {
                onScheduledAtChange(e.target.value);
                setLocalError("");
              }}
              min={minDateTime}
              className={cn(
                "w-full rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-gray-900",
                "focus:outline-none focus:ring-2 transition-all cursor-pointer",
                localError
                  ? "border-red-300 focus:ring-red-300"
                  : "border-gray-200 focus:border-amber-400 focus:ring-amber-200"
              )}
            />

            {localError && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500">
                <Info className="h-3 w-3 shrink-0" />
                {localError}
              </p>
            )}
          </div>

          {/* Parsed preview */}
          {isValidDate && parsedDate && (
            <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-800">
                  {parsedDate.toLocaleString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-[11px] font-semibold text-amber-600 mt-0.5">
                  at{" "}
                  {parsedDate.toLocaleString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZoneName: "short",
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Info callout */}
          <p className="mt-4 text-[11px] font-medium text-gray-400 flex items-start gap-1.5">
            <Info className="h-3 w-3 shrink-0 mt-0.5 text-gray-300" />
            The campaign will be created as a draft and automatically dispatched at the scheduled
            time. You can cancel it from the Campaigns list before the time elapses.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/70 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isScheduling}
            className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isScheduling || !scheduledAt}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md cursor-pointer",
              isScheduling || !scheduledAt
                ? "bg-amber-300 cursor-not-allowed shadow-none"
                : "bg-amber-500 hover:bg-amber-600 shadow-amber-500/25 active:scale-[0.99]"
            )}
          >
            {isScheduling ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <CalendarClock className="h-4 w-4" />
                Confirm Schedule
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
