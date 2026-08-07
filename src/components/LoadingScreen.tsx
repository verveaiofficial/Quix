import React, { useEffect, useRef, useState } from 'react';

interface LoadingScreenProps {
  /** Set to true when your main chat page is loaded and ready */
  isAppReady?: boolean;
  /** Optional callback after slide-out animation finishes */
  onComplete?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isAppReady = false,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const centerRef = useRef<HTMLDivElement | null>(null);
  const quixLabelRef = useRef<HTMLDivElement | null>(null);
  const verveBrandRef = useRef<HTMLDivElement | null>(null);

  const [isSlidingOut, setIsSlidingOut] = useState(false);

  useEffect(() => {
    // 1. Trigger center drop animation
    const dropTimer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (centerRef.current) {
          centerRef.current.classList.add('drop');
        }
      });
    });

    // 2. Setup Canvas Blob & Drop Physics
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 185;
    const H = 185;
    const R = 92;
    const cx = 92;
    const cy = 92;
    const INTRO_MS = 1500;

    const blobs = [
      { fx: 0.71, fy: 1.13, phase: 0.00, amp: 0.52, r: 90, color: '#00f2ff' },
      { fx: 1.31, fy: 0.83, phase: 1.20, amp: 0.48, r: 84, color: '#ff00c8' },
      { fx: 0.93, fy: 1.41, phase: 2.10, amp: 0.44, r: 78, color: '#39ff14' },
      { fx: 1.17, fy: 0.67, phase: 0.80, amp: 0.50, r: 74, color: '#6e5fff' },
      { fx: 1.53, fy: 1.27, phase: 1.70, amp: 0.38, r: 68, color: '#ff0088' },
      { fx: 0.79, fy: 1.63, phase: 3.00, amp: 0.42, r: 72, color: '#ffff00' },
      { fx: 1.23, fy: 0.91, phase: 4.20, amp: 0.35, r: 66, color: '#00ffdd' },
      { fx: 0.61, fy: 1.37, phase: 5.10, amp: 0.46, r: 80, color: '#a855f7' },
    ];

    const KF = [
      { p: 0.00, oy: -170, rx: 38, ry: 52 },
      { p: 0.32, oy: -8, rx: 36, ry: 58 },
      { p: 0.46, oy: 4, rx: 118, ry: 42 },
      { p: 0.68, oy: 0, rx: 96, ry: 88 },
      { p: 1.00, oy: 0, rx: 92, ry: 92 },
    ];

    function easeInCubic(t: number) { return t * t * t; }
    function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }
    function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

    function getClip(p: number) {
      let a = KF[0], b = KF[1];
      for (let i = 0; i < KF.length - 1; i++) {
        if (p >= KF[i].p && p <= KF[i + 1].p) {
          a = KF[i];
          b = KF[i + 1];
          break;
        }
      }
      const span = b.p - a.p;
      const local = span === 0 ? 1 : (p - a.p) / span;
      const e = p < 0.44 ? easeInCubic(local) : easeOutCubic(local);
      return { oy: lerp(a.oy, b.oy, e), rx: lerp(a.rx, b.rx, e), ry: lerp(a.ry, b.ry, e) };
    }

    function clipShape(
      cCtx: CanvasRenderingContext2D,
      ecx: number,
      ecy: number,
      rx: number,
      ry: number,
      fallFraction: number
    ) {
      cCtx.beginPath();
      if (fallFraction > 0.05) {
        const pointY = ecy - ry * 1.35;
        cCtx.arc(
          ecx,
          ecy + ry * 0.1,
          ry * fallFraction * 1.1 + rx * (1 - fallFraction),
          Math.PI * 0.15,
          Math.PI * 0.85
        );
        cCtx.bezierCurveTo(
          ecx - rx * 0.8,
          ecy - ry * 0.3,
          ecx - rx * 0.15,
          pointY + ry * 0.3,
          ecx,
          pointY
        );
        cCtx.bezierCurveTo(
          ecx + rx * 0.15,
          pointY + ry * 0.3,
          ecx + rx * 0.8,
          ecy - ry * 0.3,
          ecx + ((rx * (ry * fallFraction * 1.1 + rx * (1 - fallFraction))) / rx) * 0.95,
          ecy + ry * 0.1 - ry * fallFraction
        );
        cCtx.closePath();
      } else {
        cCtx.ellipse(ecx, ecy, rx, ry, 0, 0, Math.PI * 2);
      }
    }

    let bt = 0;
    let lastT = performance.now();
    let introStart: number | null = null;
    let introDone = false;
    let animFrameId: number;

    function frame(now: number) {
      const dt = now - lastT;
      lastT = now;
      const s = (Math.sin(((now % 5000) / 5000) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
      bt += (0.12 + (2.2 - 0.12) * s) * dt * 0.001;

      ctx.clearRect(0, 0, W, H);
      ctx.save();

      if (!introDone) {
        if (!introStart) introStart = now;
        const p = Math.min(1, (now - introStart) / INTRO_MS);
        const { oy, rx, ry } = getClip(p);
        const ecx = cx;
        const ecy = cy + oy;
        const fallFraction = Math.max(0, Math.min(1, -oy / 140));
        ctx.beginPath();
        clipShape(ctx, ecx, ecy, rx, ry, fallFraction);
        ctx.clip();
        if (p >= 1) {
          introDone = true;
          quixLabelRef.current?.classList.add('show');
          verveBrandRef.current?.classList.add('show');
        }
      } else {
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.clip();
      }

      const bg = ctx.createRadialGradient(cx * 0.84, cy * 0.76, 4, cx, cy, R);
      bg.addColorStop(0.00, '#1a1a2e');
      bg.addColorStop(0.30, '#0f1f3d');
      bg.addColorStop(0.55, '#2a1b4d');
      bg.addColorStop(0.80, '#3d1f4d');
      bg.addColorStop(1.00, '#0f2a3d');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'screen';
      blobs.forEach((b) => {
        const bx = cx + Math.sin(b.fx * bt + b.phase) * R * b.amp;
        const by = cy + Math.cos(b.fy * bt + b.phase * 1.4) * R * b.amp;
        const br = b.r * (1 + 0.08 * Math.sin(b.fx * bt * 2.3 + b.phase));
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        grad.addColorStop(0.00, b.color + 'cc');
        grad.addColorStop(0.35, b.color + '88');
        grad.addColorStop(0.70, b.color + '33');
        grad.addColorStop(1.00, b.color + '00');
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      ctx.restore();
      animFrameId = requestAnimationFrame(frame);
    }

    animFrameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(dropTimer);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  // Slide out loader when app signal or fallback timer triggers
  useEffect(() => {
    let slideTimer: NodeJS.Timeout;
    if (isAppReady && !isSlidingOut) {
      setIsSlidingOut(true);
      slideTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 600);
    }
    return () => clearTimeout(slideTimer);
  }, [isAppReady, isSlidingOut, onComplete]);

  return (
    <>
      {/* Import fonts matching original design */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Syne:wght@700;800&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .quix-white-bg {
          position: fixed;
          inset: 0;
          background: #ffffff;
          z-index: 0;
        }

        .quix-loader-wrapper {
          position: fixed;
          inset: 0;
          background: #050508;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          will-change: transform;
        }

        .quix-loader-wrapper.slide-out {
          transition: transform 0.55s cubic-bezier(0.7, 0, 1, 0.7);
          transform: translateX(110%);
        }

        .quix-center-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          transform: translateY(-130vh);
        }

        .quix-center-block.drop {
          animation: dropFall 1.5s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }

        @keyframes dropFall {
          0%   { transform: translateY(-130vh); }
          72%  { transform: translateY(12px); }
          86%  { transform: translateY(-4px); }
          100% { transform: translateY(0); }
        }

        .quix-label-text {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: .38em;
          color: rgba(255, 255, 255, .3);
          text-transform: uppercase;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .quix-label-text.show {
          opacity: 1;
        }

        .quix-verve-brand {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          letter-spacing: .16em;
          color: rgba(255, 255, 255, .15);
          white-space: nowrap;
          text-transform: uppercase;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .quix-verve-brand.show {
          opacity: 1;
        }

        .quix-verve-brand span {
          color: rgba(255, 255, 255, .28);
          font-weight: 500;
        }
      `}</style>

      <div className="quix-white-bg" />

      <div
        className={`quix-loader-wrapper ${isSlidingOut ? 'slide-out' : ''}`}
      >
        <div className="quix-center-block" ref={centerRef}>
          <canvas ref={canvasRef} width={185} height={185} style={{ display: 'block' }} />
          <div className="quix-label-text" ref={quixLabelRef}>
            QUIX
          </div>
        </div>
        <div className="quix-verve-brand" ref={verveBrandRef}>
          From <span>Verve</span>
        </div>
      </div>
    </>
  );
};

export default LoadingScreen;
