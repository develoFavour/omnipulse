import { StateCreator } from "zustand";
import { authService } from "@/lib/services/auth.service";

export interface OnboardingState {
  isOnboarding: boolean;
  onboardingError: string | null;
  updateBrand: (name: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export const createOnboardingSlice: StateCreator<OnboardingState> = (set) => ({
  isOnboarding: false,
  onboardingError: null,

  updateBrand: async (name: string) => {
    set({ isOnboarding: true, onboardingError: null });
    try {
      await authService.updateBrand(name);
      set({ isOnboarding: false });
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
