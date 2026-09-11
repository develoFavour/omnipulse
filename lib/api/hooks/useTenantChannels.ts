import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { channelService } from "@/lib/services/channel.service";
import { useAppStore } from "@/lib/store";

export interface TenantChannel {
	id: string;
	tenant_id: string;
	platform_name: "whatsapp" | "telegram" | "instagram" | "x";
	sender_identity: string;
	status: "active" | "pending" | "suspended";
	created_at: string;
	updated_at: string;
}

interface UseTenantChannelsOptions {
	pollInterval?: number; // milliseconds
}

// Module-level flag so subsequent page navigations in the same session know channels were already fetched
let globalHasFetchedChannels = false;

export function useTenantChannels(options?: UseTenantChannelsOptions) {
	const { isLoaded, isSignedIn } = useAuth();
	const storeChannels = useAppStore((s) => s.channels as unknown as TenantChannel[]);
	const setStoreChannels = useAppStore((s) => s.setChannels);

	// If the store already holds channels, do not flash a loading skeleton or Not Configured state
	const [loading, setLoading] = useState<boolean>(
		!globalHasFetchedChannels && (!storeChannels || storeChannels.length === 0)
	);
	const [error, setError] = useState<string | null>(null);

	const fetchChannels = useCallback(async () => {
		if (!isLoaded || !isSignedIn) return;

		try {
			if (!storeChannels || storeChannels.length === 0) {
				setLoading(true);
			}
			const data = await channelService.getChannels();
			const safeData = Array.isArray(data) ? (data as unknown as TenantChannel[]) : [];
			setStoreChannels(safeData as any);
			globalHasFetchedChannels = true;
			setError(null);
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.error || err.message || "Failed to fetch channels";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	}, [isLoaded, isSignedIn, storeChannels, setStoreChannels]);

	// Fetch on mount or when auth becomes ready
	useEffect(() => {
		if (!isLoaded || !isSignedIn) return;
		fetchChannels();
	}, [isLoaded, isSignedIn, fetchChannels]);

	// Optional polling
	useEffect(() => {
		if (!options?.pollInterval || !isLoaded || !isSignedIn) return;

		const interval = setInterval(() => {
			fetchChannels();
		}, options.pollInterval);

		return () => clearInterval(interval);
	}, [fetchChannels, options?.pollInterval, isLoaded, isSignedIn]);

	const isChannelConnected = (platform: string): boolean => {
		return (storeChannels || []).some(
			(ch) => ch.platform_name === platform && ch.status === "active",
		);
	};

	const getChannel = (platform: string): TenantChannel | undefined => {
		return (storeChannels || []).find((ch) => ch.platform_name === platform);
	};

	return {
		channels: storeChannels || [],
		loading,
		error,
		refetch: fetchChannels,
		isChannelConnected,
		getChannel,
	};
}
