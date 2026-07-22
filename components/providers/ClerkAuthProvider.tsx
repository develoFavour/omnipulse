"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { setAuthTokenGetter } from "@/lib/api/axios-instance";
import { useAppStore } from "@/lib/store";

interface ClerkAuthProviderProps {
  children: React.ReactNode;
}

export function ClerkAuthProvider({ children }: ClerkAuthProviderProps) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const syncUser = useAppStore((state) => state.syncUser);
  const resetAuth = useAppStore((state) => state.resetAuth);

  useEffect(() => {
    // 1. Inject the dynamic token getter so Axios can fetch fresh tokens on-demand
    setAuthTokenGetter(async () => {
      if (!isLoaded || !isSignedIn) return null;
      return await getToken();
    });

    // 2. Perform the initial JIT Sync if signed in
    const syncSession = async () => {
      if (!isLoaded) return;

      if (isSignedIn) {
        try {
          await syncUser();
        } catch (error) {
          console.error("Authentication synchronization failed:", error);
        }
      } else {
        // Clear state on sign-out
        resetAuth();
      }
    };

    syncSession();
  }, [isLoaded, isSignedIn, getToken, syncUser, resetAuth]);

  return <>{children}</>;
}
