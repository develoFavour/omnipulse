"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
  useMotionValue,
  useInView,
} from "framer-motion";
import {
  Megaphone,
  Bot,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  Rocket,
  Activity,
  Users,
  BarChart3,
} from "lucide-react";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";
import { APP_ROUTES } from "@/lib/constants/routes.const";

// ─── Constants ────────────────────────────────────────────────────────────────
const EASE_EXPO = [0.16, 1, 0.3, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;

// ─── Animated Counter Hook ────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const raf = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
}

// ─── Stat Counter Component ───────────────────────────────────────────────────
function StatCounter({
  value,
  suffix = "",
  prefix = "",
  label,
  color = "text-[#9fe870]",
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  color?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const count = useCountUp(value, 1800, inView);
  return (
    <div ref={ref}>
      <div className={`text-3xl sm:text-4xl font-black font-heading ${color}`}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs text-white/60 font-medium mt-1">{label}</div>
    </div>
  );
}

// ─── Mouse-tracking dot grid ──────────────────────────────────────────────────
function ParticleGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const COLS = 28;
    const ROWS = 16;
    let W = 0, H = 0;
    let dots: { x: number; y: number; baseX: number; baseY: number }[] = [];
    let animId: number;

    function resize() {
      W = canvas!.offsetWidth;
      H = canvas!.offsetHeight;
      canvas!.width = W;
      canvas!.height = H;
      dots = [];
      const gapX = W / (COLS - 1);
      const gapY = H / (ROWS - 1);
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const bx = c * gapX;
          const by = r * gapY;
          dots.push({ x: bx, y: by, baseX: bx, baseY: by });
        }
      }
    }

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, W, H);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      dots.forEach((dot) => {
        const dx = dot.baseX - mx;
        const dy = dot.baseY - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 160;
        if (dist < radius) {
          const force = (1 - dist / radius) * 18;
          dot.x += (dx / dist) * force * 0.08;
          dot.y += (dy / dist) * force * 0.08;
        }
        dot.x += (dot.baseX - dot.x) * 0.06;
        dot.y += (dot.baseY - dot.y) * 0.06;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1.1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(22, 51, 0, 0.1)`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    }

    resize();
    draw();

    const handleResize = () => resize();
    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouse);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
    />
  );
}

// ─── Feature data ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Megaphone,
    tag: "Broadcast Studio",
    headline: "Compose once. Blast everywhere.",
    body: "Write a single message, inject dynamic tokens like {{first_name}} and {{company}}, then fire it simultaneously to WhatsApp and Telegram with one click.",
    stats: [
      { label: "Messages / min", value: "1,200" },
      { label: "Channels supported", value: "2+" },
    ],
    preview: (
      <div className="rounded-2xl bg-[#163300] p-5 text-white text-xs font-mono space-y-3 min-h-[220px]">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <span className="h-2 w-2 rounded-full bg-[#9fe870] animate-pulse" />
          <span className="text-[#9fe870] font-bold uppercase text-[10px] tracking-widest">Live Broadcast Studio</span>
        </div>
        <div className="space-y-1.5">
          <div className="text-white/40 text-[10px] uppercase tracking-wider">Message Body</div>
          <div className="bg-white/5 rounded-xl p-3 leading-relaxed border border-white/10 text-white/90">
            {"Hey "}<span className="text-[#9fe870]">{"{{first_name}}"}</span>{"! Your exclusive pass for "}<span className="text-[#9fe870]">{"{{company}}"}</span>{" is live."}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="rounded-lg bg-[#25D366]/15 border border-[#25D366]/30 p-2.5 flex items-center gap-1.5">
            <FaWhatsapp className="h-3 w-3 text-[#25D366]" />
            <span className="text-[#25D366] font-bold text-[10px]">9,420 WA</span>
          </div>
          <div className="rounded-lg bg-[#229ED9]/15 border border-[#229ED9]/30 p-2.5 flex items-center gap-1.5">
            <FaTelegram className="h-3 w-3 text-[#229ED9]" />
            <span className="text-[#229ED9] font-bold text-[10px]">4,860 TG</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Bot,
    tag: "Webhook Flywheel",
    headline: "Contacts flow in. Zero manual work.",
    body: "Every /start tap, every reply, every form submission — inbound webhooks auto-capture phone numbers and Telegram usernames into segmented audience cohorts in real time.",
    stats: [
      { label: "Avg. capture latency", value: "31ms" },
      { label: "CSV imports needed", value: "Zero" },
    ],
    preview: (
      <div className="rounded-2xl bg-white border border-[#e8ebe6] p-5 text-xs space-y-3 min-h-[220px]">
        <div className="flex items-center justify-between pb-3 border-b border-[#e8ebe6]">
          <span className="font-bold text-[#0e0f0c] text-[11px] uppercase tracking-wider">Live Contact Stream</span>
          <span className="px-2 py-0.5 rounded-full bg-[#e2f6d5] text-[#163300] font-bold text-[10px]">● Live</span>
        </div>
        {[
          { name: "@sarah_media", tag: "Inbound Lead", time: "just now" },
          { name: "+1 (555) 912-8821", tag: "VIP Customer", time: "2s ago" },
          { name: "@apex_growth", tag: "Beta Tester", time: "8s ago" },
        ].map((c, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-[#e8ebe6] text-[#454745] flex items-center justify-center font-bold text-[9px]">
                {c.name[0].toUpperCase()}
              </div>
              <span className="font-semibold text-[#0e0f0c]">{c.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#e2f6d5] text-[#163300] font-bold text-[9px]">{c.tag}</span>
              <span className="text-gray-400 text-[10px]">{c.time}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: BarChart3,
    tag: "Mission Analytics",
    headline: "Live telemetry. Zero dropped packets.",
    body: "Track every broadcast mission in real time — per-channel delivery rates, retry logs, audience reach velocity, and automated health alerts when sender quality dips.",
    stats: [
      { label: "Delivery rate", value: "99.8%" },
      { label: "Latency threshold", value: "< 120ms" },
    ],
    preview: (
      <div className="rounded-2xl bg-[#163300] p-5 min-h-[220px] space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <span className="text-[#9fe870] font-bold text-[10px] uppercase tracking-widest">Mission Control</span>
          <span className="text-white/40 font-mono text-[10px]">LIVE</span>
        </div>
        <div className="space-y-3">
          {[
            { label: "WhatsApp Delivered", pct: 97, color: "#25D366" },
            { label: "Telegram Delivered", pct: 99, color: "#229ED9" },
            { label: "Retry Queue", pct: 3, color: "#9fe870" },
          ].map((b, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-white/60">{b.label}</span>
                <span className="font-bold font-mono" style={{ color: b.color }}>{b.pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: b.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${b.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: EASE_EXPO, delay: i * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Users,
    tag: "Team & RBAC",
    headline: "Isolated workspaces. Role-locked access.",
    body: "Every client gets their own isolated workspace. Owner, Admin, and Member roles control exactly who can broadcast, invite team members, export data, or manage connections.",
    stats: [
      { label: "Role tiers", value: "3" },
      { label: "Workspace isolation", value: "Full" },
    ],
    preview: (
      <div className="rounded-2xl bg-white border border-[#e8ebe6] p-5 text-xs space-y-3 min-h-[220px]">
        <div className="pb-3 border-b border-[#e8ebe6] font-bold text-[#0e0f0c] text-[11px] uppercase tracking-wider">Team Roster</div>
        {[
          { name: "Alex Chen", role: "Owner", color: "#163300" },
          { name: "Maria Santos", role: "Admin", color: "#0b4c72" },
          { name: "Jordan Kim", role: "Member", color: "#454745" },
        ].map((m, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-[#e8ebe6] flex items-center justify-center font-bold text-[9px] text-[#163300]">
                {m.name.split(" ").map((n: string) => n[0]).join("")}
              </div>
              <span className="font-semibold text-[#0e0f0c]">{m.name}</span>
            </div>
            <span
              className="px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider"
              style={{ backgroundColor: `${m.color}15`, color: m.color, border: `1px solid ${m.color}30` }}
            >
              {m.role}
            </span>
          </div>
        ))}
      </div>
    ),
  },
];

const TRANSMISSIONS = [
  { text: "WhatsApp DM → +1 (555) 912-8821 delivered", latency: "74ms", channel: "Meta Cloud API" },
  { text: "Mirrored to Telegram 'VIP Growth' Channel", latency: "48ms", channel: "@OmniPulseBot" },
  { text: "Inbound webhook: Captured new contact @sarah_media", latency: "31ms", channel: "Webhook Flywheel" },
  { text: "WhatsApp DM → +44 7700 900142 delivered", latency: "89ms", channel: "Meta Cloud API" },
  { text: "Dispatched to 6 Telegram Subscriber Cohorts", latency: "52ms", channel: "@OmniPulseBot" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Intro animation state
  const [introComplete, setIntroComplete] = useState(false);
  const [introPhase, setIntroPhase] = useState<"logo" | "words" | "exit">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setIntroPhase("words"), 800);
    const t2 = setTimeout(() => setIntroPhase("exit"), 2000);
    const t3 = setTimeout(() => setIntroComplete(true), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Scroll progress bar
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Sticky hero scroll parallax
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroLine1Y = useTransform(heroP, [0, 1], ["0%", "-30%"]);
  const heroLine2Y = useTransform(heroP, [0, 1], ["0%", "-55%"]);
  const heroLine3Y = useTransform(heroP, [0, 1], ["0%", "-80%"]);
  const heroOpacity = useTransform(heroP, [0, 0.6], [1, 0]);

  // Hero card scroll lift
  const heroCardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: cardP } = useScroll({ target: heroCardRef, offset: ["start end", "center center"] });
  const cardScale = useTransform(cardP, [0, 1], [0.88, 1]);
  const cardRotateX = useTransform(cardP, [0, 1], [18, 0]);
  const cardOpacity = useTransform(cardP, [0, 0.5], [0.5, 1]);
  const cardY = useTransform(cardP, [0, 1], [100, 0]);

  // Mouse-tracking tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cardTiltX = useSpring(useTransform(mouseY, [-1, 1], [6, -6]), { stiffness: 200, damping: 20 });
  const cardTiltY = useSpring(useTransform(mouseX, [-1, 1], [-6, 6]), { stiffness: 200, damping: 20 });

  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    mouseY.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  }, [mouseX, mouseY]);

  const handleCardMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  // Live ticker
  const [tickerIdx, setTickerIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTickerIdx((p) => (p + 1) % TRANSMISSIONS.length), 2800);
    return () => clearInterval(t);
  }, []);

  // Platform tab
  const [activeTab, setActiveTab] = useState<"whatsapp" | "telegram" | "flywheel">("whatsapp");

  // Calculator
  const [calcVolume, setCalcVolume] = useState(25000);
  const dispatchTime = ((calcVolume / 1200) * 0.95).toFixed(1);

  // Copy link
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText("https://api.omnipulse.io/v1/webhooks/inbound");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* ══ INTRO ANIMATION ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {!introComplete && (
          <motion.div
            key="intro"
            className="fixed inset-0 z-[200] bg-[#0e0f0c] flex items-center justify-center overflow-hidden"
            animate={introPhase === "exit" ? { opacity: 0 } : { opacity: 1 }}
            transition={introPhase === "exit" ? { duration: 0.6, ease: EASE_IN } : {}}
          >
            <div className="absolute inset-0 bg-[radial-gradient(#9fe870_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.04]" />
            <div className="relative z-10 text-center">
              <motion.div
                className="h-16 w-16 rounded-full bg-[#163300] border-2 border-[#9fe870]/40 flex items-center justify-center text-[#9fe870] font-black text-xl mx-auto"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: EASE_EXPO }}
              >
                OP
              </motion.div>
              <motion.div
                className="mt-4 text-2xl font-black text-white tracking-tight font-heading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: EASE_EXPO }}
              >
                OmniPulse<span className="text-[#9fe870]">.</span>
              </motion.div>
              <AnimatePresence>
                {introPhase !== "logo" && (
                  <motion.p
                    className="mt-3 text-sm text-white/40 font-medium tracking-wide"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE_EXPO }}
                  >
                    Omnichannel broadcast engine
                  </motion.p>
                )}
              </AnimatePresence>
              <motion.div
                className="mt-8 mx-auto h-[2px] w-32 bg-white/10 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div
                  className="h-full bg-[#9fe870] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ MAIN SHELL ═══════════════════════════════════════════════════════ */}
      <div ref={containerRef} className="min-h-screen bg-white text-[#454745] font-sans selection:bg-[#9fe870] selection:text-[#163300] relative overflow-x-hidden">

        {/* Scroll scrub bar */}
        <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-[2px] bg-[#163300] origin-left z-[150]" />

        {/* ── NAV ──────────────────────────────────────────────────────────── */}
        <motion.header
          className="sticky top-0 z-50 h-16 w-full bg-white/90 backdrop-blur-md border-b border-[#e8ebe6]"
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: introComplete ? 0 : 2.5, ease: EASE_EXPO }}
        >
          <div className="max-w-[1200px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <motion.div whileHover={{ scale: 1.08, rotate: 5 }} whileTap={{ scale: 0.95 }} className="h-8 w-8 rounded-full bg-[#163300] flex items-center justify-center text-[#9fe870] font-black text-sm">
                OP
              </motion.div>
              <span className="text-xl font-black tracking-tight text-[#0e0f0c] font-heading">OmniPulse<span className="text-[#9fe870]">.</span></span>
            </Link>
            <nav className="hidden md:flex items-center bg-[#f4f5f2] rounded-full p-1">
              {[["Studio", "#engine"], ["Architecture", "#architecture"], ["Connectors", "#channels"], ["Performance", "#benchmark"]].map(([label, href]) => (
                <a key={label} href={href} className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#454745] hover:text-[#0e0f0c] hover:bg-white transition-all">
                  {label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/sign-in" className="text-xs font-bold text-[#163300] hover:underline underline-offset-4 px-2 py-1.5 transition-colors">Sign In</Link>
              <Link href="/get-started" className="hidden sm:inline-flex items-center justify-center rounded-full border border-[#163300] bg-white px-4 py-2 text-xs font-bold text-[#163300] hover:bg-[#e8ebe6] transition-all">Open Account</Link>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link href="/get-started" className="inline-flex items-center justify-center rounded-full bg-[#163300] px-4 sm:px-5 py-2 text-xs font-black text-[#9fe870] hover:bg-[#054d28] transition-all">Launch Studio →</Link>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* ── STICKY HERO ──────────────────────────────────────────────────── */}
        <section ref={heroRef} className="relative h-[220vh]">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute inset-0 pointer-events-none">
              <ParticleGrid />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE_EXPO }}
              style={{ opacity: heroOpacity }}
              className="inline-flex items-center gap-2 rounded-full bg-[#e2f6d5] border border-[#9fe870]/70 px-4 py-1.5 mb-8 z-10"
            >
              <span className="h-2 w-2 rounded-full bg-[#163300] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#163300]">Dual-Pipeline Engine · WhatsApp Cloud & Telegram Bot APIs</span>
            </motion.div>

            <div className="relative z-10 text-center px-4 overflow-visible">
              <motion.div style={{ y: heroLine1Y, opacity: heroOpacity }}>
                <motion.h1 className="text-[clamp(44px,8vw,108px)] font-black uppercase text-[#0e0f0c] tracking-[-0.04em] leading-[0.88] font-heading"
                  initial={{ opacity: 0, y: 40 }} animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : 40 }}
                  transition={{ duration: 0.8, delay: 0.15, ease: EASE_EXPO }}>
                  MESSAGING
                </motion.h1>
              </motion.div>
              <motion.div style={{ y: heroLine2Y, opacity: heroOpacity }}>
                <motion.div className="flex items-center justify-center gap-4"
                  initial={{ opacity: 0, y: 40 }} animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : 40 }}
                  transition={{ duration: 0.8, delay: 0.25, ease: EASE_EXPO }}>
                  <span className="text-[clamp(44px,8vw,108px)] font-black uppercase text-[#163300] tracking-[-0.04em] leading-[0.88] font-heading">WITHOUT</span>
                  <span className="hidden sm:inline-block rounded-full bg-[#9fe870] px-6 py-2 text-[clamp(14px,2vw,22px)] font-black text-[#163300] uppercase tracking-tight self-center">Parallel Blast</span>
                </motion.div>
              </motion.div>
              <motion.div style={{ y: heroLine3Y, opacity: heroOpacity }}>
                <motion.h1 className="text-[clamp(44px,8vw,108px)] font-black uppercase text-[#0e0f0c] tracking-[-0.04em] leading-[0.88] font-heading"
                  initial={{ opacity: 0, y: 40 }} animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : 40 }}
                  transition={{ duration: 0.8, delay: 0.35, ease: EASE_EXPO }}>
                  BORDERS<span className="text-[#9fe870]">.</span>
                </motion.h1>
              </motion.div>
            </div>

            <motion.div className="mt-10 z-10 text-center px-4"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : 24 }}
              transition={{ duration: 0.8, delay: 0.45, ease: EASE_EXPO }}
              style={{ opacity: heroOpacity }}>
              <p className="text-base sm:text-xl text-[#454745] max-w-2xl mx-auto leading-relaxed">
                The unified omnichannel broadcast engine for agencies. Blast WhatsApp and Telegram in parallel, capture contacts in real time, and monitor live deliveries.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/get-started" className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#9fe870] px-8 py-3.5 text-base font-black text-[#163300] hover:brightness-105 transition-all shadow-md">
                    Start Free Mission <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </Link>
                </motion.div>
                <a href="#engine" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#163300] hover:text-[#0e0f0c] underline underline-offset-4 decoration-2 transition-colors py-2">
                  Explore Live Studio →
                </a>
              </div>
            </motion.div>

            <motion.div className="absolute bottom-8 left-0 right-0 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-[#868685] px-4 z-10"
              initial={{ opacity: 0 }} animate={{ opacity: introComplete ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              style={{ opacity: heroOpacity }}>
              {["Official Meta Cloud API", "High-Speed Telegram BotFather", "Brevo Transactional Invites", "Neon Postgres Multi-Tenant Core"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#163300]" />
                  <span>{t}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── HERO 3D CARD (id="engine") ────────────────────────────────────── */}
        <section id="engine" className="px-4 sm:px-6 max-w-[1200px] mx-auto pb-16 -mt-12">
          <div ref={heroCardRef} style={{ perspective: "1400px" }}>
            <motion.div
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              style={{ scale: cardScale, rotateX: cardRotateX, rotateY: cardTiltY, opacity: cardOpacity, y: cardY, transformStyle: "preserve-3d" }}
              className="rounded-[32px] bg-[#163300] text-white p-6 sm:p-10 shadow-2xl text-left relative overflow-hidden will-change-transform"
            >
              <div className="absolute top-0 right-0 p-12 opacity-[0.04] pointer-events-none">
                <Megaphone className="h-80 w-80 text-[#9fe870]" />
              </div>
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className="h-3 w-3 rounded-full bg-[#9fe870] block" />
                      <span className="absolute inset-0 rounded-full bg-[#9fe870] animate-ping opacity-75" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#9fe870] font-heading">Broadcast Studio Command Engine</h3>
                      <p className="text-xs text-white/60 font-medium">Parallel Pipeline Active · Concurrency: 1,200 msg/min</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 border border-white/15 flex items-center gap-1.5">
                      <FaWhatsapp className="h-3.5 w-3.5 text-[#25D366]" /> Meta Verified
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 border border-white/15 flex items-center gap-1.5">
                      <FaTelegram className="h-3.5 w-3.5 text-[#229ED9]" /> BotFather Active
                    </span>
                    <span className="rounded-full bg-[#9fe870] text-[#163300] px-3 py-1 text-xs font-black uppercase">Live Telemetry</span>
                  </div>
                </div>

                <div className="mt-4 py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs overflow-hidden">
                  <div className="flex items-center gap-2.5 truncate">
                    <Activity className="h-4 w-4 text-[#9fe870] shrink-0 animate-pulse" />
                    <span className="text-white/50 font-mono text-[11px] shrink-0">DISPATCH LOG:</span>
                    <AnimatePresence mode="wait">
                      <motion.span key={tickerIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="font-medium text-white truncate">
                        {TRANSMISSIONS[tickerIdx].text}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-[#9fe870]">⚡ {TRANSMISSIONS[tickerIdx].latency}</span>
                    <span className="hidden sm:inline-block text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/60">{TRANSMISSIONS[tickerIdx].channel}</span>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-7 space-y-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#9fe870] mb-2">Active Campaign Mission</label>
                      <div className="rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-sm font-semibold text-white font-mono flex items-center justify-between">
                        <span>Flash VIP Omnichannel Dispatch</span>
                        <span className="text-[10px] bg-[#9fe870]/20 text-[#9fe870] px-2 py-0.5 rounded font-bold uppercase">Queued · 10:50 AM</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#9fe870]">Message Composer</label>
                        <div className="flex items-center gap-1 text-[11px] font-mono text-white/50">
                          <span className="bg-white/10 px-2 py-0.5 rounded text-[#9fe870]">{"{{first_name}}"}</span>
                          <span className="bg-white/10 px-2 py-0.5 rounded text-[#9fe870]">{"{{company}}"}</span>
                        </div>
                      </div>
                      <div className="rounded-xl bg-white/5 border border-white/15 p-4 text-sm text-white/90 leading-relaxed min-h-[90px]">
                        {"Hey "}<span className="text-[#9fe870] font-bold">{"{{first_name}}"}</span>{"! Your exclusive agency pass for "}
                        <span className="text-[#9fe870] font-bold">{"{{company}}"}</span>{" is unlocked."}
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/10 border border-white/15 p-4 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-xs text-white/50 uppercase font-semibold">Verified Audience Reach</div>
                        <div className="text-2xl font-black text-white font-heading">14,280 <span className="text-xs font-semibold text-[#9fe870]">recipients</span></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-[#25D366]/20 text-[#25D366] px-2.5 py-1 text-xs font-bold flex items-center gap-1"><FaWhatsapp className="h-3 w-3" /> 9,420 WA</span>
                        <span className="rounded-lg bg-[#229ED9]/20 text-[#229ED9] px-2.5 py-1 text-xs font-bold flex items-center gap-1"><FaTelegram className="h-3 w-3" /> 4,860 TG</span>
                      </div>
                    </div>
                    <div className="pt-1 flex items-center gap-4">
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                        <Link href="/get-started" className="inline-flex items-center gap-2 rounded-full bg-[#9fe870] px-7 py-3 text-sm font-black text-[#163300] hover:brightness-105 transition-all">
                          <Rocket className="h-4 w-4" /> Simulate Launch (14,280)
                        </Link>
                      </motion.div>
                      <span className="text-xs text-white/50 font-medium">Est. ~11.9 mins</span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 flex justify-center">
                    <div className="w-full max-w-xs rounded-[32px] border-4 border-white/20 bg-[#0e0f0c] p-4 shadow-2xl">
                      <div className="w-20 h-4 bg-white/20 rounded-full mx-auto mb-4" />
                      <div className="rounded-xl bg-[#e8ebe6] p-3 mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-[#25D366] flex items-center justify-center">
                            <FaWhatsapp className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#0e0f0c]">OmniPulse Verified</div>
                            <div className="text-[10px] text-gray-500">Official Business Sender</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">✓ Verified</span>
                      </div>
                      <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 space-y-2">
                        <div className="text-xs text-gray-800 leading-relaxed">
                          {"Hey "}<span className="font-bold text-[#163300]">Sarah</span>{"! Your exclusive agency pass for "}
                          <span className="font-bold text-[#163300]">Apex Media</span>{" is unlocked."}
                        </div>
                        <div className="text-[10px] text-gray-400 text-right">10:50 AM · Delivered ✓✓</div>
                      </div>
                      <div className="mt-3 rounded-2xl bg-[#229ED9]/15 p-3 border border-[#229ED9]/25 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FaTelegram className="h-4 w-4 text-[#229ED9]" />
                          <span className="font-bold text-white text-[11px]">Mirrored to 6 Channels</span>
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

        {/* ── ARCHITECTURE ─────────────────────────────────────────────────── */}
        <section id="architecture" className="py-24 bg-[#f4f5f2] border-y border-[#e8ebe6]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <motion.div className="text-center max-w-2xl mx-auto mb-16"
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, ease: EASE_EXPO }}>
              <span className="text-xs font-black uppercase tracking-wider text-[#163300]">The OmniPulse Concurrency Pipeline</span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#0e0f0c] tracking-tight font-heading mt-2">How High-Throughput Works<span className="text-[#9fe870]">.</span></h2>
              <p className="mt-4 text-base text-[#454745]">Engineered in Go with relational Postgres transactions and exponential backoff rate limiters.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: "01", tag: "INGESTION", title: "Zero-Data-Entry Capture", body: "Inbound contacts indexed instantaneously as users tap /start. Segment automatically using color tags — no CSV exports ever.", tags: ["Real-time webhook sync", "Zero manual CSVs"] },
                { step: "02", tag: "COMPOSITION", title: "Dynamic Token Assembly", body: "Craft templates with instant dynamic placeholder injection. Preview natively in WhatsApp and Telegram simulators before broadcasting.", tags: ["Variable tokens", "Mobile simulator preview"] },
                { step: "03", tag: "DISPATCH", title: "Parallel Mission Transmission", body: "Go worker pools blast both platforms concurrently at 1,200 msgs/min with automated backoff that protects sender health.", tags: ["1,200+ msgs/min", "Live retry telemetry"] },
              ].map((s, i) => (
                <motion.div key={s.step} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: i * 0.1, ease: EASE_EXPO }}
                  className="rounded-2xl bg-white p-8 border border-white hover:border-[#163300]/15 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="h-12 w-12 rounded-xl bg-[#e2f6d5] text-[#163300] flex items-center justify-center font-black text-lg">{s.step}</div>
                      <span className="text-xs font-bold font-mono text-[#868685]">{s.tag}</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#0e0f0c] font-heading mb-3">{s.title}</h3>
                    <p className="text-sm text-[#454745] leading-relaxed">{s.body}</p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-[#e8ebe6] flex items-center gap-2 text-xs font-bold text-[#163300]">
                    <span>{s.tags[0]}</span><span className="text-[#9fe870] font-black">•</span><span>{s.tags[1]}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURE SHOWCASE ─────────────────────────────────────────────── */}
        <section className="py-24 max-w-[1200px] mx-auto px-4 sm:px-6 space-y-20">
          <motion.div className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, ease: EASE_EXPO }}>
            <span className="text-xs font-black uppercase tracking-wider text-[#163300]">Platform Capabilities</span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#0e0f0c] tracking-tight font-heading mt-2">Everything You Need<span className="text-[#9fe870]">.</span></h2>
            <p className="mt-4 text-base text-[#454745]">From contact capture to broadcast analytics — one unified command surface.</p>
          </motion.div>

          {FEATURES.map((feat, i) => {
            const isReversed = i % 2 !== 0;
            return (
              <motion.div key={feat.tag} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: EASE_EXPO }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isReversed ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#e2f6d5] border border-[#9fe870]/50 px-3 py-1 text-xs font-bold text-[#163300] mb-5">
                    <feat.icon className="h-3.5 w-3.5" />{feat.tag}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#0e0f0c] font-heading leading-tight mb-4">{feat.headline}</h3>
                  <p className="text-base text-[#454745] leading-relaxed mb-8">{feat.body}</p>
                  <div className="flex gap-8">
                    {feat.stats.map((s) => (
                      <div key={s.label}>
                        <div className="text-2xl font-black text-[#163300] font-heading">{s.value}</div>
                        <div className="text-xs text-[#868685] font-medium mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }} className="rounded-2xl overflow-hidden">
                  {feat.preview}
                </motion.div>
              </motion.div>
            );
          })}
        </section>

        {/* ── CHANNEL SWITCHER (id="channels") ─────────────────────────────── */}
        <section id="channels" className="py-24 bg-[#f4f5f2] border-y border-[#e8ebe6]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <motion.div className="text-center max-w-2xl mx-auto mb-12"
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, ease: EASE_EXPO }}>
              <span className="text-xs font-black uppercase tracking-wider text-[#163300]">Channel Integrations</span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#0e0f0c] tracking-tight font-heading mt-2">Native Connectors<span className="text-[#9fe870]">.</span></h2>
              <p className="text-base text-[#454745] mt-4">Connect verified APIs in under 60 seconds with QR codes, OAuth, and secure bot tokens.</p>
              <div className="mt-8 inline-flex items-center rounded-full bg-white p-1 border border-[#e8ebe6] shadow-xs">
                {(["whatsapp", "telegram", "flywheel"] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${activeTab === tab ? "bg-[#163300] text-[#9fe870] shadow-sm" : "text-[#454745] hover:text-[#0e0f0c]"}`}>
                    {tab === "whatsapp" ? "WhatsApp Cloud" : tab === "telegram" ? "Telegram Bot" : "Webhook Flywheel"}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, ease: EASE_EXPO }}
              className="rounded-[28px] bg-white border border-[#e8ebe6] p-8 sm:p-12 shadow-xs">
              <AnimatePresence mode="wait">
                {activeTab === "whatsapp" && (
                  <motion.div key="whatsapp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#25D366]/10 text-[#25D366] px-3 py-1 text-xs font-bold mb-4">
                        <FaWhatsapp className="h-4 w-4" /> Official Meta Cloud Partner
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0e0f0c] font-heading mb-4">1-Click Meta OAuth & WhatsApp QR Link</h3>
                      <p className="text-base text-[#454745] leading-relaxed mb-6">Deploy verified WhatsApp senders without managing infrastructure. Send DMs, target opt-in lists, and preview Status updates from your browser.</p>
                      <ul className="space-y-3 text-sm text-[#454745] font-medium">
                        {["Official Meta WABA & Phone Number ID support", "Automated contact sync & verification telemetry", "WhatsApp Story Bridge with media asset support"].map(t => (
                          <li key={t} className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-[#163300] shrink-0" /><span>{t}</span></li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl bg-[#f4f5f2] p-6 border border-[#e8ebe6] space-y-3 font-mono text-xs">
                      {[{ label: "WABA ID:", value: "waba_991823901928" }, { label: "Phone ID:", value: "+1 (555) 912-8821" }, { label: "Quality Rating:", value: "High (Green Tier)", extra: "text-emerald-600" }].map((r) => (
                        <div key={r.label} className="p-3 rounded-xl bg-white border border-[#e8ebe6] flex justify-between">
                          <span className="text-gray-400">{r.label}</span>
                          <span className={`font-bold text-[#0e0f0c] ${r.extra || ""}`}>{r.value}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {activeTab === "telegram" && (
                  <motion.div key="telegram" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#229ED9]/10 text-[#229ED9] px-3 py-1 text-xs font-bold mb-4">
                        <FaTelegram className="h-4 w-4" /> BotFather Native Integration
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0e0f0c] font-heading mb-4">Automatic Telegram Group & Channel Discovery</h3>
                      <p className="text-base text-[#454745] leading-relaxed mb-6">Add your bot as admin to any community. OmniPulse listens, registers Chat IDs, and exposes them in your broadcast studio selector.</p>
                      <ul className="space-y-3 text-sm text-[#454745] font-medium">
                        {["Real-time destination webhook listener", "Supports both 1:1 DMs and Public Channels", "Automatic reconnect & webhook health monitoring"].map(t => (
                          <li key={t} className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-[#163300] shrink-0" /><span>{t}</span></li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl bg-[#f4f5f2] p-6 border border-[#e8ebe6] space-y-2 text-xs">
                      {[{ title: "VIP Announcements", type: "channel" }, { title: "Growth Marketing Community", type: "supergroup" }, { title: "Daily Product Releases", type: "channel" }].map((d, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white border border-[#e8ebe6] flex items-center justify-between">
                          <div className="flex items-center gap-2"><FaTelegram className="h-3.5 w-3.5 text-[#229ED9]" /><span className="font-bold text-[#0e0f0c]">{d.title}</span></div>
                          <span className="font-mono text-[10px] text-gray-400">{d.type}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {activeTab === "flywheel" && (
                  <motion.div key="flywheel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#163300] text-[#9fe870] px-3 py-1 text-xs font-bold mb-4">
                        <Bot className="h-4 w-4" /> Inbound Webhook Flywheel
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0e0f0c] font-heading mb-4">Zero Manual CSV Imports. Contacts Flow In Live.</h3>
                      <p className="text-base text-[#454745] leading-relaxed mb-6">Every user interaction triggers instantaneous webhook ingestion. Route incoming phone numbers, Telegram usernames, and metadata into segmented cohorts.</p>
                      <div className="p-3.5 rounded-xl bg-[#f4f5f2] border border-[#e8ebe6] flex items-center justify-between gap-2">
                        <code className="text-xs font-mono font-bold text-[#163300] truncate">https://api.omnipulse.io/v1/webhooks/inbound</code>
                        <button onClick={handleCopy} className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-[#163300] hover:bg-[#e8ebe6] transition-colors">
                          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-[#f4f5f2] p-6 border border-[#e8ebe6]">
                      <div className="text-xs font-bold text-[#0e0f0c] pb-3 mb-3 border-b border-[#e8ebe6]">Live Segment Tags</div>
                      <div className="flex flex-wrap gap-2">
                        {[{ name: "VIP Customer", color: "#163300" }, { name: "Inbound Lead", color: "#10b981" }, { name: "Enterprise Tier", color: "#f59e0b" }, { name: "Beta Tester", color: "#8b5cf6" }, { name: "Telegram Direct", color: "#229ED9" }].map((tag) => (
                          <span key={tag.name} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                            style={{ backgroundColor: `${tag.color}15`, color: tag.color, border: `1px solid ${tag.color}35` }}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} />{tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* ── STATS with ANIMATED COUNTERS (id="benchmark") ────────────────── */}
        <section id="benchmark" className="py-16 px-4 sm:px-6 max-w-[1200px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.65, ease: EASE_EXPO }}
            className="rounded-[28px] bg-[#163300] text-white p-8 sm:p-14 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <span className="text-xs font-black uppercase tracking-wider text-[#9fe870]">High-Concurrency Engine</span>
                <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#9fe870] tracking-tight font-heading mt-2 leading-[0.95]">
                  ZERO LATENCY<span className="text-white">.</span><br />ZERO DROPPED PACKETS<span className="text-white">.</span>
                </h2>
                <p className="mt-6 text-base text-white/80 leading-relaxed">Built with parallel Go micro-workers, Neon Postgres relational integrity, and automated rate-limiting that keeps your senders in pristine standing.</p>
                <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/10">
                  <StatCounter value={120} suffix="ms" prefix="< " label="Routing Latency" />
                  <StatCounter value={99} suffix=".8%" label="Verified Delivery" color="text-white" />
                  <StatCounter value={100} suffix="k+" label="Daily Quota" />
                  <StatCounter value={0} suffix="%" label="Data Leakage" color="text-white" />
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="rounded-[10px] bg-white text-[#454745] p-6 shadow-2xl">
                  <div className="flex items-center justify-between pb-4 border-b border-[#e8ebe6]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#163300]">Dispatch Velocity Estimator</span>
                    <span className="rounded-full bg-[#e2f6d5] text-[#163300] px-2 py-0.5 text-[10px] font-black uppercase">Go Workers</span>
                  </div>
                  <div className="mt-5 space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-[#0e0f0c] mb-1.5">
                        <span>Audience Size:</span>
                        <span className="font-mono font-bold text-[#163300]">{calcVolume.toLocaleString()} recipients</span>
                      </div>
                      <input type="range" min="1000" max="100000" step="1000" value={calcVolume} onChange={(e) => setCalcVolume(Number(e.target.value))} className="w-full accent-[#163300] cursor-pointer" />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono"><span>1k</span><span>50k</span><span>100k</span></div>
                    </div>
                    <div className="rounded-xl bg-[#f4f5f2] p-4 space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-gray-500">Pipelines:</span><span className="font-bold text-[#0e0f0c]">WhatsApp + Telegram</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Worker Concurrency:</span><span className="font-bold text-[#163300]">1,200 msg/min</span></div>
                      <div className="flex justify-between pt-2 border-t border-[#e8ebe6]">
                        <span className="font-bold text-[#0e0f0c]">Estimated Dispatch:</span>
                        <span className="font-black text-[#163300] font-mono text-sm">{dispatchTime} min</span>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link href="/get-started" className="w-full inline-flex items-center justify-center rounded-full bg-[#163300] px-4 py-2.5 text-xs font-black text-[#9fe870] hover:bg-[#054d28] transition-all">
                        Deploy For Your Agency →
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── COMPARISON TABLE ─────────────────────────────────────────────── */}
        <section className="py-20 max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div className="text-center max-w-2xl mx-auto mb-14"
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, ease: EASE_EXPO }}>
            <span className="text-xs font-black uppercase tracking-wider text-[#163300]">The Agency Standard</span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#0e0f0c] tracking-tight font-heading mt-2">Why Unified Wins<span className="text-[#9fe870]">.</span></h2>
            <p className="text-base text-[#454745] mt-4">Compare OmniPulse against juggling multiple standalone bots and disconnected browser extensions.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.65, ease: EASE_EXPO }}
            className="rounded-2xl border border-[#e8ebe6] bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#454745]">
                <thead className="bg-[#f4f5f2] text-xs uppercase font-bold text-[#0e0f0c] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Capability</th>
                    <th className="px-6 py-4 bg-[#e2f6d5] text-[#163300] font-black">OmniPulse Command Center</th>
                    <th className="px-6 py-4">Legacy Extension / Bots</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8ebe6]">
                  {[
                    { feature: "Parallel Multi-Channel Blast", omni: "✓ Unified WhatsApp & Telegram simultaneously", legacy: "✕ Separate tools, double drafting effort" },
                    { feature: "Inbound Contact Capture", omni: "✓ Automated real-time webhook flywheel", legacy: "✕ Manual CSV exports & imports" },
                    { feature: "Agency Team Multi-Tenancy", omni: "✓ Workspace isolation + RBAC (Owner/Admin/Member)", legacy: "✕ Shared single-login credentials" },
                    { feature: "Message Variable Substitution", omni: "✓ Real-time {{first_name}} & {{company}} tokens", legacy: "✕ Static copy or brittle mail-merge scripts" },
                    { feature: "Delivery Telemetry & Mission Tracking", omni: "✓ Live Mission Control with instant retry logs", legacy: "✕ Silent failures with no audit trail" },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#0e0f0c]">{row.feature}</td>
                      <td className="px-6 py-4 font-bold text-[#163300] bg-[#e2f6d5]/40">{row.omni}</td>
                      <td className="px-6 py-4 text-gray-400 font-medium">{row.legacy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="bg-[#163300] text-white py-28 px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.65, ease: EASE_EXPO }} className="max-w-4xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-[#9fe870]">Get Started in 2 Minutes</span>
            <h2 className="text-4xl sm:text-6xl font-black uppercase text-[#9fe870] tracking-tight font-heading mt-4 leading-[0.95]">
              READY TO TRANSMIT<br />AT SCALE<span className="text-white">?</span>
            </h2>
            <p className="mt-6 text-base sm:text-lg text-white/80 max-w-xl mx-auto leading-relaxed">Create your isolated workspace, link your first bot, and experience seamless multi-channel broadcast power today.</p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link href="/get-started" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#9fe870] px-8 py-3.5 text-base font-black text-[#163300] hover:brightness-105 transition-all shadow-md">
                  Open Your Free Workspace <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                </Link>
              </motion.div>
              <Link href="/sign-in" className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3.5 text-base font-bold text-white hover:bg-white/10 transition-all">
                Sign In to Existing Account
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer className="bg-white border-t border-[#e8ebe6] py-12 px-4 sm:px-6">
          <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full bg-[#163300] flex items-center justify-center text-[#9fe870] font-black text-xs">OP</div>
              <span className="text-base font-black text-[#0e0f0c] font-heading">OmniPulse Unified Communications</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e2f6d5] border border-[#9fe870]/60 px-3.5 py-1 text-xs font-bold text-[#163300]">
              <span className="h-2 w-2 rounded-full bg-[#163300] animate-pulse" />
              Go Concurrency Pipeline & Neon DB Operational
            </div>
            <p className="text-xs text-[#868685]">© {new Date().getFullYear()} OmniPulse. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
