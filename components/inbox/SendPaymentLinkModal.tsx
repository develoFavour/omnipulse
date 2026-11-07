"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Loader2, X, Zap, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { commerceService, type PaymentTransaction } from "@/lib/services/commerce.service";
import { cn } from "@/lib/utils";

interface SendPaymentLinkModalProps {
	isOpen: boolean;
	onClose: () => void;
	conversationId: string;
	contactName?: string;
	onSuccess?: (tx: PaymentTransaction) => void;
}

export function SendPaymentLinkModal({
	isOpen,
	onClose,
	conversationId,
	contactName,
	onSuccess,
}: SendPaymentLinkModalProps) {
	const [amountNaira, setAmountNaira] = useState("");
	const [description, setDescription] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const parsedAmount = parseFloat(amountNaira.replace(/,/g, "")) || 0;
	const amountKobo = Math.round(parsedAmount * 100);

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value.replace(/[^0-9.]/g, "");
		setAmountNaira(val);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (amountKobo <= 0) {
			toast.error("Please enter a valid amount");
			return;
		}
		if (!description.trim()) {
			toast.error("Please provide an item or service description");
			return;
		}

		setIsSubmitting(true);
		try {
			const tx = await commerceService.createPaymentLink(conversationId, {
				amount: amountKobo,
				description: description.trim(),
			});

			toast.success("Payment link generated and sent to customer!");
			onSuccess?.(tx);
			onClose();
			setAmountNaira("");
			setDescription("");
		} catch (err: any) {
			toast.error(
				err.response?.data?.error ||
					err.message ||
					"Failed to generate payment link",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 10 }}
						className="relative w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl"
					>
						{/* Close button */}
						<button
							onClick={onClose}
							disabled={isSubmitting}
							className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
						>
							<X className="h-4 w-4" />
						</button>

						{/* Header */}
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
								<Zap className="h-5 w-5 fill-emerald-600" />
							</div>
							<div>
								<h3 className="font-bold text-gray-900 text-base">
									Send Paystack Payment Link
								</h3>
								<p className="text-xs text-gray-500">
									Customer can pay instantly via Bank Transfer, Card, or USSD
								</p>
							</div>
						</div>

						{contactName && (
							<div className="mt-4 rounded-xl bg-gray-50 px-3.5 py-2 text-xs text-gray-600 border border-gray-100 flex items-center justify-between">
								<span>Recipient:</span>
								<span className="font-semibold text-gray-900">{contactName}</span>
							</div>
						)}

						{/* Form */}
						<form onSubmit={handleSubmit} className="mt-4 space-y-4">
							<div>
								<label className="block text-xs font-semibold text-gray-700 mb-1.5">
									Amount (₦ NGN)
								</label>
								<div className="relative">
									<span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">
										₦
									</span>
									<input
										type="text"
										value={amountNaira}
										onChange={handleAmountChange}
										placeholder="e.g. 25000"
										autoFocus
										disabled={isSubmitting}
										className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-8 pr-4 py-2.5 text-base font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#163300]/20 focus:border-[#163300]"
									/>
								</div>
								{parsedAmount > 0 && (
									<p className="mt-1 text-[11px] text-emerald-700 font-medium">
										Customer will be charged: ₦{parsedAmount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
									</p>
								)}
							</div>

							<div>
								<label className="block text-xs font-semibold text-gray-700 mb-1.5">
									Item / Service Description
								</label>
								<input
									type="text"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="e.g. Vintage Black Jacket - Size M"
									maxLength={120}
									disabled={isSubmitting}
									className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#163300]/20 focus:border-[#163300]"
								/>
							</div>

							{/* Paystack Rails note */}
							<div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs text-emerald-900 flex items-start gap-2.5">
								<ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
								<div className="leading-relaxed text-[11px]">
									When paid, the customer will be automatically tagged{" "}
									<span className="font-bold text-emerald-800">"Customer - Paid"</span> and
									revenue will be attributed to this campaign.
								</div>
							</div>

							{/* Actions */}
							<div className="flex items-center gap-2 pt-2">
								<button
									type="button"
									onClick={onClose}
									disabled={isSubmitting}
									className="w-1/3 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isSubmitting || amountKobo <= 0 || !description.trim()}
									className={cn(
										"flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all shadow-sm",
										amountKobo > 0 && description.trim() && !isSubmitting
											? "bg-[#163300] hover:bg-[#0d2000] text-[#9fe870] hover:text-white"
											: "bg-gray-100 text-gray-400 cursor-not-allowed",
									)}
								>
									{isSubmitting ? (
										<>
											<Loader2 className="h-3.5 w-3.5 animate-spin" />
											Generating Link...
										</>
									) : (
										<>
											<CreditCard className="h-3.5 w-3.5" />
											Send Link
										</>
									)}
								</button>
							</div>
						</form>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}

