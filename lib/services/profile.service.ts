import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

export interface Profile {
  id?: string;
  first_name?: string;
  last_name?: string;
  email: string;
}

class ProfileService {
  private unwrap<T>(data: any): T {
    return data && typeof data === "object" && "data" in data ? data.data : data;
  }

  async getProfile(): Promise<Profile> {
    const response = await apiClient.get(ENDPOINTS.PROFILE.GET);
    return this.unwrap<Profile>(response.data);
  }

  async updateProfile(payload: Partial<Profile>): Promise<Profile> {
    const response = await apiClient.patch(ENDPOINTS.PROFILE.UPDATE, payload);
    return this.unwrap<Profile>(response.data);
  }
}

export const profileService = new ProfileService();
