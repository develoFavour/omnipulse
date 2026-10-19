import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ConversationStatus = "open" | "closed" | "waiting";
export type MessageDirection = "inbound" | "outbound";
export type MessageSenderType = "contact" | "agent" | "bot" | "system";

export interface ConversationContact {
  id: string;
  first_name: string;
  last_name: string;
  routing_value: string;
  channel: string;
  avatar_url?: string;
}

export interface Conversation {
  id: string;
  tenant_id: string;
  contact_id: string;
  channel: string;
  status: ConversationStatus;
  assigned_to?: string;
  last_message_text?: string;
  last_message_at: string;
  unread_count: number;
  ai_state?: "active" | "paused_by_human" | "escalated" | "disabled";
  ai_paused_until?: string;
  needs_human_attention?: boolean;
  created_at: string;
  updated_at: string;
  contact?: ConversationContact;
  assigned_user?: { id: string; first_name: string; last_name: string };
}

export interface InboxMessage {
  id: string;
  tenant_id: string;
  conversation_id: string;
  direction: MessageDirection;
  sender_type: MessageSenderType;
  sender_id?: string;
  body: string;
  media_url?: string;
  media_type?: string;
  platform_message_id?: string;
  status: string;
  error_message?: string;
  is_deleted: boolean;
  edited_at?: string;
  created_at: string;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
  limit: number;
  offset: number;
}

export interface MessagesResponse {
  messages: InboxMessage[];
}

export interface ConversationFilter {
  channel?: string;
  status?: string;
  search?: string;
  assigned_to?: string;
  needs_attention?: boolean;
  limit?: number;
  offset?: number;
}

// ─── Service ─────────────────────────────────────────────────────────────────

class InboxService {
  async listConversations(
    filter: ConversationFilter = {}
  ): Promise<ConversationListResponse> {
    const params: Record<string, string | number> = {};
    if (filter.channel && filter.channel !== "all")
      params.channel = filter.channel;
    if (filter.status && filter.status !== "all")
      params.status = filter.status;
    if (filter.search) params.search = filter.search;
    if (filter.assigned_to) params.assigned_to = filter.assigned_to;
    if (filter.needs_attention) params.needs_attention = "true";
    params.limit = filter.limit ?? 30;
    params.offset = filter.offset ?? 0;

    const response = await apiClient.get<ConversationListResponse>(
      ENDPOINTS.INBOX.CONVERSATIONS,
      { params }
    );
    const data = response.data as unknown as ConversationListResponse;
    return {
      conversations: data?.conversations ?? [],
      total: data?.total ?? 0,
      limit: data?.limit ?? 30,
      offset: data?.offset ?? 0,
    };
  }

  async getConversation(id: string): Promise<Conversation> {
    const response = await apiClient.get<Conversation>(
      ENDPOINTS.INBOX.CONVERSATION(id)
    );
    return response.data as unknown as Conversation;
  }

  async listMessages(
    conversationId: string,
    limit = 50,
    offset = 0
  ): Promise<InboxMessage[]> {
    const response = await apiClient.get<MessagesResponse>(
      ENDPOINTS.INBOX.MESSAGES(conversationId),
      { params: { limit, offset } }
    );
    const data = response.data as unknown as MessagesResponse;
    return data?.messages ?? [];
  }

  async sendReply(
    conversationId: string,
    body: string,
    mediaUrl?: string
  ): Promise<InboxMessage> {
    const payload: Record<string, string> = { body };
    if (mediaUrl) payload.media_url = mediaUrl;
    const response = await apiClient.post<InboxMessage>(
      ENDPOINTS.INBOX.REPLY(conversationId),
      payload
    );
    return response.data as unknown as InboxMessage;
  }

  async updateConversation(
    conversationId: string,
    updates: { status?: ConversationStatus; assigned_to?: string | null }
  ): Promise<void> {
    await apiClient.patch(
      ENDPOINTS.INBOX.UPDATE(conversationId),
      updates
    );
  }

  async markAsRead(conversationId: string): Promise<void> {
    await apiClient.post(ENDPOINTS.INBOX.MARK_READ(conversationId));
  }

  async editMessage(messageId: string, body: string): Promise<InboxMessage> {
    const response = await apiClient.patch<InboxMessage>(
      ENDPOINTS.INBOX.EDIT_MESSAGE(messageId),
      { body }
    );
    return response.data as unknown as InboxMessage;
  }

  async deleteMessage(messageId: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.INBOX.DELETE_MESSAGE(messageId));
  }

  async toggleAI(
    conversationId: string,
    aiState: "active" | "paused_by_human",
    clearNeedsHuman = false
  ): Promise<{ conversation_id: string; ai_state: string; paused_until?: string }> {
    const response = await apiClient.post(
      ENDPOINTS.AI_AGENT.CONVERSATION_TOGGLE(conversationId),
      { ai_state: aiState, clear_needs_human: clearNeedsHuman }
    );
    return response.data as unknown as { conversation_id: string; ai_state: string; paused_until?: string };
  }
}

export const inboxService = new InboxService();
