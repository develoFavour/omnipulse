import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

export interface UserWorkspace {
  id: string;
  company_name: string;
  role: string;
  is_active: boolean;
  onboarding_completed: boolean;
  created_at: string;
}

export interface SwitchWorkspaceResponse {
  message: string;
  tenant: {
    id: string;
    company_name: string;
    onboarding_completed: boolean;
    created_at: string;
    updated_at: string;
  };
  role: string;
}

export interface CreateWorkspaceResponse {
  message: string;
  tenant: {
    id: string;
    company_name: string;
    onboarding_completed: boolean;
    created_at: string;
    updated_at: string;
  };
  role: string;
}

class WorkspaceService {
  private unwrap<T>(data: any): T {
    if (data && typeof data === "object" && "data" in data) {
      return data.data as T;
    }
    return data as T;
  }

  /** Returns all workspaces the authenticated user has access to. */
  async listWorkspaces(): Promise<UserWorkspace[]> {
    const response = await apiClient.get<any>(ENDPOINTS.WORKSPACES.LIST);
    return this.unwrap<UserWorkspace[]>(response.data) ?? [];
  }

  /** Switches the user's active workspace and returns the new tenant context. */
  async switchWorkspace(tenantId: string): Promise<SwitchWorkspaceResponse> {
    const response = await apiClient.post<any>(ENDPOINTS.WORKSPACES.SWITCH, {
      tenant_id: tenantId,
    });
    return this.unwrap<SwitchWorkspaceResponse>(response.data);
  }

  /** Creates a brand-new workspace and sets it as the active one. */
  async createWorkspace(companyName: string): Promise<CreateWorkspaceResponse> {
    const response = await apiClient.post<any>(ENDPOINTS.WORKSPACES.CREATE, {
      company_name: companyName,
    });
    return this.unwrap<CreateWorkspaceResponse>(response.data);
  }
}

export const workspaceService = new WorkspaceService();
