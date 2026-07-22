"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Radio, Users, BarChart3, ChevronRight } from "lucide-react";
import Link from "next/link";
import { APP_ROUTES } from "@/lib/constants/routes.const";

const benefits = [
  {
    icon: Radio,
    title: "Omnichannel",
    desc: "Reach everyone at once across WhatsApp, Telegram, and social platforms.",
  },
  {
    icon: Users,
    title: "Personalized",
    desc: "Dynamically tailored messages for every segment of your audience.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Track delivery rates, engagement, and campaign performance in real-time.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function GetStartedPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-zinc-950 overflow-hidden px-4">
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

      <motion.div
        className="relative z-10 max-w-2xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div className="flex justify-center mb-14" variants={fadeUp}>
          <div className="w-14 h-14 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/[0.12] flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-md" />
          </div>
        </motion.div>

        {/* Main heading */}
        <motion.div className="space-y-5 mb-12" variants={fadeUp}>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white leading-[1.08]">
            Begin Your{" "}
            <span className="font-serif italic text-zinc-400">Broadcast</span>{" "}
            Journey
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed max-w-xl mx-auto">
            Connect with your audience across WhatsApp, Telegram, and Socials.
            One platform. Unlimited possibilities.
          </p>
        </motion.div>

        {/* Benefits grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14"
          variants={containerVariants}
        >
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.title}
              variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm hover:border-white/[0.16] transition-colors cursor-default group"
            >
              <div className="mb-3">
                <benefit.icon className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-serif text-sm font-semibold text-white tracking-wide mb-1">
                {benefit.title}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {benefit.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div className="space-y-6" variants={fadeUp}>
          <motion.button
            onClick={() => router.push(APP_ROUTES.AUTH.SIGN_UP)}
            className="group relative inline-flex items-center gap-2.5 px-8 py-4 bg-white text-zinc-950 rounded-xl font-medium text-base transition-all hover:gap-3.5 active:scale-[0.97]"
            whileHover={{ boxShadow: "0 0 40px rgba(255,255,255,0.15)" }}
          >
            Start Your Journey
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
          </motion.button>

          <p className="text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              href={APP_ROUTES.AUTH.SIGN_IN}
              className="text-white font-medium hover:text-zinc-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
