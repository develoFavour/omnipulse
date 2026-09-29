import useSWR from "swr";
import { analyticsService, AggregateAnalyticsReport } from "@/lib/services/analytics.service";

export type { AggregateAnalyticsReport };

export function useAnalytics(days = 30) {
  const { data, error, isLoading, mutate } = useSWR<AggregateAnalyticsReport>(
    `analytics_report_${days}`,
    () => analyticsService.getReport(days),
    {
      refreshInterval: 60_000, // Poll every minute
      revalidateOnFocus: true,
      dedupingInterval: 10_000,
    }
  );

  return {
    report: data,
    isLoading,
    isError: !!error,
    error,
    refetch: mutate,
  };
}
