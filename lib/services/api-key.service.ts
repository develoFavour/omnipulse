import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at?: string | null;
}

export interface CreatedApiKey extends ApiKey {
  key: string;
}

class ApiKeyService {
  private unwrap<T>(data: any): T {
    return data && typeof data === "object" && "data" in data ? data.data : data;
  }

  async list(): Promise<ApiKey[]> {
    const response = await apiClient.get(ENDPOINTS.API_KEYS.LIST);
    return this.unwrap<ApiKey[]>(response.data) ?? [];
  }

  async create(name: string): Promise<CreatedApiKey> {
    const response = await apiClient.post(ENDPOINTS.API_KEYS.CREATE, { name });
    return this.unwrap<CreatedApiKey>(response.data);
  }

  async revoke(id: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.API_KEYS.REVOKE(id));
  }
}

export const apiKeyService = new ApiKeyService();
