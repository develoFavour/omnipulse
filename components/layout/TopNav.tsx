"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell, HelpCircle, Share2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function TopNav() {
  const tenant = useAppStore((state) => state.tenant);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Left section */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
            O
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 font-heading">
            OmniPulse.
          </span>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        {/* Workspace Selector */}
        <div className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5 border border-gray-100 hover:bg-gray-100 cursor-pointer transition-colors">
          <div className="h-5 w-5 rounded-full bg-gray-900 flex items-center justify-center text-[10px] text-white font-medium">
            {tenant?.company_name?.[0]?.toUpperCase() || "O"}
          </div>
          <span className="text-sm font-semibold text-gray-700">
            {tenant?.company_name || "Workspace"}
          </span>
          <span className="ml-1 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-500 uppercase">
            Free
          </span>
          <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Progress Tracker */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-indigo-100 bg-white">
            <span className="text-[10px] font-bold text-indigo-600">33%</span>
          </div>
          <span className="text-sm font-medium text-gray-600">Getting started 🚀</span>
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative rounded-full p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white ring-2 ring-white">1</span>
          </button>
          <button className="rounded-full p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
            <HelpCircle className="h-5 w-5" />
          </button>
          <button className="hidden sm:block rounded-full p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        <div className="flex items-center gap-3">
          <button className="hidden lg:flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <Users className="h-4 w-4" />
            Invite team
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm">
            Upgrade
          </button>
          <div className="pl-2">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 ring-2 ring-indigo-500/20"
                }
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
