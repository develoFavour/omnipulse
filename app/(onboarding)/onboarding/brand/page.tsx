"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { OnboardingLayout } from "@/components/features/onboarding/OnboardingLayout";
import { BrandForm } from "@/components/features/onboarding/BrandForm";
import { APP_ROUTES } from "@/lib/constants/routes.const";
import { motion } from "framer-motion";

export default function BrandSetupPage() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const updateBrand = useAppStore((state) => state.updateBrand);

	const handleBrandSubmit = async (data: { workspace_name: string }) => {
		setIsSubmitting(true);
		try {
			await updateBrand(data.workspace_name);

			toast.success("Workspace provisioned", {
				description: `"${data.workspace_name}" is ready.`,
			});
			router.push(APP_ROUTES.ONBOARDING.CHANNELS);
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.error ||
				error.message ||
				"Failed to create workspace";

			toast.error("Error creating workspace", {
				description: errorMessage,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<OnboardingLayout
			currentStep={1}
			title="Set Up Your Workspace"
			description="Name your brand or organization to initialize your multi-channel broadcast pipeline."
			stepIcon={Sparkles}
			stepLabel="Step 1 of 3"
		>
			<BrandForm onSubmit={handleBrandSubmit} isLoading={isSubmitting} />

			{/* Info section below form */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.3, duration: 0.5 }}
				className="mt-8 pt-6 border-t border-[#e8ebe6]"
			>
				<p className="text-xs font-bold uppercase tracking-wider text-[#163300] mb-3">
					Pipeline Deployment Sequence
				</p>
				<ul className="space-y-2.5">
					{[
						"Instant multi-tenant workspace & domain routing",
						"Direct connector sync (Telegram BotFather & WhatsApp Cloud API)",
						"Unified studio broadcast console access",
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
		</OnboardingLayout>
	);
}
