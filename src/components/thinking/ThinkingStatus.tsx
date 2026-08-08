import React, { useEffect, useRef, useState } from "react";
import BubbleIndicator from "../chat/BubbleIndicator";

type StepType = "think" | "search";

interface Step {
  type: StepType;
  text: string;
}

const THINK_STEPS: Step[] = [
  { type: "think", text: "Breaking down what's actually being asked" },
  { type: "search", text: "Searching for relevant context" },
  { type: "think", text: "Connecting the dots across sources" },
  { type: "search", text: "Verifying the latest information" },
  { type: "think", text: "Structuring the answer now" },
];

const DEEP_STEPS: Step[] = [
  { type: "think", text: "Decomposing the problem into research targets" },
  { type: "search", text: "Searching for primary sources" },
  { type: "search", text: "Cross-checking conflicting claims" },
  { type: "think", text: "Weighing evidence quality" },
  { type: "search", text: "Pulling deeper technical references" },
  { type: "think", text: "Resolving contradictions" },
  { type: "think", text: "Drafting the full reasoning chain" },
  { type: "think", text: "Finalizing the answer" },
];

const thinkIconSvg =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2.3v0h6v0c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/></svg>';

const searchIconSvg =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';

const statusCSS = `
.qts-status {
  margin-bottom: 12px;
  width: 100%;
}
.qts-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  user-select: none;
}
.qts-title-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex: 1;
  min-width: 0;
}
.qts-title {
  font-size: 14.5px;
  font-weight: 600;
  color: #6b6f76;
  white-space: nowrap;
  line-height: 1.2;
  transition: color .3s ease;
}
.qts-status.active .qts-title { color: #f5f5f5; }
.qts-status.done .qts-title { color: #8a8f96; }
.qts-meta {
  font-size: 13px;
  color: #55585e;
  line-height: 1.2;
}
.qts-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  color: #8a8f96;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  transition: transform .3s ease;
}
.qts-status.done .qts-toggle { display: inline-flex; }
.qts-toggle.open { transform: rotate(180deg); }
.qts-toggle svg { stroke: currentColor; }
.qts-steps {
  padding: 2px 0 6px 0;
  margin-left: 6px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: max-height .25s cubic-bezier(0.4, 0, 0.2, 1), opacity .2s ease;
}
.qts-steps.hidden {
  max-height: 0;
  opacity: 0;
  padding: 0 0 0 6px;
}
.qts-step {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0 6px 26px;
  font-size: 13px;
  color: #6b6f76;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity .35s ease, transform .35s ease;
}
.qts-step.show { opacity: 1; transform: translateY(0); }
.qts-step::before {
  content: "";
  position: absolute;
  left: 6px;
  top: calc(-50% + 9px);
  bottom: calc(50% + 9px);
  width: 1px;
  background: #26262a;
}
.qts-step:first-child::before { display: none; }
.qts-step-icon {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3f4247;
}
.qts-step-icon svg { display: block; stroke: currentColor; }
.qts-step-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
`;

interface ThinkingStatusProps {
  done: boolean;
  deep?: boolean;
}

export default function ThinkingStatus({ done, deep = false }: ThinkingStatusProps) {
  const steps = deep ? DEEP_STEPS : THINK_STEPS;

  const [elapsed, setElapsed] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const frozenTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (done) return;

    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [done]);

  useEffect(() => {
    if (done) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    steps.forEach((_, index) => {
      timeouts.push(
        setTimeout(() => {
          setVisibleCount(index + 1);
        }, 900 + index * 1400)
      );
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [done, steps]);

  useEffect(() => {
    if (done && frozenTimeRef.current === null) {
      frozenTimeRef.current = elapsed;
    }
  }, [done, elapsed]);

  const finalTime = frozenTimeRef.current ?? elapsed;

  const mins = Math.floor(finalTime / 60);
  const secs = finalTime % 60;
  const timeLabel = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  const stepsHidden = done && !expanded;

  return (
    <div className={`qts-status visible ${done ? "done" : "active"}`}>
      <style>{statusCSS}</style>

      <div className="qts-head">
        <BubbleIndicator size={26} dimmed={done} />

        <div className="qts-title-row">
          <span className="qts-title">
            {done ? `Thought for ${timeLabel}` : "Thinking"}
          </span>

          {!done && <span className="qts-meta">{timeLabel}</span>}

          {done && (
            <button
              className={`qts-toggle ${expanded ? "open" : ""}`}
              onClick={() => setExpanded((prev) => !prev)}
              aria-label="Toggle thought process"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className={`qts-steps ${stepsHidden ? "hidden" : ""}`}>
        {steps.slice(0, done ? steps.length : visibleCount).map((step, i) => (
          <div className="qts-step show" key={i}>
            <span
              className="qts-step-icon"
              dangerouslySetInnerHTML={{
                __html: step.type === "search" ? searchIconSvg : thinkIconSvg,
              }}
            />
            <span className="qts-step-text">{step.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
