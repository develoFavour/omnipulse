import { useState, useCallback } from "react";
import { campaignService, CampaignPayload, CampaignResponse } from "@/lib/services/campaign.service";

// Re-export types for consumers
export type { CampaignResponse as Campaign, CampaignPayload as CreateCampaignPayload };

export function useCampaigns() {
  const [isCreating, setIsCreating] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCampaign = useCallback(async (payload: CampaignPayload): Promise<CampaignResponse> => {
    setIsCreating(true);
    setError(null);
    try {
      return await campaignService.createCampaign(payload);
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to create campaign";
      setError(msg);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const dispatchCampaign = useCallback(async (campaignId: string): Promise<void> => {
    setIsDispatching(true);
    setError(null);
    try {
      await campaignService.dispatchCampaign(campaignId);
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to dispatch campaign";
      setError(msg);
      throw err;
    } finally {
      setIsDispatching(false);
    }
  }, []);

  const scheduleCampaign = useCallback(async (campaignId: string, scheduledAt: Date): Promise<void> => {
    setIsScheduling(true);
    setError(null);
    try {
      await campaignService.scheduleCampaign(campaignId, scheduledAt);
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to schedule campaign";
      setError(msg);
      throw err;
    } finally {
      setIsScheduling(false);
    }
  }, []);

  const cancelScheduledCampaign = useCallback(async (campaignId: string): Promise<void> => {
    setError(null);
    try {
      await campaignService.cancelScheduledCampaign(campaignId);
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to cancel scheduled campaign";
      setError(msg);
      throw err;
    }
  }, []);

  return { createCampaign, dispatchCampaign, scheduleCampaign, cancelScheduledCampaign, isCreating, isDispatching, isScheduling, error };
}
