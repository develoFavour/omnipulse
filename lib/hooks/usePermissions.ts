"use client";

import { useAuth } from "@clerk/nextjs";
import { useAppStore } from "@/lib/store";

export type RoleType = "owner" | "admin" | "member";

export interface WorkspacePermissions {
  role: RoleType;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
  isLoading: boolean;

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
  const { isLoaded, isSignedIn } = useAuth();
  const user = useAppStore((state) => state.user);
  const workspaces = useAppStore((state) => state.workspaces);
  const tenant = useAppStore((state) => state.tenant);
  const isAuthenticating = useAppStore((state) => state.isAuthenticating);

  // Active workspace lookup
  const activeWs = workspaces.find((w) => w.id === tenant?.id || w.is_active);
  const rawRole = (activeWs?.role || user?.role || "member").toLowerCase();

  const role: RoleType =
    rawRole === "owner" ? "owner" : rawRole === "admin" ? "admin" : "member";

  const isOwner = role === "owner";
  const isAdmin = role === "admin";
  const isMember = role === "member";

  // Permissions are loading if Clerk hasn't initialized, or if the user is signed in
  // but auth sync or workspace fetching is still in flight
  const isLoading =
    !isLoaded ||
    isAuthenticating ||
    (Boolean(isSignedIn) && (!user || !tenant || (!activeWs && workspaces.length === 0 && !user?.role)));

  return {
    role,
    isOwner,
    isAdmin,
    isMember,
    isLoading,

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
