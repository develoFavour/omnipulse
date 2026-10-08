"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { APP_ROUTES } from "@/lib/constants/routes.const";
import { useUser } from "@clerk/nextjs";
import { ParticleGrid } from "@/components/landing/ParticleGrid";

export default function WelcomePage() {
	const router = useRouter();
	const { user } = useUser();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const brandName =
		user?.firstName ||
		user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
		"your workspace";

	return (
		<div className="relative min-h-screen flex flex-col items-center justify-center bg-[#fafbf8] text-[#0e0f0c] px-4 py-12 overflow-hidden selection:bg-[#9fe870] selection:text-[#163300]">
			{/* ── Background: Particle Grid & Ambient Glow ── */}
			<div className="absolute inset-0 pointer-events-none opacity-50">
				<ParticleGrid />
			</div>

			<div
				className="pointer-events-none absolute inset-0 overflow-hidden"
				aria-hidden="true"
			>
				<div
					className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] rounded-full blur-[140px] pointer-events-none opacity-50"
					style={{
						background:
							"radial-gradient(circle, rgba(159, 232, 112, 0.3) 0%, rgba(226, 246, 213, 0.5) 45%, transparent 75%)",
					}}
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
								transition: { staggerChildren: 0.15, delayChildren: 0.1 },
							},
						}}
						className="space-y-10"
					>
						{/* Top Brand Logo */}
						<motion.div
							className="flex justify-center"
							variants={{
								hidden: { opacity: 0, y: -10 },
								visible: { opacity: 1, y: 0 },
							}}
						>
							<Link href="/" className="inline-flex items-center gap-2.5 group">
								<div className="h-8 w-8 rounded-full bg-[#163300] flex items-center justify-center text-[#9fe870] font-black text-sm transition-transform group-hover:scale-105">
									MR
								</div>
								<span className="text-xl font-black tracking-tight text-[#0e0f0c] font-heading">
									MessageRail<span className="text-[#9fe870]">.</span>
								</span>
							</Link>
						</motion.div>

						{/* Animated Checkmark Circle */}
						<motion.div
							className="flex justify-center"
							variants={{
								hidden: { scale: 0.8, opacity: 0 },
								visible: {
									scale: 1,
									opacity: 1,
									transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
								},
							}}
						>
							<div className="relative w-20 h-20 rounded-full bg-[#e2f6d5] border border-[#9fe870] flex items-center justify-center text-[#163300] shadow-[0_0_35px_rgba(159,232,112,0.35)]">
								<CheckCircle2 className="w-10 h-10" strokeWidth={2.2} />
							</div>
						</motion.div>

						{/* Welcome Message */}
						<motion.div
							className="space-y-3"
							variants={{
								hidden: { y: 16, opacity: 0 },
								visible: {
									y: 0,
									opacity: 1,
									transition: { duration: 0.5, ease: "easeOut" },
								},
							}}
						>
							<div className="inline-flex items-center gap-2 rounded-full bg-[#e2f6d5] border border-[#9fe870]/70 px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#163300] shadow-sm mb-1">
								<Sparkles className="w-3.5 h-3.5 text-[#163300]" />
								<span>Workspace Ready</span>
							</div>

							<h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-black tracking-tight text-[#163300] uppercase leading-tight">
								Welcome,{" "}
								<span className="text-[#0e0f0c]">
									{brandName}
								</span>
							</h1>
							<p className="text-base sm:text-lg text-[#454745] font-medium leading-relaxed max-w-lg mx-auto">
								Your multi-channel broadcast engine is fully provisioned and ready for high-speed transmission.
							</p>
						</motion.div>

						{/* "What's Next" Roadmap Cards */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{[
								{
									number: "01",
									title: "Audiences",
									desc: "Sync contacts automatically via inbound webhooks or tags",
								},
								{
									number: "02",
									title: "Studio",
									desc: "Compose multi-channel drafts with live mobile simulators",
								},
								{
									number: "03",
									title: "Telemetry",
									desc: "Monitor sub-120ms delivery confirmations in real time",
								},
							].map((item) => (
								<motion.div
									key={item.number}
									variants={{
										hidden: { y: 16, opacity: 0 },
										visible: {
											y: 0,
											opacity: 1,
											transition: { duration: 0.45, ease: "easeOut" },
										},
									}}
									className="p-5 sm:p-6 rounded-3xl border border-[#e8ebe6] bg-white/95 backdrop-blur-xl text-left shadow-[0_12px_40px_rgba(22,51,0,0.04)] flex flex-col justify-between"
								>
									<div>
										<span className="text-[10px] font-mono font-bold text-[#163300] bg-[#f4f5f2] border border-[#e8ebe6] px-2 py-0.5 rounded-md inline-block mb-3">
											{item.number}
										</span>
										<h3 className="font-heading font-black text-sm text-[#163300] uppercase tracking-wider mb-1.5">
											{item.title}
										</h3>
										<p className="text-xs font-medium text-[#454745] leading-relaxed">
											{item.desc}
										</p>
									</div>
								</motion.div>
							))}
						</div>

						{/* CTA */}
						<motion.div
							variants={{
								hidden: { y: 16, opacity: 0 },
								visible: {
									y: 0,
									opacity: 1,
									transition: { duration: 0.5, ease: "easeOut", delay: 0.2 },
								},
							}}
							className="pt-2"
						>
							<button
								onClick={() => router.push(APP_ROUTES.DASHBOARD.BASE)}
								className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#9fe870] hover:bg-[#8ee05c] text-[#163300] rounded-full font-black text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
							>
								<span>Launch Broadcast Console</span>
								<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
							</button>
						</motion.div>
					</motion.div>
				)}
			</div>
		</div>
	);
}
