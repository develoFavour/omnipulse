import { StateCreator } from "zustand";
import { authService, SyncResponse } from "@/lib/services/auth.service";
import {
  workspaceService,
  UserWorkspace,
} from "@/lib/services/workspace.service";

export interface AuthState {
  user: SyncResponse["user"] | null;
  tenant: SyncResponse["tenant"] | null;
  workspaces: UserWorkspace[];
  isAuthenticating: boolean;
  isSwitchingWorkspace: boolean;
  authError: string | null;
  syncUser: () => Promise<SyncResponse>;
  loadWorkspaces: () => Promise<void>;
  switchWorkspace: (tenantId: string) => Promise<void>;
  createWorkspace: (name: string) => Promise<void>;
  resetAuth: () => void;
}

export const createAuthSlice: StateCreator<AuthState> = (set, get) => ({
  user: null,
  tenant: null,
  workspaces: [],
  isAuthenticating: false,
  isSwitchingWorkspace: false,
  authError: null,

  syncUser: async () => {
    set({ isAuthenticating: true, authError: null });
    try {
      const data = await authService.syncUser();
      set({ user: data.user, tenant: data.tenant, isAuthenticating: false });
      // Trigger workspace list refresh in background after sync
      get().loadWorkspaces().catch(() => {});
      return data;
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Failed to sync user with backend";
      set({ authError: msg, isAuthenticating: false });
      throw err;
    }
  },

  loadWorkspaces: async () => {
    try {
      const workspaces = await workspaceService.listWorkspaces();
      set({ workspaces: workspaces ?? [] });
    } catch {
      // silently ignore — workspace list is non-critical
    }
  },

  switchWorkspace: async (tenantId: string) => {
    set({ isSwitchingWorkspace: true });
    try {
      const result = await workspaceService.switchWorkspace(tenantId);
      // Update global tenant to the newly active one
      set((state) => ({
        tenant: result.tenant,
        user: state.user
          ? { ...state.user, role: result.role }
          : state.user,
        isSwitchingWorkspace: false,
        // Mark the switched workspace as active locally
        workspaces: state.workspaces.map((w) => ({
          ...w,
          is_active: w.id === tenantId,
        })),
      }));
      // Hard refresh so dashboard data reflects the new workspace context
      window.location.href = "/dashboard";
    } catch (err: any) {
      set({ isSwitchingWorkspace: false });
      throw err;
    }
  },

  createWorkspace: async (name: string) => {
    set({ isSwitchingWorkspace: true });
    try {
      const result = await workspaceService.createWorkspace(name);
      const newWorkspace: UserWorkspace = {
        id: result.tenant.id,
        company_name: result.tenant.company_name,
        role: "owner",
        is_active: true,
        onboarding_completed: result.tenant.onboarding_completed,
        created_at: result.tenant.created_at,
      };
      set((state) => ({
        tenant: result.tenant,
        user: state.user ? { ...state.user, role: "owner" } : state.user,
        isSwitchingWorkspace: false,
        workspaces: [
          ...state.workspaces.map((w) => ({ ...w, is_active: false })),
          newWorkspace,
        ],
      }));
      // Navigate to onboarding for the fresh workspace
      window.location.href = "/onboarding/brand";
    } catch (err: any) {
      set({ isSwitchingWorkspace: false });
      throw err;
    }
  },

  resetAuth: () =>
    set({ user: null, tenant: null, workspaces: [], authError: null }),
});
