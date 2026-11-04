"use client";

import { useState } from "react";
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
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import { FaTelegram, FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { ClientReviewPanel } from "./ClientReviewPanel";

interface ScheduledCampaignDetailModalProps {
  campaign: ScheduledCampaignItem | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelSchedule: (id: string) => void;
  onCancelPermanently: (id: string) => void;
  onDispatchNow: (id: string) => void;
  onSchedule: (id: string) => void;
  onSubmitForApproval?: (id: string) => Promise<boolean>;
  onApprove?: (id: string) => Promise<boolean>;
  onReject?: (id: string, reason: string) => Promise<boolean>;
  isCancelling: boolean;
  isPermanentlyCancelling: boolean;
  isDispatching: boolean;
  isSubmittingApproval?: boolean;
  isApproving?: boolean;
  isRejecting?: boolean;
  approvalRequired?: boolean;
  isDraft?: boolean;
  contactLabels?: Record<string, string>;
}

export function ScheduledCampaignDetailModal({
  campaign,
  isOpen,
  onClose,
  onCancelSchedule,
  onCancelPermanently,
  onDispatchNow,
  isCancelling,
  isPermanentlyCancelling,
  isDispatching,
  onSchedule,
  onSubmitForApproval,
  onApprove,
  onReject,
  isSubmittingApproval = false,
  isApproving = false,
  isRejecting = false,
  approvalRequired = false,
  isDraft = false,
  contactLabels = {},
}: ScheduledCampaignDetailModalProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const { role } = usePermissions();

  if (!campaign) return null;

  const scheduledDate = campaign.scheduled_at ? new Date(campaign.scheduled_at) : null;
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const status = campaign.status;
  const canReview = role === "owner" || role === "admin";
  const isRejected = status === "rejected";
  const brandRequestedChanges = campaign.latest_review_decision === "changes_requested";
  const awaitingApproval =
    approvalRequired && status !== "approved" && status !== "scheduled";
  const actionsBlocked = isRejected || brandRequestedChanges || awaitingApproval;
  const canApprove = canReview && status === "pending_approval" && !brandRequestedChanges;
  const canSubmit = (status === "draft" && approvalRequired) || isRejected;

  const handleSubmit = async () => {
    if (!onSubmitForApproval) return;
    await onSubmitForApproval(campaign.id);
  };

  const handleApprove = async () => {
    if (!onApprove) return;
    await onApprove(campaign.id);
  };

  const handleReject = async () => {
    if (!onReject || !rejectReason.trim()) return;
    const ok = await onReject(campaign.id, rejectReason.trim());
    if (ok) {
      setShowRejectForm(false);
      setRejectReason("");
    }
  };

  let banner: { title: string; body: string } | null = null;
  if (brandRequestedChanges) {
    banner = {
      title: "Changes requested by the brand",
      body: "The brand asked for changes on this campaign. Revise the broadcast in the studio, then share a new review link before sending.",
    };
  } else if (isRejected) {
    banner = {
      title: "Rejected by an Owner or Admin",
      body: campaign.rejection_reason
        ? `Reason: ${campaign.rejection_reason}. Revise this campaign, then submit it for approval again.`
        : "Revise this campaign, then submit it for approval again.",
    };
  } else if (status === "pending_approval") {
    banner = {
      title: "Awaiting approval",
      body: canReview
        ? "Review the message and audience, then approve or reject it below."
        : "An Owner or Admin must approve this campaign before it can be scheduled or sent.",
    };
  } else if (approvalRequired && status === "approved") {
    banner = {
      title: "Approved",
      body: "This campaign has been approved and can be scheduled or sent.",
    };
  }

  const bannerTone = brandRequestedChanges || isRejected
    ? "border-rose-200 bg-rose-50"
    : status === "approved"
    ? "border-emerald-200 bg-emerald-50"
    : "border-amber-200 bg-amber-50";
  const bannerIconTone = brandRequestedChanges || isRejected
    ? "text-rose-600"
    : status === "approved"
    ? "text-emerald-600"
    : "text-amber-600";
  const BannerIcon = brandRequestedChanges || isRejected
    ? AlertTriangle
    : status === "approved"
    ? CheckCircle2
    : Clock;

  const headerBadgeTone = brandRequestedChanges || isRejected
    ? "bg-rose-100 text-rose-800 border-rose-300"
    : status === "approved"
    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
    : "bg-amber-100 text-amber-800 border-amber-300";
  const headerDotTone = brandRequestedChanges || isRejected
    ? "bg-rose-500"
    : status === "approved"
    ? "bg-emerald-500"
    : "bg-amber-500 animate-ping";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[min(92vw,960px)] !max-w-none max-h-[calc(100vh-2rem)] min-w-0 bg-white border border-gray-200/90 shadow-2xl rounded-3xl p-0 overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-[#9fe870]/20 border-b border-amber-200/50 p-6 pb-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${headerBadgeTone}`}>
                <span className={`h-2 w-2 rounded-full ${headerDotTone}`} />
                {isDraft
                  ? "Saved Draft"
                  : status === "pending_approval"
                  ? "Awaiting Approval"
                  : status === "approved"
                  ? "Approved Campaign"
                  : isRejected
                  ? "Rejected"
                  : "Scheduled Dispatch"}
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
        <div className="min-w-0 p-6 space-y-6 max-h-[68vh] overflow-x-hidden overflow-y-auto">
          {/* Schedule Timing Card */}
          <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                  {isDraft ? "Dispatch Timing" : "Target Dispatch Date & Time"}
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
                    : "Not scheduled yet"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-xs font-bold text-amber-800 shadow-xs">
                {isDraft ? "Draft" : campaign.formattedCountdown}
              </span>
            </div>
          </div>

          {/* Approval Status Banner */}
          {banner && (
            <div className={`rounded-2xl border p-4 space-y-3 ${bannerTone}`}>
              <div className="flex items-start gap-3">
                <BannerIcon className={`h-5 w-5 shrink-0 mt-0.5 ${bannerIconTone}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    {banner.title}
                  </p>
                  <p className="text-xs text-gray-700 mt-1 leading-relaxed">{banner.body}</p>
                </div>
              </div>

              {(canSubmit || canApprove) && !showRejectForm && (
                <div className="flex flex-wrap items-center gap-2 pl-8">
                  {canSubmit && (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmittingApproval || isApproving || isRejecting}
                      className="h-8 px-3 text-xs font-bold bg-[#163300] hover:bg-[#0d2000] text-[#9fe870] hover:text-white"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                      {isSubmittingApproval ? "Submitting..." : "Submit for approval"}
                    </Button>
                  )}
                  {canApprove && (
                    <>
                      <Button
                        type="button"
                        onClick={handleApprove}
                        disabled={isApproving || isRejecting}
                        className="h-8 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        {isApproving ? "Approving..." : "Approve"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowRejectForm(true)}
                        disabled={isApproving || isRejecting}
                        className="h-8 px-3 text-xs font-bold text-rose-700 border-rose-300 hover:bg-rose-100"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              )}

              {canApprove && showRejectForm && (
                <div className="pl-8 space-y-2">
                  <label
                    htmlFor="rejection-reason"
                    className="block text-xs font-bold text-gray-700"
                  >
                    Reason for rejection
                  </label>
                  <textarea
                    id="rejection-reason"
                    value={rejectReason}
                    onChange={(event) => setRejectReason(event.target.value)}
                    rows={2}
                    placeholder="Tell the author what needs to change..."
                    className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectReason("");
                      }}
                      disabled={isRejecting}
                      className="h-8 px-3 text-xs font-semibold text-gray-600"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleReject}
                      disabled={!rejectReason.trim() || isRejecting}
                      className="h-8 px-3 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      {isRejecting ? "Rejecting..." : "Confirm rejection"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Message Content Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-[#163300]" />
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
                <ImageIcon className="h-3.5 w-3.5 text-[#163300]" />
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
                    className="text-xs font-bold text-[#163300] hover:underline inline-flex items-center gap-1 mt-1"
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
              <Users className="h-3.5 w-3.5 text-[#163300]" />
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
            {campaign.parsedContacts.length > 0 && (
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Selected Contacts
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {campaign.parsedContacts.map((contactId) => (
                    <div key={contactId} className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-semibold text-gray-800 truncate">
                        {contactLabels[contactId] || "Contact"}
                      </span>
                      <span className="font-mono text-[10px] text-gray-400 truncate max-w-[45%]">
                        {contactId}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
          {status === "scheduled" && (
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
          )}

          {!isRejected && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onCancelPermanently(campaign.id)}
              disabled={isCancelling || isDispatching || isPermanentlyCancelling}
              className="w-full sm:w-auto text-rose-700 border-rose-300 hover:bg-rose-100 hover:text-rose-800 font-bold text-xs"
            >
              <AlertTriangle className="h-4 w-4 mr-1.5 text-rose-600" />
              {isPermanentlyCancelling ? "Deleting..." : isDraft ? "Delete Draft" : "Cancel Permanently"}
            </Button>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
            {["draft", "pending_approval", "approved"].includes(campaign.status) && (
              <ClientReviewPanel campaignId={campaign.id} compact />
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onSchedule(campaign.id)}
              disabled={isCancelling || isDispatching || isPermanentlyCancelling || actionsBlocked}
              title={actionsBlocked ? "This campaign must be approved before it can be scheduled." : undefined}
              className="flex-1 sm:flex-initial min-w-[92px] text-xs font-bold text-amber-700 border-amber-200 hover:bg-amber-50 disabled:opacity-50"
            >
              <Calendar className="h-4 w-4 mr-1.5" />
              Schedule
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-initial min-w-[72px] text-xs font-semibold text-gray-600"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => onDispatchNow(campaign.id)}
              disabled={isCancelling || isDispatching || actionsBlocked}
              title={actionsBlocked ? "This campaign must be approved before it can be dispatched." : undefined}
              className="flex-1 sm:flex-initial min-w-[112px] bg-[#163300] hover:bg-[#0d2000] text-[#9fe870] hover:text-white font-bold text-xs shadow-md shadow-[#163300]/20 disabled:opacity-50"
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
