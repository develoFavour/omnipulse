import { useState, useEffect, useCallback } from "react";
import { campaignService, CampaignResponse } from "@/lib/services/campaign.service";
import { toast } from "sonner";

export interface ScheduledCampaignItem extends CampaignResponse {
  parsedChannels: string[];
  parsedDestinations: string[];
  parsedContacts: string[];
  timeRemainingMs: number;
  formattedCountdown: string;
  isPastDue: boolean;
}

function computeCountdown(scheduledAtStr?: string): {
  timeRemainingMs: number;
  formattedCountdown: string;
  isPastDue: boolean;
} {
  if (!scheduledAtStr) {
    return { timeRemainingMs: 0, formattedCountdown: "Unscheduled", isPastDue: false };
  }

  const target = new Date(scheduledAtStr).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { timeRemainingMs: diff, formattedCountdown: "Dispatching now...", isPastDue: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  let formatted = "";
  if (days > 0) {
    formatted = `${days}d ${hours}h left`;
  } else if (hours > 0) {
    formatted = `${hours}h ${minutes}m left`;
  } else if (minutes > 0) {
    formatted = `${minutes}m ${seconds}s left`;
  } else {
    formatted = `${seconds}s left`;
  }

  return { timeRemainingMs: diff, formattedCountdown: formatted, isPastDue: false };
}

function enrichCampaign(c: CampaignResponse): ScheduledCampaignItem {
  let parsedChannels: string[] = [];
  try {
    parsedChannels = JSON.parse(c.selected_channels || "[]");
  } catch {
    parsedChannels = [];
  }

  let parsedDestinations: string[] = [];
  try {
    parsedDestinations = JSON.parse(c.selected_telegram_destination_ids || "[]");
  } catch {
    parsedDestinations = [];
  }

  let parsedContacts: string[] = [];
  try {
    parsedContacts = JSON.parse(c.selected_contact_ids || "[]");
  } catch {
    parsedContacts = [];
  }

  const countdown = computeCountdown(c.scheduled_at);

  return {
    ...c,
    parsedChannels,
    parsedDestinations,
    parsedContacts,
    ...countdown,
  };
}

export function useScheduledCampaigns() {
  const [campaigns, setCampaigns] = useState<ScheduledCampaignItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [permanentlyCancellingId, setPermanentlyCancellingId] = useState<string | null>(null);
  const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const fetchScheduled = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    setError(null);
    try {
      const [scheduledData, pendingData, draftData] = await Promise.all([
        campaignService.getCampaigns("scheduled", 1, 100),
        campaignService.getCampaigns("pending_approval", 1, 100).catch(() => []),
        campaignService.getCampaigns("draft", 1, 100).catch(() => []),
      ]);
      const combined = [
        ...(draftData || []),
        ...(pendingData || []),
        ...(scheduledData || []),
      ];
      const enriched = combined.map(enrichCampaign);
      setCampaigns(enriched);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to load scheduled campaigns";
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchScheduled(false);

    // Auto-poll every 20 seconds to catch when background scheduler fires campaigns
    const pollTimer = setInterval(() => {
      fetchScheduled(true);
    }, 20000);

    return () => clearInterval(pollTimer);
  }, [fetchScheduled]);

  // Update countdown timers every second
  useEffect(() => {
    const ticker = setInterval(() => {
      setCampaigns((prev) =>
        prev.map((c) => ({
          ...c,
          ...computeCountdown(c.scheduled_at),
        }))
      );
    }, 1000);

    return () => clearInterval(ticker);
  }, []);

  const cancelSchedule = async (campaignId: string) => {
    setCancellingId(campaignId);
    try {
      await campaignService.cancelScheduledCampaign(campaignId);
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
      toast.success("Schedule cancelled", {
        description: "The campaign has been reverted to draft status.",
      });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to cancel schedule";
      toast.error(msg);
      return false;
    } finally {
      setCancellingId(null);
    }
  };

  const dispatchNow = async (campaignId: string) => {
    setDispatchingId(campaignId);
    try {
      await campaignService.dispatchCampaign(campaignId);
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
      toast.success("Broadcast dispatched immediately!", {
        description: "The background queue is currently processing targets.",
      });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to dispatch broadcast";
      toast.error(msg);
      return false;
    } finally {
      setDispatchingId(null);
    }
  };

  const cancelCampaignPermanently = async (campaignId: string) => {
    setPermanentlyCancellingId(campaignId);
    try {
      await campaignService.cancelCampaign(campaignId);
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
      toast.success("Campaign permanently cancelled", {
        description: "It will not be dispatched or scheduled again.",
      });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to cancel campaign";
      toast.error(msg);
      return false;
    } finally {
      setPermanentlyCancellingId(null);
    }
  };

  const deleteDraft = async (campaignId: string) => {
    setDeletingDraftId(campaignId);
    try {
      await campaignService.deleteDraft(campaignId);
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
      toast.success("Draft deleted", {
        description: "The saved broadcast draft has been removed.",
      });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to delete draft";
      toast.error(msg);
      return false;
    } finally {
      setDeletingDraftId(null);
    }
  };

  const scheduleDraft = async (campaignId: string, scheduledAt: Date) => {
    setSchedulingId(campaignId);
    try {
      await campaignService.scheduleCampaign(campaignId, scheduledAt);
      await fetchScheduled(true);
      toast.success("Draft scheduled", {
        description: "The broadcast is now in the scheduled queue.",
      });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to schedule draft";
      toast.error(msg);
      return false;
    } finally {
      setSchedulingId(null);
    }
  };

  const approveCampaign = async (campaignId: string) => {
    try {
      await campaignService.approveCampaign(campaignId);
      toast.success("Campaign approved successfully!", {
        description: "Campaign status updated to approved.",
      });
      fetchScheduled(true);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to approve campaign";
      toast.error(msg);
      return false;
    }
  };

  const rejectCampaign = async (campaignId: string, reason: string) => {
    try {
      await campaignService.rejectCampaign(campaignId, reason);
      toast.success("Campaign rejected", {
        description: "The campaign draft has been marked as rejected with reason.",
      });
      fetchScheduled(true);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to reject campaign";
      toast.error(msg);
      return false;
    }
  };

  return {
    campaigns,
    isLoading,
    isRefreshing,
    error,
    cancellingId,
    permanentlyCancellingId,
    deletingDraftId,
    schedulingId,
    dispatchingId,
    refetch: () => fetchScheduled(false),
    cancelSchedule,
    cancelCampaignPermanently,
    deleteDraft,
    scheduleDraft,
    dispatchNow,
    approveCampaign,
    rejectCampaign,
  };
}
