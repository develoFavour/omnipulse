import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

export interface ChannelStat {
  name: string;
  value: number;
  color: string;
  icon: string;
}

export interface DashboardDeliveryActivity {
  id: string;
  campaign_name: string;
  contact_name: string;
  platform: string;
  status: string;
  error_message?: string;
  created_at: string;
}

export interface DashboardStats {
  total_audience: number;
  broadcasts_sent: number;
  delivery_rate: number;
  active_channels: number;
  total_deliveries: number;
  failed_deliveries: number;
  channel_data: ChannelStat[];
  recent_activities: DashboardDeliveryActivity[];
}

class DashboardService {
  /**
   * Retrieves the aggregated global dashboard statistics.
   */
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>(ENDPOINTS.DASHBOARD.STATS);
    return response.data;
  }

  /**
   * Retrieves the paginated delivery history.
   */
  async listDeliveries(limit: number = 100, offset: number = 0): Promise<DashboardDeliveryActivity[]> {
    const response = await apiClient.get<DashboardDeliveryActivity[]>(
      `${ENDPOINTS.DASHBOARD.DELIVERIES}?limit=${limit}&offset=${offset}`
    );
    return response.data;
  }
}

export const dashboardService = new DashboardService();
export type { DashboardService };
