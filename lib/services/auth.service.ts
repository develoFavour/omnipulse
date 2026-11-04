import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

export interface SyncResponse {
  user: {
    id: string;
    clerk_id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role: string;
  };
  tenant: {
    id: string;
    company_name: string;
    onboarding_completed: boolean;
  };
}

class AuthService {
  /**
   * Syncs the authenticated Clerk user to the Go backend.
   */
  async syncUser(): Promise<SyncResponse> {
    const response = await apiClient.post<any>(ENDPOINTS.AUTH.SYNC);
    // Robust envelope handler: works whether axios interceptor unwrapped response.data or not
    const data =
      response.data && typeof response.data === "object" && "data" in response.data
        ? (response.data as { data: SyncResponse }).data
        : (response.data as SyncResponse);
    return data;
  }

  /**
   * Updates the company/workspace name during onboarding, optionally saving
   * the owner's name so campaign review trails show a real person.
   */
  async updateBrand(
    companyName: string,
    firstName?: string,
    lastName?: string
  ): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(
      ENDPOINTS.ONBOARDING.BRAND,
      {
        company_name: companyName,
        ...(firstName ? { first_name: firstName } : {}),
        ...(lastName ? { last_name: lastName } : {}),
      }
    );
    return response.data;
  }

  /**
   * Finalizes the onboarding flow and flips the onboarding_completed flag.
   */
  async completeOnboarding(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      ENDPOINTS.ONBOARDING.COMPLETE
    );
    return response.data;
  }
}

export const authService = new AuthService();
export type { AuthService };
