import React, { useState, useEffect, useRef, ReactNode } from "react";
import { Search, FileText } from "lucide-react";

interface SourceGroup {
  count: number;
  sources: string[];
}

export interface DeepThinkReasoningProps {
  steps?: string[];
  searchResults?: SourceGroup;
  readPages?: SourceGroup;
  answer?: string;
  isDeepThink?: boolean;
  onComplete?: () => void;
}

type TimelineEvent =
  | { type: "step"; index: number }
  | { type: "search" }
  | { type: "read" };

const EVENT = {
  STEP: "step",
  SEARCH: "search",
  READ: "read",
} as const;

const DOT = ({ color, index }: { color: string; index: number }) => (
  <span
    className="inline-flex w-[18px] h-[18px] rounded-full ring-2 ring-black shrink-0"
    style={{ backgroundColor: color, marginLeft: index === 0 ? 0 : -8 }}
  />
);

function useTypedReveal(fullText: string, active: boolean, speed = 14): string {
  const [shown, setShown] = useState("");
  useEffect(() => {
    if (!active) return;
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setShown(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [active, fullText, speed]);
  return shown;
}

export default function DeepThinkReasoning({
  steps = [
    "Analyzing user query context and establishing retrieval pathways...",
    "Executing deep web queries across knowledge vectors...",
    "Synthesizing logical constraints and structuring final output...",
  ],
  searchResults = { count: 31, sources: ["#10a37f", "#ff4500", "#4285f4", "#f59e0b"] },
  readPages = { count: 4, sources: ["#10a37f", "#ff4500", "#ec4899", "#10a37f"] },
  answer = "Analysis complete. System architecture is fully verified and optimal.",
  isDeepThink = false,
  onComplete,
}: DeepThinkReasoningProps) {
  const timeline: TimelineEvent[] = [
    { type: EVENT.STEP, index: 0 },
    { type: EVENT.SEARCH },
    { type: EVENT.STEP, index: 1 },
    { type: EVENT.READ },
    { type: EVENT.STEP, index: 2 },
  ];

  const [visibleCount, setVisibleCount] = useState(0);
  const [answering, setAnswering] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [isThoughtOpen, setIsThoughtOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const answerText = useTypedReveal(answer, answering, 12);

  // Timer counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Duration: DeepThink = 5+ min (300,000ms), Normal Thinking = 6-15 seconds
  useEffect(() => {
    let i = 0;
    const totalSteps = timeline.length;
    const targetDuration = isDeepThink ? 300000 : Math.floor(Math.random() * 9000) + 6000;
    const intervalTime = targetDuration / totalSteps;

    const id = setInterval(() => {
      i += 1;
      if (i <= totalSteps) {
        setVisibleCount(i);
      } else {
        clearInterval(id);
        setIsDone(true);
        setAnswering(true);
        if (onComplete) onComplete();
      }
    }, intervalTime);

    return () => clearInterval(id);
  }, [isDeepThink, timeline.length, onComplete]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [visibleCount, answerText]);

  const visibleEvents = timeline.slice(0, visibleCount);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return mins > 0 ? `${mins}m ${s}s` : `${s}s`;
  };

  return (
    <div className="w-full text-white font-[Inter,sans-serif]" ref={scrollRef}>
      <style>{`
        @keyframes fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade { animation: fadein 0.4s ease-out forwards; }
      `}</style>

      {/* Header bar */}
      <div className="flex items-center gap-3 py-2 select-none">
        <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 animate-pulse shrink-0 flex items-center justify-center">
          <div className="w-[14px] h-[14px] rounded-full bg-black/40" />
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={() => isDone && setIsThoughtOpen(!isThoughtOpen)}
            className="flex items-center gap-1 bg-transparent border-none text-[14.5px] font-semibold text-white/70 hover:text-white cursor-pointer p-0"
          >
            <span>{isDone ? "Thought process" : "Thinking"}</span>
            {isDone && (
              <span className={`transition-transform duration-300 text-xs ${isThoughtOpen ? "rotate-180" : "rotate-0"}`}>
                ▼
              </span>
            )}
          </button>
          <span className="text-white/30 text-xs">•</span>
          <span className="text-[13px] text-white/50">{formatTime(elapsed)}</span>
          <span className="text-white/30 text-xs">•</span>
          <button
            onClick={() => setIsSourcesOpen(!isSourcesOpen)}
            className="bg-transparent border-none text-[12.5px] text-white/60 hover:text-white cursor-pointer flex items-center gap-1 p-1 rounded hover:bg-white/5 transition"
          >
            <span>Sources</span>
            <span className={`transition-transform duration-300 text-xs ${isSourcesOpen ? "rotate-180" : "rotate-0"}`}>▼</span>
          </button>
        </div>
      </div>

      {/* Sources Dropdown */}
      {isSourcesOpen && (
        <div className="flex flex-col gap-1.5 my-2 pl-2 animate-fade">
          <div className="text-xs text-white/40">Found {searchResults.count} web pages & read {readPages.count} pages</div>
          <div className="flex flex-wrap gap-2">
            <a href="#" onClick={(e) => e.preventDefault()} className="text-xs text-white/70 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 hover:bg-white/10 transition">
              <FileText size={13} className="text-white/50" /> quix-docs.dev/architecture-v3
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-xs text-white/70 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 hover:bg-white/10 transition">
              <Search size={13} className="text-white/50" /> supabase.com/guides/edge-functions
            </a>
          </div>
        </div>
      )}

      {/* Timeline Steps */}
      <div className={`relative pl-4 space-y-3 my-3 transition-all duration-300 ${isDone && !isThoughtOpen ? "max-h-0 overflow-hidden opacity-0" : "max-h-[500px] opacity-100"}`}>
        <div className="absolute left-0 top-0 bottom-0 w-px bg-white/15" aria-hidden="true" />
        {visibleEvents.map((ev, i) => (
          <TimelineItem key={i} event={ev} steps={steps} searchResults={searchResults} readPages={readPages} />
        ))}
      </div>

      {/* Answer Stream */}
      {answering && (
        <div className="mt-4 text-[14.5px] leading-relaxed text-white/95 whitespace-pre-wrap animate-fade">
          {formatBold(answerText)}
          {answerText.length < answer.length && (
            <span className="inline-block w-[7px] h-[16px] bg-white/70 ml-0.5 align-middle animate-pulse" />
          )}
        </div>
      )}
    </div>
  );
}

function TimelineItem({
  event,
  steps,
  searchResults,
  readPages,
}: {
  event: TimelineEvent;
  steps: string[];
  searchResults: SourceGroup;
  readPages: SourceGroup;
}) {
  if (event.type === EVENT.STEP) {
    return (
      <div className="flex gap-2.5 animate-fade items-center">
        <span className="w-[18px] h-[18px] flex items-center justify-center shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
        </span>
        <p className="text-white/60 text-[13.5px] leading-relaxed">{steps[event.index] ?? steps[0]}</p>
      </div>
    );
  }

  if (event.type === EVENT.SEARCH) {
    return (
      <div className="flex flex-col gap-1.5 animate-fade">
        <span className="flex items-center gap-2">
          <span className="w-[18px] h-[18px] flex items-center justify-center shrink-0">
            <Search size={14} className="text-white/40" />
          </span>
          <span className="text-white/50 text-[13.5px]">Found {searchResults.count} web pages</span>
        </span>
        <span className="flex ml-[26px]">
          {searchResults.sources.map((c, i) => (
            <DOT key={i} color={c} index={i} />
          ))}
        </span>
      </div>
    );
  }

  if (event.type === EVENT.READ) {
    return (
      <div className="flex flex-col gap-1.5 animate-fade">
        <span className="flex items-center gap-2">
          <span className="w-[18px] h-[18px] flex items-center justify-center shrink-0">
            <FileText size={14} className="text-white/40" />
          </span>
          <span className="text-white/50 text-[13.5px]">Read {readPages.count} pages</span>
        </span>
        <span className="flex ml-[26px]">
          {readPages.sources.map((c, i) => (
            <DOT key={i} color={c} index={i} />
          ))}
        </span>
      </div>
    );
  }

  return null;
}

function formatBold(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i}>{p.slice(2, -2)}</strong>
    ) : (
      <React.Fragment key={i}>{p}</React.Fragment>
    )
  );
     }
