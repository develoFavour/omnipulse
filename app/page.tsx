"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring,
  AnimatePresence 
} from "framer-motion";
import { 
  Radio, 
  Zap, 
  Megaphone, 
  Bot, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Copy, 
  Sparkles, 
  Layers, 
  RefreshCw, 
  Smartphone, 
  Clock, 
  Globe, 
  Lock, 
  ChevronRight, 
  BarChart3, 
  ExternalLink,
  Send,
  MessageCircle,
  FileText,
  Sliders,
  Check,
  Rocket,
  Shield,
  Activity,
  ArrowUpRight
} from "lucide-react";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";
import { APP_ROUTES } from "@/lib/constants/routes.const";

// Custom easing for high-end agency feel
const TRANSITION_EASE = [0.16, 1, 0.3, 1] as const;

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);

  // Global scroll progress for the top scrub indicator
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  const scaleXProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Hero Card 3D Scroll Tilt & Perspective Reveal
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroCardRef,
    offset: ["start end", "center center"]
  });

  const cardScale = useTransform(heroScrollProgress, [0, 1], [0.93, 1]);
  const cardRotateX = useTransform(heroScrollProgress, [0, 1], [14, 0]);
  const cardOpacity = useTransform(heroScrollProgress, [0, 1], [0.65, 1]);
  const cardY = useTransform(heroScrollProgress, [0, 1], [80, 0]);

  // Interactive Platform Tabs
  const [activePlatformTab, setActivePlatformTab] = useState<"whatsapp" | "telegram" | "flywheel">("whatsapp");
  const [calculatorVolume, setCalculatorVolume] = useState<number>(25000);
  const [copiedLink, setCopiedLink] = useState(false);

  // Live Simulated Transmission Ticker
  const [activeTickerIndex, setActiveTickerIndex] = useState(0);
  const simulatedTransmissions = [
    { platform: "whatsapp", text: "WhatsApp DM → +1 (555) 912-8821 delivered", latency: "74ms", channel: "Meta Cloud API" },
    { platform: "telegram", text: "Mirrored to Telegram 'VIP Growth' Channel", latency: "48ms", channel: "@OmniPulseBot" },
    { platform: "flywheel", text: "Inbound webhook: Captured new contact @sarah_media", latency: "31ms", channel: "Webhook Flywheel" },
    { platform: "whatsapp", text: "WhatsApp DM → +44 7700 900142 delivered", latency: "89ms", channel: "Meta Cloud API" },
    { platform: "telegram", text: "Dispatched to 6 Telegram Subscriber Cohorts", latency: "52ms", channel: "@OmniPulseBot" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTickerIndex((prev) => (prev + 1) % simulatedTransmissions.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [simulatedTransmissions.length]);

  // Computed broadcast velocity
  const dispatchTimeMinutes = ((calculatorVolume / 1200) * 0.95).toFixed(1);

  const handleCopyDemoCommand = () => {
    navigator.clipboard.writeText("https://api.omnipulse.io/v1/webhooks/inbound");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-white text-[#454745] font-sans selection:bg-[#9fe870] selection:text-[#163300] relative overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────
          AGENCY SCROLL PROGRESS INDICATOR (Fixed at very top)
          ───────────────────────────────────────────────────────────── */}
      <motion.div
        style={{ scaleX: scaleXProgress }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#163300] via-[#9fe870] to-[#163300] origin-left z-[100]"
      />

      {/* ─────────────────────────────────────────────────────────────
          1. STICKY TOP NAVIGATION BAR
          Wise spec: White background, 64px, logo left, pill nav segment,
          right cluster: Language flag, Help, Sign in, Outlined Sign up
          ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-16 w-full bg-white/90 backdrop-blur-md border-b border-[#e8ebe6] transition-all">
        <div className="max-w-[1200px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div 
              whileHover={{ scale: 1.08, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="h-8 w-8 rounded-full bg-[#163300] flex items-center justify-center text-[#9fe870] font-black text-sm tracking-tighter shadow-xs"
            >
              OP
            </motion.div>
            <span className="text-xl font-black tracking-tight text-[#0e0f0c] font-heading">
              OmniPulse<span className="text-[#9fe870]">.</span>
            </span>
          </Link>

          {/* Center Pill Segmented Nav (Desktop) */}
          <nav className="hidden md:flex items-center bg-[#e8ebe6] rounded-full p-1 border border-[#e8ebe6]">
            <a 
              href="#engine" 
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#454745] hover:text-[#0e0f0c] transition-colors"
            >
              Omnichannel Studio
            </a>
            <a 
              href="#architecture" 
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#454745] hover:text-[#0e0f0c] transition-colors"
            >
              Architecture
            </a>
            <a 
              href="#channels" 
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#454745] hover:text-[#0e0f0c] transition-colors"
            >
              Connectors
            </a>
            <a 
              href="#benchmark" 
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#454745] hover:text-[#0e0f0c] transition-colors"
            >
              Performance
            </a>
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-xs font-bold text-[#163300] hover:underline underline-offset-4 px-2 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/get-started"
              className="hidden sm:inline-flex items-center justify-center rounded-full border border-[#163300] bg-white px-4 py-2 text-xs font-bold text-[#163300] hover:bg-[#e8ebe6] transition-all shadow-xs"
            >
              Open Account
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/get-started"
                className="inline-flex items-center justify-center rounded-full bg-[#9fe870] px-4 sm:px-5 py-2 text-xs font-black text-[#163300] hover:brightness-105 transition-all shadow-xs"
              >
                Launch Studio →
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION WITH RADIAL GRID & STAGGERED REVEALS
          Wise spec: Centered massive display headline (900 weight, tight -0.04em tracking),
          white space, pill CTAs, Lime Voltage as punctuation, flat surfaces
          ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 px-4 sm:px-6 max-w-[1200px] mx-auto text-center">
        {/* Subtle Fine Agency Grid Background Mask */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(#163300_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.04] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_20%,#000_60%,transparent_100%)] pointer-events-none" />

        {/* Accent Pill Tag */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: TRANSITION_EASE }}
          className="inline-flex items-center gap-2 rounded-full bg-[#e2f6d5] border border-[#9fe870]/70 px-4 py-1.5 mb-8 shadow-xs"
        >
          <span className="h-2 w-2 rounded-full bg-[#163300] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#163300]">
            Dual-Pipeline Engine • WhatsApp Cloud &amp; Telegram Bot APIs
          </span>
        </motion.div>

        {/* Display Headline — Wise Sans 900 Block Shouted Letters */}
        <motion.h1 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: TRANSITION_EASE }}
          className="text-5xl sm:text-7xl lg:text-[96px] font-black uppercase text-[#0e0f0c] tracking-[-0.035em] leading-[0.9] font-heading max-w-5xl mx-auto"
        >
          MESSAGING WITHOUT BORDERS<span className="text-[#9fe870]">.</span>
          <br />
          DISPATCH IN PARALLEL<span className="text-[#9fe870]">.</span>
        </motion.h1>

        {/* Body Copy — Inter 400/500, Charcoal #454745 */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: TRANSITION_EASE }}
          className="mt-8 text-base sm:text-xl text-[#454745] max-w-2xl mx-auto leading-relaxed font-normal"
        >
          The unified omnichannel broadcast engine for agencies and growth teams. Blast WhatsApp and Telegram in parallel, capture contacts with zero data entry, and monitor live deliveries with zero dropped packets.
        </motion.p>

        {/* Primary CTA Cluster — Pill + Text Link */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: TRANSITION_EASE }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/get-started"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-[#9fe870] px-8 py-3.5 text-base font-black text-[#163300] hover:brightness-105 transition-all shadow-md"
            >
              Start Free Mission
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </Link>
          </motion.div>
          <a
            href="#engine"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#163300] hover:text-[#0e0f0c] underline underline-offset-4 decoration-2 transition-colors py-2"
          >
            Explore Live Studio Simulator →
          </a>
        </motion.div>

        {/* System Trust Badges */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-14 pt-8 border-t border-[#e8ebe6] flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-[#868685]"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#163300]" />
            <span>Official Meta Cloud API</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#163300]" />
            <span>High-Speed Telegram Bot Father</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#163300]" />
            <span>Brevo Transactional Team Invites</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#163300]" />
            <span>Neon Postgres Multi-Tenant Core</span>
          </div>
        </motion.div>

        {/* ─────────────────────────────────────────────────────────────
            3. HERO 3D SCROLL-TILT SHOWCASE CARD
            Linear / Wise agency standard: 3D perspective scroll lift,
            smooth scale up, live transmission simulation
            ───────────────────────────────────────────────────────────── */}
        <div ref={heroCardRef} style={{ perspective: "1200px" }} className="mt-14">
          <motion.div 
            id="engine"
            style={{
              scale: cardScale,
              rotateX: cardRotateX,
              opacity: cardOpacity,
              y: cardY,
              transformStyle: "preserve-3d"
            }}
            className="rounded-[28px] bg-[#163300] text-white p-6 sm:p-10 border border-[#163300] shadow-2xl text-left relative overflow-hidden will-change-transform"
          >
            {/* Background Ambient Megaphone Silhouette */}
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Megaphone className="h-96 w-96 text-[#9fe870]" />
            </div>

            <div className="relative z-10">
              {/* Header Control Row with Live Ticker */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="h-3 w-3 rounded-full bg-[#9fe870] block" />
                    <span className="absolute inset-0 rounded-full bg-[#9fe870] animate-ping opacity-75" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#9fe870] font-heading">
                      Broadcast Studio Command Engine
                    </h3>
                    <p className="text-xs text-white/70 font-medium">
                      Parallel Pipeline Active • Concurrency: 1,200 msg/min
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 border border-white/15 flex items-center gap-1.5">
                    <FaWhatsapp className="h-3.5 w-3.5 text-[#25D366]" /> Meta Verified
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 border border-white/15 flex items-center gap-1.5">
                    <FaTelegram className="h-3.5 w-3.5 text-[#229ED9]" /> BotFather Active
                  </span>
                  <span className="rounded-full bg-[#9fe870] text-[#163300] px-3 py-1 text-xs font-black uppercase">
                    Live Telemetry
                  </span>
                </div>
              </div>

              {/* Dynamic Live Simulated Transmission Banner */}
              <div className="mt-4 py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs overflow-hidden">
                <div className="flex items-center gap-2.5 truncate">
                  <Activity className="h-4 w-4 text-[#9fe870] shrink-0 animate-pulse" />
                  <span className="text-white/60 font-mono text-[11px] shrink-0">DISPATCH LOG:</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeTickerIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="font-medium text-white truncate"
                    >
                      {simulatedTransmissions[activeTickerIndex].text}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-[#9fe870]">
                    ⚡ {simulatedTransmissions[activeTickerIndex].latency}
                  </span>
                  <span className="hidden sm:inline-block text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/70">
                    {simulatedTransmissions[activeTickerIndex].channel}
                  </span>
                </div>
              </div>

              {/* Split Grid: Left Studio Composer | Right Live Device Preview */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Live Composer Mockup */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#9fe870] mb-2">
                      Active Campaign Mission
                    </label>
                    <div className="rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-sm font-semibold text-white font-mono flex items-center justify-between">
                      <span>Flash VIP Omnichannel Dispatch</span>
                      <span className="text-[10px] bg-[#9fe870]/20 text-[#9fe870] px-2 py-0.5 rounded font-bold uppercase">
                        Queued for 10:50 AM
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#9fe870]">
                        Message Composer with Dynamic Tokens
                      </label>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-white/60">
                        <span className="bg-white/10 px-2 py-0.5 rounded text-[#9fe870]">{"{{first_name}}"}</span>
                        <span className="bg-white/10 px-2 py-0.5 rounded text-[#9fe870]">{"{{company}}"}</span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/15 p-4 text-sm text-white/90 leading-relaxed font-sans min-h-[105px]">
                      Hey <span className="text-[#9fe870] font-bold">{"{{first_name}}"}</span>! Your exclusive agency pass for <span className="text-[#9fe870] font-bold">{"{{company}}"}</span> is unlocked. Reply YES or tap the action link below to claim.
                    </div>
                  </div>

                  {/* Target Audience Summary Strip */}
                  <div className="rounded-xl bg-white/10 border border-white/15 p-4 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-white/60 uppercase font-semibold">Verified Audience Reach</div>
                      <div className="text-2xl font-black text-white font-heading">
                        14,280 <span className="text-xs font-semibold text-[#9fe870]">recipients targeted</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-[#25D366]/20 text-[#25D366] px-2.5 py-1 text-xs font-bold flex items-center gap-1">
                        <FaWhatsapp className="h-3 w-3" /> 9,420 WhatsApp
                      </span>
                      <span className="rounded-lg bg-[#229ED9]/20 text-[#229ED9] px-2.5 py-1 text-xs font-bold flex items-center gap-1">
                        <FaTelegram className="h-3 w-3" /> 4,860 Telegram
                      </span>
                    </div>
                  </div>

                  {/* Primary Launch Action */}
                  <div className="pt-2 flex items-center gap-4">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href="/get-started"
                        className="inline-flex items-center gap-2 rounded-full bg-[#9fe870] px-7 py-3 text-sm font-black text-[#163300] hover:brightness-105 transition-all shadow-md"
                      >
                        <Rocket className="h-4 w-4" />
                        Simulate Launch Mission (14,280)
                      </Link>
                    </motion.div>
                    <span className="text-xs text-white/60 font-medium">
                      Est. dispatch duration: ~11.9 mins
                    </span>
                  </div>
                </div>

                {/* Right Column: High-Fidelity Mobile Device Preview */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="w-full max-w-sm rounded-[32px] border-4 border-white/20 bg-[#0e0f0c] p-4 shadow-2xl relative text-gray-900">
                    {/* Speaker Notch */}
                    <div className="w-24 h-4 bg-white/20 rounded-full mx-auto mb-4" />

                    {/* Mock Phone Header */}
                    <div className="rounded-xl bg-[#e8ebe6] p-3 mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-xs">
                          <FaWhatsapp className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#0e0f0c]">OmniPulse Verified</div>
                          <div className="text-[10px] text-gray-500">Official Business Sender</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        ✓ Verified
                      </span>
                    </div>

                    {/* Simulated Incoming Message Bubble */}
                    <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 space-y-2">
                      <div className="text-xs text-gray-800 leading-relaxed font-sans">
                        Hey <span className="font-bold text-[#163300]">Sarah</span>! Your exclusive agency pass for <span className="font-bold text-[#163300]">Apex Media</span> is unlocked. Reply YES or tap the action link below to claim.
                      </div>
                      <div className="text-[10px] text-gray-400 text-right">
                        10:50 AM • Delivered ✓✓
                      </div>
                    </div>

                    {/* Simulated Telegram Channel Card */}
                    <div className="mt-3 rounded-2xl bg-[#229ED9]/15 p-3 border border-[#229ED9]/25 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FaTelegram className="h-4 w-4 text-[#229ED9]" />
                        <span className="font-bold text-white text-[11px]">Mirrored to 6 Telegram Channels</span>
                      </div>
                      <span className="text-[10px] text-[#9fe870] font-mono font-bold">100% Synced</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. HOW IT WORKS / STICKY ARCHITECTURE TIMELINE (Scroll Storytelling)
          Agency-grade 3-step scroll visual explaining the pipeline
          ───────────────────────────────────────────────────────────── */}
      <section id="architecture" className="py-24 bg-[#e8ebe6] border-y border-[#e8ebe6]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-[#163300]">
              The OmniPulse Concurrency Pipeline
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#0e0f0c] tracking-tight font-heading mt-2">
              How High-Throughput Works<span className="text-[#9fe870]">.</span>
            </h2>
            <p className="mt-4 text-base text-[#454745]">
              Engineered in Go with relational Postgres transactions and exponential backoff rate limiters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 01 */}
            <motion.div 
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: TRANSITION_EASE }}
              className="rounded-2xl bg-white p-8 border border-white shadow-xs flex flex-col justify-between group hover:border-[#163300]/20 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-12 w-12 rounded-xl bg-[#e2f6d5] text-[#163300] flex items-center justify-center font-black text-lg">
                    01
                  </div>
                  <span className="text-xs font-bold font-mono text-[#868685]">INGESTION</span>
                </div>
                <h3 className="text-xl font-bold text-[#0e0f0c] font-heading mb-3">
                  Zero-Data-Entry Capture
                </h3>
                <p className="text-sm text-[#454745] leading-relaxed">
                  Inbound contacts are indexed instantaneously as users tap <strong className="text-[#163300]">/start</strong> or send messages. Segment contacts automatically using flexible color tags without messy spreadsheet exports.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#e8ebe6] flex items-center gap-2 text-xs font-bold text-[#163300]">
                <span>Real-time webhook sync</span>
                <span className="text-[#9fe870] font-black">•</span>
                <span>Zero manual CSVs</span>
              </div>
            </motion.div>

            {/* Step 02 */}
            <motion.div 
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: TRANSITION_EASE }}
              className="rounded-2xl bg-white p-8 border border-white shadow-xs flex flex-col justify-between group hover:border-[#163300]/20 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-12 w-12 rounded-xl bg-[#e2f6d5] text-[#163300] flex items-center justify-center font-black text-lg">
                    02
                  </div>
                  <span className="text-xs font-bold font-mono text-[#868685]">COMPOSITION</span>
                </div>
                <h3 className="text-xl font-bold text-[#0e0f0c] font-heading mb-3">
                  Dynamic Token Assembly
                </h3>
                <p className="text-sm text-[#454745] leading-relaxed">
                  Craft templates with instant dynamic placeholder injection. Preview how your copy and media assets will look natively inside WhatsApp and Telegram on live phone simulators before broadcasting.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#e8ebe6] flex items-center gap-2 text-xs font-bold text-[#163300]">
                <span>Variable tokens</span>
                <span className="text-[#9fe870] font-black">•</span>
                <span>Mobile simulator preview</span>
              </div>
            </motion.div>

            {/* Step 03 */}
            <motion.div 
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.2, ease: TRANSITION_EASE }}
              className="rounded-2xl bg-white p-8 border border-white shadow-xs flex flex-col justify-between group hover:border-[#163300]/20 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-12 w-12 rounded-xl bg-[#e2f6d5] text-[#163300] flex items-center justify-center font-black text-lg">
                    03
                  </div>
                  <span className="text-xs font-bold font-mono text-[#868685]">DISPATCH</span>
                </div>
                <h3 className="text-xl font-bold text-[#0e0f0c] font-heading mb-3">
                  Parallel Mission Transmission
                </h3>
                <p className="text-sm text-[#454745] leading-relaxed">
                  Go worker pools blast both WhatsApp and Telegram concurrently at 1,200 msgs/min with automated backoff algorithms that protect your sender health and prevent spam flags.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#e8ebe6] flex items-center gap-2 text-xs font-bold text-[#163300]">
                <span>1,200+ msgs/min</span>
                <span className="text-[#9fe870] font-black">•</span>
                <span>Live retry telemetry</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. INTERACTIVE PLATFORM CATALOG (Segmented Pill Switcher)
          Wise spec: Segmented pill container (9999px radius),
          Active tab in Lime Voltage (#9fe870), inactive transparent
          ───────────────────────────────────────────────────────────── */}
      <section id="channels" className="py-24 max-w-[1200px] mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: TRANSITION_EASE }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="text-xs font-black uppercase tracking-wider text-[#163300]">
            Channel Integrations
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#0e0f0c] tracking-tight font-heading mt-2">
            Native Connectors For Every Protocol<span className="text-[#9fe870]">.</span>
          </h2>
          <p className="text-base text-[#454745] mt-4">
            Connect verified APIs in under 60 seconds with QR codes, OAuth, and secure bot tokens.
          </p>

          {/* Segmented Tab Control */}
          <div className="mt-8 inline-flex items-center rounded-full bg-[#e8ebe6] p-1 border border-[#e8ebe6]">
            <button
              onClick={() => setActivePlatformTab("whatsapp")}
              className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
                activePlatformTab === "whatsapp"
                  ? "bg-[#9fe870] text-[#163300] shadow-xs"
                  : "text-[#454745] hover:text-[#0e0f0c]"
              }`}
            >
              WhatsApp Business API
            </button>
            <button
              onClick={() => setActivePlatformTab("telegram")}
              className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
                activePlatformTab === "telegram"
                  ? "bg-[#9fe870] text-[#163300] shadow-xs"
                  : "text-[#454745] hover:text-[#0e0f0c]"
              }`}
            >
              Telegram Bot &amp; Channels
            </button>
            <button
              onClick={() => setActivePlatformTab("flywheel")}
              className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
                activePlatformTab === "flywheel"
                  ? "bg-[#9fe870] text-[#163300] shadow-xs"
                  : "text-[#454745] hover:text-[#0e0f0c]"
              }`}
            >
              Inbound Webhook Flywheel
            </button>
          </div>
        </motion.div>

        {/* Tab Content Cards */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: TRANSITION_EASE }}
          className="rounded-[28px] border border-[#e8ebe6] bg-[#e8ebe6]/40 p-8 sm:p-12"
        >
          {activePlatformTab === "whatsapp" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#25D366]/10 text-[#25D366] px-3 py-1 text-xs font-bold mb-4">
                  <FaWhatsapp className="h-4 w-4" /> Official Meta Cloud Partner API
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0e0f0c] font-heading mb-4">
                  1-Click Meta Cloud OAuth &amp; Direct WhatsApp QR Link
                </h3>
                <p className="text-base text-[#454745] leading-relaxed mb-6">
                  Deploy verified WhatsApp broadcast senders without managing complex server infrastructure. Send DMs, target opt-in customer lists, and preview WhatsApp Status story updates directly from your browser.
                </p>
                <ul className="space-y-3 text-sm text-[#454745] font-medium">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#163300]" />
                    <span>Official Meta WABA &amp; Phone Number ID support</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#163300]" />
                    <span>Automated contact sync &amp; verification telemetry</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#163300]" />
                    <span>WhatsApp Story Bridge with media asset support</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl bg-white p-6 border border-[#e8ebe6] shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-[#e8ebe6] text-xs font-bold text-[#0e0f0c]">
                  <span>Connected WhatsApp Identity</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Active</span>
                </div>
                <div className="mt-4 space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-[#e8ebe6]/50 flex justify-between">
                    <span className="text-gray-500">WABA ID:</span>
                    <span className="font-bold text-[#0e0f0c]">waba_991823901928</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#e8ebe6]/50 flex justify-between">
                    <span className="text-gray-500">Phone ID:</span>
                    <span className="font-bold text-[#0e0f0c]">+1 (555) 912-8821</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#e8ebe6]/50 flex justify-between">
                    <span className="text-gray-500">Quality Rating:</span>
                    <span className="font-bold text-emerald-600">High (Green Tier)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePlatformTab === "telegram" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#229ED9]/10 text-[#229ED9] px-3 py-1 text-xs font-bold mb-4">
                  <FaTelegram className="h-4 w-4" /> BotFather Native Integration
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0e0f0c] font-heading mb-4">
                  Automatic Telegram Group &amp; Channel Discovery
                </h3>
                <p className="text-base text-[#454745] leading-relaxed mb-6">
                  Add your Telegram Bot as an administrator to any community group or broadcast channel. OmniPulse automatically listens, registers the destination Chat ID, and exposes it in your broadcast studio target selector.
                </p>
                <ul className="space-y-3 text-sm text-[#454745] font-medium">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#163300]" />
                    <span>Real-time destination webhook listener</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#163300]" />
                    <span>Supports both 1:1 Direct Messages and Public Channels</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#163300]" />
                    <span>Automatic reconnect &amp; webhook health monitoring</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl bg-white p-6 border border-[#e8ebe6] shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-[#e8ebe6] text-xs font-bold text-[#0e0f0c]">
                  <span>Auto-Discovered Telegram Destinations</span>
                  <span className="text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">6 Registered</span>
                </div>
                <div className="mt-4 space-y-2 text-xs font-sans">
                  {[
                    { title: "VIP Announcements", type: "channel", id: "-10019283719" },
                    { title: "Growth Marketing Community", type: "supergroup", id: "-10020192831" },
                    { title: "Daily Product Releases", type: "channel", id: "-10038192849" },
                  ].map((dest) => (
                    <div key={dest.id} className="p-2.5 rounded-xl bg-[#e8ebe6]/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaTelegram className="h-3.5 w-3.5 text-[#229ED9]" />
                        <span className="font-bold text-[#0e0f0c]">{dest.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-gray-500">{dest.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activePlatformTab === "flywheel" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#163300] text-[#9fe870] px-3 py-1 text-xs font-bold mb-4">
                  <Bot className="h-4 w-4" /> Inbound Webhook Flywheel
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0e0f0c] font-heading mb-4">
                  Zero Manual CSV Imports. Contacts Flow In Live.
                </h3>
                <p className="text-base text-[#454745] leading-relaxed mb-6">
                  Every user interaction triggers instantaneous webhook ingestion. Route incoming phone numbers, Telegram usernames, and custom metadata directly into segmented audience cohorts.
                </p>
                <div className="p-3.5 rounded-xl bg-white border border-[#e8ebe6] flex items-center justify-between gap-2">
                  <code className="text-xs font-mono font-bold text-[#163300] truncate">
                    https://api.omnipulse.io/v1/webhooks/inbound
                  </code>
                  <button
                    onClick={handleCopyDemoCommand}
                    className="shrink-0 p-1.5 rounded-lg text-gray-500 hover:text-[#163300] hover:bg-[#e8ebe6] transition-colors"
                    title="Copy URL"
                  >
                    {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-6 border border-[#e8ebe6] shadow-sm">
                <div className="text-xs font-bold text-[#0e0f0c] pb-3 border-b border-[#e8ebe6]">
                  Live Segment Cohort Tags
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    { name: "VIP Customer", color: "#6366f1" },
                    { name: "Inbound Lead", color: "#10b981" },
                    { name: "Enterprise Tier", color: "#f59e0b" },
                    { name: "Beta Tester", color: "#8b5cf6" },
                    { name: "Telegram Direct", color: "#06b6d4" },
                  ].map((tag) => (
                    <span
                      key={tag.name}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: `${tag.color}15`,
                        color: tag.color,
                        border: `1px solid ${tag.color}35`,
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. INVERTED DARK SECTION (Forest Ink #163300 Card)
          Wise spec: Forest Ink background, 28px radius, 40px padding,
          Lime Voltage text for headline, Paper for body, Inset white card
          ───────────────────────────────────────────────────────────── */}
      <section id="benchmark" className="py-16 px-4 sm:px-6 max-w-[1200px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: TRANSITION_EASE }}
          className="rounded-[28px] bg-[#163300] text-white p-8 sm:p-14 border border-[#163300] shadow-xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <span className="text-xs font-black uppercase tracking-wider text-[#9fe870]">
                High-Concurrency Engine
              </span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#9fe870] tracking-tight font-heading mt-2 leading-[0.95]">
                ZERO LATENCY<span className="text-white">.</span>
                <br />
                ZERO DROPPED PACKETS<span className="text-white">.</span>
              </h2>
              <p className="mt-6 text-base text-white/90 leading-relaxed font-normal">
                Built with parallel Go micro-workers, Neon Postgres relational integrity, and automated rate-limiting algorithms that keep your WhatsApp phone numbers and Telegram bots in pristine standing.
              </p>

              {/* 4 Stats Matrix */}
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/10">
                <div>
                  <div className="text-3xl font-black text-[#9fe870] font-heading">&lt; 120ms</div>
                  <div className="text-xs text-white/70 font-medium mt-1">Routing Latency</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white font-heading">99.8%</div>
                  <div className="text-xs text-white/70 font-medium mt-1">Verified Delivery</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-[#9fe870] font-heading">100k+</div>
                  <div className="text-xs text-white/70 font-medium mt-1">Daily Quota</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white font-heading">0%</div>
                  <div className="text-xs text-white/70 font-medium mt-1">Data Leakage</div>
                </div>
              </div>
            </div>

            {/* Right Inset Card: Interactive Broadcast Quota Estimator */}
            <div className="lg:col-span-5">
              <div className="rounded-[10px] bg-white text-[#454745] p-6 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-[#e8ebe6]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#163300]">
                    Dispatch Velocity Estimator
                  </span>
                  <span className="rounded-full bg-[#e2f6d5] text-[#163300] px-2 py-0.5 text-[10px] font-black uppercase">
                    Go Worker Pool
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-[#0e0f0c] mb-1.5">
                      <span>Audience Target Size:</span>
                      <span className="font-mono font-bold text-[#163300]">{calculatorVolume.toLocaleString()} recipients</span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="100000"
                      step="1000"
                      value={calculatorVolume}
                      onChange={(e) => setCalculatorVolume(Number(e.target.value))}
                      className="w-full accent-[#163300] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                      <span>1,000</span>
                      <span>50,000</span>
                      <span>100,000</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#e8ebe6]/70 p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Simultaneous Pipelines:</span>
                      <span className="font-bold text-[#0e0f0c]">WhatsApp (Meta) + Telegram</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Worker Concurrency:</span>
                      <span className="font-bold text-[#163300]">1,200 messages / min</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#e8ebe6]">
                      <span className="font-bold text-[#0e0f0c]">Estimated Dispatch Time:</span>
                      <span className="font-black text-[#163300] font-mono text-sm">{dispatchTimeMinutes} minutes</span>
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/get-started"
                      className="w-full inline-flex items-center justify-center rounded-full bg-[#163300] px-4 py-2.5 text-xs font-black text-[#9fe870] hover:bg-[#054d28] transition-all shadow-sm"
                    >
                      Deploy For Your Agency →
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. COMPARISON TABLE (OmniPulse Unified vs Fragmented Tools)
          Wise spec: Flat table on Paper canvas, Pebble hairlines,
          Fog surfaces, clean pill indicators
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 max-w-[1200px] mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: TRANSITION_EASE }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-xs font-black uppercase tracking-wider text-[#163300]">
            The Agency Standard
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#0e0f0c] tracking-tight font-heading mt-2">
            Why Unified Wins<span className="text-[#9fe870]">.</span>
          </h2>
          <p className="text-base text-[#454745] mt-4">
            Compare OmniPulse against juggling multiple standalone bots and disconnected browser extensions.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: TRANSITION_EASE }}
          className="rounded-2xl border border-[#e8ebe6] bg-white overflow-hidden shadow-xs"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#454745]">
              <thead className="bg-[#e8ebe6] text-xs uppercase font-bold text-[#0e0f0c] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Capability</th>
                  <th className="px-6 py-4 bg-[#e2f6d5] text-[#163300] font-black">OmniPulse Command Center</th>
                  <th className="px-6 py-4">Legacy Extension / Separate Bots</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8ebe6]">
                {[
                  {
                    feature: "Parallel Multi-Channel Blast",
                    omni: "✓ Unified WhatsApp & Telegram simultaneously",
                    legacy: "✕ Separate tools, double drafting effort",
                  },
                  {
                    feature: "Inbound Contact Capture",
                    omni: "✓ Automated real-time webhook flywheel",
                    legacy: "✕ Manual CSV exports & imports",
                  },
                  {
                    feature: "Agency Team Multi-Tenancy",
                    omni: "✓ Workspace isolation + RBAC (Owner/Admin/Member)",
                    legacy: "✕ Shared single-login credentials",
                  },
                  {
                    feature: "Message Variable Substitution",
                    omni: "✓ Real-time {{first_name}} and {{company}} tokens",
                    legacy: "✕ Static copy or brittle mail-merge scripts",
                  },
                  {
                    feature: "Delivery Telemetry & Mission Tracking",
                    omni: "✓ Live Mission Control with instant retry logs",
                    legacy: "✕ Silent failures with no audit trail",
                  },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#0e0f0c]">{row.feature}</td>
                    <td className="px-6 py-4 font-bold text-[#163300] bg-[#e2f6d5]/40">{row.omni}</td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{row.legacy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. CALL TO ACTION FINALE (Inverted Forest Ink with Lime Accent)
          Wise spec: Forest Ink full width, Wise Sans headline,
          Lime Voltage CTA pill, clean rhythm
          ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#163300] text-white py-24 px-4 sm:px-6 text-center border-t border-[#163300]">
        <motion.div 
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: TRANSITION_EASE }}
          className="max-w-4xl mx-auto"
        >
          <span className="text-xs font-black uppercase tracking-wider text-[#9fe870]">
            Get Started in 2 Minutes
          </span>
          <h2 className="text-4xl sm:text-6xl font-black uppercase text-[#9fe870] tracking-tight font-heading mt-4 leading-[0.95]">
            READY TO TRANSMIT AT SCALE<span className="text-white">?</span>
          </h2>
          <p className="mt-6 text-base sm:text-lg text-white/90 max-w-xl mx-auto leading-relaxed">
            Create your isolated workspace, link your first bot, and experience seamless multi-channel broadcast power today.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/get-started"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#9fe870] px-8 py-3.5 text-base font-black text-[#163300] hover:brightness-105 transition-all shadow-md"
              >
                Open Your Free Workspace
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </Link>
            </motion.div>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3.5 text-base font-bold text-white hover:bg-white/10 transition-all"
            >
              Sign In to Existing Account
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. FOOTER
          Wise spec: Minimalist, Paper / Forest Ink, quiet labels,
          Operational status pill, copyright
          ───────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-[#e8ebe6] py-12 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-full bg-[#163300] flex items-center justify-center text-[#9fe870] font-black text-xs">
              OP
            </div>
            <span className="text-base font-black text-[#0e0f0c] font-heading">
              OmniPulse Unified Communications
            </span>
          </div>

          {/* Operational Status Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e2f6d5] border border-[#9fe870]/70 px-3.5 py-1 text-xs font-bold text-[#163300]">
            <span className="h-2 w-2 rounded-full bg-[#163300] animate-pulse" />
            <span>Go Concurrency Pipeline &amp; Neon DB Operational</span>
          </div>

          <p className="text-xs text-[#868685]">
            © {new Date().getFullYear()} OmniPulse. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
