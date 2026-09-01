"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { channelService } from "@/lib/services/channel.service";

interface WhatsAppQRState {
	qrCode: string | null;
	status: "idle" | "loading_qr" | "waiting_scan" | "connected" | "error";
	connectedPhone: string | null;
	connectedName: string | null;
	error: string | null;
}

interface UseWhatsAppQROptions {
	onConnected?: (phone: string, name: string) => void;
	onError?: (error: string) => void;
}

export function useWhatsAppQR(options?: UseWhatsAppQROptions) {
	const [state, setState] = useState<WhatsAppQRState>({
		qrCode: null,
		status: "idle",
		connectedPhone: null,
		connectedName: null,
		error: null,
	});
	const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const qrRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const stopPolling = useCallback(() => {
		if (pollRef.current) {
			clearInterval(pollRef.current);
			pollRef.current = null;
		}
		if (qrRefreshRef.current) {
			clearInterval(qrRefreshRef.current);
			qrRefreshRef.current = null;
		}
	}, []);

	const checkStatus = useCallback(async () => {
		try {
			const res = await channelService.getWhatsAppQRStatus();
			if (res.status === "connected" && res.phone) {
				stopPolling();
				setState((prev) => ({
					...prev,
					status: "connected",
					connectedPhone: res.phone || null,
					connectedName: res.name || null,
					error: null,
				}));
				options?.onConnected?.(res.phone || "", res.name || "");
			}
		} catch {
			// Silently continue polling
		}
	}, [stopPolling, options]);

	const requestQR = useCallback(async () => {
		setState((prev) => ({ ...prev, status: "loading_qr", error: null }));
		try {
			const res = await channelService.getWhatsAppQR();
			if (res.qr_code) {
				setState((prev) => ({
					...prev,
					qrCode: res.qr_code,
					status: "waiting_scan",
					error: null,
				}));

				// Poll for connection status every 2 seconds
				stopPolling();
				pollRef.current = setInterval(() => {
					void checkStatus();
				}, 2000);

				// Auto-refresh QR code every 20 seconds (they expire)
				qrRefreshRef.current = setInterval(async () => {
					try {
						const refreshRes = await channelService.getWhatsAppQR();
						if (refreshRes.qr_code) {
							setState((prev) => ({
								...prev,
								qrCode: refreshRes.qr_code,
							}));
						}
					} catch {
						// QR refresh failed silently
					}
				}, 20000);
			} else if (res.status === "connected") {
				setState((prev) => ({
					...prev,
					status: "connected",
					connectedPhone: res.phone || null,
					connectedName: res.name || null,
					error: null,
				}));
				options?.onConnected?.(res.phone || "", res.name || "");
			}
		} catch (err: unknown) {
			const apiErr = err as {
				response?: { data?: { error?: string } };
				message?: string;
			};
			const msg =
				apiErr.response?.data?.error ||
				apiErr.message ||
				"Failed to generate QR code";
			setState((prev) => ({ ...prev, status: "error", error: msg }));
			options?.onError?.(msg);
		}
	}, [stopPolling, checkStatus, options]);

	const disconnect = useCallback(async () => {
		try {
			await channelService.disconnectWhatsAppQR();
			stopPolling();
			setState({
				qrCode: null,
				status: "idle",
				connectedPhone: null,
				connectedName: null,
				error: null,
			});
		} catch (err: unknown) {
			const apiErr = err as {
				response?: { data?: { error?: string } };
				message?: string;
			};
			const msg =
				apiErr.response?.data?.error ||
				apiErr.message ||
				"Failed to disconnect";
			setState((prev) => ({ ...prev, error: msg }));
			options?.onError?.(msg);
		}
	}, [stopPolling, options]);

	// Cleanup on unmount
	useEffect(() => {
		return () => stopPolling();
	}, [stopPolling]);

	return {
		...state,
		requestQR,
		disconnect,
		stopPolling,
	};
}
