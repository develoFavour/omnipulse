import useSWR from "swr";

import { dashboardService, DashboardStats, DashboardDeliveryActivity } from "@/lib/services/dashboard.service";
export type { DashboardStats, DashboardDeliveryActivity };

export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
    "dashboard_stats", // Key name is arbitrary now since we pass a custom fetcher
    () => dashboardService.getStats(),
    {
      refreshInterval: 5000, // Refresh every 5 seconds for live telemetry feeling
    }
  );

  return {
    stats: data,
    isLoading,
    isError: error,
    refetch: mutate,
  };
}
