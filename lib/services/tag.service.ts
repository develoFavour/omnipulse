import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";
import type { ApiResponse } from "@/lib/api/response";

export interface Tag {
  id: string;
  tenant_id: string;
  name: string;
  color: string;
  contact_count?: number;
  created_at: string;
  updated_at: string;
}

class TagService {
  async listTags(): Promise<Tag[]> {
    try {
      const response = await apiClient.get<ApiResponse<Tag[]>>(ENDPOINTS.TAGS.BASE);
      const payload = response.data as unknown as Tag[];
      return Array.isArray(payload) ? payload : [];
    } catch {
      return [];
    }
  }

  async createTag(name: string, color: string = "#6366f1"): Promise<Tag> {
    const response = await apiClient.post<ApiResponse<Tag>>(ENDPOINTS.TAGS.BASE, { name, color });
    return response.data as unknown as Tag;
  }

  async deleteTag(id: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.TAGS.BY_ID(id));
  }

  async tagContact(contactId: string, tagId: string): Promise<void> {
    await apiClient.post(ENDPOINTS.TAGS.ASSIGN_CONTACT(contactId), { tag_id: tagId });
  }

  async untagContact(contactId: string, tagId: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.TAGS.REMOVE_CONTACT(contactId, tagId));
  }

  async bulkTagContacts(tagId: string, contactIds: string[], action: "assign" | "remove"): Promise<void> {
    await apiClient.post(ENDPOINTS.TAGS.BULK_ASSIGN(tagId), { action, contact_ids: contactIds });
  }

  async updateTag(id: string, name: string, color: string): Promise<Tag> {
    const response = await apiClient.put<ApiResponse<Tag>>(ENDPOINTS.TAGS.BY_ID(id), { name, color });
    return response.data as unknown as Tag;
  }
}

export const tagService = new TagService();
export type { TagService };
