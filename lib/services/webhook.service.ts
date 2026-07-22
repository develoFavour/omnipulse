import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

class WebhookService {
  /**
   * Simulates an inbound message from Telegram to the webhook endpoint
   */
  async simulateTelegramWebhook(tenantId: string, payload: any): Promise<void> {
    await apiClient.post(ENDPOINTS.WEBHOOKS.TELEGRAM(tenantId), payload);
  }
}

export const webhookService = new WebhookService();
export type { WebhookService };
