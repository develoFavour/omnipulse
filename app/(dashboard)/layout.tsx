"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { useAppStore } from "@/lib/store";
import { usePlatformAdmin } from "@/lib/api/hooks/useAdmin";
import { APP_ROUTES } from "@/lib/constants/routes.const";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const { isPlatformAdmin, isLoading: adminCheckLoading } = usePlatformAdmin();
  const fetchChannels = useAppStore((state) => state.fetchChannels);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleMobileMenuClick = useCallback(() => {
    setMobileSidebarOpen((prev) => !prev);
  }, []);

  const handleMobileClose = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  // Redirect immediately if user signs out, session expires, or account is deleted
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace(APP_ROUTES.AUTH.SIGN_IN);
    }
  }, [isLoaded, isSignedIn, router]);

  // Platform accounts own no workspace: they belong on /admin, never here.
  useEffect(() => {
    if (isPlatformAdmin) {
      router.replace(APP_ROUTES.ADMIN.BASE);
    }
  }, [isPlatformAdmin, router]);

  // Eagerly pre-warm channel connections at the dashboard root
  useEffect(() => {
    if (isLoaded && isSignedIn && !adminCheckLoading && !isPlatformAdmin) {
      fetchChannels().catch(() => {});
    }
  }, [isLoaded, isSignedIn, adminCheckLoading, isPlatformAdmin, fetchChannels]);

  if (!isLoaded || !isSignedIn || adminCheckLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f4f5f2]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#163300]" />
          <p className="text-sm font-medium text-gray-600">
            {isLoaded && !isSignedIn ? "Redirecting to sign in..." : "Initializing workspace..."}
          </p>
        </div>
      </div>
    );
  }

  if (isPlatformAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f4f5f2]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#163300]" />
          <p className="text-sm font-medium text-gray-600">Opening platform dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#f4f5f2]">
      <TopNav onMobileMenuClick={handleMobileMenuClick} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isMobileOpen={mobileSidebarOpen} onMobileClose={handleMobileClose} />
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
