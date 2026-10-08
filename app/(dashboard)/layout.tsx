"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { useAppStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const fetchChannels = useAppStore((state) => state.fetchChannels);

  // Eagerly pre-warm channel connections at the dashboard root
  // so any page (Broadcast, Audience, etc.) has active channel state immediately on mount
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchChannels().catch(() => {});
    }
  }, [isLoaded, isSignedIn, fetchChannels]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f4f5f2]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#163300]" />
          <p className="text-sm font-medium text-gray-600">Initializing workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#f4f5f2]">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
