"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	MessageCircle,
	Send,
	Hash,
	Loader2,
	Link2,
	X as XIcon,
	CheckCircle2,
	ArrowRight,
	Zap,
	Clock,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { OnboardingLayout } from "@/components/features/onboarding/OnboardingLayout";
import { ChannelConnectCard } from "@/components/features/onboarding/ChannelConnectCard";
import { TelegramConnectionForm } from "@/components/features/onboarding/TelegramConnectionForm";
import { WhatsAppQRConnect } from "@/components/features/onboarding/WhatsAppQRConnect";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/constants/routes.const";
import { useChannelConnection } from "@/lib/api/hooks/useChannelConnection";
import { useTenantChannels } from "@/lib/api/hooks/useTenantChannels";
import { useAppStore } from "@/lib/store";

const CHANNELS = [
	{
		id: "whatsapp",
		title: "WhatsApp QR Pairing",
		description: "Instant 10-second device linking via WhatsApp Multi-Device",
		icon: MessageCircle,
		colorClass: "bg-[#25D366]",
	},
	{
		id: "telegram",
		title: "Telegram BotFather",
		description: "High-speed token dispatch & channel broadcasting",
		icon: Send,
		colorClass: "bg-[#229ED9]",
	},
	{
		id: "instagram",
		title: "Instagram DM",
		description: "Direct community broadcasting & story triggers",
		icon: MessageCircle,
		colorClass: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
	},
	{
		id: "x",
		title: "X (Twitter)",
		description: "Public timeline announcements and engagement",
		icon: Hash,
		colorClass: "bg-[#0e0f0c]",
	},
];

function ChannelsSetupInner() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const isConnectorView = searchParams.get("view") === "connectors";

	const completeOnboarding = useAppStore((state) => state.completeOnboarding);
	const { channels, refetch, isChannelConnected } = useTenantChannels({
		pollInterval: 2000,
	});
	const {
		connectTelegram,
		loading: connectionLoading,
		error: connectionError,
		reset: resetError,
	} = useChannelConnection({
		onSuccess: (data) => {
			toast.success("Channel connected!", {
				description: `${data.platform_name} is ready for broadcasting.`,
			});
			setActiveChannelModal(null);
			refetch();
		},
	});

	const [activeChannelModal, setActiveChannelModal] = useState<string | null>(
		null,
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleTelegramConnect = async (token: string) => {
		await connectTelegram(token);
	};

	const safeChannels = Array.isArray(channels) ? channels : [];
	const connectedChannels = safeChannels;
	const connectedCount = connectedChannels.filter(
		(ch) => ch.status === "active",
	).length;

	const handleFinish = async () => {
		setIsSubmitting(true);
		try {
			await completeOnboarding();
			toast.success("Setup complete!");
			router.push(APP_ROUTES.ONBOARDING.WELCOME);
		} catch (err: any) {
			toast.error("Failed to complete setup", {
				description: err.message || "An unexpected error occurred.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// ── Decision Gate View ──────────────────────────────────────────────────
	const DecisionGate = () => (
		<div className="space-y-6">
			{/* Options */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{/* Connect Now */}
				<button
					onClick={() =>
						router.push("/onboarding/channels?view=connectors")
					}
					className="group relative flex flex-col items-start gap-3 p-5 rounded-2xl border-2 border-[#163300] bg-[#163300] text-left hover:bg-[#0e2400] transition-all active:scale-[0.98]"
				>
					<div className="w-9 h-9 rounded-full bg-[#9fe870]/20 flex items-center justify-center">
						<Zap className="w-4 h-4 text-[#9fe870]" />
					</div>
					<div>
						<p className="text-sm font-black uppercase tracking-wide text-[#9fe870]">
							Connect Now
						</p>
						<p className="text-xs font-medium text-[#9fe870]/60 mt-0.5 leading-relaxed">
							Link a channel and start broadcasting immediately
						</p>
					</div>
					<ArrowRight className="w-4 h-4 text-[#9fe870]/50 absolute bottom-4 right-4 group-hover:translate-x-0.5 transition-transform" />
				</button>

				{/* Do this Later */}
				<button
					onClick={() => router.push(APP_ROUTES.ONBOARDING.WELCOME)}
					className="group relative flex flex-col items-start gap-3 p-5 rounded-2xl border-2 border-[#e8ebe6] bg-white text-left hover:border-[#d0d3cd] hover:bg-[#f4f5f2] transition-all active:scale-[0.98]"
				>
					<div className="w-9 h-9 rounded-full bg-[#f4f5f2] border border-[#e8ebe6] flex items-center justify-center">
						<Clock className="w-4 h-4 text-[#454745]" />
					</div>
					<div>
						<p className="text-sm font-black uppercase tracking-wide text-[#163300]">
							I'll do this later
						</p>
						<p className="text-xs font-medium text-[#868685] mt-0.5 leading-relaxed">
							Skip for now — connect channels anytime in Settings
						</p>
					</div>
					<ArrowRight className="w-4 h-4 text-[#868685]/40 absolute bottom-4 right-4 group-hover:translate-x-0.5 transition-transform" />
				</button>
			</div>

			{/* Reassurance note */}
			<p className="text-center text-xs font-medium text-[#868685]">
				You can always connect channels later from your workspace settings.
			</p>
		</div>
	);

	// ── Connector Cards View ────────────────────────────────────────────────
	const ConnectorCards = () => (
		<div>
			{/* Connected Channels Summary Banner */}
			<AnimatePresence>
				{connectedCount > 0 && (
					<motion.div
						initial={{ opacity: 0, height: 0, y: -8 }}
						animate={{ opacity: 1, height: "auto", y: 0 }}
						exit={{ opacity: 0, height: 0, y: -8 }}
						transition={{ duration: 0.25 }}
						className="overflow-hidden mb-6"
					>
						<div className="p-4 rounded-2xl border border-[#9fe870]/70 bg-[#e2f6d5]/50 flex items-start gap-3">
							<CheckCircle2 className="w-5 h-5 text-[#163300] shrink-0 mt-0.5" />
							<div>
								<p className="text-xs font-bold uppercase tracking-wider text-[#163300]">
									{connectedCount} Pipeline{connectedCount !== 1 ? "s" : ""} Online
								</p>
								<div className="flex flex-wrap gap-1.5 mt-2">
									{connectedChannels
										.filter((ch) => ch.status === "active")
										.map((ch) => (
											<span
												key={ch.id}
												className="text-[11px] font-bold bg-[#163300] text-[#9fe870] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"
											>
												✓ {ch.platform_name}
											</span>
										))}
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Channel Grid */}
			<div className="space-y-3.5 mb-7">
				{CHANNELS.map((channel) => (
					<ChannelConnectCard
						key={channel.id}
						title={channel.title}
						description={channel.description}
						icon={channel.icon}
						colorClass={channel.colorClass}
						isConnected={isChannelConnected(channel.id)}
						onToggle={() => {
							if (isChannelConnected(channel.id)) return;
							resetError();
							setActiveChannelModal(channel.id);
						}}
					/>
				))}
			</div>

			{/* Action Buttons */}
			<div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#e8ebe6]">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push("/onboarding/channels")}
					className="w-full sm:w-auto h-12 px-6 rounded-full border-[#e8ebe6] hover:bg-[#f4f5f2] text-[#163300] font-bold text-xs uppercase tracking-wider shadow-none"
				>
					<span>Back</span>
				</Button>

				<Button
					type="button"
					onClick={handleFinish}
					disabled={isSubmitting}
					className="w-full sm:flex-1 h-12 rounded-full bg-[#9fe870] hover:bg-[#8ee05c] text-[#163300] font-black text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
				>
					{isSubmitting ? (
						<>
							<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							<span>Activating Engine...</span>
						</>
					) : (
						<>
							<span>Continue to Studio</span>
							<ArrowRight className="w-4 h-4 ml-1.5" />
						</>
					)}
				</Button>
			</div>
		</div>
	);

	return (
		<OnboardingLayout
			currentStep={2}
			title={isConnectorView ? "Connect Channels" : "Channel Setup"}
			description={
				isConnectorView
					? "Link your broadcasting accounts. You can always reconnect or add more from Settings."
					: "Would you like to connect a messaging channel now, or set this up later?"
			}
			stepIcon={Link2}
			stepLabel="Step 2 of 3"
		>
			<AnimatePresence mode="wait">
				{isConnectorView ? (
					<motion.div
						key="connectors"
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.2 }}
					>
						<ConnectorCards />
					</motion.div>
				) : (
					<motion.div
						key="gate"
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.2 }}
					>
						<DecisionGate />
					</motion.div>
				)}
			</AnimatePresence>

			{/* Modal Overlay for Channel Connection */}
			{mounted &&
				createPortal(
					<AnimatePresence>
						{activeChannelModal && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.2 }}
								className="fixed inset-0 bg-[#0e0f0c]/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
								onClick={() =>
									!connectionLoading && setActiveChannelModal(null)
								}
							>
								<motion.div
									initial={{ scale: 0.96, opacity: 0, y: 12 }}
									animate={{ scale: 1, opacity: 1, y: 0 }}
									exit={{ scale: 0.96, opacity: 0, y: 12 }}
									transition={{ duration: 0.2 }}
									onClick={(e) => e.stopPropagation()}
									className={`w-full ${
										activeChannelModal === "telegram" ||
										activeChannelModal === "whatsapp"
											? "max-w-[760px]"
											: "max-w-md"
									} bg-white border border-[#e8ebe6] rounded-3xl shadow-2xl relative my-8 overflow-hidden`}
								>
									{/* Top Lime Accent */}
									<div className="h-1.5 w-full bg-[#9fe870]" />

									<div className="p-6 sm:p-8 relative">
										{/* Close Button */}
										<button
											onClick={() => setActiveChannelModal(null)}
											disabled={connectionLoading}
											className="absolute top-6 right-6 p-1.5 hover:bg-[#f4f5f2] rounded-full transition-colors text-[#454745] hover:text-[#0e0f0c] disabled:opacity-50 z-10"
										>
											<XIcon className="w-5 h-5" />
										</button>

										{/* Modal Header */}
										<div className="mb-6 pr-8">
											<div className="inline-flex items-center gap-2 rounded-full bg-[#e2f6d5] border border-[#9fe870]/70 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#163300] mb-2">
												Pipeline Connector
											</div>
											<h3 className="text-xl font-heading font-black text-[#163300] uppercase tracking-tight">
												Connect{" "}
												{activeChannelModal === "telegram"
													? "Telegram BotFather"
													: activeChannelModal === "whatsapp"
													? "WhatsApp via QR"
													: "Channel"}
											</h3>
											<p className="text-xs font-medium text-[#454745] mt-1">
												{activeChannelModal === "telegram"
													? "Integrate your Telegram bot token to enable instantaneous subscriber broadcasts."
													: activeChannelModal === "whatsapp"
													? "Scan the QR code with WhatsApp on your phone to link your broadcasting device in seconds."
													: "Follow the steps below."}
											</p>
										</div>

										{/* Telegram Form */}
										{activeChannelModal === "telegram" && (
											<TelegramConnectionForm
												onSubmit={handleTelegramConnect}
												isLoading={connectionLoading}
												error={connectionError}
												onClose={() => setActiveChannelModal(null)}
											/>
										)}

										{/* WhatsApp QR Form */}
										{activeChannelModal === "whatsapp" && (
											<WhatsAppQRConnect
												onSuccess={(phone, name) => {
													toast.success("WhatsApp Linked!", {
														description: `${name || "Device"} (${phone}) is ready for broadcasting.`,
													});
													setActiveChannelModal(null);
													refetch();
												}}
												onClose={() => setActiveChannelModal(null)}
											/>
										)}

										{/* Placeholder for other channels */}
										{activeChannelModal !== "telegram" &&
											activeChannelModal !== "whatsapp" && (
												<div className="text-center py-8 space-y-4">
													<div className="w-12 h-12 rounded-full bg-[#f4f5f2] border border-[#e8ebe6] mx-auto flex items-center justify-center text-[#163300]">
														<Link2 className="w-5 h-5" />
													</div>
													<div>
														<h4 className="text-sm font-bold text-[#163300]">
															Integration In Progress
														</h4>
														<p className="text-xs text-[#868685] mt-1">
															{activeChannelModal === "instagram"
																? "Instagram Direct Messaging pipeline is currently in closed beta."
																: "X (Twitter) enterprise connector is coming in the next release."}
														</p>
													</div>
													<Button
														onClick={() => setActiveChannelModal(null)}
														className="rounded-full bg-[#163300] hover:bg-[#054d28] text-[#9fe870] font-bold text-xs uppercase px-6 py-2"
													>
														Close Window
													</Button>
												</div>
											)}
									</div>
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>,
					document.body,
				)}
		</OnboardingLayout>
	);
}

export default function ChannelsSetupPage() {
	return (
		<Suspense fallback={null}>
			<ChannelsSetupInner />
		</Suspense>
	);
}
