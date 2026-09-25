import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

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
      const response = await apiClient.get<any>(ENDPOINTS.TAGS.BASE);
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (Array.isArray(response.data?.data)) {
        return response.data.data;
      }
      return [];
    } catch {
      return [];
    }
  }

  async createTag(name: string, color: string = "#6366f1"): Promise<Tag> {
    const response = await apiClient.post<any>(ENDPOINTS.TAGS.BASE, { name, color });
    return response.data?.data || response.data;
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
    await apiClient.post(ENDPOINTS.TAGS.BULK_ASSIGN(tagId), {
      action,
      contact_ids: contactIds,
    });
  }

  async updateTag(id: string, name: string, color: string): Promise<Tag> {
    const response = await apiClient.put<any>(ENDPOINTS.TAGS.BY_ID(id), { name, color });
    return response.data?.data || response.data;
  }
}

export const tagService = new TagService();
export type { TagService };
