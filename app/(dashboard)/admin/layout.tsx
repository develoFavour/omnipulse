"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const { isPlatformAdmin, isLoading } = usePlatformAdmin();

	if (isLoading) {
		return (
			<div className="flex h-[60vh] items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="h-7 w-7 animate-spin text-[#163300]" />
					<p className="text-sm font-medium text-gray-600">
						Verifying platform access...
					</p>
				</div>
			</div>
		);
	}

	if (!isPlatformAdmin) {
		return (
			<div className="flex h-[60vh] items-center justify-center">
				<div className="max-w-md rounded-2xl border border-gray-200/90 bg-white p-8 text-center shadow-sm">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-200">
						<ShieldAlert className="h-6 w-6" />
					</div>
					<h1 className="text-lg font-bold text-gray-900">
						Platform access required
					</h1>
					<p className="mt-2 text-sm text-gray-500">
						This dashboard is limited to allowlisted platform operators. It is separate
						from workspace roles, so workspace ownership does not grant access.
					</p>
					<Link
						href={APP_ROUTES.DASHBOARD.BASE}
						className="mt-5 inline-flex items-center rounded-full bg-[#163300] px-4 py-2 text-sm font-semibold text-white hover:bg-[#123300]"
					>
						Back to workspace
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className="mb-5 flex items-center gap-1 overflow-x-auto rounded-2xl border border-gray-200/90 bg-white p-1.5 shadow-sm">
				<span className="shrink-0 px-2 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
					Platform
				</span>
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
			</div>
			{children}
		</div>
	);
}
