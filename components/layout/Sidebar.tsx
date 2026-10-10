"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Megaphone,
  CalendarClock,
  Users,
  Plug,
  Settings,
  HelpCircle,
  Activity,
  Sparkles,
  ArrowRight,
  FileText,
  BarChart3,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_ROUTES } from "@/lib/constants/routes.const";
import { usePermissions, RoleType } from "@/lib/hooks/usePermissions";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: RoleType[];
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: APP_ROUTES.DASHBOARD.BASE, icon: LayoutDashboard },
  { name: "Broadcast Studio", href: APP_ROUTES.DASHBOARD.BROADCAST, icon: Megaphone },
  { name: "Scheduled Queue", href: APP_ROUTES.DASHBOARD.SCHEDULED, icon: CalendarClock },
  { name: "Message Templates", href: APP_ROUTES.DASHBOARD.TEMPLATES, icon: FileText },
  { name: "Audience Directory", href: APP_ROUTES.DASHBOARD.AUDIENCE, icon: Users },
  { name: "Connect Profiles", href: APP_ROUTES.DASHBOARD.CONNECTIONS, icon: Plug, roles: ["owner", "admin"] },
  { name: "Campaign Analytics", href: APP_ROUTES.DASHBOARD.ANALYTICS, icon: BarChart3 },
  { name: "Team & Roles", href: APP_ROUTES.DASHBOARD.TEAM, icon: ShieldCheck, roles: ["owner", "admin"] },
  { name: "Recent Activities", href: APP_ROUTES.DASHBOARD.ACTIVITY, icon: Activity },
];

const secondaryNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help & Support", href: "/support", icon: HelpCircle },
];

interface SidebarProps {
  /** Whether the mobile drawer is open */
  isMobileOpen?: boolean;
  /** Called when the backdrop or close button is clicked on mobile */
  onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { role } = usePermissions();

  const visibleNav = navigation.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const navContent = (
    <>
      {/* Main Navigation */}
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
        <nav className="flex-1 space-y-1">
          {visibleNav.map((item) => {
            const isActive =
              item.href === APP_ROUTES.DASHBOARD.SCHEDULED
                ? pathname.startsWith(APP_ROUTES.DASHBOARD.SCHEDULED)
                : item.href === APP_ROUTES.DASHBOARD.BROADCAST
                ? pathname === APP_ROUTES.DASHBOARD.BROADCAST
                : pathname === item.href ||
                  (item.href !== APP_ROUTES.DASHBOARD.BASE && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "text-[#163300]"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-[#e2f6d5]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {!isActive && (
                  <div className="absolute inset-0 rounded-lg bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10" />
                )}
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-all duration-200 relative z-10",
                    isActive ? "text-[#163300]" : "text-gray-400 group-hover:text-gray-600",
                    "group-hover:scale-110"
                  )}
                  aria-hidden="true"
                />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Secondary Navigation */}
        <div className="mt-8">
          <nav className="space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "text-[#163300]"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-secondary"
                      className="absolute inset-0 rounded-lg bg-[#e2f6d5]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-lg bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10" />
                  )}
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-all duration-200 relative z-10",
                      isActive ? "text-[#163300]" : "text-gray-400 group-hover:text-gray-600",
                      "group-hover:scale-110"
                    )}
                    aria-hidden="true"
                  />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* What's New Widget */}
        <div className="mt-auto pt-8">
          <div className="rounded-xl border border-[#9fe870]/30 bg-gradient-to-b from-[#e2f6d5]/40 to-white p-4 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-[#9fe870]/20 blur-2xl opacity-50 transition-opacity group-hover:opacity-100" />
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-[#163300]" />
              <h3 className="text-sm font-bold text-[#163300]">What's New</h3>
            </div>
            <ul className="space-y-2.5">
              {[
                { title: "Omnichannel Studio", new: true },
                { title: "Telegram Groups", new: true },
                { title: "Compliance Engine" }
              ].map((item, idx) => (
                <li key={idx}>
                  <Link href="#" className="flex items-center justify-between group/link">
                    <span className="text-xs font-medium text-gray-600 group-hover/link:text-[#163300] transition-colors">
                      {item.title}
                    </span>
                    <ArrowRight className="h-3 w-3 text-gray-400 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-[#163300]" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-[#9fe870]/20 flex items-center justify-between">
              <span className="text-[10px] font-medium text-gray-400">version: 1.2.0</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile: overlay backdrop ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile: slide-in drawer ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            key="sidebar-drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white border-r border-gray-200 shadow-2xl lg:hidden"
          >
            {/* Close button */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-900">Navigation</span>
              <button
                onClick={onMobileClose}
                className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            {navContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Desktop: always-visible static sidebar ── */}
      <aside className="hidden lg:flex h-full w-64 flex-col bg-white border-r border-gray-200 shrink-0">
        {navContent}
      </aside>
    </>
  );
}
