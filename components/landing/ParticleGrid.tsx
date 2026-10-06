"use client";

import { useRef, useEffect } from "react";

export function ParticleGrid() {
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
