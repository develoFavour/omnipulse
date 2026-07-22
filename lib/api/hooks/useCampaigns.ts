import { useState, useCallback } from "react";
import { campaignService, CampaignPayload, CampaignResponse } from "@/lib/services/campaign.service";

// Re-export types for consumers
export type { CampaignResponse as Campaign, CampaignPayload as CreateCampaignPayload };

export function useCampaigns() {
  const [isCreating, setIsCreating] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
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

  return { createCampaign, dispatchCampaign, isCreating, isDispatching, error };
}
