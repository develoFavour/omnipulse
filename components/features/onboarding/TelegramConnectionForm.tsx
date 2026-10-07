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
		title: "Launch Token Creator",
		description: "Open Telegram and speak to @BotFather",
		action: "Open BotFather",
		details:
			"@BotFather is Telegram's official bot creation system used to generate your broadcasting bot credentials.",
	},
	{
		number: 2,
		title: "Create Your Broadcast Bot",
		description: "Send /newbot and assign a brand handle",
		action: "In Progress",
		details:
			"Name your bot (e.g. SarahsBoutiqueBot). BotFather will generate an API authorization token for you to copy.",
	},
	{
		number: 3,
		title: "Authenticate Token",
		description: "Paste token below to sync webhook pipeline",
		action: "Verify & Connect",
		details:
			"Paste the unique token from BotFather into the input field below to activate direct subscriber dispatch.",
	},
];

export function TelegramConnectionForm({
	onSubmit,
	isLoading = false,
	error = null,
	onClose,
}: TelegramConnectionFormProps) {
	const [currentStep, setCurrentStep] = useState<number>(1);
	const [step1Complete, setStep1Complete] = useState<boolean>(false);
	const [step2Complete, setStep2Complete] = useState<boolean>(false);

	const form = useForm<TelegramTokenFormValues>({
		resolver: zodResolver(telegramTokenSchema),
		defaultValues: { bot_token: "" },
		mode: "onChange",
	});

	const { isValid } = form.formState;

	const handleOpenBotFather = () => {
		window.open("https://t.me/BotFather", "_blank");
		setStep1Complete(true);
		setCurrentStep(2);
	};

	const handleSubmit = async (data: TelegramTokenFormValues) => {
		try {
			await onSubmit(data.bot_token);
		} catch {
			// Handled by parent
		}
	};

	return (
		<div className="space-y-6">
			{/* Guided Step Items */}
			<div className="space-y-3">
				<p className="text-xs font-bold uppercase tracking-wider text-[#163300]">
					Telegram Bot Creation Guide
				</p>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
					{STEP_ITEMS.map((step) => {
						const isComplete =
							(step.number === 1 && step1Complete) ||
							(step.number === 2 && step2Complete);
						const isCurrent = step.number === currentStep;

						return (
							<div
								key={step.number}
								className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
									isComplete
										? "border-[#9fe870] bg-[#e2f6d5]/50"
										: isCurrent
										? "border-[#163300] bg-[#e2f6d5]/25 shadow-sm"
										: "border-[#e8ebe6] bg-[#f8faf7]"
								}`}
							>
								<div>
									<div className="flex items-center justify-between mb-2">
										<div
											className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
												isComplete
													? "bg-[#163300] text-[#9fe870]"
													: isCurrent
													? "bg-[#163300] text-[#9fe870]"
													: "bg-[#f4f5f2] text-[#868685] border border-[#e8ebe6]"
											}`}
										>
											{isComplete ? (
												<CheckCircle2 className="w-4 h-4 text-[#9fe870]" />
											) : (
												step.number
											)}
										</div>

										{isComplete && (
											<span className="text-[10px] font-bold uppercase tracking-wider text-[#163300] bg-[#e2f6d5] px-2 py-0.5 rounded-full">
												Done
											</span>
										)}
									</div>

									<p className="text-xs font-bold text-[#0e0f0c]">
										{step.title}
									</p>
									<p className="text-[11px] font-medium text-[#454745] mt-1 leading-relaxed">
										{step.description}
									</p>
								</div>

								{/* Action for step 1 */}
								{step.number === 1 && !isComplete && (
									<Button
										type="button"
										onClick={handleOpenBotFather}
										className="mt-3 w-full rounded-full border border-[#163300] bg-white hover:bg-[#163300] hover:text-[#9fe870] text-[#163300] font-bold text-xs uppercase h-8 transition-all"
									>
										<ExternalLink className="w-3.5 h-3.5 mr-1.5" />
										<span>Launch BotFather</span>
									</Button>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* Error State */}
			<AnimatePresence>
				{error && (
					<motion.div
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						className="p-4 rounded-2xl border border-red-200 bg-red-50 flex items-start gap-3"
					>
						<AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
						<div>
							<p className="text-xs font-bold uppercase tracking-wider text-red-700">
								Connection failed
							</p>
							<p className="text-xs font-medium text-red-600 mt-0.5">{error}</p>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Token Input Form */}
			<div className="pt-2">
				<form
					onSubmit={form.handleSubmit(handleSubmit)}
					className="space-y-4"
				>
					<div className="p-4 rounded-2xl border border-[#9fe870]/70 bg-[#e2f6d5]/40 flex items-start gap-2.5">
						<ArrowRight className="w-4 h-4 text-[#163300] mt-0.5 shrink-0" />
						<div>
							<p className="text-xs font-bold uppercase tracking-wider text-[#163300]">
								BotFather Token Input
							</p>
							<p className="text-xs font-medium text-[#454745] mt-0.5">
								Copy the HTTP API token sent by @BotFather and paste it below.
							</p>
						</div>
					</div>

					<div className="space-y-1.5">
						<Label
							htmlFor="bot_token"
							className="text-xs font-bold uppercase tracking-wider text-[#163300]"
						>
							Telegram Bot API Token
						</Label>
						<Input
							id="bot_token"
							type="password"
							placeholder="123456789:ABCDefGHIjklmnoPQRstuvWXYZ"
							className="h-11 bg-[#f4f5f2] border-[#e8ebe6] text-[#0e0f0c] placeholder:text-[#868685] rounded-xl focus-visible:ring-2 focus-visible:ring-[#9fe870]/50 focus-visible:border-[#163300] focus:bg-white text-sm font-mono transition-all shadow-none"
							{...form.register("bot_token")}
							disabled={isLoading}
						/>
						{form.formState.errors.bot_token && (
							<p className="text-xs font-semibold text-red-600 mt-1">
								{form.formState.errors.bot_token.message}
							</p>
						)}
					</div>

					{/* Actions */}
					<div className="flex items-center gap-3 pt-2">
						{onClose && (
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={isLoading}
								className="flex-1 h-11 rounded-full border-[#e8ebe6] hover:bg-[#f4f5f2] text-[#163300] font-bold text-xs uppercase tracking-wider shadow-none"
							>
								Cancel
							</Button>
						)}
						<Button
							type="submit"
							disabled={!isValid || isLoading}
							className="flex-[2] h-11 rounded-full bg-[#9fe870] hover:bg-[#8ee05c] text-[#163300] font-black text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
						>
							{isLoading ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									<span>Authenticating Token...</span>
								</>
							) : (
								<>
									<Send className="w-4 h-4 mr-2" />
									<span>Verify & Connect Bot</span>
								</>
							)}
						</Button>
					</div>

					<p className="text-[11px] font-semibold text-[#868685] text-center pt-1">
						🔒 Your Bot API token is encrypted with AES-256 and never logged in plain text.
					</p>
				</form>
			</div>
		</div>
	);
}
