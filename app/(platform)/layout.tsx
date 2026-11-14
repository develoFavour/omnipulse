"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Loader2, LogOut } from "lucide-react";
import { usePlatformAdmin } from "@/lib/api/hooks/useAdmin";
import { APP_ROUTES } from "@/lib/constants/routes.const";
import { cn } from "@/lib/utils";

const TABS = [
	{ name: "Overview", href: APP_ROUTES.ADMIN.BASE },
	{ name: "Growth", href: APP_ROUTES.ADMIN.GROWTH },
	{ name: "Revenue", href: APP_ROUTES.ADMIN.REVENUE },
	{ name: "Health", href: APP_ROUTES.ADMIN.HEALTH },
	{ name: "Workspaces", href: APP_ROUTES.ADMIN.WORKSPACES },
];

// The platform surface is its own product shell: no workspace sidebar, no
// tenant data, no onboarding. Workspace identities are sent back to their
// dashboard rather than shown a restricted page.
export default function PlatformLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const { signOut } = useClerk();
	const { isPlatformAdmin, isLoading } = usePlatformAdmin();

	useEffect(() => {
		if (!isLoading && !isPlatformAdmin) {
			router.replace(APP_ROUTES.DASHBOARD.BASE);
		}
	}, [isLoading, isPlatformAdmin, router]);

	if (isLoading || !isPlatformAdmin) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#f4f5f2]">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="h-7 w-7 animate-spin text-[#163300]" />
					<p className="text-sm font-medium text-gray-600">Verifying platform access...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col bg-[#f4f5f2]">
			<header className="border-b border-gray-200 bg-white">
				<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
					<div className="flex items-center gap-3">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/logos/messagerail-emblem.svg"
							alt=""
							className="h-8 w-8"
							aria-hidden="true"
						/>
						<div className="leading-tight">
							<p className="text-sm font-bold text-gray-900">MessageRail</p>
							<p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
								Platform operations
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={() => void signOut({ redirectUrl: APP_ROUTES.HOME })}
						className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
					>
						<LogOut className="h-3.5 w-3.5" />
						Sign out
					</button>
				</div>
				<nav className="mx-auto flex w-full max-w-7xl items-center gap-1 overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8">
					{TABS.map((tab) => {
						const isActive =
							tab.href === APP_ROUTES.ADMIN.BASE
								? pathname === tab.href
								: pathname.startsWith(tab.href);
						return (
							<Link
								key={tab.name}
								href={tab.href}
								className={cn(
									"shrink-0 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors",
									isActive
										? "bg-[#e2f6d5] text-[#163300]"
										: "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
								)}
							>
								{tab.name}
							</Link>
						);
					})}
				</nav>
			</header>
			<main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
				{children}
			</main>
		</div>
	);
}
