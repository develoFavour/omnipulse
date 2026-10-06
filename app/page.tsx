"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { IntroCurtain } from "@/components/landing/IntroCurtain";
import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { CommandDeck } from "@/components/landing/CommandDeck";
import { ArchitectureSection } from "@/components/landing/ArchitectureSection";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { ChannelSwitcher } from "@/components/landing/ChannelSwitcher";
import { BenchmarkSection } from "@/components/landing/BenchmarkSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Intro animation & hydration mount state
  const [hasMounted, setHasMounted] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [introPhase, setIntroPhase] = useState<"logo" | "words" | "exit">("logo");

  useEffect(() => {
    setHasMounted(true);
    const t1 = setTimeout(() => setIntroPhase("words"), 800);
    const t2 = setTimeout(() => setIntroPhase("exit"), 2000);
    const t3 = setTimeout(() => setIntroComplete(true), 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Scroll progress bar
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Hero scroll parallax
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroLine1Y = useTransform(heroP, [0, 1], ["0%", "-12%"]);
  const heroLine2Y = useTransform(heroP, [0, 1], ["0%", "-20%"]);
  const heroLine3Y = useTransform(heroP, [0, 1], ["0%", "-28%"]);

  // Hero card scroll lift
  const heroCardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: cardP } = useScroll({ target: heroCardRef, offset: ["start end", "center center"] });
  const cardScale = useTransform(cardP, [0, 1], [0.93, 1]);
  const cardRotateX = useTransform(cardP, [0, 1], [12, 0]);
  const cardOpacity = useTransform(cardP, [0, 0.4], [0.75, 1]);
  const cardY = useTransform(cardP, [0, 1], [50, 0]);

  return (
    <>
      <IntroCurtain introComplete={introComplete} introPhase={introPhase} />

      <div
        ref={containerRef}
        className="min-h-screen bg-white text-[#454745] font-sans selection:bg-[#9fe870] selection:text-[#163300] relative overflow-x-hidden"
      >
        {/* Scroll scrub bar */}
        <motion.div
          style={{ scaleX }}
          className="fixed top-0 left-0 right-0 h-[2px] bg-[#163300] origin-left z-[150]"
        />

        <LandingNav introComplete={introComplete} />

        <HeroSection
          heroRef={heroRef}
          heroLine1Y={heroLine1Y}
          heroLine2Y={heroLine2Y}
          heroLine3Y={heroLine3Y}
          hasMounted={hasMounted}
          introComplete={introComplete}
        />

        <CommandDeck
          heroCardRef={heroCardRef}
          cardScale={cardScale}
          cardRotateX={cardRotateX}
          cardOpacity={cardOpacity}
          cardY={cardY}
        />

        <ArchitectureSection />

        <FeatureShowcase />

        <ChannelSwitcher />

        <BenchmarkSection />

        <ComparisonSection />

        <LandingFooter />
      </div>
    </>
  );
}
