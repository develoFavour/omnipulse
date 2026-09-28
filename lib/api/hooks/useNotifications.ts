import { useState, useCallback } from "react";
import useSWR from "swr";
import {
  notificationService,
  Notification,
  NotificationsResponse,
} from "@/lib/services/notification.service";

export type { Notification };

export function useNotifications(limit = 20) {
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<NotificationsResponse>(
    `notifications_${limit}`,
    () => notificationService.list(limit),
    {
      // Poll every 30s for new events — fast enough without hammering the DB
      refreshInterval: 30_000,
      // Revalidate when the window regains focus (user comes back to the tab)
      revalidateOnFocus: true,
    }
  );

  const markRead = useCallback(
    async (id: string) => {
      setIsMarkingRead(true);
      try {
        await notificationService.markRead(id);
        // Optimistic update: flip is_read locally immediately
        await mutate(
          (prev) =>
            prev
              ? {
                  ...prev,
                  unread_count: Math.max(0, prev.unread_count - 1),
                  notifications: prev.notifications.map((n) =>
                    n.id === id ? { ...n, is_read: true } : n
                  ),
                }
              : prev,
          { revalidate: false }
        );
      } finally {
        setIsMarkingRead(false);
      }
    },
    [mutate]
  );

  const markAllRead = useCallback(async () => {
    setIsMarkingRead(true);
    try {
      await notificationService.markAllRead();
      await mutate(
        (prev) =>
          prev
            ? {
                unread_count: 0,
                notifications: prev.notifications.map((n) => ({
                  ...n,
                  is_read: true,
                })),
              }
            : prev,
        { revalidate: false }
      );
    } finally {
      setIsMarkingRead(false);
    }
  }, [mutate]);

  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unread_count ?? 0,
    isLoading,
    isError: !!error,
    markRead,
    markAllRead,
    isMarkingRead,
    refetch: mutate,
  };
}
