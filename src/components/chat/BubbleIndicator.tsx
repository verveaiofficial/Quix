import React, { useEffect, useRef } from "react";

type IndicatorBlob = {
  fx: number;
  fy: number;
  phase: number;
  amp: number;
  r: number;
  color: string;
};

const blobs: IndicatorBlob[] = [
  { fx: 0.71, fy: 1.13, phase: 0.0, amp: 0.52, r: 15, color: "#00f2ff" },
  { fx: 1.31, fy: 0.83, phase: 1.2, amp: 0.48, r: 14, color: "#ff00c8" },
  { fx: 0.93, fy: 1.41, phase: 2.1, amp: 0.44, r: 13, color: "#39ff14" },
  { fx: 1.17, fy: 0.67, phase: 0.8, amp: 0.5, r: 12, color: "#6e5fff" },
  { fx: 1.53, fy: 1.27, phase: 1.7, amp: 0.38, r: 11, color: "#ff0088" },
  { fx: 0.79, fy: 1.63, phase: 3.0, amp: 0.42, r: 12, color: "#ffff00" },
  { fx: 1.23, fy: 0.91, phase: 4.2, amp: 0.35, r: 11, color: "#00ffdd" },
  { fx: 0.61, fy: 1.37, phase: 5.1, amp: 0.46, r: 13, color: "#a855f7" },
];

interface BubbleIndicatorProps {
  dimmed?: boolean;
  size?: number;
}

export default function BubbleIndicator({
  dimmed = false,
  size = 32,
}: BubbleIndicatorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = size;
    const H = size;
    const R = size / 2;
    const cx = size / 2;
    const cy = size / 2;
    const scale = size / 32;

    const SLOW = 0.12;
    const FAST_S = 2.2;
    const CYCLE = 5000;

    let startTime = performance.now();
    let lastTime = startTime;
    let t = 0;
    let activeId = 0;

    function draw(now: number) {
      const dt = now - lastTime;
      lastTime = now;

      const cycleT = (now - startTime) % CYCLE;
      const s =
        (Math.sin((cycleT / CYCLE) * Math.PI * 2 - Math.PI / 2) + 1) / 2;

      t += (SLOW + (FAST_S - SLOW) * s) * dt * 0.001;

      ctx.clearRect(0, 0, W, H);
      ctx.save();

      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      const bg = ctx.createRadialGradient(
        cx * 0.84,
        cy * 0.76,
        1,
        cx,
        cy,
        R
      );
      bg.addColorStop(0.0, "#1a1a2e");
      bg.addColorStop(0.3, "#0f1f3d");
      bg.addColorStop(0.55, "#2a1b4d");
      bg.addColorStop(0.8, "#3d1f4d");
      bg.addColorStop(1.0, "#0f2a3d");

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = "screen";

      blobs.forEach((b) => {
        const bx = cx + Math.sin(b.fx * t + b.phase) * R * b.amp;
        const by = cy + Math.cos(b.fy * t + b.phase * 1.4) * R * b.amp;
        const pulse = 1 + 0.08 * Math.sin(b.fx * t * 2.3 + b.phase);
        const br = b.r * scale * pulse;

        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        grad.addColorStop(0.0, b.color + "cc");
        grad.addColorStop(0.35, b.color + "88");
        grad.addColorStop(0.7, b.color + "33");
        grad.addColorStop(1.0, b.color + "00");

        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      ctx.restore();

      activeId = requestAnimationFrame(draw);
    }

    activeId = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(activeId);
  }, [size]);

  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        opacity: dimmed ? 0.28 : 1,
        filter: dimmed ? "saturate(0.15) brightness(0.7)" : "none",
        transition: "opacity 0.8s ease, filter 0.8s ease",
      }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          borderRadius: "50%",
          display: "block",
          width: size,
          height: size,
        }}
      />
    </div>
  );
}
