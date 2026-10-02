import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";
import type { ApiResponse } from "@/lib/api/response";

export type NotificationType =
  | "campaign_completed"
  | "delivery_failure"
  | "new_opt_out"
  | "contact_import_finished"
  | "channel_disconnected";

export interface Notification {
  id: string;
  tenant_id: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}

class NotificationService {
  async list(limit = 20): Promise<NotificationsResponse> {
    try {
      const response = await apiClient.get<ApiResponse<NotificationsResponse>>(ENDPOINTS.NOTIFICATIONS.BASE, {
        params: { limit },
      });
      const data = response.data as unknown as NotificationsResponse;
      return {
        notifications: data?.notifications ?? [],
        unread_count: data?.unread_count ?? 0,
      };
    } catch {
      return { notifications: [], unread_count: 0 };
    }
  }

  async markRead(id: string): Promise<void> {
    await apiClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  }

  async markAllRead(): Promise<void> {
    await apiClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  }
}

export const notificationService = new NotificationService();
