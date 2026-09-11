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
      // Direct session lookup if available on window
      if (typeof window !== "undefined" && (window as any).Clerk) {
        const clerk = (window as any).Clerk;
        if (clerk.session) {
          try {
            const tok = await clerk.session.getToken();
            if (tok) return tok;
          } catch {
            // fallback
          }
        }
      }

      if (isSignedIn) {
        return await getToken();
      }
      return null;
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
