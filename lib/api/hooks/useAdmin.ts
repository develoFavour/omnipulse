import useSWR from "swr";
import {
	adminService,
	type AdminWorkspaceQuery,
} from "@/lib/services/admin.service";

// The allowlist check runs once per session and never retries a 403: an
// ordinary workspace member is simply not an admin, not a transient failure.
export function usePlatformAdmin() {
	const { data, error, isLoading } = useSWR(
		"admin_me",
		() => adminService.me(),
		{
			revalidateOnFocus: false,
			shouldRetryOnError: false,
			dedupingInterval: 300_000,
		},
	);

	return {
		isPlatformAdmin: data?.platform_admin === true && !error,
		isLoading,
	};
}

export function useAdminOverview(days = 30) {
	const { data, error, isLoading, mutate } = useSWR(
		["admin_overview", days],
		() => adminService.overview(days),
		{ refreshInterval: 60_000, revalidateOnFocus: true },
	);
	return { overview: data, isLoading, error, refetch: mutate };
}

export function useAdminGrowth(days = 30) {
	const { data, error, isLoading, mutate } = useSWR(
		["admin_growth", days],
		() => adminService.growth(days),
		{ refreshInterval: 300_000, revalidateOnFocus: true },
	);
	return { growth: data, isLoading, error, refetch: mutate };
}

export function useAdminRevenue(days = 30) {
	const { data, error, isLoading, mutate } = useSWR(
		["admin_revenue", days],
		() => adminService.revenue(days),
		{ refreshInterval: 300_000, revalidateOnFocus: true },
	);
	return { revenue: data, isLoading, error, refetch: mutate };
}

export function useAdminHealth() {
	const { data, error, isLoading, mutate } = useSWR(
		"admin_health",
		() => adminService.health(),
		{ refreshInterval: 30_000, revalidateOnFocus: true },
	);
	return { health: data, isLoading, error, refetch: mutate };
}

export function useAdminWorkspaces(query: AdminWorkspaceQuery) {
	const { data, error, isLoading, mutate } = useSWR(
		[
			"admin_workspaces",
			query.q ?? "",
			query.page ?? 1,
			query.page_size ?? 25,
			query.sort ?? "",
			query.direction ?? "",
		],
		() => adminService.workspaces(query),
		{ refreshInterval: 60_000, keepPreviousData: true },
	);
	return { list: data, isLoading, error, refetch: mutate };
}

export function useAdminWorkspace(id: string | undefined) {
	const { data, error, isLoading, mutate } = useSWR(
		id ? ["admin_workspace", id] : null,
		() => adminService.workspace(id as string),
		{ refreshInterval: 60_000 },
	);
	return { detail: data, isLoading, error, refetch: mutate };
}
