import { useState, useCallback, useEffect, useRef } from "react";
import {
	channelService,
	type WhatsAppOAuthConfig,
} from "@/lib/services/channel.service";

declare global {
	interface Window {
		FB: {
			init: (params: Record<string, unknown>) => void;
			login: (
				callback: (response: Record<string, unknown>) => void,
				options: Record<string, unknown>,
			) => void;
		};
		fbAsyncInit: () => void;
	}
}

interface UseWhatsAppOAuthOptions {
	onSuccess?: (result: {
		sender_identity: string;
		waba_id: string;
		phone_number_id: string;
	}) => void;
	onError?: (error: string) => void;
}

interface UseWhatsAppOAuthReturn {
	connectWithMeta: () => Promise<void>;
	disconnect: () => Promise<void>;
	isLoading: boolean;
	isDisconnecting: boolean;
	error: string | null;
	config: WhatsAppOAuthConfig | null;
	isConnected: boolean;
	connectionResult: {
		sender_identity: string;
		waba_id: string;
		phone_number_id: string;
	} | null;
	resetConnection: () => void;
}

/**
 * useWhatsAppOAuth — Bridges Meta's Embedded Signup (Facebook SDK) flow with OmniPulse.
 *
 * 1. Fetches OAuth config (app_id, config_id) from the backend
 * 2. Loads the Facebook SDK dynamically
 * 3. Provides `connectWithMeta()` which opens the Embedded Signup dialog
 * 4. On success, sends the auth code to the backend which exchanges it for a
 *    permanent token and saves the WhatsApp channel
 */
export function useWhatsAppOAuth(
	options?: UseWhatsAppOAuthOptions,
): UseWhatsAppOAuthReturn {
	const [isLoading, setIsLoading] = useState(false);
	const [isDisconnecting, setIsDisconnecting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [config, setConfig] = useState<WhatsAppOAuthConfig | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [connectionResult, setConnectionResult] = useState<{
		sender_identity: string;
		waba_id: string;
		phone_number_id: string;
	} | null>(null);
	const configRef = useRef<WhatsAppOAuthConfig | null>(null);
	const fbLoadedRef = useRef(false);

	// Fetch the OAuth config on mount
	useEffect(() => {
		let cancelled = false;

		const fetchConfig = async () => {
			try {
				const oauthConfig = await channelService.getWhatsAppOAuthConfig();
				if (!cancelled) {
					setConfig(oauthConfig);
					configRef.current = oauthConfig;
				}
			} catch (err: unknown) {
				if (!cancelled) {
					const apiErr = err as {
						response?: { data?: { error?: string } };
						message?: string;
					};
					const msg =
						apiErr.response?.data?.error ||
						apiErr.message ||
						"Failed to load Meta OAuth configuration";
					setError(msg);
				}
			}
		};

		fetchConfig();

		return () => {
			cancelled = true;
		};
	}, []);

	// Load Facebook SDK dynamically when config is available.
	// This runs exactly once when config becomes available.
	// We avoid calling setState in the effect body by using a ref.
	useEffect(() => {
		if (!config || fbLoadedRef.current) return;

		const existingScript = document.getElementById("facebook-jssdk");
		if (existingScript) {
			fbLoadedRef.current = true;
			return;
		}

		const script = document.createElement("script");
		script.id = "facebook-jssdk";
		script.src = "https://connect.facebook.net/en_US/sdk.js";
		script.async = true;
		script.defer = true;
		script.crossOrigin = "anonymous";

		window.fbAsyncInit = () => {
			window.FB.init({
				appId: config.app_id,
				version: "v21.0",
				xfbml: false,
			});
			fbLoadedRef.current = true;
		};

		document.body.appendChild(script);
	}, [config]);

	const connectWithMeta = useCallback(async () => {
		const oauthConfig = configRef.current;
		if (!oauthConfig) {
			const msg =
				"Meta OAuth is not configured. Please check your environment variables.";
			setError(msg);
			options?.onError?.(msg);
			return;
		}

		if (!fbLoadedRef.current) {
			const msg =
				"Facebook SDK is still loading. Please try again in a moment.";
			setError(msg);
			options?.onError?.(msg);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			// Prepare session refs for Meta postMessage listener
			let capturedWabaId: string | undefined;
			let capturedPhoneNumberId: string | undefined;

			const messageHandler = (event: MessageEvent) => {
				if (
					event.origin !== "https://www.facebook.com" &&
					event.origin !== "https://web.facebook.com"
				) {
					return;
				}
				try {
					const data =
						typeof event.data === "string" ? JSON.parse(event.data) : event.data;
					if (data.type === "WA_EMBEDDED_SIGNUP") {
						if (data.data?.waba_id) {
							capturedWabaId = data.data.waba_id;
						}
						if (data.data?.phone_number_id) {
							capturedPhoneNumberId = data.data.phone_number_id;
						}
					}
				} catch {
					// Ignore unparseable postMessages
				}
			};

			window.addEventListener("message", messageHandler);

			// Launch Meta Embedded Signup dialog
			const response = await new Promise<{
				code?: string;
				error?: { message: string };
			}>((resolve) => {
				console.info("[Meta OAuth] Launch config", { config_id: oauthConfig.config_id, redirect_uri: oauthConfig.redirect_uri });

				window.FB.login(
					(fbResponse: Record<string, unknown>) => {
					console.info("[Meta OAuth] FB.login response", {
						status: fbResponse.status,
						authResponseKeys: Object.keys((fbResponse.authResponse as Record<string, unknown>) || {}),
						errorMessage: (fbResponse.error as { message?: string } | undefined)?.message,
					});
						const authResp = fbResponse.authResponse as
							| Record<string, unknown>
							| undefined;
						if (authResp?.code) {
							resolve({ code: authResp.code as string });
						} else if (fbResponse.status === "not_authorized") {
							resolve({
								error: {
									message: "You declined the authorization. Please try again.",
								},
							});
						} else if (fbResponse.status === "unknown") {
							resolve({
								error: {
									message:
										"Facebook login was cancelled or could not be completed.",
								},
							});
						} else {
							const errResp = fbResponse.error as
								| { message?: string }
								| undefined;
							resolve({
								error: {
									message:
										errResp?.message ||
										"An unknown error occurred during Facebook login.",
								},
							});
						}
					},
					{
						config_id: oauthConfig.config_id,
						redirect_uri: oauthConfig.redirect_uri,
						response_type: "code",
						override_default_response_type: true,
						extras: {
							setup: {},
							featureType: "",
							sessionInfoVersion: "3",
						},
					},
				);
			});

			window.removeEventListener("message", messageHandler);

			if (response.error) {
				setError(response.error.message);
				options?.onError?.(response.error.message);
				setIsLoading(false);
				return;
			}

			if (!response.code) {
				const msg = "No authorization code received from Meta.";
				setError(msg);
				options?.onError?.(msg);
				setIsLoading(false);
				return;
			}

			// Exchange the auth code with our backend, passing captured waba_id / phone_number_id if present
			const result = await channelService.exchangeWhatsAppOAuthCode(
				response.code,
				capturedWabaId,
				capturedPhoneNumberId,
			);

			const connRes = {
				sender_identity: result.sender_identity,
				waba_id: result.waba_id,
				phone_number_id: result.phone_number_id,
			};

			setConnectionResult(connRes);
			setIsConnected(true);
			setError(null);
			options?.onSuccess?.(connRes);
		} catch (err: unknown) {
			const apiErr = err as {
				response?: { data?: { error?: string } };
				message?: string;
			};
			const msg =
				apiErr.response?.data?.error ||
				apiErr.message ||
				"Failed to complete WhatsApp connection via Meta";
			setError(msg);
			options?.onError?.(msg);
		} finally {
			setIsLoading(false);
		}
	}, [options]);

	const disconnect = useCallback(async () => {
		setIsDisconnecting(true);
		setError(null);
		try {
			await channelService.disconnectChannel("whatsapp");
			setIsConnected(false);
			setConnectionResult(null);
			setConfig(null);
			configRef.current = null;
		} catch (err: unknown) {
			const apiErr = err as {
				response?: { data?: { error?: string } };
				message?: string;
			};
			const msg =
				apiErr.response?.data?.error ||
				apiErr.message ||
				"Failed to disconnect WhatsApp";
			setError(msg);
			options?.onError?.(msg);
		} finally {
			setIsDisconnecting(false);
		}
	}, [options]);

	const resetConnection = useCallback(() => {
		setError(null);
		setIsConnected(false);
		setConnectionResult(null);
	}, []);

	return {
		connectWithMeta,
		disconnect,
		isLoading,
		isDisconnecting,
		error,
		config,
		isConnected,
		connectionResult,
		resetConnection,
	};
}
