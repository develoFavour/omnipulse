import { create } from "zustand";
import { createAuthSlice, AuthState } from "./slices/authSlice";
import { createOnboardingSlice, OnboardingState } from "./slices/onboardingSlice";
import { createChannelSlice, ChannelState } from "./slices/channelSlice";

export type AppState = AuthState & OnboardingState & ChannelState;

export const useAppStore = create<AppState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createOnboardingSlice(...a),
  ...createChannelSlice(...a),
}));
