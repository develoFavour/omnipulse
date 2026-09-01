"use client";

import { useEffect } from "react";
import { useWhatsAppQR } from "@/lib/api/hooks/useWhatsAppQR";
import { QRCodeSVG } from "qrcode.react";
import { FiSmartphone, FiCheck, FiRefreshCw, FiX, FiWifi } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

interface WhatsAppQRModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConnected?: (phone: string, name: string) => void;
}

export function WhatsAppQRModal({
	isOpen,
	onClose,
	onConnected,
}: WhatsAppQRModalProps) {
	const {
		qrCode,
		status,
		connectedPhone,
		connectedName,
		error,
		requestQR,
		disconnect,
		stopPolling,
	} = useWhatsAppQR({
		onConnected: (phone, name) => {
			onConnected?.(phone, name);
		},
	});

	const handleClose = () => {
		stopPolling();
		onClose();
	};

	useEffect(() => {
		if (isOpen && (status === "idle" || status === "error")) {
			void requestQR();
		}
	}, [isOpen, status, requestQR]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				onClick={handleClose}
			/>

			{/* Modal */}
			<div className="relative w-full max-w-lg mx-4 bg-[#1a1d23] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-[#25D366]/20 flex items-center justify-center">
							<FaWhatsapp className="w-5 h-5 text-[#25D366]" />
						</div>
						<div>
							<h2 className="text-lg font-semibold text-white">
								Connect WhatsApp
							</h2>
							<p className="text-sm text-white/50">
								Link your phone to send broadcasts
							</p>
						</div>
					</div>
					<button
						onClick={handleClose}
						className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
					>
						<FiX className="w-4 h-4 text-white/60" />
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-8">
					{status === "connected" ? (
						/* ✅ Connected State */
						<div className="flex flex-col items-center gap-6">
							<div className="w-20 h-20 rounded-full bg-[#25D366]/20 flex items-center justify-center animate-pulse">
								<FiCheck className="w-10 h-10 text-[#25D366]" />
							</div>
							<div className="text-center">
								<h3 className="text-xl font-semibold text-white mb-1">
									Connected!
								</h3>
								<p className="text-white/60">
									{connectedName || "WhatsApp"}{" "}
									{connectedPhone && (
										<span className="text-[#25D366] font-mono">
											({connectedPhone})
										</span>
									)}
								</p>
							</div>
							<div className="flex gap-3 w-full">
								<button
									onClick={handleClose}
									className="flex-1 px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-medium transition-colors"
								>
									Done
								</button>
								<button
									onClick={() => void disconnect()}
									className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl font-medium transition-colors"
								>
									Disconnect
								</button>
							</div>
						</div>
					) : status === "loading_qr" ? (
						/* ⏳ Loading State */
						<div className="flex flex-col items-center gap-6">
							<div className="w-64 h-64 rounded-2xl bg-white/5 flex items-center justify-center">
								<div className="w-8 h-8 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
							</div>
							<p className="text-white/50 text-sm">
								Generating QR code...
							</p>
						</div>
					) : status === "error" ? (
						/* ❌ Error State */
						<div className="flex flex-col items-center gap-6">
							<div className="w-64 h-64 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col items-center justify-center gap-4 px-6">
								<FiWifi className="w-10 h-10 text-red-400" />
								<p className="text-red-400 text-sm text-center">
									{error || "Connection failed"}
								</p>
							</div>
							<button
								onClick={() => void requestQR()}
								className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
							>
								<FiRefreshCw className="w-4 h-4" />
								Try Again
							</button>
						</div>
					) : (
						/* 📱 QR Code State */
						<div className="flex flex-col items-center gap-6">
							{/* QR Code */}
							<div className="relative">
								<div className="w-64 h-64 rounded-2xl bg-white p-4 shadow-lg shadow-[#25D366]/10">
									{qrCode ? (
										<QRCodeSVG
											value={qrCode}
											size={224}
											bgColor="#ffffff"
											fgColor="#000000"
											level="M"
											className="w-full h-full"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center">
											<div className="w-8 h-8 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
										</div>
									)}
								</div>
								{/* Refresh overlay timer */}
								<button
									onClick={() => void requestQR()}
									className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-[#1a1d23] border border-white/10 rounded-full text-xs text-white/50 hover:text-white/80 transition-colors"
								>
									<FiRefreshCw className="w-3 h-3" />
									Refresh QR
								</button>
							</div>

							{/* Instructions */}
							<div className="w-full space-y-3">
								<p className="text-white/40 text-xs uppercase tracking-wider font-medium text-center">
									How to scan
								</p>
								<div className="space-y-2.5">
									{[
										{
											step: "1",
											text: "Open WhatsApp on your phone",
										},
										{
											step: "2",
											text: 'Tap ⋮ Menu (or Settings on iPhone)',
										},
										{
											step: "3",
											text: 'Select "Linked Devices"',
										},
										{
											step: "4",
											text: 'Tap "Link a Device" → Scan this QR code',
										},
									].map((item) => (
										<div
											key={item.step}
											className="flex items-center gap-3"
										>
											<div className="w-6 h-6 rounded-full bg-[#25D366]/15 text-[#25D366] text-xs font-bold flex items-center justify-center flex-shrink-0">
												{item.step}
											</div>
											<span className="text-sm text-white/70">
												{item.text}
											</span>
										</div>
									))}
								</div>
							</div>

							{/* Status indicator */}
							<div className="flex items-center gap-2 text-sm text-white/40">
								<FiSmartphone className="w-4 h-4" />
								<span>Waiting for scan...</span>
								<div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
