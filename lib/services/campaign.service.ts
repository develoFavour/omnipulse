import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";
import type { ApiResponse } from "@/lib/api/response";

export interface CampaignPayload {
  title: string;
  message_body: string;
  delivery_type: "direct_message" | "public_post";
  selected_channels: string;
  selected_telegram_destination_ids?: string;
  selected_contact_ids?: string;
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
  selected_contact_ids?: string;
  media_url?: string;
  status: string;
  scheduled_at?: string;
  submitted_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  total_targets: number;
  processed_targets: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignReport {
  campaign: CampaignResponse;
  stats: CampaignStats;
  deliveries?: CampaignDeliveryItem[];
  read_rate: number;
  delivery_rate: number;
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
    const response = await apiClient.post<ApiResponse<CampaignResponse>>(ENDPOINTS.CAMPAIGNS.BASE, payload);
    return response.data as unknown as CampaignResponse;
  }

  async getCampaigns(status?: string, page = 1, pageSize = 50): Promise<CampaignResponse[]> {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (page) params.append("page", String(page));
    if (pageSize) params.append("pageSize", String(pageSize));
    const qs = params.toString();
    const url = qs ? `${ENDPOINTS.CAMPAIGNS.BASE}?${qs}` : ENDPOINTS.CAMPAIGNS.BASE;
    const response = await apiClient.get<ApiResponse<CampaignResponse[]>>(url);
    return response.data as unknown as CampaignResponse[];
  }

  async getCampaignById(campaignId: string): Promise<CampaignResponse> {
    const response = await apiClient.get<ApiResponse<CampaignResponse>>(ENDPOINTS.CAMPAIGNS.BY_ID(campaignId));
    return response.data as unknown as CampaignResponse;
  }

  async dispatchCampaign(campaignId: string): Promise<{ message: string; campaign_id: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string; campaign_id: string }>>(
      ENDPOINTS.CAMPAIGNS.DISPATCH(campaignId)
    );
    return response.data as unknown as { message: string; campaign_id: string };
  }

  async pauseCampaign(campaignId: string): Promise<{ message: string; campaign_id: string; status: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string; campaign_id: string; status: string }>>(
      ENDPOINTS.CAMPAIGNS.PAUSE(campaignId),
    );
    return response.data as unknown as { message: string; campaign_id: string; status: string };
  }

  async resumeCampaign(campaignId: string): Promise<{ message: string; campaign_id: string; status: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string; campaign_id: string; status: string }>>(
      ENDPOINTS.CAMPAIGNS.RESUME(campaignId),
    );
    return response.data as unknown as { message: string; campaign_id: string; status: string };
  }

  async cancelCampaign(campaignId: string): Promise<{ message: string; campaign_id: string; status: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string; campaign_id: string; status: string }>>(
      ENDPOINTS.CAMPAIGNS.CANCEL(campaignId),
    );
    return response.data as unknown as { message: string; campaign_id: string; status: string };
  }

  async getCampaignStats(campaignId: string): Promise<CampaignStats> {
    const response = await apiClient.get<ApiResponse<CampaignStats>>(ENDPOINTS.CAMPAIGNS.STATS(campaignId));
    return response.data as unknown as CampaignStats;
  }

  async getCampaignDeliveries(campaignId: string, page = 1, pageSize = 50): Promise<CampaignDeliveryItem[]> {
    const response = await apiClient.get<ApiResponse<CampaignDeliveryItem[]>>(
      `${ENDPOINTS.CAMPAIGNS.DELIVERIES(campaignId)}?page=${page}&pageSize=${pageSize}`
    );
    return response.data as unknown as CampaignDeliveryItem[];
  }

  async scheduleCampaign(
    campaignId: string,
    scheduledAt: Date
  ): Promise<{ message: string; campaign_id: string; scheduled_at: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string; campaign_id: string; scheduled_at: string }>>(
      ENDPOINTS.CAMPAIGNS.SCHEDULE(campaignId),
      { scheduled_at: scheduledAt.toISOString() }
    );
    return response.data as unknown as { message: string; campaign_id: string; scheduled_at: string };
  }

  async cancelScheduledCampaign(campaignId: string): Promise<{ message: string; campaign_id: string }> {
    const response = await apiClient.delete<ApiResponse<{ message: string; campaign_id: string }>>(
      ENDPOINTS.CAMPAIGNS.SCHEDULE(campaignId)
    );
    return response.data as unknown as { message: string; campaign_id: string };
  }

  async submitForApproval(campaignId: string): Promise<{ message: string; campaign_id: string; status: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string; campaign_id: string; status: string }>>(
      ENDPOINTS.CAMPAIGNS.SUBMIT(campaignId)
    );
    return response.data as unknown as { message: string; campaign_id: string; status: string };
  }

  async approveCampaign(campaignId: string): Promise<{ message: string; campaign_id: string; status: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string; campaign_id: string; status: string }>>(
      ENDPOINTS.CAMPAIGNS.APPROVE(campaignId)
    );
    return response.data as unknown as { message: string; campaign_id: string; status: string };
  }

  async rejectCampaign(campaignId: string, reason: string): Promise<{ message: string; campaign_id: string; status: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string; campaign_id: string; status: string }>>(
      ENDPOINTS.CAMPAIGNS.REJECT(campaignId),
      { reason }
    );
    return response.data as unknown as { message: string; campaign_id: string; status: string };
  }

  async getCampaignReport(campaignId: string): Promise<CampaignReport> {
    const response = await apiClient.get<ApiResponse<CampaignReport>>(ENDPOINTS.CAMPAIGNS.REPORT(campaignId));
    return response.data as unknown as CampaignReport;
  }

  async exportCampaignReport(campaignId: string): Promise<void> {
    const response = await apiClient.get(ENDPOINTS.CAMPAIGNS.EXPORT(campaignId), {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data as BlobPart], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `campaign-report-${campaignId.slice(0, 8)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
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
    url += `?token=${token}`;
  }
  return url;
}
