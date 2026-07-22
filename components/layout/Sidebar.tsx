"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Plug,
  Settings,
  HelpCircle,
  Activity,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_ROUTES } from "@/lib/constants/routes.const";

const navigation = [
  { name: "Dashboard", href: APP_ROUTES.DASHBOARD.BASE, icon: LayoutDashboard },
  { name: "Broadcast Studio", href: APP_ROUTES.DASHBOARD.BROADCAST, icon: Megaphone },
  { name: "Audience Directory", href: APP_ROUTES.DASHBOARD.AUDIENCE, icon: Users },
  { name: "Connect Profiles", href: APP_ROUTES.DASHBOARD.CONNECTIONS, icon: Plug },
  { name: "Recent Activities", href: APP_ROUTES.DASHBOARD.ACTIVITY, icon: Activity },
];

const secondaryNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help & Support", href: "/support", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Main Navigation */}
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== APP_ROUTES.DASHBOARD.BASE && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "text-indigo-700"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-indigo-50"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Hover Background */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-lg bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10" />
                )}

                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-all duration-200 relative z-10",
                    isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600",
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
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "text-indigo-700"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-lg bg-indigo-50"
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
                      isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600",
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
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white p-4 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-indigo-100 blur-2xl opacity-50 transition-opacity group-hover:opacity-100" />
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-indigo-900">What's New</h3>
            </div>
            <ul className="space-y-2.5">
              {[
                { title: "Omnichannel Studio", new: true },
                { title: "Telegram Groups", new: true },
                { title: "Compliance Engine" }
              ].map((item, idx) => (
                <li key={idx}>
                  <Link href="#" className="flex items-center justify-between group/link">
                    <span className="text-xs font-medium text-gray-600 group-hover/link:text-indigo-600 transition-colors">
                      {item.title}
                    </span>
                    <ArrowRight className="h-3 w-3 text-gray-400 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-indigo-600" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-indigo-100/50 flex items-center justify-between">
              <span className="text-[10px] font-medium text-gray-400">version: 1.2.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
