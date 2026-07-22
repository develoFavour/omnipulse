"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Loader2,
	AlertCircle,
	CheckCircle2,
	ArrowRight,
	ExternalLink,
	Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const telegramTokenSchema = z.object({
	bot_token: z
		.string()
		.min(1, "Bot token is required")
		.regex(
			/^\d+:[A-Za-z0-9_-]+$/,
			"Invalid format. Bot token should be: 123456789:ABCDefGHIjklmnoPQRstuvWXYZ",
		),
});

type TelegramTokenFormValues = z.infer<typeof telegramTokenSchema>;

interface TelegramConnectionFormProps {
	onSubmit: (token: string) => Promise<void>;
	isLoading?: boolean;
	error?: string | null;
	onClose?: () => void;
}

const STEP_ITEMS = [
	{
		number: 1,
		title: "Launch the Token Creator",
		description: "Open Telegram and go to @BotFather",
		action: "Open BotFather",
		details:
			"@BotFather is Telegram's official bot creation service. We'll use it to create your broadcasting bot.",
	},
	{
		number: 2,
		title: "Create Your Bot",
		description: "Type /newbot and follow the instructions",
		action: "In Progress",
		details:
			"Name your bot (e.g., SarahsBoutiqueBot). BotFather will send you a unique token to copy.",
	},
	{
		number: 3,
		title: "Paste Your Token",
		description: "Enter the token BotFather gave you",
		action: "Verify & Connect",
		details:
			"Your token is encrypted and never shared. We only use it to broadcast on your behalf.",
	},
];

export function TelegramConnectionForm({
	onSubmit,
	isLoading = false,
	error = null,
	onClose,
}: TelegramConnectionFormProps) {
	const [currentStep, setCurrentStep] = useState(1);
	const [completedSteps, setCompletedSteps] = useState<number[]>([]);

	const form = useForm<TelegramTokenFormValues>({
		resolver: zodResolver(telegramTokenSchema),
		defaultValues: { bot_token: "" },
		mode: "onChange",
	});

	const handleOpenBotFather = () => {
		// Deep link to open Telegram and go to BotFather
		const deepLink = "https://t.me/BotFather";
		window.open(deepLink, "_blank");

		// Mark step 1 as completed
		if (!completedSteps.includes(1)) {
			setCompletedSteps([...completedSteps, 1]);
			setCurrentStep(2);
		}
	};

	const handleSubmit = async (data: TelegramTokenFormValues) => {
		try {
			await onSubmit(data.bot_token);
			// Mark all steps as completed on success
			setCompletedSteps([1, 2, 3]);
		} catch (err) {
			// Error is handled by parent component
		}
	};

	const isValid = form.formState.isValid;
	const step1Complete = completedSteps.includes(1);

	return (
		<div className="space-y-6">
			{/* Two-Column Layout: Video + Steps */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Left Column: Placeholder for GIF/Video */}
				<div className="flex flex-col items-center justify-center p-6 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
					<div className="w-full aspect-video bg-white/5 rounded-lg flex flex-col items-center justify-center border border-white/10">
						<div className="text-center">
							<div className="text-4xl mb-2">🤖</div>
							<p className="text-sm text-zinc-400 mb-2">
								Interactive Setup Guide
							</p>
							<p className="text-xs text-zinc-500">
								(Add GIF showing @BotFather interactions)
							</p>
						</div>
					</div>
					<p className="text-xs text-zinc-500 mt-4 text-center">
						5-second looping demonstration of creating a Telegram bot
					</p>
				</div>

				{/* Right Column: 3-Step Guide */}
				<div className="space-y-4">
					{STEP_ITEMS.map((step, idx) => {
						const isComplete = completedSteps.includes(step.number);
						const isCurrent = currentStep === step.number;

						return (
							<motion.div
								key={step.number}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: idx * 0.1 }}
							>
								<div
									className={`p-4 rounded-lg border transition-all ${
										isComplete
											? "border-green-500/30 bg-green-500/10"
											: isCurrent
												? "border-white/30 bg-white/[0.08]"
												: "border-white/10 bg-white/[0.03]"
									}`}
								>
									{/* Header with Step Number */}
									<div className="flex items-start justify-between gap-3 mb-3">
										<div className="flex items-center gap-3 flex-1">
											{/* Step Badge */}
											<div
												className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
													isComplete
														? "bg-green-500/30 text-green-300 border border-green-500/50"
														: isCurrent
															? "bg-white/20 text-white border border-white/30"
															: "bg-white/5 text-zinc-400 border border-white/10"
												}`}
											>
												{isComplete ? (
													<CheckCircle2 className="w-5 h-5" />
												) : (
													step.number
												)}
											</div>

											{/* Step Info */}
											<div className="flex-1 min-w-0">
												<p className="text-sm font-semibold text-white">
													{step.title}
												</p>
												<p className="text-xs text-zinc-400">
													{step.description}
												</p>
											</div>
										</div>

										{/* Action Button or Status */}
										{isComplete ? (
											<div className="text-xs font-medium text-green-300 whitespace-nowrap flex items-center gap-1">
												<CheckCircle2 className="w-4 h-4" />
												Done
											</div>
										) : null}
									</div>

									{/* Details */}
									<p className="text-xs text-zinc-400 ml-11 mb-3">
										{step.details}
									</p>

									{/* Action Button - Only show for current step or step 1 */}
									{(isCurrent || step.number === 1) && !isComplete && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: "auto" }}
											exit={{ opacity: 0, height: 0 }}
											className="ml-11"
										>
											{step.number === 1 && (
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={handleOpenBotFather}
													className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 border border-blue-500/30 h-8"
												>
													<ExternalLink className="w-3.5 h-3.5 mr-2" />
													{step.action}
												</Button>
											)}
										</motion.div>
									)}
								</div>
							</motion.div>
						);
					})}
				</div>
			</div>

			{/* Error State */}
			<AnimatePresence>
				{error && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="p-4 rounded-lg border border-red-500/30 bg-red-500/10 flex gap-3"
					>
						<AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
						<div>
							<p className="text-sm font-medium text-red-200">
								Connection failed
							</p>
							<p className="text-xs text-red-300 mt-1">{error}</p>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Token Input - Only show after step 1 is done */}
			<AnimatePresence>
				{step1Complete && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.3 }}
						className="overflow-hidden"
					>
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className="space-y-4"
						>
							<div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/10">
								<div className="flex gap-2 items-start mb-3">
									<ArrowRight className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
									<div>
										<p className="text-sm font-medium text-blue-300">
											Ready to paste?
										</p>
										<p className="text-xs text-blue-200 mt-1">
											After you create your bot with @BotFather, copy the token
											and paste it here.
										</p>
									</div>
								</div>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="bot_token"
									className="text-sm font-medium text-white"
								>
									Bot Token
								</Label>
								<Input
									id="bot_token"
									type="password"
									placeholder="123456789:ABCDefGHIjklmnoPQRstuvWXYZ"
									className="h-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-white/20"
									{...form.register("bot_token")}
									disabled={isLoading}
								/>
								{form.formState.errors.bot_token && (
									<p className="text-xs text-red-400 mt-1">
										{form.formState.errors.bot_token.message}
									</p>
								)}
							</div>

							{/* Actions */}
							<div className="flex gap-2 pt-4">
								{onClose && (
									<Button
										type="button"
										variant="ghost"
										onClick={onClose}
										disabled={isLoading}
										className="flex-1"
									>
										Cancel
									</Button>
								)}
								<Button
									type="submit"
									disabled={!isValid || isLoading}
									className="flex-1 bg-white hover:bg-zinc-200 text-zinc-950 font-medium"
								>
									{isLoading ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Verifying...
										</>
									) : (
										<>
											<Send className="w-4 h-4 mr-2" />
											Verify & Connect
										</>
									)}
								</Button>
							</div>

							<p className="text-xs text-zinc-400 text-center">
								🔒 Your token is encrypted and stored securely
							</p>
						</form>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Info Footer */}
			<div className="pt-4 border-t border-white/10">
				<p className="text-xs text-zinc-400 text-center">
					Questions? Each step will automatically open Telegram. Just follow
					along!
				</p>
			</div>
		</div>
	);
}
