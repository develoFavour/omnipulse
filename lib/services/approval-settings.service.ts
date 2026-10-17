import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

export interface ApprovalSettings {
  require_campaign_approval: boolean;
  plan_tier: string;
  can_enable: boolean;
}

class ApprovalSettingsService {
  async get(): Promise<ApprovalSettings> {
    const response = await apiClient.get(ENDPOINTS.SETTINGS_APPROVAL);
    return response.data as ApprovalSettings;
  }

  async update(requireCampaignApproval: boolean): Promise<ApprovalSettings> {
    const response = await apiClient.put(ENDPOINTS.SETTINGS_APPROVAL, {
      require_campaign_approval: requireCampaignApproval,
    });
    return response.data as ApprovalSettings;
  }
}

export const approvalSettingsService = new ApprovalSettingsService();
