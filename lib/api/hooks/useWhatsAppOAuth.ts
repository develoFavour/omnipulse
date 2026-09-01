import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import {
	channelService,
	type WhatsAppOAuthConfig,
} from "@/lib/services/channel.service";

declare global {
	interface Window {
		FB?: {
			init: (params: Record<string, unknown>) => void;
			login: (
				callback: (response: Record<string, unknown>) => void,
				options: Record<string, unknown>,
			) => void;
		};
		fbAsyncInit?: () => void;
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

function ensureFacebookSDK(appId: string): Promise<void> {
	return new Promise((resolve) => {
		if (typeof window === "undefined") {
			resolve();
			return;
		}
		if (window.FB) {
			resolve();
			return;
		}

		window.fbAsyncInit = () => {
			window.FB?.init({
				appId,
				autoLogAppEvents: true,
				xfbml: false,
				version: "v21.0",
			});
			resolve();
		};

		if (!document.getElementById("facebook-jssdk")) {
			const script = document.createElement("script");
			script.id = "facebook-jssdk";
			script.src = "https://connect.facebook.net/en_US/sdk.js";
			script.async = true;
			script.defer = true;
			script.crossOrigin = "anonymous";
			document.body.appendChild(script);
		}
	});
}

/**
 * useWhatsAppOAuth — Bridges Meta's Embedded Signup flow with OmniPulse.
 *
 * 1. Fetches OAuth config (app_id, config_id) from the backend
 * 2. Loads the Facebook SDK dynamically
 * 3. Provides `connectWithMeta()` which opens the Embedded Signup onboarding dialog
 * 4. Listens for `sessionInfoListener` postMessage events for WABA ID & Phone Number ID
 * 5. On success, exchanges the auth code with the backend
 */
export function useWhatsAppOAuth(
	options?: UseWhatsAppOAuthOptions,
): UseWhatsAppOAuthReturn {
	const { isLoaded, isSignedIn } = useAuth();
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
	const pendingCodeRef = useRef<string | null>(null);
	const signupAssetsRef = useRef<{ waba_id: string; phone_number_id: string } | null>(null);
	const exchangeInFlightRef = useRef(false);

	// Fetch the OAuth config on mount and pre-initialize Facebook SDK
	useEffect(() => {
		let cancelled = false;

		const fetchConfig = async () => {
			if (!isLoaded || !isSignedIn) return;

			try {
				const oauthConfig = await channelService.getWhatsAppOAuthConfig();
				if (!cancelled) {
					setConfig(oauthConfig);
					configRef.current = oauthConfig;
					if (oauthConfig.app_id) {
						void ensureFacebookSDK(oauthConfig.app_id);
					}
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
	}, [isLoaded, isSignedIn]);

	const completeEmbeddedSignup = useCallback(
		async (forcedCode?: string) => {
			const code = forcedCode || pendingCodeRef.current;
			const assets = signupAssetsRef.current;
			if (!code || exchangeInFlightRef.current) return;

			exchangeInFlightRef.current = true;
			setIsLoading(true);
			console.info("[Meta OAuth] stage=exchanging_code", {
				code_length: code.length,
				waba_id: assets?.waba_id,
				phone_number_id: assets?.phone_number_id,
				source: "embedded_signup",
			});

			try {
				const redirectURI = `${window.location.origin}/connections`;
				const result = await channelService.exchangeWhatsAppOAuthCode(
					code,
					assets?.waba_id,
					assets?.phone_number_id,
					redirectURI,
					"embedded_signup",
				);
				const connRes = {
					sender_identity: result.sender_identity,
					waba_id: result.waba_id,
					phone_number_id: result.phone_number_id,
				};
				console.info("[Meta OAuth] stage=token_received", connRes);
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
				console.error("[Meta OAuth] stage=exchange_failed", { message: msg });
				setError(msg);
				options?.onError?.(msg);
			} finally {
				pendingCodeRef.current = null;
				exchangeInFlightRef.current = false;
				setIsLoading(false);
			}
		},
		[options],
	);

	// Meta sends the WABA and phone IDs through postMessage when Embedded Signup finishes.
	useEffect(() => {
		const handleMetaMessage = (event: MessageEvent) => {
			if (
				event.origin !== "https://www.facebook.com" &&
				event.origin !== "https://web.facebook.com"
			)
				return;

			let payload: Record<string, unknown>;
			try {
				payload =
					typeof event.data === "string"
						? JSON.parse(event.data)
						: event.data;
			} catch {
				return;
			}
			if (payload?.type !== "WA_EMBEDDED_SIGNUP") return;

			const data = (payload.data || payload) as Record<string, unknown>;
			const wabaID = String(data.waba_id || "");
			const phoneNumberID = String(data.phone_number_id || "");
			console.info("[Meta OAuth] Embedded Signup message", {
				event: data.event,
				waba_id: wabaID,
				phone_number_id: phoneNumberID,
			});

			if (wabaID || phoneNumberID) {
				signupAssetsRef.current = {
					waba_id: wabaID,
					phone_number_id: phoneNumberID,
				};
				if (pendingCodeRef.current && !exchangeInFlightRef.current) {
					void completeEmbeddedSignup(pendingCodeRef.current);
				}
			}
		};

		window.addEventListener("message", handleMetaMessage);
		return () => window.removeEventListener("message", handleMetaMessage);
	}, [completeEmbeddedSignup]);

	const connectWithMeta = useCallback(async () => {
		setError(null);
		setIsLoading(true);
		pendingCodeRef.current = null;
		signupAssetsRef.current = null;

		let oauthConfig = configRef.current;
		if (!oauthConfig) {
			try {
				oauthConfig = await channelService.getWhatsAppOAuthConfig();
				setConfig(oauthConfig);
				configRef.current = oauthConfig;
			} catch (fetchErr: unknown) {
				const apiErr = fetchErr as {
					response?: { data?: { error?: string } };
					message?: string;
				};
				const msg =
					apiErr.response?.data?.error ||
					apiErr.message ||
					"Meta OAuth configuration is not ready. Please try again in a moment.";
				setError(msg);
				setIsLoading(false);
				options?.onError?.(msg);
				return;
			}
		}

		if (!oauthConfig || !oauthConfig.app_id || !oauthConfig.config_id) {
			const msg =
				"Meta OAuth is not configured on the server. Please check your environment variables.";
			setError(msg);
			setIsLoading(false);
			options?.onError?.(msg);
			return;
		}

		// Ensure Facebook SDK is initialized
		try {
			await ensureFacebookSDK(oauthConfig.app_id);
		} catch (sdkErr) {
			console.error("[Meta OAuth] Error loading Facebook SDK", sdkErr);
		}

		if (window.FB) {
			console.info("[Meta OAuth] Launching Embedded Signup Onboarding Wizard via FB.login", {
				config_id: oauthConfig.config_id,
			});
			window.FB.login(
				(response) => {
					const authResponse = response.authResponse as
						| { code?: string }
						| undefined;
					const code = authResponse?.code;
					console.info("[Meta OAuth] FB.login callback", {
						status: response.status,
						code_present: Boolean(code),
					});
					if (!code) {
						setIsLoading(false);
						return;
					}
					pendingCodeRef.current = code;
					setTimeout(() => {
						if (!exchangeInFlightRef.current) {
							void completeEmbeddedSignup(code);
						}
					}, 1500);
				},
				{
					config_id: oauthConfig.config_id,
					response_type: "code",
					override_default_response_type: true,
					extras: {
						setup: {},
						sessionInfoVersion: "3",
					},
				},
			);
			return;
		}

		const msg = "Unable to initialize Meta signup window. Please disable any content blockers and try again.";
		setError(msg);
		setIsLoading(false);
		options?.onError?.(msg);
	}, [completeEmbeddedSignup, options]);

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
