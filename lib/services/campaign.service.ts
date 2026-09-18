import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

export interface CampaignPayload {
  title: string;
  message_body: string;
  delivery_type: "direct_message" | "public_post";
  selected_channels: string;
  selected_telegram_destination_ids?: string;
  selected_contact_ids?: string; // JSON array of contact IDs — empty means "all eligible"
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
  campaign_id?: string;
  status?: string;
  total_targets?: number;
  processed_targets?: number;
  sent: number;
  delivered: number;
  failed: number;
  progress_percent?: number;
}

export interface CampaignDeliveryItem {
  id: string;
  campaign_id: string;
  contact_id?: string;
  target_type: "contact" | "telegram_destination";
  platform: string;
  routing_value: string;
  status: "delivered" | "failed" | "sent";
  error_message?: string;
  created_at: string;
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

  async getCampaignById(campaignId: string): Promise<CampaignResponse> {
    const response = await apiClient.get<{ success: boolean; data: CampaignResponse }>(
      ENDPOINTS.CAMPAIGNS.BY_ID(campaignId),
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

  async getCampaignDeliveries(campaignId: string, page = 1, pageSize = 50): Promise<CampaignDeliveryItem[]> {
    const response = await apiClient.get<{ success: boolean; data: CampaignDeliveryItem[] }>(
      `${ENDPOINTS.CAMPAIGNS.DELIVERIES(campaignId)}?page=${page}&pageSize=${pageSize}`,
    );
    return response.data.data;
  }
}

export const campaignService = new CampaignService();
export type { CampaignService };

export function getCampaignWebSocketURL(campaignId: string, token?: string | null): string {
  const httpUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const wsProto = httpUrl.startsWith("https") ? "wss" : "ws";
  const cleanHost = httpUrl.replace(/^https?:\/\//, "");
  let url = `${wsProto}://${cleanHost}/api/v1/ws/campaigns/${campaignId}`;
  if (token) {
    url += `?token=${encodeURIComponent(token)}`;
  }
  return url;
}
