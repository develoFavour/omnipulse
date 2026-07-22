import { useCallback, useEffect, useState } from "react";
import {
  telegramDestinationService,
  TelegramDestination,
} from "@/lib/services/telegram-destination.service";

export function useTelegramDestinations() {
  const [destinations, setDestinations] = useState<TelegramDestination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDestinations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await telegramDestinationService.getDestinations();
      setDestinations(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load Telegram destinations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  return { destinations, isLoading, error, refetch: fetchDestinations };
}
