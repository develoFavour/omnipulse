"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className="relative min-h-screen flex items-center justify-center bg-slate-50 overflow-hidden px-4 py-12">
			{/* Animated background orbs */}
			<div className="absolute inset-0 pointer-events-none">
				<motion.div
					className="absolute -top-40 right-1/4 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px]"
					animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
					transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute bottom-0 -left-32 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]"
					animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px]"
					animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
					transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
				/>
			</div>

			{/* Auth Content */}
			<motion.div
				className="relative z-10 w-full flex flex-col items-center justify-center mt-12"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
			>
				<div className="w-full max-w-[440px]">{children}</div>

				{/* Footer below card */}
				{/* <div className="flex items-center justify-center mt-8">
          <p className="text-xs text-slate-500 tracking-wide">
            Protected by enterprise-grade encryption
          </p>
        </div> */}
			</motion.div>
		</div>
	);
}
