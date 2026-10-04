import { StateCreator } from "zustand";
import { authService } from "@/lib/services/auth.service";
import { AuthState } from "./authSlice";

export interface OnboardingState {
  isOnboarding: boolean;
  onboardingError: string | null;
  updateBrand: (name: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export const createOnboardingSlice: StateCreator<OnboardingState & AuthState, [], [], OnboardingState> = (set) => ({
  isOnboarding: false,
  onboardingError: null,

  updateBrand: async (name: string) => {
    set({ isOnboarding: true, onboardingError: null });
    try {
      await authService.updateBrand(name);
      // Patch the tenant name in the auth slice immediately so the UI
      // reflects the real workspace name without requiring a page reload.
      set((state: any) => ({
        isOnboarding: false,
        tenant: state.tenant ? { ...state.tenant, company_name: name } : state.tenant,
        workspaces: (state.workspaces ?? []).map((w: any) =>
          w.is_active ? { ...w, company_name: name } : w
        ),
      }));
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to update brand workspace name";
      set({ onboardingError: msg, isOnboarding: false });
      throw err;
    }
  },

  completeOnboarding: async () => {
    set({ isOnboarding: true, onboardingError: null });
    try {
      await authService.completeOnboarding();
      set({ isOnboarding: false });
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to complete onboarding flow";
      set({ onboardingError: msg, isOnboarding: false });
      throw err;
    }
  },
});
