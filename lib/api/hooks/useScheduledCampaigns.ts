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
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const fetchScheduled = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    setError(null);
    try {
      const data = await campaignService.getCampaigns("scheduled", 1, 100);
      const enriched = (data || []).map(enrichCampaign);
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

  return {
    campaigns,
    isLoading,
    isRefreshing,
    error,
    cancellingId,
    dispatchingId,
    refetch: () => fetchScheduled(false),
    cancelSchedule,
    dispatchNow,
  };
}
