"use client";

import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";
import { BenchmarkStat } from "./types";

export function useCountUp(target: number, duration = 1800, start = false) {
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

export function StatCounter({
  value,
  suffix = "",
  prefix = "",
  label,
  color = "text-[#9fe870]",
}: BenchmarkStat) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const count = useCountUp(value, 1800, inView);

  return (
    <div ref={ref} className="flex flex-col justify-start">
      <div
        className={`text-2xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight whitespace-nowrap flex items-baseline gap-1 ${color}`}
      >
        {prefix && (
          <span className="text-lg sm:text-xl lg:text-2xl font-bold opacity-80 leading-none">
            {prefix}
          </span>
        )}
        <span className="leading-none">{count.toLocaleString()}</span>
        {suffix && (
          <span className="text-xl sm:text-2xl lg:text-3xl font-black leading-none">
            {suffix}
          </span>
        )}
      </div>
      <div className="text-xs text-white/60 font-medium mt-2 whitespace-nowrap">
        {label}
      </div>
    </div>
  );
}
