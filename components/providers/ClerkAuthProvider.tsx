"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { setAuthTokenGetter, setUserInfoGetter } from "@/lib/api/axios-instance";
import { APP_ROUTES } from "@/lib/constants/routes.const";
import { useAppStore } from "@/lib/store";

interface ClerkAuthProviderProps {
  children: React.ReactNode;
}

export function ClerkAuthProvider({ children }: ClerkAuthProviderProps) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const syncUser = useAppStore((state) => state.syncUser);
  const resetAuth = useAppStore((state) => state.resetAuth);
  // Platform identities have no workspace to provision, so the workspace sync
  // is skipped on the platform surface; the API would refuse it anyway.
  const onPlatformSurface = pathname.startsWith(APP_ROUTES.ADMIN.BASE);

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

    // 2. Inject verified user context (email and name) so backend receives real identity
    setUserInfoGetter(() => {
      if (!user) return null;
      return {
        email: user.primaryEmailAddress?.emailAddress || null,
        name: user.fullName || user.firstName || null,
      };
    });

    // 2. Perform the initial JIT Sync if signed in
    const syncSession = async () => {
      if (!isLoaded) return;

      if (isSignedIn) {
        if (onPlatformSurface) return;
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
  }, [isLoaded, isSignedIn, getToken, user, onPlatformSurface, syncUser, resetAuth]);

  return <>{children}</>;
}
