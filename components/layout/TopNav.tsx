"use client";

import { useState, useRef, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { Bell, HelpCircle, Share2, Check, ExternalLink, ChevronDown, CheckCircle2, Circle, Sparkles, MessageSquare, Send } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useDashboard } from "@/lib/api/hooks/useDashboard";
import { APP_ROUTES } from "@/lib/constants/routes.const";
import Link from "next/link";

export function TopNav() {
  const tenant = useAppStore((state) => state.tenant);
  const { stats } = useDashboard();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUsage, setShowUsage] = useState(false);

  const onboardingRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const usageRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (onboardingRef.current && !onboardingRef.current.contains(event.target as Node)) {
        setShowOnboarding(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (usageRef.current && !usageRef.current.contains(event.target as Node)) {
        setShowUsage(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onboarding = stats?.onboarding_progress || {
    workspace_created: true,
    channels_connected: false,
    contacts_imported: false,
    first_broadcast_sent: false,
    completion_percentage: 25,
    completed_steps: 1,
    total_steps: 4,
  };

  const planUsage = stats?.plan_usage || {
    plan_tier: "Free Public Beta",
    plan_badge: "FREE BETA",
    monthly_message_limit: -1,
    messages_sent_this_month: 0,
    contacts_stored: 0,
    contacts_limit: -1,
    channels_connected: 0,
    channels_limit: -1,
    is_unlimited: true,
  };

  const recentDeliveries = stats?.recent_activities || [];

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Left section */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <Link href={APP_ROUTES.DASHBOARD.BASE} className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-sm transition-transform group-hover:scale-105">
            O
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 font-heading">
            OmniPulse.
          </span>
        </Link>

        <div className="h-6 w-px bg-gray-200" />

        {/* Workspace & Plan Selector */}
        <div className="relative" ref={usageRef}>
          <button
            onClick={() => setShowUsage(!showUsage)}
            className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5 border border-gray-100 hover:bg-gray-100 cursor-pointer transition-colors text-left"
          >
            <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white font-medium">
              {tenant?.company_name?.[0]?.toUpperCase() || "O"}
            </div>
            <span className="text-sm font-semibold text-gray-700 max-w-[140px] truncate">
              {tenant?.company_name || "Workspace"}
            </span>
            <span className="rounded-full bg-indigo-100/70 border border-indigo-200/60 px-2 py-0.5 text-[10px] font-bold text-indigo-700 uppercase tracking-wide">
              {planUsage.plan_badge}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>

          {/* Usage & Plan Dropdown */}
          {showUsage && (
            <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white p-4 shadow-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{planUsage.plan_tier}</h4>
                  <p className="text-[11px] text-emerald-600 font-medium">● Active Workspace</p>
                </div>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  Unlimited
                </span>
              </div>

              <div className="space-y-3 py-3 text-xs">
                <div>
                  <div className="flex justify-between text-gray-600 mb-1">
                    <span>Dispatches this month</span>
                    <span className="font-semibold text-gray-900">{planUsage.messages_sent_this_month} / ∞</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full w-2" />
                  </div>
                </div>

                <div className="flex justify-between text-gray-600 pt-1">
                  <span>Connected channels</span>
                  <span className="font-semibold text-gray-900">{stats?.active_channels || 0} active</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Audience contacts</span>
                  <span className="font-semibold text-gray-900">{stats?.total_audience || 0} contacts</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <Link
                  href={APP_ROUTES.DASHBOARD.CONNECTIONS}
                  onClick={() => setShowUsage(false)}
                  className="block text-center text-xs font-bold text-indigo-600 hover:text-indigo-700 py-1"
                >
                  Manage channels & integrations →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Real DB Onboarding Tracker Dropdown */}
        <div className="relative hidden md:block" ref={onboardingRef}>
          <button
            onClick={() => setShowOnboarding(!showOnboarding)}
            className="flex items-center gap-2 rounded-full border border-gray-200 px-3.5 py-1.5 hover:bg-gray-50 cursor-pointer transition-colors bg-white shadow-xs"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 border border-indigo-200">
              <span className="text-[10px] font-extrabold text-indigo-600">
                {onboarding.completion_percentage}%
              </span>
            </div>
            <span className="text-xs font-semibold text-gray-700">
              {onboarding.completion_percentage === 100 ? "Ready to scale 🚀" : "Getting started"}
            </span>
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </button>

          {/* Interactive Checklist Dropdown */}
          {showOnboarding && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white p-4 shadow-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Workspace Launch Checklist</h4>
                  <p className="text-[11px] text-gray-500">
                    {onboarding.completed_steps} of {onboarding.total_steps} milestones completed
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-600">
                  {onboarding.completion_percentage}%
                </span>
              </div>

              {/* Progress track */}
              <div className="my-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${onboarding.completion_percentage}%` }}
                />
              </div>

              {/* Steps list */}
              <div className="space-y-2 py-1 text-xs">
                {/* Step 1 */}
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-50/60 text-emerald-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-medium line-through text-gray-500">Create workspace</span>
                </div>

                {/* Step 2 */}
                <Link
                  href={APP_ROUTES.DASHBOARD.CONNECTIONS}
                  onClick={() => setShowOnboarding(false)}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                    onboarding.channels_connected
                      ? "bg-emerald-50/60 text-emerald-900 hover:bg-emerald-100/60"
                      : "bg-gray-50 hover:bg-indigo-50/60 text-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {onboarding.channels_connected ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-300 shrink-0" />
                    )}
                    <span className={onboarding.channels_connected ? "line-through text-gray-500 font-medium" : "font-semibold"}>
                      Connect messaging channel
                    </span>
                  </div>
                  {!onboarding.channels_connected && (
                    <ExternalLink className="h-3 w-3 text-indigo-600" />
                  )}
                </Link>

                {/* Step 3 */}
                <Link
                  href={APP_ROUTES.DASHBOARD.AUDIENCE}
                  onClick={() => setShowOnboarding(false)}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                    onboarding.contacts_imported
                      ? "bg-emerald-50/60 text-emerald-900 hover:bg-emerald-100/60"
                      : "bg-gray-50 hover:bg-indigo-50/60 text-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {onboarding.contacts_imported ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-300 shrink-0" />
                    )}
                    <span className={onboarding.contacts_imported ? "line-through text-gray-500 font-medium" : "font-semibold"}>
                      Import audience contacts
                    </span>
                  </div>
                  {!onboarding.contacts_imported && (
                    <ExternalLink className="h-3 w-3 text-indigo-600" />
                  )}
                </Link>

                {/* Step 4 */}
                <Link
                  href={APP_ROUTES.DASHBOARD.BROADCAST}
                  onClick={() => setShowOnboarding(false)}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                    onboarding.first_broadcast_sent
                      ? "bg-emerald-50/60 text-emerald-900 hover:bg-emerald-100/60"
                      : "bg-gray-50 hover:bg-indigo-50/60 text-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {onboarding.first_broadcast_sent ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-300 shrink-0" />
                    )}
                    <span className={onboarding.first_broadcast_sent ? "line-through text-gray-500 font-medium" : "font-semibold"}>
                      Send first broadcast
                    </span>
                  </div>
                  {!onboarding.first_broadcast_sent && (
                    <ExternalLink className="h-3 w-3 text-indigo-600" />
                  )}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Action icons & Live Notification Dropdown */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {recentDeliveries.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 rounded-full bg-indigo-600 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notification Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-gray-900">Recent Dispatch Events</h4>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">Real-time</span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 py-2">
                  {recentDeliveries.length > 0 ? (
                    recentDeliveries.slice(0, 6).map((item) => (
                      <div key={item.id} className="py-2.5 px-1 flex items-start gap-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            item.status === "delivered" || item.status === "sent"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {item.platform === "whatsapp" ? "WA" : "TG"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">
                            {item.contact_name}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">
                            {item.campaign_name}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              item.status === "delivered" || item.status === "sent"
                                ? "text-emerald-700 bg-emerald-50"
                                : "text-red-700 bg-red-50"
                            }`}
                          >
                            {item.status}
                          </span>
                          <span className="block text-[10px] text-gray-400 mt-0.5">
                            {new Date(item.created_at).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-gray-400 text-xs">
                      No broadcast deliveries yet.
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <Link
                    href={APP_ROUTES.DASHBOARD.BASE}
                    onClick={() => setShowNotifications(false)}
                    className="block text-center text-xs font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    View telemetry overview →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href={APP_ROUTES.DASHBOARD.BROADCAST}
            title="Create Broadcast"
            className="rounded-full p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
          >
            <Send className="h-4 w-4 text-indigo-600" />
          </Link>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        <div className="flex items-center gap-3">
          <Link
            href={APP_ROUTES.DASHBOARD.BROADCAST}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-sm"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Broadcast</span>
          </Link>
          <div className="pl-1">
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
