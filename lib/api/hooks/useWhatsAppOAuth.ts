import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
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
	const { getToken, isLoaded, isSignedIn } = useAuth();
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
	const fbLoadedRef = useRef(false)
	const callbackHandledRef = useRef(false);
	const pendingCodeRef = useRef<string | null>(null);
	const signupAssetsRef = useRef<{ waba_id: string; phone_number_id: string } | null>(null);
	const exchangeInFlightRef = useRef(false);

	// Fetch the OAuth config on mount
	useEffect(() => {
		let cancelled = false;

		const fetchConfig = async () => {
			if (!isLoaded || !isSignedIn) return;

			try {
				console.info("[Meta OAuth] stage=config_request");
				const oauthConfig = await channelService.getWhatsAppOAuthConfig();
				console.info("[Meta OAuth] stage=config_received", {
					config_id: oauthConfig.config_id,
					redirect_uri: oauthConfig.redirect_uri,
				});
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
	}, [isLoaded, isSignedIn]);

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

	const completeEmbeddedSignup = useCallback(
		async (forcedCode?: string) => {
			const code = forcedCode || pendingCodeRef.current;
			const assets = signupAssetsRef.current;
			if (!code || exchangeInFlightRef.current) return;

			exchangeInFlightRef.current = true;
			callbackHandledRef.current = true;
			setIsLoading(true);
			console.info("[Meta OAuth] stage=received_code", {
				code_length: code.length,
				waba_id: assets?.waba_id,
				phone_number_id: assets?.phone_number_id,
			});

			try {
				const result = await channelService.exchangeWhatsAppOAuthCode(
					code,
					assets?.waba_id,
					assets?.phone_number_id,
					configRef.current?.redirect_uri,
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
				window.history.replaceState({}, document.title, window.location.pathname);
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
				waba_id_present: Boolean(wabaID),
				phone_number_id_present: Boolean(phoneNumberID),
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
		const oauthConfig = configRef.current;
		if (!oauthConfig) {
			const msg =
				"Meta OAuth is not configured. Please check your environment variables.";
			setError(msg);
			options?.onError?.(msg);
			return;
		}

		setError(null);
		setIsLoading(true);
		pendingCodeRef.current = null;
		signupAssetsRef.current = null;

		// Launch Meta Embedded Signup via the Facebook JavaScript SDK popup
		if (fbLoadedRef.current && window.FB) {
			console.info("[Meta OAuth] Launching Embedded Signup modal via FB.login", {
				config_id: oauthConfig.config_id,
			});
			window.FB.login(
				(response) => {
					const authResponse = response.authResponse as
						| { code?: string }
						| undefined;
					const code = authResponse?.code;
					console.info("[Meta OAuth] FB.login response", {
						status: response.status,
						code_present: Boolean(code),
					});
					if (!code) {
						setIsLoading(false);
						setError(
							"Meta Embedded Signup was cancelled or did not return an authorization code.",
						);
						return;
					}
					pendingCodeRef.current = code;
					void completeEmbeddedSignup(code);
				},
				{
					config_id: oauthConfig.config_id,
					response_type: "code",
					override_default_response_type: true,
					extras: {
						setup: {},
						featureType: "whatsapp_business_app_onboarding",
						sessionInfoVersion: "3",
					},
				},
			);
			return;
		}

		// Fallback: Direct OAuth URL if SDK failed to load
		const redirectURI = `${window.location.origin}/connections`;
		const oauthURL = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${oauthConfig.app_id}&config_id=${oauthConfig.config_id}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code`;

		console.info("[Meta OAuth] Direct OAuth Dialog Fallback", {
			app_id: oauthConfig.app_id,
			config_id: oauthConfig.config_id,
			redirect_uri: redirectURI,
		});

		window.location.href = oauthURL;
	}, [completeEmbeddedSignup, options]);

	// Handle the authorization code returned to /connections by the direct OAuth dialog.
	useEffect(() => {
		if (!isLoaded || !isSignedIn || typeof window === "undefined") return;
		const params = new URLSearchParams(window.location.search);
		const code = params.get("code");
		if (!code || callbackHandledRef.current) return;
		callbackHandledRef.current = true;

		const exchangeCode = async () => {
			const redirectURI = `${window.location.origin}${window.location.pathname}`;
			console.info("[Meta OAuth] stage=received_code", {
				code_length: code.length,
				redirect_uri: redirectURI,
			});
			setIsLoading(true);
			try {
				const token = await getToken();
				if (!token) {
					throw new Error(
						"Authentication token is not ready. Please try again.",
					);
				}

				const result = await channelService.exchangeWhatsAppOAuthCode(
					code,
					undefined,
					undefined,
					redirectURI,
				);
				console.info("[Meta OAuth] stage=token_received", result);
				const connRes = {
					sender_identity: result.sender_identity,
					waba_id: result.waba_id,
					phone_number_id: result.phone_number_id,
				};
				setConnectionResult(connRes);
				setIsConnected(true);
				setError(null);
				window.history.replaceState(
					{},
					document.title,
					window.location.pathname,
				);
				options?.onSuccess?.(connRes);
			} catch (err: unknown) {
				const apiErr = err as {
					response?: { status?: number; data?: { error?: string } };
					message?: string;
				};
				const msg =
					apiErr.response?.data?.error ||
					apiErr.message ||
					"Failed to complete WhatsApp connection via Meta";
				console.error("[Meta OAuth] stage=exchange_failed", { message: msg });
				if (apiErr.response?.status === 401)
					callbackHandledRef.current = false;
				setError(msg);
				options?.onError?.(msg);
			} finally {
				setIsLoading(false);
			}
		};

		exchangeCode();
	}, [getToken, isLoaded, isSignedIn, options]);
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
