import { useState, useCallback } from "react";
import { channelService, ChannelPayload, ChannelResponse } from "@/lib/services/channel.service";

interface UseChannelConnectionOptions {
	onSuccess?: (data: ChannelResponse) => void;
	onError?: (error: string) => void;
}

export function useChannelConnection(options?: UseChannelConnectionOptions) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<ChannelResponse | null>(null);

	const connectTelegram = useCallback(
		async (botToken: string) => {
			setLoading(true);
			setError(null);

			try {
				const payload: ChannelPayload = {
					platform_name: "telegram",
					sender_identity: "Telegram Bot",
					encrypted_credentials: { bot_token: botToken },
				};
				const result = await channelService.createChannel(payload);
				setData(result);
				options?.onSuccess?.(result);
				return result;
			} catch (err: any) {
				const errorMessage =
					err.response?.data?.error ||
					err.message ||
					"Failed to connect Telegram. Please check your bot token and try again.";
				setError(errorMessage);
				options?.onError?.(errorMessage);
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[options],
	);

	const connectWhatsApp = useCallback(
		async (code: string) => {
			setLoading(true);
			setError(null);

			try {
				const result = await channelService.connectWhatsApp(code);
				setData(result);
				options?.onSuccess?.(result);
				return result;
			} catch (err: any) {
				const errorMessage =
					err.response?.data?.error ||
					err.message ||
					"Failed to connect WhatsApp.";
				setError(errorMessage);
				options?.onError?.(errorMessage);
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[options],
	);

	const reset = useCallback(() => {
		setError(null);
		setData(null);
	}, []);

	return {
		loading,
		error,
		data,
		connectTelegram,
		connectWhatsApp,
		reset,
	};
}
