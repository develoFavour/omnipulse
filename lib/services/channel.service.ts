import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";
import type { ApiResponse } from "@/lib/api/response";

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

export interface WhatsAppOAuthConfig {
  app_id: string;
  config_id: string;
  redirect_uri: string;
}

export interface WhatsAppOAuthCallbackResponse {
  channel: ChannelResponse;
  waba_id: string;
  phone_number_id: string;
  sender_identity: string;
}

class ChannelService {
  async createChannel(payload: ChannelPayload): Promise<ChannelResponse> {
    const response = await apiClient.post<ApiResponse<ChannelResponse>>(ENDPOINTS.CHANNELS.BASE, payload);
    return response.data as unknown as ChannelResponse;
  }

  async getChannels(): Promise<ChannelResponse[]> {
    const response = await apiClient.get<ApiResponse<ChannelResponse[]>>(ENDPOINTS.CHANNELS.BASE);
    return response.data as unknown as ChannelResponse[];
  }

  async connectWhatsApp(code: string): Promise<ChannelResponse> {
    const response = await apiClient.post<ApiResponse<ChannelResponse>>(
      `${ENDPOINTS.CHANNELS.BASE}/whatsapp/callback`,
      { code }
    );
    return response.data as unknown as ChannelResponse;
  }

  async disconnectChannel(platform: string): Promise<{ message: string; platform: string }> {
    const response = await apiClient.delete<ApiResponse<{ message: string; platform: string }>>(
      ENDPOINTS.CHANNELS.DISCONNECT(platform)
    );
    return response.data as unknown as { message: string; platform: string };
  }

  async getWhatsAppOAuthConfig(): Promise<WhatsAppOAuthConfig> {
    const response = await apiClient.get<ApiResponse<WhatsAppOAuthConfig>>(ENDPOINTS.WHATSAPP.OAUTH_CONFIG);
    return response.data as unknown as WhatsAppOAuthConfig;
  }

  async exchangeWhatsAppOAuthCode(
    code: string,
    waba_id?: string,
    phone_number_id?: string,
    redirect_uri?: string,
    source?: string
  ): Promise<WhatsAppOAuthCallbackResponse> {
    const response = await apiClient.post<ApiResponse<WhatsAppOAuthCallbackResponse>>(
      ENDPOINTS.WHATSAPP.OAUTH_CALLBACK,
      { code, waba_id, phone_number_id, redirect_uri, source }
    );
    return response.data as unknown as WhatsAppOAuthCallbackResponse;
  }

  async getWhatsAppQR(): Promise<{ qr_code: string; status?: string; phone?: string; name?: string }> {
    const response = await apiClient.get<ApiResponse<{ qr_code: string; status?: string; phone?: string; name?: string }>>(
      ENDPOINTS.WHATSAPP.QR
    );
    return response.data as unknown as { qr_code: string; status?: string; phone?: string; name?: string };
  }

  async getWhatsAppQRStatus(): Promise<{ status: string; phone?: string; name?: string }> {
    const response = await apiClient.get<ApiResponse<{ status: string; phone?: string; name?: string }>>(
      ENDPOINTS.WHATSAPP.STATUS
    );
    return response.data as unknown as { status: string; phone?: string; name?: string };
  }

  async disconnectWhatsAppQR(): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(ENDPOINTS.WHATSAPP.DISCONNECT);
    return response.data as unknown as { message: string };
  }

  async syncWhatsAppContacts(): Promise<{ synced_count: number; message: string }> {
    const response = await apiClient.post<ApiResponse<{ synced_count: number; message: string }>>(
      ENDPOINTS.WHATSAPP.SYNC_CONTACTS
    );
    return response.data as unknown as { synced_count: number; message: string };
  }

  async syncTelegramContacts(): Promise<{
    synced_count: number;
    total_count: number;
    message: string;
    bot_username?: string;
    bot_link?: string;
  }> {
    const response = await apiClient.post<
      ApiResponse<{ synced_count: number; total_count: number; message: string; bot_username?: string; bot_link?: string }>
    >(ENDPOINTS.TELEGRAM.SYNC_CONTACTS);
    return response.data as unknown as {
      synced_count: number;
      total_count: number;
      message: string;
      bot_username?: string;
      bot_link?: string;
    };
  }
}

export const channelService = new ChannelService();
export type { ChannelService };
