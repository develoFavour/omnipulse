import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

export interface TelegramDestination {
  id: string;
  tenant_id: string;
  channel_id: string;
  telegram_chat_id: string;
  title: string;
  type: "group" | "supergroup" | "channel";
  status: "active" | "archived";
  source: "webhook" | "manual";
  created_at: string;
  updated_at: string;
}

class TelegramDestinationService {
  async getDestinations(): Promise<TelegramDestination[]> {
    const response = await apiClient.get<{ success: boolean; data: TelegramDestination[] }>(
      ENDPOINTS.TELEGRAM.DESTINATIONS,
    );
    return response.data.data;
  }
}

export const telegramDestinationService = new TelegramDestinationService();
