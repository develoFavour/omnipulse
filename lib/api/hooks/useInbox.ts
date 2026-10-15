import { useState, useCallback } from "react";
import useSWR from "swr";
import {
  inboxService,
  type Conversation,
  type InboxMessage,
  type ConversationFilter,
  type ConversationListResponse,
  type ConversationStatus,
} from "@/lib/services/inbox.service";

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
      refreshInterval: 15_000,
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
      refreshInterval: 10_000,
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
        // Optimistic: append the new message immediately
        await mutate(
          (prev) => (prev ? [...prev, newMsg] : [newMsg]),
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
