"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { APP_ROUTES } from "@/lib/constants/routes.const";
import { useUser } from "@clerk/nextjs";

export default function WelcomePage() {
	const router = useRouter();
	const { user } = useUser();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Use the workspace name if we had it in state, otherwise fallback to the user's name or email
	const brandName =
		user?.firstName ||
		user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
		"your workspace";

	return (
		<div className="relative min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4 overflow-hidden">
			{/* Animated background orbs */}
			<div className="absolute inset-0 pointer-events-none">
				<motion.div
					className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-white/[0.05] rounded-full blur-[120px]"
					animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.08, 0.05] }}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-zinc-800/30 rounded-full blur-[100px]"
					animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
					transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
				/>
			</div>

			<div className="relative z-10 max-w-3xl mx-auto w-full text-center">
				{mounted && (
					<motion.div
						initial="hidden"
						animate="visible"
						variants={{
							hidden: {},
							visible: {
								transition: { staggerChildren: 0.15, delayChildren: 0.2 },
							},
						}}
						className="space-y-12"
					>
						{/* Animated Checkmark */}
						<motion.div
							className="flex justify-center"
							variants={{
								hidden: { scale: 0.8, opacity: 0 },
								visible: {
									scale: 1,
									opacity: 1,
									transition: { duration: 0.6, ease: "easeOut" as const },
								},
							}}
						>
							<div className="relative w-24 h-24">
								<div
									className="absolute inset-0 bg-white/5 rounded-full animate-pulse"
									style={{ animationDuration: "3s" }}
								/>
								<div className="absolute inset-0 flex items-center justify-center">
									<CheckCircle2
										className="w-16 h-16 text-white"
										strokeWidth={1.5}
									/>
								</div>
							</div>
						</motion.div>

						{/* Welcome Message */}
						<motion.div
							className="space-y-5"
							variants={{
								hidden: { y: 20, opacity: 0 },
								visible: {
									y: 0,
									opacity: 1,
									transition: { duration: 0.6, ease: "easeOut" },
								},
							}}
						>
							<h1 className="text-5xl md:text-6xl font-light tracking-tight text-white leading-tight">
								Welcome{" "}
								<span className="font-serif italic text-zinc-300">
									{brandName}
								</span>
							</h1>
							<p className="text-lg text-zinc-400 font-light leading-relaxed max-w-xl mx-auto">
								Your broadcast journey is officially underway. We&apos;ve set
								everything up for you.
							</p>
						</motion.div>

						{/* "What's next" cards */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
							{[
								{
									number: "01",
									title: "Build Audience",
									desc: "Add contacts or import from CSV",
								},
								{
									number: "02",
									title: "Compose",
									desc: "Create targeted, personalized messages",
								},
								{
									number: "03",
									title: "Track",
									desc: "Monitor delivery and engagement",
								},
							].map((item) => (
								<motion.div
									key={item.number}
									variants={{
										hidden: { y: 20, opacity: 0 },
										visible: {
											y: 0,
											opacity: 1,
											transition: { duration: 0.5, ease: "easeOut" },
										},
									}}
									className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md text-left"
								>
									<div className="text-sm font-medium text-zinc-500 mb-3 font-mono">
										{item.number}
									</div>
									<h3 className="font-serif text-base font-semibold text-white tracking-wide mb-2">
										{item.title}
									</h3>
									<p className="text-sm text-zinc-400 leading-relaxed">
										{item.desc}
									</p>
								</motion.div>
							))}
						</div>

						{/* CTA */}
						<motion.div
							variants={{
								hidden: { y: 20, opacity: 0 },
								visible: {
									y: 0,
									opacity: 1,
									transition: { duration: 0.5, ease: "easeOut", delay: 0.3 },
								},
							}}
							className="pt-4"
						>
							<button
								onClick={() => router.push(APP_ROUTES.DASHBOARD.BASE)}
								className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white text-zinc-950 rounded-xl font-medium text-base transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:gap-3.5 active:scale-[0.98]"
							>
								Enter Dashboard
								<ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
							</button>
						</motion.div>
					</motion.div>
				)}
			</div>
		</div>
	);
}
