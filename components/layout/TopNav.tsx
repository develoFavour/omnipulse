"use client";

import { useState, useRef, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { 
  Bell, ExternalLink, ChevronDown, 
  CheckCircle2, Circle, Send,
  CheckCheck, AlertTriangle, Radio, UserMinus, Users,
  Building2, Plus, Loader2, Crown, Shield, User as UserIcon,
  Check, ChevronsUpDown, Menu
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useDashboard } from "@/lib/api/hooks/useDashboard";
import { useNotifications } from "@/lib/api/hooks/useNotifications";
import { APP_ROUTES } from "@/lib/constants/routes.const";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

interface TopNavProps {
  /** Callback to toggle the mobile sidebar drawer */
  onMobileMenuClick?: () => void;
}

export function TopNav({ onMobileMenuClick }: TopNavProps = {}) {
  const tenant = useAppStore((state) => state.tenant);
  const workspaces = useAppStore((state) => state.workspaces);
  const loadWorkspaces = useAppStore((state) => state.loadWorkspaces);
  const switchWorkspace = useAppStore((state) => state.switchWorkspace);
  const createWorkspace = useAppStore((state) => state.createWorkspace);
  const isSwitchingWorkspace = useAppStore((state) => state.isSwitchingWorkspace);
  const { stats } = useDashboard();
  const { notifications, unreadCount, markRead, markAllRead, isMarkingRead } = useNotifications();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifTab, setNotifTab] = useState<"alerts" | "deliveries">("alerts");
  const [showUsage, setShowUsage] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const onboardingRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const usageRef = useRef<HTMLDivElement>(null);

  // Load workspaces on mount
  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

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
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-3 sm:px-4 lg:px-6">
      {/* Left section */}
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>

        {/* Logo */}
        <Link href={APP_ROUTES.DASHBOARD.BASE} className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
          <div className="flex h-7 items-center justify-center transition-transform group-hover:scale-105">
            <Image
              src="/logos/messagerail-icon.svg"
              alt="MessageRail"
              width={50}
              height={28}
              className="h-5 sm:h-6 w-auto object-contain"
              priority
            />
          </div>
          <span className="text-base sm:text-xl font-bold tracking-tight text-gray-900 font-heading">
            MessageRail.
          </span>
        </Link>

        <div className="hidden lg:block h-6 w-px bg-gray-200" />

        {/* Workspace Switcher – hidden on mobile */}
        <div className="relative hidden lg:block" ref={usageRef}>
          <button
            onClick={() => setShowUsage(!showUsage)}
            className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5 border border-gray-100 hover:bg-gray-100 cursor-pointer transition-colors text-left"
            disabled={isSwitchingWorkspace}
          >
            {isSwitchingWorkspace ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#163300]" />
            ) : (
              <div className="h-5 w-5 rounded-full bg-[#163300] flex items-center justify-center text-[10px] text-[#9fe870] font-bold shrink-0">
                {tenant?.company_name?.[0]?.toUpperCase() || "O"}
              </div>
            )}
            <span className="text-sm font-semibold text-gray-700 max-w-[140px] truncate">
              {isSwitchingWorkspace ? "Switching..." : (tenant?.company_name || "Workspace")}
            </span>
            <span className="rounded-full bg-[#e2f6d5] border border-[#9fe870]/60 px-2 py-0.5 text-[10px] font-bold text-[#163300] uppercase tracking-wide">
              {planUsage.plan_badge}
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400" />
          </button>

          {/* Workspace Switcher Dropdown */}
          {showUsage && (
            <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white shadow-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
              {/* Header */}
              <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Workspaces</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">{workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""} on this account</p>
                  </div>
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    {planUsage.plan_badge}
                  </span>
                </div>
              </div>

              {/* Workspace List */}
              <div className="max-h-56 overflow-y-auto py-1.5 px-2">
                {workspaces.length === 0 ? (
                  <div className="py-6 text-center">
                    <Building2 className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No workspaces found</p>
                  </div>
                ) : (
                  workspaces.map((ws) => {
                    const isActive = ws.id === tenant?.id || ws.is_active;

                    return (
                      <button
                        key={ws.id}
                        onClick={async () => {
                          if (isActive) return;
                          setShowUsage(false);
                          try {
                            await switchWorkspace(ws.id);
                          } catch (err: any) {
                            toast.error(err?.message || "Failed to switch workspace");
                          }
                        }}
                        disabled={isActive || isSwitchingWorkspace}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                          isActive
                            ? "bg-[#e2f6d5]/70 cursor-default"
                            : "hover:bg-gray-50 cursor-pointer"
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center text-xs font-bold shadow-xs ${
                            isActive
                              ? "bg-[#163300] text-[#9fe870]"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {ws.company_name?.[0]?.toUpperCase() || "W"}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold truncate ${isActive ? "text-[#163300]" : "text-gray-800"}`}>
                            {ws.company_name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {ws.role === "owner" ? (
                              <Crown className="h-2.5 w-2.5 text-amber-500" />
                            ) : ws.role === "admin" ? (
                              <Shield className="h-2.5 w-2.5 text-[#163300]" />
                            ) : (
                              <UserIcon className="h-2.5 w-2.5 text-gray-400" />
                            )}
                            <span className="text-[10px] capitalize text-gray-500">{ws.role}</span>
                          </div>
                        </div>

                        {/* Active Indicator */}
                        {isActive && (
                          <Check className="h-4 w-4 text-[#163300] shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}

              </div>

              {/* Usage Stats */}
              <div className="px-4 py-3 border-t border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Dispatches this month</span>
                  <span className="font-semibold text-gray-900">{planUsage.messages_sent_this_month} / ∞</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Connected channels</span>
                  <span className="font-semibold text-gray-900">{stats?.active_channels || 0} active</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Audience contacts</span>
                  <span className="font-semibold text-gray-900">{stats?.total_audience || 0} contacts</span>
                </div>
              </div>

              {/* Footer actions */}
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <Link
                  href={APP_ROUTES.DASHBOARD.CONNECTIONS}
                  onClick={() => setShowUsage(false)}
                  className="text-xs font-bold text-[#163300] hover:underline"
                >
                  Manage channels →
                </Link>
                <button
                  onClick={() => { setShowUsage(false); setShowCreateModal(true); }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#163300] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-[#e2f6d5]/50 border border-gray-200 hover:border-[#9fe870]/50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New workspace
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create Workspace Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => !isCreating && setShowCreateModal(false)}>
            <div
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm mx-4 p-6 animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-xl bg-[#163300] flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-[#9fe870]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Create new workspace</h3>
                  <p className="text-xs text-gray-500">You'll be set as owner immediately</p>
                </div>
              </div>

              <input
                id="new-workspace-name"
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && newWorkspaceName.trim() && !isCreating) {
                    setIsCreating(true);
                    try {
                      await createWorkspace(newWorkspaceName.trim());
                      setShowCreateModal(false);
                      setNewWorkspaceName("");
                      toast.success("Workspace created! Setting it up for you...");
                    } catch (err: any) {
                      toast.error(err?.message || "Failed to create workspace");
                    } finally {
                      setIsCreating(false);
                    }
                  }
                }}
                placeholder="e.g. Acme Corp, Personal Brand..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#163300] focus:border-transparent mb-4"
                autoFocus
                disabled={isCreating}
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setShowCreateModal(false); setNewWorkspaceName(""); }}
                  disabled={isCreating}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!newWorkspaceName.trim() || isCreating) return;
                    setIsCreating(true);
                    try {
                      await createWorkspace(newWorkspaceName.trim());
                      setShowCreateModal(false);
                      setNewWorkspaceName("");
                      toast.success("Workspace created! Setting it up for you...");
                    } catch (err: any) {
                      toast.error(err?.message || "Failed to create workspace");
                    } finally {
                      setIsCreating(false);
                    }
                  }}
                  disabled={!newWorkspaceName.trim() || isCreating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#163300] text-[#9fe870] text-xs font-bold hover:bg-[#163300]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating...</>
                  ) : (
                    <><Plus className="h-3.5 w-3.5" /> Create workspace</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 sm:gap-3">
        {/* Real DB Onboarding Tracker Dropdown */}
        <div className="relative hidden md:block" ref={onboardingRef}>
          <button
            onClick={() => setShowOnboarding(!showOnboarding)}
            className="flex items-center gap-2 rounded-full border border-gray-200 px-3.5 py-1.5 hover:bg-gray-50 cursor-pointer transition-colors bg-white shadow-xs"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e2f6d5] border border-[#9fe870]/60">
              <span className="text-[10px] font-extrabold text-[#163300]">
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
                <span className="text-xs font-bold text-[#163300]">
                  {onboarding.completion_percentage}%
                </span>
              </div>

              {/* Progress track */}
              <div className="my-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#163300] transition-all duration-300"
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
                      : "bg-gray-50 hover:bg-[#e2f6d5]/50 text-gray-800"
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
                    <ExternalLink className="h-3 w-3 text-[#163300]" />
                  )}
                </Link>

                {/* Step 3 */}
                <Link
                  href={APP_ROUTES.DASHBOARD.AUDIENCE}
                  onClick={() => setShowOnboarding(false)}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                    onboarding.contacts_imported
                      ? "bg-emerald-50/60 text-emerald-900 hover:bg-emerald-100/60"
                      : "bg-gray-50 hover:bg-[#e2f6d5]/50 text-gray-800"
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
                    <ExternalLink className="h-3 w-3 text-[#163300]" />
                  )}
                </Link>

                {/* Step 4 */}
                <Link
                  href={APP_ROUTES.DASHBOARD.BROADCAST}
                  onClick={() => setShowOnboarding(false)}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                    onboarding.first_broadcast_sent
                      ? "bg-emerald-50/60 text-emerald-900 hover:bg-emerald-100/60"
                      : "bg-gray-50 hover:bg-[#e2f6d5]/50 text-gray-800"
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
                    <ExternalLink className="h-3 w-3 text-[#163300]" />
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
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : recentDeliveries.length > 0 ? (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-[#9fe870] ring-2 ring-white" />
              ) : null}
            </button>

            {/* Notification Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-84 sm:w-96 rounded-2xl bg-white p-4 shadow-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-[#163300]" />
                    <h4 className="text-xs font-bold text-gray-900">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-red-50 text-red-600 border border-red-200/60 px-1.5 py-0.2 text-[10px] font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllRead()}
                      disabled={isMarkingRead}
                      className="flex items-center gap-1 text-[11px] font-semibold text-[#163300] hover:underline transition-colors disabled:opacity-50"
                    >
                      <CheckCheck className="h-3 w-3" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 pt-2.5 pb-1 border-b border-gray-50">
                  <button
                    onClick={() => setNotifTab("alerts")}
                    className={`pb-1.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                      notifTab === "alerts"
                        ? "border-[#163300] text-[#163300]"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <span>System Alerts</span>
                    {unreadCount > 0 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    )}
                  </button>
                  <button
                    onClick={() => setNotifTab("deliveries")}
                    className={`pb-1.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                      notifTab === "deliveries"
                        ? "border-[#163300] text-[#163300]"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <span>Live Feed</span>
                    {recentDeliveries.length > 0 && (
                      <span className="text-[10px] text-gray-400 font-mono">({recentDeliveries.length})</span>
                    )}
                  </button>
                </div>

                {/* Tab: System Alerts */}
                {notifTab === "alerts" && (
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 py-1">
                    {notifications.length > 0 ? (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (!item.is_read) {
                              markRead(item.id);
                            }
                          }}
                          className={`py-2.5 px-2 flex items-start gap-3 rounded-lg transition-colors cursor-pointer ${
                            !item.is_read ? "bg-[#e2f6d5]/40 hover:bg-[#e2f6d5]/70" : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="mt-0.5">
                            {item.type === "campaign_completed" ? (
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                <CheckCircle2 className="h-4 w-4" />
                              </div>
                            ) : item.type === "delivery_failure" ? (
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                                <AlertTriangle className="h-4 w-4" />
                              </div>
                            ) : item.type === "channel_disconnected" ? (
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                <Radio className="h-4 w-4" />
                              </div>
                            ) : item.type === "new_opt_out" ? (
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                                <UserMinus className="h-4 w-4" />
                              </div>
                            ) : item.type === "contact_import_finished" ? (
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e2f6d5] text-[#163300]">
                                <Users className="h-4 w-4" />
                              </div>
                            ) : (
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e2f6d5] text-[#163300]">
                                <Bell className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className={`text-xs truncate ${!item.is_read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                                {item.title}
                              </p>
                              {!item.is_read && (
                                <span className="h-1.5 w-1.5 rounded-full bg-[#163300] shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                              {item.body}
                            </p>
                            <span className="block text-[10px] text-gray-400 mt-1">
                              {new Date(item.created_at).toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-gray-400 text-xs flex flex-col items-center justify-center">
                        <CheckCircle2 className="h-7 w-7 text-emerald-500/60 mb-2" />
                        <p className="font-semibold text-gray-700">All caught up!</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">No unread alerts or notifications.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Live Feed */}
                {notifTab === "deliveries" && (
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 py-1">
                    {recentDeliveries.length > 0 ? (
                      recentDeliveries.slice(0, 6).map((item) => (
                        <div key={item.id} className="py-2 px-1 flex items-start gap-3 hover:bg-gray-50 rounded-lg transition-colors">
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
                )}

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    href={APP_ROUTES.DASHBOARD.BASE}
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-bold text-[#163300] hover:underline"
                  >
                    Telemetry overview →
                  </Link>
                  <Link
                    href={APP_ROUTES.DASHBOARD.BROADCAST}
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] font-medium text-gray-400 hover:text-gray-600"
                  >
                    New broadcast
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
            <Send className="h-4 w-4 text-[#163300]" />
          </Link>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        <div className="flex items-center gap-2">
          <Link
            href={APP_ROUTES.DASHBOARD.BROADCAST}
            className="hidden sm:flex items-center gap-2 rounded-lg bg-[#163300] px-3.5 py-2 text-xs font-bold text-[#9fe870] hover:bg-[#163300]/90 transition-all shadow-sm"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Broadcast</span>
          </Link>
          {/* Mobile: icon-only broadcast */}
          <Link
            href={APP_ROUTES.DASHBOARD.BROADCAST}
            className="sm:hidden flex items-center justify-center rounded-lg bg-[#163300] p-2 text-[#9fe870] hover:bg-[#163300]/90 transition-all shadow-sm"
            aria-label="Broadcast"
          >
            <Send className="h-4 w-4" />
          </Link>
          <div className="pl-1">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 ring-2 ring-[#163300]/10"
                }
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
