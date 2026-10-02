import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";
import type { ApiResponse } from "@/lib/api/response";

export interface MessageTemplate {
  id: string;
  tenant_id: string;
  title: string;
  category: string;
  body: string;
  media_url?: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateInput {
  title: string;
  category?: string;
  body: string;
  media_url?: string;
  variables?: string[];
}

export interface UpdateTemplateInput {
  title: string;
  category?: string;
  body: string;
  media_url?: string;
  variables?: string[];
}

class TemplateService {
  async listTemplates(category?: string): Promise<MessageTemplate[]> {
    try {
      const url =
        category && category !== "all"
          ? `${ENDPOINTS.TEMPLATES.BASE}?category=${encodeURIComponent(category)}`
          : ENDPOINTS.TEMPLATES.BASE;
      const response = await apiClient.get<ApiResponse<MessageTemplate[]>>(url);
      const payload = response.data as unknown as MessageTemplate[];
      return Array.isArray(payload) ? payload : [];
    } catch {
      return [];
    }
  }

  async getTemplate(id: string): Promise<MessageTemplate> {
    const response = await apiClient.get<ApiResponse<MessageTemplate>>(ENDPOINTS.TEMPLATES.BY_ID(id));
    return response.data as unknown as MessageTemplate;
  }

  async createTemplate(data: CreateTemplateInput): Promise<MessageTemplate> {
    const response = await apiClient.post<ApiResponse<MessageTemplate>>(ENDPOINTS.TEMPLATES.BASE, data);
    return response.data as unknown as MessageTemplate;
  }

  async updateTemplate(id: string, data: UpdateTemplateInput): Promise<MessageTemplate> {
    const response = await apiClient.put<ApiResponse<MessageTemplate>>(ENDPOINTS.TEMPLATES.BY_ID(id), data);
    return response.data as unknown as MessageTemplate;
  }

  async deleteTemplate(id: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.TEMPLATES.BY_ID(id));
  }
}

export const templateService = new TemplateService();
export type { TemplateService };
