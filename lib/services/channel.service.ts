import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

export interface ChannelPayload {
  platform_name: string;
  sender_identity: string;
  encrypted_credentials: {
    bot_token?: string;
    [key: string]: any;
  };
}

export interface ChannelResponse {
  id: string;
  tenant_id: string;
  platform_name: string;
  sender_identity: string;
  status: string;
  created_at: string;
  updated_at: string;
}

class ChannelService {
  async createChannel(payload: ChannelPayload): Promise<ChannelResponse> {
    const response = await apiClient.post<{ success: boolean; data: ChannelResponse }>(
      ENDPOINTS.CHANNELS.BASE,
      payload,
    );
    return response.data.data;
  }

  async getChannels(): Promise<ChannelResponse[]> {
    const response = await apiClient.get<{ success: boolean; data: ChannelResponse[] }>(
      ENDPOINTS.CHANNELS.BASE,
    );
    return response.data.data;
  }

  async connectWhatsApp(code: string): Promise<ChannelResponse> {
    const response = await apiClient.post<{ success: boolean; data: ChannelResponse }>(
      `${ENDPOINTS.CHANNELS.BASE}/whatsapp/callback`,
      { code },
    );
    return response.data.data;
  }
}

export const channelService = new ChannelService();
export type { ChannelService };
