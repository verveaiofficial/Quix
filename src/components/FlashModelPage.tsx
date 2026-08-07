import React, { useEffect, useRef } from "react";

interface FlashModelPageProps {
  /** User query text passed from chat logic */
  userMessage?: string;
  /** Response text from model API */
  responseText?: string;
  /** Controls if model is actively thinking/processing */
  isThinking?: boolean;
}

const defaultAnswer =
  "QUIX is structured around a highly modular, event-driven microservices architecture. It leverages Supabase Edge Functions for fast serverless execution, integrated with real-time vector embeddings for context-aware processing.";

type BubbleAnim = {
  stop: () => void;
  setGrey: (greyState: boolean) => void;
};

export const FlashModelPage: React.FC<FlashModelPageProps> = ({
  userMessage = "How's QUIX's architecture structured right now?",
  responseText = defaultAnswer,
  isThinking = false,
}) => {
  const phaseBlockRef = useRef<HTMLDivElement>(null);
  const responseBlockRef = useRef<HTMLDivElement>(null);
  const orbPhaseRef = useRef<HTMLCanvasElement>(null);
  const responseTextRef = useRef<HTMLDivElement>(null);

  const currentPhaseAnimRef = useRef<BubbleAnim | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    function wait(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function initBubbleAnimation(canvas: HTMLCanvasElement, isGreyInit = false): BubbleAnim {
      const ctx = canvas.getContext("2d")!;
      const W = 26,
        H = 26,
        R = 13,
        cx = 13,
        cy = 13;

      const vibrantBlobs = [
        { fx: 0.71, fy: 1.13, phase: 0.0, amp: 0.52, r: 12, color: "#00f2ff" },
        { fx: 1.31, fy: 0.83, phase: 1.2, amp: 0.48, r: 11, color: "#ff00c8" },
        { fx: 0.93, fy: 1.41, phase: 2.1, amp: 0.44, r: 10, color: "#39ff14" },
        { fx: 1.17, fy: 0.67, phase: 0.8, amp: 0.5, r: 9, color: "#6e5fff" },
        { fx: 1.53, fy: 1.27, phase: 1.7, amp: 0.38, r: 9, color: "#ff0088" },
        { fx: 0.79, fy: 1.63, phase: 3.0, amp: 0.42, r: 10, color: "#ffff00" },
        { fx: 1.23, fy: 0.91, phase: 4.2, amp: 0.35, r: 9, color: "#00ffdd" },
        { fx: 0.61, fy: 1.37, phase: 5.1, amp: 0.46, r: 10, color: "#a855f7" },
      ];

      const greyBlobs = [
        { fx: 0.71, fy: 1.13, phase: 0.0, amp: 0.52, r: 12, color: "#e0e0e0" },
        { fx: 1.31, fy: 0.83, phase: 1.2, amp: 0.48, r: 11, color: "#8a8a8a" },
        { fx: 0.93, fy: 1.41, phase: 2.1, amp: 0.44, r: 10, color: "#b5b5b5" },
        { fx: 1.17, fy: 0.67, phase: 0.8, amp: 0.5, r: 9, color: "#666666" },
        { fx: 1.53, fy: 1.27, phase: 1.7, amp: 0.38, r: 9, color: "#cccccc" },
        { fx: 0.79, fy: 1.63, phase: 3.0, amp: 0.42, r: 10, color: "#444444" },
        { fx: 1.23, fy: 0.91, phase: 4.2, amp: 0.35, r: 9, color: "#d9d9d9" },
        { fx: 0.61, fy: 1.37, phase: 5.1, amp: 0.46, r: 10, color: "#777777" },
      ];

      let blobs = isGreyInit ? greyBlobs : vibrantBlobs;
      let isGrey = isGreyInit;
      const SLOW = 0.12,
        FAST_S = 2.2,
        CYCLE = 5000;
      let startTime = performance.now(),
        lastTime = startTime,
        t = 0,
        id: number;

      function draw(now: number) {
        const dt = now - lastTime;
        lastTime = now;
        const cycleT = (now - startTime) % CYCLE;
        const s = (Math.sin((cycleT / CYCLE) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
        t += (SLOW + (FAST_S - SLOW) * s) * dt * 0.001;
        ctx.clearRect(0, 0, W, H);
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.clip();

        const bg = ctx.createRadialGradient(cx * 0.84, cy * 0.76, 1, cx, cy, R);
        if (isGrey) {
          bg.addColorStop(0.0, "#2a2a30");
          bg.addColorStop(0.3, "#1a1a20");
          bg.addColorStop(0.55, "#121216");
          bg.addColorStop(0.8, "#0c0c10");
          bg.addColorStop(1.0, "#050508");
        } else {
          bg.addColorStop(0.0, "#1a1a2e");
          bg.addColorStop(0.3, "#0f1f3d");
          bg.addColorStop(0.55, "#2a1b4d");
          bg.addColorStop(0.8, "#3d1f4d");
          bg.addColorStop(1.0, "#0f2a3d");
        }

        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = "screen";
        blobs.forEach((b) => {
          const bx = cx + Math.sin(b.fx * t + b.phase) * R * b.amp;
          const by = cy + Math.cos(b.fy * t + b.phase * 1.4) * R * b.amp;
          const pulse = 1 + 0.08 * Math.sin(b.fx * t * 2.3 + b.phase);
          const br = b.r * pulse;
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
        id = requestAnimationFrame(draw);
      }
      id = requestAnimationFrame(draw);
      return {
        stop: () => cancelAnimationFrame(id),
        setGrey: (greyState: boolean) => {
          blobs = greyState ? greyBlobs : vibrantBlobs;
          isGrey = greyState;
        },
      };
    }

    async function runPhaseStage() {
      const block = phaseBlockRef.current;
      const canvas = orbPhaseRef.current;

      if (!block || !canvas) return;

      block.classList.add("visible", "active");
      canvas.classList.remove("dimmed");
      canvas.classList.add("show");
      currentPhaseAnimRef.current = initBubbleAnimation(canvas, false);

      // Flash model thinking duration: 3 to 9 seconds
      const thinkingDuration = Math.floor(Math.random() * 6000) + 3000;
      await wait(thinkingDuration);

      block.classList.remove("active");
      block.classList.add("done");
    }

    async function streamMessage(fullText: string) {
      const responseBlock = responseBlockRef.current;
      const textContainer = responseTextRef.current;

      if (responseBlock) responseBlock.classList.add("visible");

      await wait(250);

      let currentText = "";
      const words = fullText.split(" ");
      for (let i = 0; i < words.length; i++) {
        currentText += (i === 0 ? "" : " ") + words[i];
        if (textContainer) textContainer.textContent = currentText;
        await wait(30 + Math.random() * 25);
      }

      await wait(400);

      if (currentPhaseAnimRef.current) {
        currentPhaseAnimRef.current.setGrey(true);
      }
      if (orbPhaseRef.current) {
        orbPhaseRef.current.classList.add("dimmed");
      }
    }

    function resetAll() {
      if (currentPhaseAnimRef.current) {
        currentPhaseAnimRef.current.stop();
        currentPhaseAnimRef.current = null;
      }

      phaseBlockRef.current?.classList.remove("visible", "active", "done");

      if (orbPhaseRef.current) {
        orbPhaseRef.current.classList.remove("show", "dimmed");
      }

      if (responseBlockRef.current) responseBlockRef.current.classList.remove("visible");
      if (responseTextRef.current) responseTextRef.current.textContent = "";
    }

    async function run() {
      resetAll();
      await wait(400);
      if (!mountedRef.current) return;

      await runPhaseStage();
      await wait(300);
      if (!mountedRef.current) return;

      await streamMessage(responseText);
    }

    run();

    return () => {
      mountedRef.current = false;
      if (currentPhaseAnimRef.current) currentPhaseAnimRef.current.stop();
    };
  }, [responseText, userMessage, isThinking]);

  return (
    <div className="aisc-body">
      <style>{`
        :root {
          --bg: #000000;
          --card: #0e0e10;
          --muted: #6b6f76;
          --active: #f5f5f5;
          --done: #8a8f96;
          --radius: 14px;
        }
        * { box-sizing: border-box; }
        .aisc-body {
          margin: 0;
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 40px 24px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .wrap {
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
        }

        .message-user {
          align-self: flex-end;
          max-width: 85%;
          margin-left: auto;
          margin-bottom: 24px;
          background-color: #1e1e20;
          color: #ffffff;
          padding: 12px 16px;
          border-radius: 18px 18px 4px 18px;
          font-size: 15px;
          line-height: 1.5;
          word-wrap: break-word;
          white-space: pre-wrap;
          width: fit-content;
        }

        .status {
          margin-bottom: 12px;
          opacity: 0;
          transform: translateY(8px);
          max-height: 0;
          overflow: hidden;
          transition: opacity .45s cubic-bezier(0.4, 0, 0.2, 1), transform .45s cubic-bezier(0.4, 0, 0.2, 1), max-height .45s cubic-bezier(0.4, 0, 0.2, 1), margin-bottom .45s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .status.visible {
          opacity: 1;
          transform: translateY(0);
          max-height: 640px;
        }

        .status-head {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
          user-select: none;
        }

        .icon-slot {
          width: 26px;
          height: 26px;
          flex-shrink: 0;
          position: relative;
        }
        .bubble-canvas {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: block;
          opacity: 0;
          transition: opacity .5s ease, filter .5s ease;
        }
        .bubble-canvas.show { opacity: 1; }
        .bubble-canvas.dimmed { opacity: 0.35; filter: grayscale(100%); }

        .response-container {
          margin-top: 0px;
          opacity: 0;
          transform: translateY(6px);
          max-height: 0;
          overflow: hidden;
          transition: opacity .45s cubic-bezier(0.4, 0, 0.2, 1), transform .45s cubic-bezier(0.4, 0, 0.2, 1), max-height .45s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .response-container.visible {
          opacity: 1;
          transform: translateY(0);
          max-height: 500px;
        }
        .response-content {
          font-size: 14.5px;
          line-height: 1.6;
          color: #e0e0e0;
          word-wrap: break-word;
          white-space: pre-wrap;
          padding-left: 0px;
          margin-top: 4px;
        }
      `}</style>

      <div className="wrap">
        <div className="message-user">{userMessage}</div>

        <div className="status" id="phase-block" ref={phaseBlockRef}>
          <div className="status-head">
            <div className="icon-slot">
              <canvas className="bubble-canvas" id="orb-phase" width={26} height={26} ref={orbPhaseRef} />
            </div>
          </div>
        </div>

        <div className="response-container" id="response-block" ref={responseBlockRef}>
          <div className="response-content" id="response-text" ref={responseTextRef} />
        </div>
      </div>
    </div>
  );
};

export default FlashModelPage;
