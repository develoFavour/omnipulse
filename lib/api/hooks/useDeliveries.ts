import useSWR from "swr";
import { dashboardService, DashboardDeliveryActivity } from "@/lib/services/dashboard.service";

export type { DashboardDeliveryActivity };

export function useDeliveries(limit: number = 100, offset: number = 0) {
  const { data, error, isLoading, mutate } = useSWR<DashboardDeliveryActivity[]>(
    `dashboard_deliveries_${limit}_${offset}`,
    () => dashboardService.listDeliveries(limit, offset),
    {
      refreshInterval: 10000,
    }
  );

  return {
    deliveries: data || [],
    isLoading,
    isError: error,
    refetch: mutate,
  };
}
