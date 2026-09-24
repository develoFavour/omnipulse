"use client";

import { useState } from "react";
import { ScheduledCampaignItem } from "@/lib/api/hooks/useScheduledCampaigns";
import {
  Clock,
  Calendar,
  Rocket,
  XCircle,
  Eye,
  ImageIcon,
  Users,
  Radio,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { FaTelegram, FaWhatsapp } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ScheduledPostCardProps {
  campaign: ScheduledCampaignItem;
  onInspect: (campaign: ScheduledCampaignItem) => void;
  onRequestCancel: (campaign: ScheduledCampaignItem) => void;
  onRequestDispatch: (campaign: ScheduledCampaignItem) => void;
  isCancelling?: boolean;
  isDispatching?: boolean;
}

export function ScheduledPostCard({
  campaign,
  onInspect,
  onRequestCancel,
  onRequestDispatch,
  isCancelling,
  isDispatching,
}: ScheduledPostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const scheduledDate = campaign.scheduled_at ? new Date(campaign.scheduled_at) : null;
  const isUrgent = campaign.timeRemainingMs > 0 && campaign.timeRemainingMs < 1000 * 60 * 60; // < 1 hour

  return (
    <div
      className={cn(
        "group relative rounded-2xl border bg-white p-5 transition-all duration-200 shadow-xs hover:shadow-md",
        isUrgent
          ? "border-amber-300 ring-1 ring-amber-200/50 bg-gradient-to-b from-amber-50/20 to-white"
          : "border-gray-200/90 hover:border-indigo-200"
      )}
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase",
              campaign.isPastDue
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : isUrgent
                ? "bg-amber-100 text-amber-800 border border-amber-300"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                campaign.isPastDue
                  ? "bg-rose-500 animate-pulse"
                  : isUrgent
                  ? "bg-amber-600 animate-ping"
                  : "bg-amber-500"
              )}
            />
            {campaign.isPastDue ? "Due Now" : "Scheduled"}
          </span>

          {/* Countdown Pill */}
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold",
              isUrgent
                ? "bg-amber-100/80 text-amber-900 font-bold"
                : "bg-gray-100 text-gray-700"
            )}
          >
            <Clock className={cn("h-3 w-3", isUrgent ? "text-amber-600" : "text-gray-400")} />
            <span>{campaign.formattedCountdown}</span>
          </div>
        </div>

        {/* Scheduled Target Date & Time */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          <span>
            {scheduledDate
              ? scheduledDate.toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Date unassigned"}
          </span>
        </div>
      </div>

      {/* Campaign Title & Message Preview */}
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors">
          {campaign.title}
        </h3>

        <div className="mt-2 text-xs text-gray-600 font-normal leading-relaxed bg-gray-50/70 p-3 rounded-xl border border-gray-100 relative">
          <p className={cn(!isExpanded && "line-clamp-2")}>
            {campaign.message_body}
          </p>
          {campaign.message_body.length > 120 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 focus:outline-none"
            >
              {isExpanded ? "Show less" : "Read full message"}
            </button>
          )}
        </div>
      </div>

      {/* Asset indicator if any */}
      {campaign.media_url && (
        <div className="mb-3.5 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
          <ImageIcon className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
          <span className="truncate max-w-[280px]">Attachment: {campaign.media_url}</span>
        </div>
      )}

      {/* Placements & Target Audience Summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {campaign.parsedChannels.includes("telegram") && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 border border-sky-100 text-[11px] font-semibold text-sky-700">
              <FaTelegram className="h-3 w-3 text-sky-500" />
              Telegram DM
            </span>
          )}
          {campaign.parsedChannels.includes("whatsapp") && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-[11px] font-semibold text-emerald-700">
              <FaWhatsapp className="h-3 w-3 text-emerald-500" />
              WhatsApp DM
            </span>
          )}
          {campaign.parsedDestinations.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 border border-sky-100 text-[11px] font-semibold text-sky-700">
              <FaTelegram className="h-3 w-3 text-sky-500" />
              {campaign.parsedDestinations.length} Telegram Channel(s)
            </span>
          )}
        </div>

        {/* Recipients count */}
        <div className="flex items-center gap-1 text-xs font-semibold text-gray-500">
          <Users className="h-3.5 w-3.5 text-gray-400" />
          <span>
            {campaign.parsedContacts.length > 0
              ? `${campaign.parsedContacts.length} recipients`
              : "All active contacts"}
          </span>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onInspect(campaign)}
          className="h-8 px-2.5 text-xs font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/60"
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          Inspect Details
        </Button>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRequestCancel(campaign)}
            disabled={isCancelling || isDispatching}
            className="h-8 px-2.5 text-xs font-bold text-rose-600 border-rose-200/80 hover:bg-rose-50 hover:text-rose-700"
          >
            <XCircle className="h-3.5 w-3.5 mr-1 text-rose-500" />
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => onRequestDispatch(campaign)}
            disabled={isCancelling || isDispatching}
            className="h-8 px-3 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <Rocket className="h-3.5 w-3.5 mr-1" />
            Send Now
          </Button>
        </div>
      </div>
    </div>
  );
}
