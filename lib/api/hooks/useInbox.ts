import { useState, useCallback, useEffect, useRef } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import {
  inboxService,
  type Conversation,
  type InboxMessage,
  type ConversationFilter,
  type ConversationListResponse,
  type ConversationStatus,
} from "@/lib/services/inbox.service";
import { getAuthToken } from "@/lib/api/axios-instance";

export type {
  Conversation,
  InboxMessage,
  ConversationFilter,
  ConversationStatus,
};

export function useInboxConversations(filter: ConversationFilter = {}) {
  const key = `inbox_conversations_${JSON.stringify(filter)}`;

  const { data, error, isLoading, mutate } = useSWR<ConversationListResponse>(
    key,
    () => inboxService.listConversations(filter),
    {
      // Keep a fallback poll in case WebSocket drops — reduced since WS handles real-time
      refreshInterval: 60_000,
      revalidateOnFocus: true,
    }
  );

  return {
    conversations: data?.conversations ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError: !!error,
    refetch: mutate,
  };
}

export function useInboxMessages(conversationId: string | null) {
  const key = conversationId
    ? `inbox_messages_${conversationId}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<InboxMessage[]>(
    key,
    () => inboxService.listMessages(conversationId!, 100, 0),
    {
      // Keep a fallback poll — reduced since WS handles real-time
      refreshInterval: 60_000,
      revalidateOnFocus: true,
    }
  );

  const [isSending, setIsSending] = useState(false);

  const sendReply = useCallback(
    async (body: string, mediaUrl?: string) => {
      if (!conversationId) return;
      setIsSending(true);
      try {
        const newMsg = await inboxService.sendReply(
          conversationId,
          body,
          mediaUrl
        );
        // Deduplicate before appending to avoid doubling with live WebSocket events
        await mutate(
          (prev) => {
            if (!prev) return [newMsg];
            if (
              prev.some(
                (m) =>
                  m.id === newMsg.id ||
                  (m.direction === newMsg.direction && m.body === newMsg.body)
              )
            ) {
              return prev;
            }
            return [...prev, newMsg];
          },
          { revalidate: false }
        );
        return newMsg;
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, mutate]
  );

  const markAsRead = useCallback(async () => {
    if (!conversationId) return;
    await inboxService.markAsRead(conversationId);
  }, [conversationId]);

  return {
    messages: data ?? [],
    isLoading,
    isError: !!error,
    isSending,
    sendReply,
    markAsRead,
    refetch: mutate,
  };
}

export function useInboxActions() {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = useCallback(
    async (conversationId: string, status: ConversationStatus) => {
      setIsUpdating(true);
      try {
        await inboxService.updateConversation(conversationId, { status });
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  const assignConversation = useCallback(
    async (conversationId: string, userId: string | null) => {
      setIsUpdating(true);
      try {
        await inboxService.updateConversation(conversationId, {
          assigned_to: userId,
        });
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return { updateStatus, assignConversation, isUpdating };
}

// ─── Real-Time WebSocket Hook ─────────────────────────────────────────────────

/**
 * Opens a persistent WebSocket to the backend inbox hub and instantly updates
 * SWR caches when the server pushes a NEW_MESSAGE or CONVERSATION_UPDATED event.
 * This eliminates polling latency so all dashboard users see messages in ~0ms.
 *
 * @param conversationFilter The same filter object used by useInboxConversations
 *                           (needed to match and revalidate its SWR cache key).
 * @param activeConversationId The conversation currently open in the thread panel.
 */
export function useInboxWebSocket(
  conversationFilter: ConversationFilter,
  activeConversationId: string | null
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUnmountedRef = useRef(false);

  const convListKey = `inbox_conversations_${JSON.stringify(conversationFilter)}`;

  const connect = useCallback(async () => {
    if (isUnmountedRef.current) return;

    // Clean up any existing socket before creating a new one
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.close();
    }

    const token = await getAuthToken();
    if (!token) {
      // Auth not ready yet — retry in 2s
      reconnectTimeoutRef.current = setTimeout(connect, 2000);
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const wsBase = apiBase.replace(/^http/, "ws");
    const url = `${wsBase}/api/v1/ws/inbox?token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[INBOX-WS] 🔌 Connected to real-time inbox stream");
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data as string) as {
          type: string;
          conversation_id: string;
          message?: InboxMessage;
          conversation?: Conversation;
        };

        if (payload.type === "NEW_MESSAGE") {
          // 1. If this conversation is currently open, append the message to its SWR cache
          const msgKey = `inbox_messages_${payload.conversation_id}`;
          globalMutate(
            msgKey,
            (prev: InboxMessage[] | undefined) => {
              if (!prev) return prev;
              const incoming = payload.message;
              if (!incoming) return prev;
              // Deduplicate by ID or (same direction, same body, sent within 5 seconds)
              const exists = prev.some(
                (m) =>
                  m.id === incoming.id ||
                  (m.direction === incoming.direction &&
                    m.body === incoming.body &&
                    Math.abs(new Date(m.created_at).getTime() - new Date(incoming.created_at).getTime()) < 5000)
              );
              if (exists) return prev;
              return [...prev, incoming];
            },
            { revalidate: false }
          );

          // 2. Always revalidate the conversation list so the last_message_text / unread_count updates
          globalMutate(convListKey);
        }
      } catch (err) {
        console.warn("[INBOX-WS] Failed to parse event", err);
      }
    };

    ws.onerror = (err) => {
      console.warn("[INBOX-WS] WebSocket error", err);
    };

    ws.onclose = (event) => {
      console.log(`[INBOX-WS] Disconnected (code=${event.code}). Reconnecting in 3s…`);
      if (!isUnmountedRef.current) {
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      }
    };
  }, [convListKey]);

  useEffect(() => {
    isUnmountedRef.current = false;
    connect();

    return () => {
      isUnmountedRef.current = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close(1000, "component unmounted");
    };
  }, [connect]);
}
