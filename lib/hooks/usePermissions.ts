"use client";

import { useAppStore } from "@/lib/store";

export type RoleType = "owner" | "admin" | "member";

export interface WorkspacePermissions {
  role: RoleType;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;

  // High-level capabilities
  canManageTeam: boolean;        // owner, admin
  canManageRoles: boolean;       // owner only
  canRemoveMembers: boolean;     // owner only
  canInviteAdmins: boolean;      // owner only
  canInviteMembers: boolean;     // owner, admin

  canManageChannels: boolean;    // owner, admin (connect/disconnect/oauth/qr)
  canSyncContacts: boolean;      // owner, admin

  canRenameWorkspace: boolean;   // owner only
  canDeleteWorkspace: boolean;   // owner only
  canManageBilling: boolean;     // owner only

  canCreateBroadcast: boolean;   // all roles
  canManageTemplates: boolean;   // all roles can create/use
  canDeleteTemplates: boolean;   // owner, admin

  canManageAudience: boolean;    // all roles can view/add contacts
  canDeleteAudience: boolean;    // owner, admin
  canExportData: boolean;        // owner, admin
}

export function usePermissions(): WorkspacePermissions {
  const user = useAppStore((state) => state.user);
  const workspaces = useAppStore((state) => state.workspaces);
  const tenant = useAppStore((state) => state.tenant);

  // Active workspace lookup
  const activeWs = workspaces.find((w) => w.id === tenant?.id || w.is_active);
  const rawRole = (activeWs?.role || user?.role || "member").toLowerCase();

  const role: RoleType =
    rawRole === "owner" ? "owner" : rawRole === "admin" ? "admin" : "member";

  const isOwner = role === "owner";
  const isAdmin = role === "admin";
  const isMember = role === "member";

  return {
    role,
    isOwner,
    isAdmin,
    isMember,

    // Team management
    canManageTeam: isOwner || isAdmin,
    canManageRoles: isOwner,
    canRemoveMembers: isOwner,
    canInviteAdmins: isOwner,
    canInviteMembers: isOwner || isAdmin,

    // Channel connectivity
    canManageChannels: isOwner || isAdmin,
    canSyncContacts: isOwner || isAdmin,

    // Workspace & Billing
    canRenameWorkspace: isOwner,
    canDeleteWorkspace: isOwner,
    canManageBilling: isOwner,

    // Broadcasts & Campaigns
    canCreateBroadcast: true,

    // Templates
    canManageTemplates: true,
    canDeleteTemplates: isOwner || isAdmin,

    // Audience & Contacts
    canManageAudience: true,
    canDeleteAudience: isOwner || isAdmin,
    canExportData: isOwner || isAdmin,
  };
}
