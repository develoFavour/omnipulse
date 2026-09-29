import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

export interface AnalyticsOverview {
  total_sent: number;
  total_delivered: number;
  total_failed: number;
  delivery_rate: number;
  campaigns_count: number;
  total_audience_reach: number;
  period_growth_sent: number;
  period_growth_rate: number;
}

export interface DailyDeliveryPoint {
  date: string; // YYYY-MM-DD
  sent: number;
  delivered: number;
  failed: number;
  delivery_rate: number;
}

export interface PlatformAnalytics {
  platform: string; // "whatsapp", "telegram"
  total: number;
  delivered: number;
  failed: number;
  delivery_rate: number;
  share_percentage: number;
}

export interface HourlyPerformance {
  hour: number;
  total: number;
  delivered: number;
  delivery_rate: number;
}

export interface TopCampaignMetric {
  id: string;
  title: string;
  total_targets: number;
  delivered: number;
  failed: number;
  delivery_rate: number;
  status: string;
  created_at: string;
}

export interface AggregateAnalyticsReport {
  days: number;
  start_date: string;
  end_date: string;
  overview: AnalyticsOverview;
  daily_trend: DailyDeliveryPoint[];
  platform_breakdown: PlatformAnalytics[];
  hourly_distribution: HourlyPerformance[];
  top_campaigns: TopCampaignMetric[];
}

class AnalyticsService {
  async getReport(days = 30): Promise<AggregateAnalyticsReport> {
    const response = await apiClient.get<any>(ENDPOINTS.ANALYTICS.REPORT(days));
    const data = response.data?.data ?? response.data;
    return {
      days: data?.days ?? days,
      start_date: data?.start_date ?? "",
      end_date: data?.end_date ?? "",
      overview: data?.overview ?? {
        total_sent: 0,
        total_delivered: 0,
        total_failed: 0,
        delivery_rate: 0,
        campaigns_count: 0,
        total_audience_reach: 0,
        period_growth_sent: 0,
        period_growth_rate: 0,
      },
      daily_trend: data?.daily_trend ?? [],
      platform_breakdown: data?.platform_breakdown ?? [],
      hourly_distribution: data?.hourly_distribution ?? [],
      top_campaigns: data?.top_campaigns ?? [],
    };
  }
}

export const analyticsService = new AnalyticsService();
