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

export interface LatestCampaignInfo {
  id: string;
  title: string;
  status: string;
  total_targets: number;
  processed_targets: number;
  delivered_count: number;
  failed_count: number;
  delivery_rate: number;
  created_at: string;
}

export interface AudienceHealthInfo {
  total_contacts: number;
  active_contacts: number;
  opt_out_count: number;
  opt_out_rate: number;
  new_contacts_this_week: number;
  status: "Optimal" | "Healthy" | "Attention" | string;
}

export interface OnboardingProgressInfo {
  workspace_created: boolean;
  channels_connected: boolean;
  contacts_imported: boolean;
  first_broadcast_sent: boolean;
  completion_percentage: number;
  completed_steps: number;
  total_steps: number;
}

export interface PlanUsageInfo {
  plan_tier: string;
  plan_badge: string;
  monthly_message_limit: number;
  messages_sent_this_month: number;
  contacts_stored: number;
  contacts_limit: number;
  channels_connected: number;
  channels_limit: number;
  is_unlimited: boolean;
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
  latest_campaign?: LatestCampaignInfo;
  audience_health: AudienceHealthInfo;
  onboarding_progress: OnboardingProgressInfo;
  plan_usage: PlanUsageInfo;
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
