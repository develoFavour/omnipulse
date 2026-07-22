import { useState, useEffect, useCallback } from "react";
import { channelService, ChannelResponse } from "@/lib/services/channel.service";

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

export function useTenantChannels(options?: UseTenantChannelsOptions) {
	const [channels, setChannels] = useState<TenantChannel[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchChannels = useCallback(async () => {
		try {
			setLoading(true);
			const data = await channelService.getChannels();
			setChannels(Array.isArray(data) ? (data as unknown as TenantChannel[]) : []);
			setError(null);
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.error || err.message || "Failed to fetch channels";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	}, []);

	// Initial fetch
	useEffect(() => {
		fetchChannels();
	}, [fetchChannels]);

	// Optional polling
	useEffect(() => {
		if (!options?.pollInterval) return;

		const interval = setInterval(() => {
			fetchChannels();
		}, options.pollInterval);

		return () => clearInterval(interval);
	}, [fetchChannels, options?.pollInterval]);

	const isChannelConnected = (platform: string): boolean => {
		return channels.some(
			(ch) => ch.platform_name === platform && ch.status === "active",
		);
	};

	const getChannel = (platform: string): TenantChannel | undefined => {
		return channels.find((ch) => ch.platform_name === platform);
	};

	return {
		channels,
		loading,
		error,
		refetch: fetchChannels,
		isChannelConnected,
		getChannel,
	};
}
