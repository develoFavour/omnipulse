import { StateCreator } from "zustand";
import { authService, SyncResponse } from "@/lib/services/auth.service";

export interface AuthState {
  user: SyncResponse["user"] | null;
  tenant: SyncResponse["tenant"] | null;
  isAuthenticating: boolean;
  authError: string | null;
  syncUser: () => Promise<SyncResponse>;
  resetAuth: () => void;
}

export const createAuthSlice: StateCreator<AuthState> = (set) => ({
  user: null,
  tenant: null,
  isAuthenticating: false,
  authError: null,

  syncUser: async () => {
    set({ isAuthenticating: true, authError: null });
    try {
      const data = await authService.syncUser();
      set({ user: data.user, tenant: data.tenant, isAuthenticating: false });
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to sync user with backend";
      set({ authError: msg, isAuthenticating: false });
      throw err;
    }
  },

  resetAuth: () => set({ user: null, tenant: null, authError: null }),
});
