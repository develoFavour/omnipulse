"use client";

import { ScheduledCampaignItem } from "@/lib/api/hooks/useScheduledCampaigns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Clock,
  Calendar,
  Send,
  Users,
  Radio,
  FileText,
  AlertTriangle,
  Rocket,
  XCircle,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import { FaTelegram, FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";

interface ScheduledCampaignDetailModalProps {
  campaign: ScheduledCampaignItem | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelSchedule: (id: string) => void;
  onDispatchNow: (id: string) => void;
  isCancelling: boolean;
  isDispatching: boolean;
}

export function ScheduledCampaignDetailModal({
  campaign,
  isOpen,
  onClose,
  onCancelSchedule,
  onDispatchNow,
  isCancelling,
  isDispatching,
}: ScheduledCampaignDetailModalProps) {
  if (!campaign) return null;

  const scheduledDate = campaign.scheduled_at ? new Date(campaign.scheduled_at) : null;
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white border border-gray-200/90 shadow-2xl rounded-3xl p-0 overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-indigo-500/10 border-b border-amber-200/50 p-6 pb-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                Scheduled Dispatch
              </span>
              <span className="text-xs font-semibold text-gray-500">
                ID: {campaign.id.slice(0, 8)}...
              </span>
            </div>
            {scheduledDate && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <span>{campaign.formattedCountdown}</span>
              </div>
            )}
          </div>
          <DialogTitle className="text-xl font-extrabold text-gray-900 mt-3 tracking-tight">
            {campaign.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
            <span>·</span>
            <span>Local Timezone: {userTimezone}</span>
          </DialogDescription>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Schedule Timing Card */}
          <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                  Target Dispatch Date & Time
                </p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">
                  {scheduledDate
                    ? scheduledDate.toLocaleString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "No schedule date set"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-xs font-bold text-amber-800 shadow-xs">
                {campaign.formattedCountdown}
              </span>
            </div>
          </div>

          {/* Message Content Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-indigo-600" />
                Message Content
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {campaign.message_body.length} characters
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed font-sans shadow-xs">
              {campaign.message_body}
            </div>
          </div>

          {/* Media Attachment if present */}
          {campaign.media_url && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-indigo-600" />
                Attached Media
              </span>
              <div className="border border-gray-200 rounded-2xl p-3 bg-gray-50 flex items-center gap-3">
                <img
                  src={campaign.media_url}
                  alt="Broadcast Asset"
                  className="h-16 w-16 rounded-xl object-cover border border-gray-200 bg-white"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {campaign.media_url}
                  </p>
                  <a
                    href={campaign.media_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 mt-1"
                  >
                    Open Media Asset <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Target Audience & Placements */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-indigo-600" />
              Audience & Placements
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Channels badge list */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Selected Channels
                </p>
                <div className="flex flex-wrap gap-2">
                  {campaign.parsedChannels.includes("telegram") && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-xs font-bold text-sky-700">
                      <FaTelegram className="h-3.5 w-3.5 text-sky-500" />
                      Telegram DM
                    </span>
                  )}
                  {campaign.parsedChannels.includes("whatsapp") && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
                      <FaWhatsapp className="h-3.5 w-3.5 text-emerald-500" />
                      WhatsApp DM
                    </span>
                  )}
                  {campaign.parsedDestinations.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-xs font-bold text-sky-700">
                      <FaTelegram className="h-3.5 w-3.5 text-sky-500" />
                      {campaign.parsedDestinations.length} Telegram Destination(s)
                    </span>
                  )}
                  {campaign.parsedChannels.length === 0 && campaign.parsedDestinations.length === 0 && (
                    <span className="text-xs text-gray-400 italic">No channel tags detected</span>
                  )}
                </div>
              </div>

              {/* Audience Volume info */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Delivery Mode & Targets
                </p>
                <p className="text-sm font-bold text-gray-800 capitalize">
                  {campaign.delivery_type.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {campaign.parsedContacts.length > 0
                    ? `${campaign.parsedContacts.length} designated recipients selected`
                    : "Broadcasting to all eligible channel contacts"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onCancelSchedule(campaign.id)}
            disabled={isCancelling || isDispatching}
            className="w-full sm:w-auto text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 font-bold text-xs"
          >
            <XCircle className="h-4 w-4 mr-1.5 text-rose-500" />
            {isCancelling ? "Cancelling..." : "Cancel Schedule"}
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-initial text-xs font-semibold text-gray-600"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => onDispatchNow(campaign.id)}
              disabled={isCancelling || isDispatching}
              className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20"
            >
              <Rocket className="h-4 w-4 mr-1.5" />
              {isDispatching ? "Launching..." : "Dispatch Now"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
