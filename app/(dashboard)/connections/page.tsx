"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Send,
	MessageCircle,
	Camera,
	Mail,
	Smartphone,
	CheckCircle2,
	Loader2,
	Radio,
	RefreshCw,
	ShieldCheck,
	Layers,
	ChevronRight,
	ExternalLink,
	AlertCircle,
} from "lucide-react";
import { useTenantChannels } from "@/lib/api/hooks/useTenantChannels";
import { useTelegramDestinations } from "@/lib/api/hooks/useTelegramDestinations";
import { useChannelConnection } from "@/lib/api/hooks/useChannelConnection";
import { useWhatsAppOAuth } from "@/lib/api/hooks/useWhatsAppOAuth";
import { TelegramConnectionForm } from "@/components/features/onboarding/TelegramConnectionForm";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface PlatformCatalogItem {
	id: string;
	name: string;
	category: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	brandColor: string;
	bgLight: string;
	borderLight: string;
	textColor: string;
	available: boolean;
}

const PLATFORMS: PlatformCatalogItem[] = [
	{
		id: "telegram",
		name: "Telegram Bot",
		category: "Instant Messaging",
		description:
			"Connect bots to send DMs, group broadcasts, and channel announcements.",
		icon: Send,
		brandColor: "#229ED9",
		bgLight: "bg-[#229ED9]/10",
		borderLight: "border-[#229ED9]/20",
		textColor: "text-[#229ED9]",
		available: true,
	},
	{
		id: "whatsapp",
		name: "WhatsApp Business",
		category: "Official Meta API",
		description:
			"Direct customer messaging, 1-click Meta OAuth, and WhatsApp Channel broadcasts.",
		icon: MessageCircle,
		brandColor: "#25D366",
		bgLight: "bg-[#25D366]/10",
		borderLight: "border-[#25D366]/20",
		textColor: "text-[#25D366]",
		available: true,
	},
	{
		id: "instagram",
		name: "Instagram Direct",
		category: "Social Commerce",
		description:
			"Engage followers via automated DMs and story response triggers.",
		icon: Camera,
		brandColor: "#E1306C",
		bgLight: "bg-pink-50",
		borderLight: "border-pink-200",
		textColor: "text-pink-600",
		available: false,
	},
	{
		id: "email",
		name: "Email Broadcasts",
		category: "Transactional & Marketing",
		description:
			"High-deliverability email marketing via Resend, Postmark, or SendGrid.",
		icon: Mail,
		brandColor: "#6366F1",
		bgLight: "bg-indigo-50",
		borderLight: "border-indigo-200",
		textColor: "text-indigo-600",
		available: false,
	},
	{
		id: "sms",
		name: "SMS & Twilio",
		category: "Mobile Gateways",
		description:
			"Global SMS delivery for critical alerts, 2FA, and priority notifications.",
		icon: Smartphone,
		brandColor: "#10B981",
		bgLight: "bg-emerald-50",
		borderLight: "border-emerald-200",
		textColor: "text-emerald-600",
		available: false,
	},
];

export default function ConnectionsCatalogPage() {
	const { channels, refetch: refetchChannels } = useTenantChannels();
	const {
		destinations,
		isLoading: loadingDestinations,
		refetch: refetchDestinations,
	} = useTelegramDestinations();
	const { connectTelegram, loading: isConnectingTelegram } =
		useChannelConnection();
	const {
		connectWithMeta,
		disconnect: disconnectWhatsApp,
		isLoading: isMetaConnecting,
		isDisconnecting: isMetaDisconnecting,
		error: metaError,
		config: metaConfig,
		isConnected: isMetaConnected,
		connectionResult: metaConnectionResult,
		resetConnection: resetMetaConnection,
	} = useWhatsAppOAuth({
		onSuccess: (result) => {
			toast.success("WhatsApp Business connected!", {
				description: `${result.sender_identity} is now active.`,
			});
			refetchChannels();
			setActiveManagePlatform(null);
		},
		onError: (error) => {
			toast.error(error, {
				description: "WhatsApp connection error",
			});
		},
	});

	const [activeManagePlatform, setActiveManagePlatform] = useState<
		string | null
	>(null);
	const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);

	const telegramChannel = channels.find(
		(c) => c.platform_name === "telegram" && c.status === "active",
	);
	const whatsappChannel = channels.find(
		(c) => c.platform_name === "whatsapp" && c.status === "active",
	);

	const getPlatformChannel = (platformId: string) => {
		if (platformId === "telegram") return telegramChannel;
		if (platformId === "whatsapp") return whatsappChannel;
		return undefined;
	};

	const handleTelegramSubmit = async (token: string) => {
		await connectTelegram(token);
		toast.success("Telegram Bot connected!");
		refetchChannels();
		refetchDestinations();
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
			className="max-w-7xl mx-auto pt-4 pb-16"
		>
			{/* Header */}
			<div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/80 pb-8">
				<div>
					<div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1.5">
						<Layers className="h-4 w-4" />
						Integrations & Channels
					</div>
					<h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-heading">
						Channel Connections
					</h1>
					<p className="mt-2 text-gray-500 font-medium max-w-2xl text-base">
						Connect your messaging providers, manage live webhooks, and inspect
						auto-discovered broadcast targets in dedicated channel workspaces.
					</p>
				</div>

				<div className="flex items-center gap-3">
					<span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 border border-gray-200">
						<span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
						{channels.filter((c) => c.status === "active").length} Active
						Channels
					</span>
				</div>
			</div>

			{/* Catalog Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
				{PLATFORMS.map((platform) => {
					const connected = getPlatformChannel(platform.id);
					return (
						<motion.div
							key={platform.id}
							whileHover={{ y: -2 }}
							transition={{ duration: 0.2 }}
							className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-gray-300 hover:shadow-md transition-all"
						>
							<div>
								<div className="flex items-start justify-between mb-5">
									<div
										className={`h-14 w-14 rounded-2xl flex items-center justify-center border shadow-sm ${platform.bgLight} ${platform.borderLight} ${platform.textColor}`}
									>
										<platform.icon className="h-7 w-7" />
									</div>
									{connected ? (
										<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 shadow-sm">
											<CheckCircle2 className="h-3.5 w-3.5" />
											Active
										</span>
									) : platform.available ? (
										<span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600 border border-gray-200">
											Not Configured
										</span>
									) : (
										<span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-xs font-bold text-gray-400 border border-gray-200">
											Coming Soon
										</span>
									)}
								</div>

								<div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
									{platform.category}
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-2 font-heading">
									{platform.name}
								</h3>
								<p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
									{platform.description}
								</p>
							</div>

							<div>
								{connected && (
									<div className="mb-4 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs font-medium text-gray-700 flex items-center justify-between">
										<span className="text-gray-500">Connected identity:</span>
										<span className="font-bold text-gray-900 font-mono">
											{connected.sender_identity}
										</span>
									</div>
								)}

								{platform.available ? (
									<button
										onClick={() => setActiveManagePlatform(platform.id)}
										className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white hover:bg-gray-800 transition-all shadow-sm group-hover:bg-indigo-600"
									>
										<span>
											{connected
												? "Manage Channel & Targets"
												: "Connect Platform"}
										</span>
										<ChevronRight className="h-4 w-4" />
									</button>
								) : (
									<button
										disabled
										className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-5 py-3 text-sm font-bold text-gray-400 cursor-not-allowed"
									>
										Coming Soon
									</button>
								)}
							</div>
						</motion.div>
					);
				})}
			</div>

			{/* Channel Management Modal */}
			<AnimatePresence>
				{activeManagePlatform && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
						<motion.div
							initial={{ opacity: 0, scale: 0.96 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.96 }}
							className="w-full max-w-3xl rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto"
						>
							{/* Modal Header */}
							<div className="flex items-start justify-between border-b border-gray-100 pb-6">
								<div className="flex items-center gap-4">
									<div
										className={`h-12 w-12 rounded-2xl flex items-center justify-center border shadow-sm ${
											activeManagePlatform === "telegram"
												? "bg-[#229ED9]/10 border-[#229ED9]/20 text-[#229ED9]"
												: "bg-[#25D366]/10 border-[#25D366]/20 text-[#25D366]"
										}`}
									>
										{activeManagePlatform === "telegram" ? (
											<Send className="h-6 w-6" />
										) : (
											<MessageCircle className="h-6 w-6" />
										)}
									</div>
									<div>
										<h3 className="text-2xl font-extrabold text-gray-900 font-heading">
											{activeManagePlatform === "telegram"
												? "Telegram Bot Workspace"
												: "WhatsApp Business Workspace"}
										</h3>
										<p className="text-sm font-medium text-gray-500">
											{activeManagePlatform === "telegram"
												? "Configure webhook credentials, inspect connection health, and view discovered destinations."
												: "Connect your WhatsApp Business Account with one click via Meta."}
										</p>
									</div>
								</div>

								<button
									onClick={() => {
										setActiveManagePlatform(null);
										resetMetaConnection();
									}}
									className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 font-bold transition-all"
								>
									✕
								</button>
							</div>

							{/* Telegram Management View */}
							{activeManagePlatform === "telegram" && (
								<div className="space-y-8">
									<div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 space-y-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2 text-sm font-bold text-gray-900">
												<ShieldCheck className="h-4 w-4 text-indigo-600" />
												Channel Configuration
											</div>
											{telegramChannel && (
												<span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
													✓ Active & Registered
												</span>
											)}
										</div>
										<TelegramConnectionForm
											onSubmit={handleTelegramSubmit}
											isLoading={isConnectingTelegram}
											onClose={() => setActiveManagePlatform(null)}
										/>
									</div>

									<div className="space-y-4 pt-4 border-t border-gray-100">
										<div className="flex items-center justify-between">
											<div>
												<h4 className="text-base font-bold text-gray-900">
													Auto-Discovered Groups & Channels
												</h4>
												<p className="text-xs text-gray-500 font-medium">
													Real-time Telegram groups where your bot is an admin
												</p>
											</div>
											<button
												onClick={() => refetchDestinations()}
												className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm"
											>
												<RefreshCw className="h-3.5 w-3.5 text-gray-500" />
												Refresh List
											</button>
										</div>

										{loadingDestinations ? (
											<div className="flex items-center justify-center py-8 text-gray-500 text-sm gap-2">
												<Loader2 className="h-5 w-5 animate-spin text-indigo-600" />{" "}
												Fetching destinations...
											</div>
										) : destinations.length === 0 ? (
											<div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 p-8 text-center">
												<Radio className="h-8 w-8 text-gray-400 mx-auto mb-2" />
												<p className="text-sm font-bold text-gray-900">
													No destinations discovered yet
												</p>
												<p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
													Add your bot to a Telegram group or channel and post a
													message to trigger automatic discovery.
												</p>
											</div>
										) : (
											<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
												<table className="w-full text-left text-sm">
													<thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold tracking-wider">
														<tr>
															<th className="px-4 py-3">Group Name</th>
															<th className="px-4 py-3">Type</th>
															<th className="px-4 py-3">Chat ID</th>
															<th className="px-4 py-3">Status</th>
														</tr>
													</thead>
													<tbody className="divide-y divide-gray-100">
														{destinations.map((d) => (
															<tr
																key={d.id}
																className="hover:bg-gray-50 transition-colors"
															>
																<td className="px-4 py-3 font-bold text-gray-900">
																	{d.title}
																</td>
																<td className="px-4 py-3 capitalize text-gray-500 font-medium">
																	{d.type}
																</td>
																<td className="px-4 py-3 font-mono text-xs text-gray-400">
																	{d.telegram_chat_id}
																</td>
																<td className="px-4 py-3">
																	<span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
																		{d.status}
																	</span>
																</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
										)}
									</div>
								</div>
							)}

							{/* WhatsApp Management View */}
							{activeManagePlatform === "whatsapp" && (
								<div className="space-y-6">
									{(whatsappChannel || isMetaConnected) && (
										<div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
											<div className="flex items-center gap-3 mb-4">
												<div className="h-10 w-10 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center">
													<CheckCircle2 className="h-5 w-5" />
												</div>
												<div>
													<h4 className="text-sm font-bold text-emerald-900">
														WhatsApp Connected
													</h4>
													<p className="text-xs text-emerald-700 font-medium">
														{whatsappChannel?.sender_identity ||
															metaConnectionResult?.sender_identity}
													</p>
												</div>
											</div>
											<div className="flex flex-wrap items-center gap-2 text-xs text-emerald-600 font-medium">
												<span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1">
													WABA: {metaConnectionResult?.waba_id || "Active"}
												</span>
												<span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1">
													Phone ID:{" "}
													{metaConnectionResult?.phone_number_id ||
														"Registered"}
												</span>
											</div>
											<div className="mt-5 pt-4 border-t border-emerald-200/60">
												<AlertDialog
													open={isDisconnectDialogOpen}
													onOpenChange={setIsDisconnectDialogOpen}
												>
													<AlertDialogTrigger
														disabled={isMetaDisconnecting}
														className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 px-5 py-3 text-sm font-bold text-red-700 hover:bg-red-100 transition-all disabled:opacity-50"
													>
														{isMetaDisconnecting ? (
															<>
																<Loader2 className="h-4 w-4 animate-spin" />{" "}
																Disconnecting...
															</>
														) : (
															<>Disconnect WhatsApp</>
														)}
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>
																Disconnect WhatsApp?
															</AlertDialogTitle>
															<AlertDialogDescription>
																This will remove the channel and you&apos;ll
																need to reconnect via Meta OAuth.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction
																variant="destructive"
																onClick={async () => {
																	await disconnectWhatsApp();
																	toast.success(
																		"WhatsApp disconnected successfully",
																	);
																	refetchChannels();
																	setActiveManagePlatform(null);
																}}
															>
																Disconnect
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</div>
										</div>
									)}

									{!whatsappChannel && !isMetaConnected && (
										<div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 space-y-6">
											<div className="flex items-start gap-4">
												<div className="h-12 w-12 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
													<MessageCircle className="h-6 w-6" />
												</div>
												<div>
													<h4 className="text-base font-bold text-emerald-900">
														Connect with Meta
													</h4>
													<p className="text-sm text-emerald-700/80 font-medium leading-relaxed mt-1">
														One-click OAuth setup. No developer console, no
														copy-pasting tokens. Just sign in with your Facebook
														account and select your WhatsApp Business profile.
													</p>
												</div>
											</div>

											<div className="space-y-3 bg-white/60 rounded-xl p-4 border border-emerald-100">
												<p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
													How it works
												</p>
												<ol className="space-y-2 text-sm text-emerald-800/80">
													<li className="flex items-start gap-2">
														<span className="font-bold text-emerald-600">
															1.
														</span>
														<span>
															Click &apos;Connect with Meta&apos; below
														</span>
													</li>
													<li className="flex items-start gap-2">
														<span className="font-bold text-emerald-600">
															2.
														</span>
														<span>
															Sign in with your Facebook account (Meta OAuth)
														</span>
													</li>
													<li className="flex items-start gap-2">
														<span className="font-bold text-emerald-600">
															3.
														</span>
														<span>
															Select your WhatsApp Business profile & phone
															number
														</span>
													</li>
													<li className="flex items-start gap-2">
														<span className="font-bold text-emerald-600">
															4.
														</span>
														<span>
															We handle the rest - webhook registration, token
															exchange, and channel activation
														</span>
													</li>
												</ol>
											</div>



											<button
												onClick={connectWithMeta}
												disabled={isMetaConnecting}
												className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1877F2] px-6 py-4 text-sm font-bold text-white hover:bg-[#166FE5] transition-all shadow-md disabled:opacity-50"
											>
												{isMetaConnecting ? (
													<>
														<Loader2 className="h-5 w-5 animate-spin" />{" "}
														Connecting...
													</>
												) : (
													<>
														<ExternalLink className="h-5 w-5" /> Connect with
														Meta
													</>
												)}
											</button>

											{metaError && (
												<div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
													<AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
													{metaError}
												</div>
											)}
										</div>
									)}
								</div>
							)}
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
