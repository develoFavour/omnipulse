import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

export interface CampaignPayload {
  title: string;
  message_body: string;
  delivery_type: "direct_message" | "public_post";
  selected_channels: string;
  selected_telegram_destination_ids?: string;
  media_url?: string;
}

export interface CampaignResponse {
  id: string;
  tenant_id: string;
  title: string;
  message_body: string;
  delivery_type: string;
  selected_channels: string;
  selected_telegram_destination_ids: string;
  status: string;
  total_targets: number;
  processed_targets: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignStats {
  sent: number;
  delivered: number;
  failed: number;
}

class CampaignService {
  async createCampaign(payload: CampaignPayload): Promise<CampaignResponse> {
    const response = await apiClient.post<{ success: boolean; data: CampaignResponse }>(
      ENDPOINTS.CAMPAIGNS.BASE,
      payload,
    );
    return response.data.data;
  }

  async getCampaigns(): Promise<CampaignResponse[]> {
    const response = await apiClient.get<{ success: boolean; data: CampaignResponse[] }>(
      ENDPOINTS.CAMPAIGNS.BASE,
    );
    return response.data.data;
  }

  async dispatchCampaign(campaignId: string): Promise<{ message: string; campaign_id: string }> {
    const response = await apiClient.post<{ success: boolean; data: { message: string; campaign_id: string } }>(
      ENDPOINTS.CAMPAIGNS.DISPATCH(campaignId),
    );
    return response.data.data;
  }

  async getCampaignStats(campaignId: string): Promise<CampaignStats> {
    const response = await apiClient.get<{ success: boolean; data: CampaignStats }>(
      ENDPOINTS.CAMPAIGNS.STATS(campaignId),
    );
    return response.data.data;
  }
}

export const campaignService = new CampaignService();
export type { CampaignService };
