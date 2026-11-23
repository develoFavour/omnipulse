import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

export interface CannedReply {
  id: string;
  tenant_id: string;
  shortcut: string;
  title: string;
  body: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCannedReplyPayload {
  shortcut: string;
  title: string;
  body: string;
}

export const cannedReplyService = {
  list: async (): Promise<CannedReply[]> => {
    const res = await apiClient.get<CannedReply[]>(ENDPOINTS.CANNED_REPLIES.BASE);
    return res.data;
  },
  create: async (payload: CreateCannedReplyPayload): Promise<CannedReply> => {
    const res = await apiClient.post<CannedReply>(ENDPOINTS.CANNED_REPLIES.BASE, payload);
    return res.data;
  },
  update: async (id: string, payload: CreateCannedReplyPayload): Promise<CannedReply> => {
    const res = await apiClient.put<CannedReply>(ENDPOINTS.CANNED_REPLIES.BY_ID(id), payload);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.CANNED_REPLIES.BY_ID(id));
  },
};
