import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

export interface WorkspaceSettings { logo_url: string; timezone: string; language: string; }
class WorkspaceSettingsService {
  async get(): Promise<WorkspaceSettings> { const response = await apiClient.get(ENDPOINTS.WORKSPACE_SETTINGS); return response.data as WorkspaceSettings; }
  async update(payload: Partial<WorkspaceSettings>): Promise<WorkspaceSettings> { const response = await apiClient.patch(ENDPOINTS.WORKSPACE_SETTINGS, payload); return response.data as WorkspaceSettings; }
}
export const workspaceSettingsService = new WorkspaceSettingsService();
