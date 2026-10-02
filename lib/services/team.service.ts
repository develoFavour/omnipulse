import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";
import type { ApiResponse } from "@/lib/api/response";

export type RoleType = "owner" | "admin" | "member";

export interface TenantMember {
  id: string;
  tenant_id: string;
  user_id: string;
  role: RoleType;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface TeamInvitation {
  id: string;
  tenant_id: string;
  email: string;
  role: "admin" | "member";
  invited_by: string;
  inviter_email?: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  expires_at: string;
  created_at: string;
}

export interface TeamOverview {
  members: TenantMember[];
  invitations: TeamInvitation[];
}

export interface InvitationPreview {
  workspace_name: string;
  inviter_email: string;
  invited_email: string;
  role: string;
  expires_at: string;
}

class TeamService {
  /** Fetches all active workspace members and pending invitations. */
  async listTeam(): Promise<TeamOverview> {
    const response = await apiClient.get<ApiResponse<TeamOverview>>(ENDPOINTS.TEAM.MEMBERS);
    return response.data as unknown as TeamOverview;
  }

  /** Sends an invitation to join the current workspace. */
  async inviteMember(
    email: string,
    role: "admin" | "member"
  ): Promise<{ message: string; invitation: TeamInvitation }> {
    const response = await apiClient.post<ApiResponse<{ message: string; invitation: TeamInvitation }>>(
      ENDPOINTS.TEAM.INVITE,
      { email, role }
    );
    return response.data as unknown as { message: string; invitation: TeamInvitation };
  }

  /** Revokes a pending invitation. */
  async revokeInvitation(invitationId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      ENDPOINTS.TEAM.REVOKE_INVITE(invitationId)
    );
    return response.data as unknown as { message: string };
  }

  /** Removes a member from the workspace. */
  async removeMember(memberId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      ENDPOINTS.TEAM.REMOVE_MEMBER(memberId)
    );
    return response.data as unknown as { message: string };
  }

  /** Updates a member's role (owner only). */
  async updateMemberRole(memberId: string, role: RoleType): Promise<{ message: string }> {
    const response = await apiClient.patch<ApiResponse<{ message: string }>>(
      ENDPOINTS.TEAM.UPDATE_ROLE(memberId),
      { role }
    );
    return response.data as unknown as { message: string };
  }

  /** Public preview for an invitation token — no authentication required. */
  async previewInvitation(token: string): Promise<InvitationPreview> {
    const response = await apiClient.get<ApiResponse<InvitationPreview>>(
      ENDPOINTS.INVITATIONS.PREVIEW(token)
    );
    return response.data as unknown as InvitationPreview;
  }

  /** Accepts an invitation and joins the target workspace. */
  async acceptInvitation(token: string): Promise<{ message: string; tenant: any }> {
    const response = await apiClient.post<ApiResponse<{ message: string; tenant: any }>>(
      ENDPOINTS.INVITATIONS.ACCEPT,
      { token }
    );
    return response.data as unknown as { message: string; tenant: any };
  }
}

export const teamService = new TeamService();
export type { TeamService };
