"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Loader2, X, Zap, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { apiMessage } from "@/lib/api/axios-error";
import { commerceService, type PaymentTransaction, type SettlementAccount } from "@/lib/services/commerce.service";
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
	const [customerEmail, setCustomerEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [settlement, setSettlement] = useState<SettlementAccount | null>(null);
	const [isLoadingSettlement, setIsLoadingSettlement] = useState(true);

	useEffect(() => {
		if (!isOpen) return;
		let isMounted = true;
		commerceService
			.getSettlementAccount()
			.then((acc) => {
				if (isMounted) setSettlement(acc);
			})
			.finally(() => {
				if (isMounted) setIsLoadingSettlement(false);
			});
		return () => {
			isMounted = false;
		};
	}, [isOpen]);

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
				...(customerEmail.trim() ? { customer_email: customerEmail.trim() } : {}),
			});

			toast.success("Payment link generated and sent to customer!");
			onSuccess?.(tx);
			onClose();
			setAmountNaira("");
			setDescription("");
			setCustomerEmail("");
		} catch (err: unknown) {
			toast.error(apiMessage(err, "Failed to generate payment link"));
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

							<div>
								<label className="block text-xs font-semibold text-gray-700 mb-1.5">
									Customer Email <span className="text-gray-400 font-normal">(Optional)</span>
								</label>
								<input
									type="email"
									value={customerEmail}
									onChange={(e) => setCustomerEmail(e.target.value)}
									placeholder="e.g. buyer@example.com (for Paystack receipt)"
									disabled={isSubmitting}
									className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#163300]/20 focus:border-[#163300]"
								/>
							</div>

							{/* Paystack Settlement & Rails note */}
							{settlement ? (
								<div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs text-emerald-950 space-y-1.5">
									<div className="flex items-center justify-between font-bold">
										<span className="flex items-center gap-1.5 text-emerald-900">
											<ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
											Direct Bank Payout Active
										</span>
										<span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-mono px-2 py-0.5 rounded-full font-bold">
											Paystack T+1
										</span>
									</div>
									<p className="text-[11px] text-emerald-800 leading-tight">
										Settles into <strong>{settlement.bank_name} ({settlement.account_number.slice(0, 3)}****{settlement.account_number.slice(-3)})</strong> — {settlement.account_name}
									</p>
									<p className="text-[10px] text-emerald-700 font-medium pt-1 border-t border-emerald-200/50 flex items-center justify-between">
										<span>Agency receives: <strong>98.5%</strong></span>
										<span>MessageRail fee: <strong>1.5%</strong></span>
									</p>
								</div>
							) : !isLoadingSettlement ? (
								<div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950 space-y-1.5">
									<div className="flex items-center justify-between font-bold">
										<span className="flex items-center gap-1.5 text-amber-900">
											<AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
											No Settlement Bank Linked
										</span>
										<Link
											href="/settings?tab=payouts"
											target="_blank"
											className="text-[10px] underline text-amber-900 hover:text-black font-bold"
										>
											Link Bank Account →
										</Link>
									</div>
									<p className="text-[11px] text-amber-800 leading-relaxed">
										Connect your Nigerian bank in <strong>Settings → Settlement & Payouts</strong> so payments deposit automatically on next-day payout (T+1).
									</p>
									<p className="text-[10px] text-amber-700 font-medium pt-1 border-t border-amber-200/60">
										Standard Platform Split: <strong>98.5%</strong> directly to your bank · <strong>1.5%</strong> platform fee.
									</p>
								</div>
							) : null}

							{/* Automatic attribution indicator */}
							<div className="flex items-center gap-2 text-[11px] text-gray-500 px-1">
								<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
								<span>Auto-tags contact &ldquo;Customer - Paid&rdquo; & attributes revenue to broadcast upon payment.</span>
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

