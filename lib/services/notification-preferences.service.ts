import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

export type NotificationPreference = { key: string; email: boolean; in_app: boolean };

class NotificationPreferencesService {
  async get(): Promise<NotificationPreference[]> {
    const response = await apiClient.get<NotificationPreference[]>(ENDPOINTS.NOTIFICATIONS.PREFERENCES);
    return response.data ?? [];
  }

  async update(preferences: NotificationPreference[]): Promise<NotificationPreference[]> {
    const response = await apiClient.put<NotificationPreference[]>(ENDPOINTS.NOTIFICATIONS.PREFERENCES, { preferences });
    return response.data ?? preferences;
  }
}

export const notificationPreferencesService = new NotificationPreferencesService();
