"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	MessageCircle,
	Send,
	Hash,
	ArrowLeft,
	Loader2,
	Link2,
	X as XIcon,
	CheckCircle2,
	ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { OnboardingLayout } from "@/components/features/onboarding/OnboardingLayout";
import { ChannelConnectCard } from "@/components/features/onboarding/ChannelConnectCard";
import { TelegramConnectionForm } from "@/components/features/onboarding/TelegramConnectionForm";
import { WhatsAppConnectionForm } from "@/components/features/onboarding/WhatsAppConnectionForm";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/constants/routes.const";
import { useChannelConnection } from "@/lib/api/hooks/useChannelConnection";
import { useTenantChannels } from "@/lib/api/hooks/useTenantChannels";
import { useAppStore } from "@/lib/store";

const CHANNELS = [
	{
		id: "telegram",
		title: "Telegram BotFather",
		description: "High-speed token dispatch & channel broadcasting",
		icon: Send,
		colorClass: "bg-[#229ED9]",
	},
	{
		id: "whatsapp",
		title: "WhatsApp Cloud API",
		description: "Official Meta dual-pipeline direct customer messaging",
		icon: MessageCircle,
		colorClass: "bg-[#25D366]",
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

export default function ChannelsSetupPage() {
	const router = useRouter();
	const completeOnboarding = useAppStore((state) => state.completeOnboarding);
	const { channels, refetch, isChannelConnected } = useTenantChannels({
		pollInterval: 2000,
	});
	const {
		connectTelegram,
		connectWhatsApp,
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
		if (safeChannels.length === 0) {
			toast.error("Please connect at least one channel before continuing.");
			return;
		}

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

	return (
		<OnboardingLayout
			currentStep={2}
			title="Connect Channels"
			description="Integrate your communication pipelines. Start with at least one to activate the engine."
			stepIcon={Link2}
			stepLabel="Step 2 of 3"
		>
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
			<div className="flex items-center gap-3 pt-4 border-t border-[#e8ebe6]">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.back()}
					className="flex-1 h-12 rounded-full border-[#e8ebe6] hover:bg-[#f4f5f2] text-[#163300] font-bold text-xs uppercase tracking-wider shadow-none"
				>
					<ArrowLeft className="w-4 h-4 mr-1.5" />
					<span>Back</span>
				</Button>

				<Button
					type="button"
					onClick={handleFinish}
					disabled={connectedCount === 0 || isSubmitting}
					className="flex-[2] h-12 rounded-full bg-[#9fe870] hover:bg-[#8ee05c] text-[#163300] font-black text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
				>
					{isSubmitting ? (
						<>
							<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							<span>Activating Engine...</span>
						</>
					) : (
						<>
							<span>Complete Setup</span>
							<ArrowRight className="w-4 h-4 ml-1.5" />
						</>
					)}
				</Button>
			</div>

			{/* Info Section */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.3, duration: 0.5 }}
				className="mt-8 pt-6 border-t border-[#e8ebe6]"
			>
				<p className="text-xs font-bold uppercase tracking-wider text-[#163300] mb-3">
					What happens next?
				</p>
				<ul className="space-y-2.5">
					{[
						"Synchronize real-time contact intake via webhooks",
						"Author unified broadcast messages with dynamic tags",
						"Monitor delivery telemetry in the Live Studio console",
					].map((item, idx) => (
						<li key={idx} className="flex items-center gap-2.5 text-xs font-medium text-[#454745]">
							<span className="text-[10px] font-mono font-bold text-[#163300] bg-[#f4f5f2] border border-[#e8ebe6] px-1.5 py-0.5 rounded">
								0{idx + 1}
							</span>
							<span>{item}</span>
						</li>
					))}
				</ul>
			</motion.div>

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
										activeChannelModal === "telegram"
											? "max-w-[900px]"
											: "max-w-md"
									} bg-white border border-[#e8ebe6] rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8`}
								>
									{/* Top Lime Accent */}
									<div className="absolute top-0 inset-x-0 h-1 bg-[#9fe870] rounded-t-3xl" />

									{/* Close Button */}
									<button
										onClick={() => setActiveChannelModal(null)}
										disabled={connectionLoading}
										className="absolute top-5 right-5 p-1.5 hover:bg-[#f4f5f2] rounded-full transition-colors text-[#454745] hover:text-[#0e0f0c] disabled:opacity-50"
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
												? "WhatsApp Cloud API"
												: "Channel"}
										</h3>
										<p className="text-xs font-medium text-[#454745] mt-1">
											{activeChannelModal === "telegram"
												? "Integrate your Telegram bot token to enable instantaneous subscriber broadcasts."
												: activeChannelModal === "whatsapp"
												? "Authenticate your Meta Cloud API credentials for multi-tenant delivery."
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

									{/* WhatsApp Form */}
									{activeChannelModal === "whatsapp" && (
										<WhatsAppConnectionForm
											onSubmit={async (creds) => {
												await connectWhatsApp(creds);
											}}
											isLoading={connectionLoading}
											error={connectionError}
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
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>,
					document.body,
				)}
		</OnboardingLayout>
	);
}
