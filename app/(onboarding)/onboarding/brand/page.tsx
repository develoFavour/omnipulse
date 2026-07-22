"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
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
			title="Tell us about your brand"
			description="What's the name of your business or personal brand?"
			stepIcon={Sparkles}
			stepLabel="Step 1 of 3"
		>
			<BrandForm onSubmit={handleBrandSubmit} isLoading={isSubmitting} />

			{/* Info section below form */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5, duration: 0.5 }}
				className="mt-10 pt-8 border-t border-white/10"
			>
				<p className="text-sm font-medium text-white mb-4">
					What happens next?
				</p>
				<ul className="space-y-3">
					{[
						"Your workspace will be provisioned instantly",
						"Connect your communication channels",
						"Start broadcasting to your audience",
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
