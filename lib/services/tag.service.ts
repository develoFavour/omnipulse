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
    const response = await apiClient.get<Tag[]>(ENDPOINTS.TAGS.BASE);
    return response.data || [];
  }

  async createTag(name: string, color: string = "#6366f1"): Promise<Tag> {
    const response = await apiClient.post<Tag>(ENDPOINTS.TAGS.BASE, { name, color });
    return response.data;
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
}

export const tagService = new TagService();
export type { TagService };
