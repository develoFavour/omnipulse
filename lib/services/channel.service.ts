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
		const response = await apiClient.post<{
			success: boolean;
			data: ChannelResponse;
		}>(ENDPOINTS.CHANNELS.BASE, payload);
		return response.data.data;
	}

	async getChannels(): Promise<ChannelResponse[]> {
		const response = await apiClient.get<{
			success: boolean;
			data: ChannelResponse[];
		}>(ENDPOINTS.CHANNELS.BASE);
		return response.data.data;
	}

	async connectWhatsApp(code: string): Promise<ChannelResponse> {
		const response = await apiClient.post<{
			success: boolean;
			data: ChannelResponse;
		}>(`${ENDPOINTS.CHANNELS.BASE}/whatsapp/callback`, { code });
		return response.data.data;
	}

	async disconnectChannel(
		platform: string,
	): Promise<{ message: string; platform: string }> {
		const response = await apiClient.delete<{
			success: boolean;
			data: { message: string; platform: string };
		}>(ENDPOINTS.CHANNELS.DISCONNECT(platform));
		return response.data.data;
	}

	async getWhatsAppOAuthConfig(): Promise<WhatsAppOAuthConfig> {
		const response = await apiClient.get<{
			success: boolean;
			data: WhatsAppOAuthConfig;
		}>(ENDPOINTS.WHATSAPP.OAUTH_CONFIG);
		return response.data.data;
	}

	async exchangeWhatsAppOAuthCode(
		code: string,
		waba_id?: string,
		phone_number_id?: string,
		redirect_uri?: string,
		source?: string,
	): Promise<WhatsAppOAuthCallbackResponse> {
		const response = await apiClient.post<{
			success: boolean;
			data: WhatsAppOAuthCallbackResponse;
		}>(ENDPOINTS.WHATSAPP.OAUTH_CALLBACK, {
			code,
			waba_id,
			phone_number_id,
			redirect_uri,
			source,
		});
		return response.data.data;
	}
}

export const channelService = new ChannelService();
export type { ChannelService };
