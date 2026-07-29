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
		title: "Telegram",
		description: "Reach tech-savvy audiences",
		icon: Send,
		colorClass: "bg-[#229ED9]/20",
	},
	{
		id: "whatsapp",
		title: "WhatsApp",
		description: "Send messages directly to customers",
		icon: MessageCircle,
		colorClass: "bg-[#25D366]/20",
	},
	{
		id: "instagram",
		title: "Instagram",
		description: "Post to your followers",
		icon: MessageCircle,
		colorClass: "bg-pink-500/20",
	},
	{
		id: "x",
		title: "X (Twitter)",
		description: "Post to public timelines",
		icon: Hash,
		colorClass: "bg-zinc-800",
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
			title="Connect your channels"
			description="Start with one channel. You can add more anytime."
			stepIcon={Link2}
			stepLabel="Step 2 of 3"
		>
			{/* Connected Channels Summary */}
			<AnimatePresence>
				{connectedCount > 0 && (
					<motion.div
						initial={{ opacity: 0, height: 0, y: -10 }}
						animate={{ opacity: 1, height: "auto", y: 0 }}
						exit={{ opacity: 0, height: 0, y: -10 }}
						transition={{ duration: 0.3 }}
						className="overflow-hidden mb-8"
					>
						<div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10 backdrop-blur-sm">
							<div className="flex items-start gap-3">
								<CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
								<div>
									<p className="text-sm font-medium text-green-200">
										{connectedCount} channel{connectedCount !== 1 ? "s" : ""}{" "}
										connected
									</p>
									<div className="flex flex-wrap gap-2 mt-2">
										{connectedChannels
											.filter((ch) => ch.status === "active")
											.map((ch) => (
												<span
													key={ch.id}
													className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full"
												>
													✓ {ch.platform_name}
												</span>
											))}
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Channel Grid */}
			<div className="space-y-4 mb-8">
				{CHANNELS.map((channel) => (
					<ChannelConnectCard
						key={channel.id}
						title={channel.title}
						description={channel.description}
						icon={channel.icon}
						colorClass={channel.colorClass}
						isConnected={isChannelConnected(channel.id)}
						onToggle={() => {
							if (isChannelConnected(channel.id)) return; // Prevent toggle if already connected
							resetError();
							setActiveChannelModal(channel.id);
						}}
					/>
				))}
			</div>

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
								className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
								onClick={() =>
									!connectionLoading && setActiveChannelModal(null)
								}
							>
								<motion.div
									initial={{ scale: 0.95, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0.95, opacity: 0 }}
									transition={{ duration: 0.2 }}
									onClick={(e) => e.stopPropagation()}
									className={`w-full ${
										activeChannelModal === "telegram"
											? "max-w-[1000px]"
											: "max-w-md"
									} bg-zinc-900 border border-white/10 rounded-2xl p-6 relative`}
								>
									{/* Close Button */}
									<button
										onClick={() => setActiveChannelModal(null)}
										disabled={connectionLoading}
										className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
									>
										<XIcon className="w-5 h-5 text-zinc-400" />
									</button>

									{/* Modal Header */}
									<div className="mb-6">
										<h3 className="text-lg font-semibold text-white">
											Connect{" "}
											{activeChannelModal === "telegram"
												? "Telegram"
												: "Channel"}
										</h3>
										<p className="text-sm text-zinc-400 mt-1">
											{activeChannelModal === "telegram"
												? "Enter your Telegram bot token to start broadcasting"
												: "Follow the steps below"}
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
									{activeChannelModal !== "telegram" && activeChannelModal !== "whatsapp" && (
										<div className="text-center py-8">
											<p className="text-sm text-zinc-400 mb-4">
												{activeChannelModal === "instagram"
													? "Instagram connection coming soon"
													: "X connection coming soon"}
											</p>
											<Button
												onClick={() => setActiveChannelModal(null)}
												variant="ghost"
												className="w-full"
											>
												Close
											</Button>
										</div>
									)}
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>,
					document.body,
				)}

			{/* Action Buttons */}
			<div className="flex gap-3 pt-6">
				<Button
					variant="ghost"
					onClick={() => router.back()}
					className="flex-1"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back
				</Button>
				<Button
					onClick={handleFinish}
					disabled={connectedCount === 0 || isSubmitting}
					className="flex-1 bg-white hover:bg-zinc-200 text-zinc-950 font-medium"
				>
					{isSubmitting ? (
						<>
							<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							Finishing...
						</>
					) : (
						<>
							<CheckCircle2 className="w-4 h-4 mr-2" />
							Finish Setup
						</>
					)}
				</Button>
			</div>

			{/* Info Section */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5, duration: 0.5 }}
				className="mt-10 pt-8 border-t border-white/10"
			>
				<p className="text-sm font-medium text-white mb-4">What comes next?</p>
				<ul className="space-y-3">
					{[
						"Build your audience directory",
						"Compose your first broadcast",
						"Track engagement and delivery",
					].map((item, idx) => (
						<li key={idx} className="flex gap-3 text-sm text-zinc-400">
							<span className="text-zinc-500 font-mono">0{idx + 1}.</span>
							{item}
						</li>
					))}
				</ul>
			</motion.div>
		</OnboardingLayout>
	);
}
