"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;
type Currency = "NGN" | "USD";
type BillingCycle = "monthly" | "yearly";

const plans = [
	{
		name: "Starter",
		badge: "Free Forever",
		description: "The essentials to launch and validate your messaging workflow.",
		prices: { NGN: { monthly: "₦0", yearly: "₦0" }, USD: { monthly: "$0", yearly: "$0" } },
		period: "forever",
		features: [
			"500 audience contacts",
			"1,000 messages / broadcasts monthly",
			"2 connected channels",
			"Standard delivery queue",
			"Single workspace",
			"Basic delivery analytics",
		],
	},
	{
		name: "Growth",
		badge: "Best Value",
		description: "More volume and visibility for growing brands and agencies.",
		prices: { NGN: { monthly: "₦6,500", yearly: "₦65,000" }, USD: { monthly: "$14", yearly: "$140" } },
		period: "/month",
		popular: true,
		features: [
			"5,000 audience contacts",
			"25,000 messages / broadcasts monthly",
			"Unlimited connected channels",
			"3 client workspaces included",
			"Streaming CSV exports",
			"Automated inbound webhook processing",
			"Priority email and Telegram support",
		],
	},
	{
		name: "Agency",
		badge: "High-Volume Scale",
		description: "Team controls and uncapped workspace scale for client operations.",
		prices: { NGN: { monthly: "₦17,500", yearly: "₦175,000" }, USD: { monthly: "$34", yearly: "$340" } },
		period: "/month",
		features: [
			"25,000 audience contacts",
			"100,000 messages / broadcasts monthly",
			"Unlimited workspaces and channels",
			"Granular team roles and permissions",
			"Priority delivery pipeline",
			"Dedicated WhatsApp session routing",
			"Direct engineering support bridge",
		],
	},
] as const;

export function PricingSection() {
	const [currency, setCurrency] = useState<Currency>("NGN");
	const [cycle, setCycle] = useState<BillingCycle>("monthly");

	return (
		<section id="pricing" className="py-20 max-w-[1200px] mx-auto px-4 sm:px-6">
			<motion.div
				className="text-center max-w-2xl mx-auto"
				initial={{ opacity: 0, y: 24 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: "-60px" }}
				transition={{ duration: 0.6, ease: EASE_EXPO }}
			>
				<span className="text-xs font-black uppercase tracking-wider text-[#163300]">
					Simple workspace pricing
				</span>
				<h2 className="text-3xl sm:text-5xl font-black uppercase text-[#0e0f0c] tracking-tight font-heading mt-2">
					Choose the workspace that fits your client load<span className="text-[#9fe870]">.</span>
				</h2>
				<p className="text-base text-[#454745] mt-4">
					Start free, then scale your audience, broadcasts, workspaces, and team controls as your agency grows.
				</p>
			</motion.div>

			<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
				<div className="inline-flex rounded-full border border-[#e8ebe6] bg-[#f4f5f2] p-1">
					{(["NGN", "USD"] as const).map((option) => (
						<button
							key={option}
							type="button"
							onClick={() => setCurrency(option)}
							className={`rounded-full px-4 py-2 text-xs font-black transition-all ${currency === option ? "bg-[#163300] text-[#9fe870]" : "text-[#454745] hover:text-[#163300]"}`}
						>
							{option === "NGN" ? "NGN (₦)" : "USD ($)"}
						</button>
					))}
				</div>
				<div className="inline-flex rounded-full border border-[#e8ebe6] bg-white p-1">
					{(["monthly", "yearly"] as const).map((option) => (
						<button
							key={option}
							type="button"
							onClick={() => setCycle(option)}
							className={`rounded-full px-4 py-2 text-xs font-black capitalize transition-all ${cycle === option ? "bg-[#e2f6d5] text-[#163300]" : "text-[#454745] hover:text-[#163300]"}`}
						>
							{option === "yearly" ? "Annual · 2 months free" : "Monthly"}
						</button>
					))}
				</div>
			</div>

			<div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
				{plans.map((plan, index) => (
					(() => {
						const isPopular = plan.name === "Growth";
						return (
					<motion.article
						key={plan.name}
						initial={{ opacity: 0, y: 24 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-60px" }}
						transition={{ duration: 0.55, delay: index * 0.08, ease: EASE_EXPO }}
						className={`relative flex flex-col rounded-2xl border p-6 ${isPopular ? "border-[#163300] bg-[#163300] text-white shadow-xl md:-translate-y-2" : "border-[#e8ebe6] bg-white text-[#454745] shadow-sm"}`}
					>
						<div>
							<div className="flex items-center justify-between gap-3">
								<h3 className={`text-xl font-black font-heading ${isPopular ? "text-[#9fe870]" : "text-[#0e0f0c]"}`}>
									{plan.name}
								</h3>
								<span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${isPopular ? "bg-[#9fe870] text-[#163300]" : "bg-[#e2f6d5] text-[#163300]"}`}>
									{plan.badge}
								</span>
							</div>
							<div className="mt-6 flex items-end gap-1">
								<span className={`text-4xl font-black font-heading ${isPopular ? "text-white" : "text-[#0e0f0c]"}`}>
									{plan.prices[currency][cycle]}
								</span>
								{plan.name !== "Starter" && <span className={`pb-1 text-xs font-semibold ${isPopular ? "text-white/60" : "text-gray-500"}`}>{cycle === "monthly" ? "/month" : "/year"}</span>}
							</div>
							{cycle === "yearly" && plan.name !== "Starter" && <p className={`mt-1 text-xs font-semibold ${isPopular ? "text-[#9fe870]" : "text-[#163300]"}`}>2 months free · billed annually</p>}
							<p className={`mt-3 min-h-10 text-sm leading-relaxed ${isPopular ? "text-white/75" : "text-[#454745]"}`}>{plan.description}</p>
							<ul className={`mt-6 space-y-3 border-t pt-5 ${isPopular ? "border-white/15" : "border-[#e8ebe6]"}`}>
								{plan.features.map((feature) => (
									<li key={feature} className={`flex items-start gap-2 text-sm ${isPopular ? "text-white/85" : "text-[#454745]"}`}>
										<Check className={`mt-0.5 h-4 w-4 shrink-0 ${isPopular ? "text-[#9fe870]" : "text-[#163300]"}`} />
										<span>{feature}</span>
									</li>
								))}
							</ul>
						</div>
						<Link href="/sign-up" className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black transition-all ${isPopular ? "bg-[#9fe870] text-[#163300] hover:brightness-105" : "bg-[#163300] text-[#9fe870] hover:bg-[#054d28]"}`}>
							{plan.name === "Starter" ? "Start Free" : `Choose ${plan.name}`}
							<ArrowRight className="h-4 w-4" />
						</Link>
						</motion.article>
						);
					})()
				))}
			</div>
			<p className="mt-6 text-center text-xs text-[#868685]">
				Cancel anytime. Annual plans are billed upfront. Secure checkout is available after you create a workspace.
			</p>
		</section>
	);
}
