import React, { useState, useRef, useEffect } from "react";

type Language = 'HTML' | 'JSX' | 'TSX';

interface CodeDemo {
  lang: Language;
  userPrompt: string;
  introText: string;
  code: string;
  iframeDoc: string;
}

interface CodeEmbedBlockProps {
  codeText: string;
  lang: Language;
  iframeDoc: string;
}

interface BubbleIndicatorProps {
  dimmed?: boolean;
}

interface CoderPageProps {
  userMessage?: string;
  activeDemo?: CodeDemo;
}

const CopyIcon: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const PlayIcon: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const CloseIcon: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CheckIcon: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const copyTextToClipboard = (text: string): void => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
  } catch (err) {
    console.error("Copy command failed", err);
  }
  document.body.removeChild(textarea);
};

const CodeEmbedBlock: React.FC<CodeEmbedBlockProps> = ({ codeText, lang, iframeDoc }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [previewAnim, setPreviewAnim] = useState<string>("");
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [copyMorph, setCopyMorph] = useState<boolean>(false);
  const [playMorph, setPlayMorph] = useState<boolean>(false);

  const preRef = useRef<HTMLPreElement | null>(null);

  useEffect(() => {
    if (preRef.current) {
      preRef.current.scrollTop = preRef.current.scrollHeight;
    }
  }, [codeText]);

  const handleCopy = () => {
    copyTextToClipboard(codeText);
    setCopyMorph(true);
    setCopied(true);
    setTimeout(() => setCopyMorph(false), 250);

    setTimeout(() => {
      setCopyMorph(true);
      setCopied(false);
      setTimeout(() => setCopyMorph(false), 250);
    }, 2000);
  };

  const handlePreviewToggle = () => {
    const nextOpen = !open;
    setPlayMorph(true);
    setTimeout(() => setPlayMorph(false), 250);

    setOpen(nextOpen);
    if (nextOpen) {
      setPreviewVisible(true);
      setPreviewAnim("expandOverlay");
    } else {
      setPreviewAnim("collapseOverlay");
    }
  };

  const handleOverlayAnimEnd = () => {
    if (previewAnim === "collapseOverlay") {
      setPreviewVisible(false);
      setPreviewAnim("");
    }
  };

  return (
    <div style={styles.codeBlock}>
      <div style={styles.codeHeader}>
        <span style={styles.codeLang}>{lang}</span>
        <div style={styles.codeActions}>
          <button
            onClick={handleCopy}
            title={copied ? "Copied" : "Copy Code"}
            className={`morph-btn ${copyMorph ? "icon-morph" : ""}`}
            style={styles.codeBtn}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
          <button
            onClick={handlePreviewToggle}
            title={open ? "Close Preview" : "Preview Code"}
            className={`morph-btn ${playMorph ? "icon-morph" : ""}`}
            style={styles.codeBtn}
          >
            {open ? <CloseIcon /> : <PlayIcon />}
          </button>
        </div>
      </div>

      <pre ref={preRef} style={styles.pre}>
        <code>{codeText}</code>
      </pre>

      {previewVisible && (
        <div
          style={styles.fullScreenOverlay}
          onAnimationEnd={handleOverlayAnimEnd}
          className={
            previewAnim === "expandOverlay"
              ? "anim-overlay-expand"
              : previewAnim === "collapseOverlay"
              ? "anim-overlay-collapse"
              : ""
          }
        >
          <div style={styles.overlayHeader}>
            <span style={styles.codeLang}>{lang} Live Preview</span>
            <div style={styles.codeActions}>
              <button
                onClick={handleCopy}
                title={copied ? "Copied" : "Copy Code"}
                className={`morph-btn ${copyMorph ? "icon-morph" : ""}`}
                style={styles.codeBtn}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
              <button
                onClick={handlePreviewToggle}
                title="Close Full Screen Preview"
                className={`morph-btn ${playMorph ? "icon-morph" : ""}`}
                style={styles.codeBtn}
              >
                <CloseIcon />
              </button>
            </div>
          </div>
          <iframe
            title="preview"
            sandbox="allow-scripts"
            srcDoc={iframeDoc}
            style={styles.fullIframe}
          />
        </div>
      )}
    </div>
  );
};

interface Blob {
  fx: number;
  fy: number;
  phase: number;
  amp: number;
  r: number;
  color: string;
}

const blobs: Blob[] = [
  { fx: 0.71, fy: 1.13, phase: 0.00, amp: 0.52, r: 15, color: '#00f2ff' },
  { fx: 1.31, fy: 0.83, phase: 1.20, amp: 0.48, r: 14, color: '#ff00c8' },
  { fx: 0.93, fy: 1.41, phase: 2.10, amp: 0.44, r: 13, color: '#39ff14' },
  { fx: 1.17, fy: 0.67, phase: 0.80, amp: 0.50, r: 12, color: '#6e5fff' },
  { fx: 1.53, fy: 1.27, phase: 1.70, amp: 0.38, r: 11, color: '#ff0088' },
  { fx: 0.79, fy: 1.63, phase: 3.00, amp: 0.42, r: 12, color: '#ffff00' },
  { fx: 1.23, fy: 0.91, phase: 4.20, amp: 0.35, r: 11, color: '#00ffdd' },
  { fx: 0.61, fy: 1.37, phase: 5.10, amp: 0.46, r: 13, color: '#a855f7' },
];

function initBubbleAnimation(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { stop: () => {} };
  const W = 32, H = 32, R = 16, cx = 16, cy = 16;
  const SLOW = 0.12, FAST_S = 2.2, CYCLE = 5000;
  let startTime = performance.now(), lastTime = startTime, t = 0, activeId: number;

  function draw(now: number) {
    const dt = now - lastTime; lastTime = now;
    const cycleT = (now - startTime) % CYCLE;
    const s = (Math.sin((cycleT / CYCLE) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
    t += (SLOW + (FAST_S - SLOW) * s) * dt * 0.001;

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();

    const bg = ctx.createRadialGradient(cx * 0.84, cy * 0.76, 1, cx, cy, R);
    bg.addColorStop(0.00, '#1a1a2e');
    bg.addColorStop(0.30, '#0f1f3d');
    bg.addColorStop(0.55, '#2a1b4d');
    bg.addColorStop(0.80, '#3d1f4d');
    bg.addColorStop(1.00, '#0f2a3d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'screen';
    blobs.forEach(b => {
      const bx = cx + Math.sin(b.fx * t + b.phase) * R * b.amp;
      const by = cy + Math.cos(b.fy * t + b.phase * 1.4) * R * b.amp;
      const pulse = 1 + 0.08 * Math.sin(b.fx * t * 2.3 + b.phase);
      const br = b.r * pulse;
      const grad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      grad.addColorStop(0.00, b.color + 'cc');
      grad.addColorStop(0.35, b.color + '88');
      grad.addColorStop(0.70, b.color + '33');
      grad.addColorStop(1.00, b.color + '00');
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fillStyle = grad; ctx.fill();
    });
    ctx.restore();
    activeId = requestAnimationFrame(draw);
  }
  activeId = requestAnimationFrame(draw);
  return { stop: () => cancelAnimationFrame(activeId) };
}

const BubbleIndicator: React.FC<BubbleIndicatorProps> = ({ dimmed }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    const anim = initBubbleAnimation(canvasRef.current);
    return () => anim.stop();
  }, []);
  return (
    <div style={{
      width: 32, height: 32, flexShrink: 0,
      opacity: dimmed ? 0.28 : 1,
      filter: dimmed ? 'saturate(0.15) brightness(0.7)' : 'none',
      transition: 'opacity 0.8s ease, filter 0.8s ease',
    }}>
      <canvas ref={canvasRef} width={32} height={32} style={{ borderRadius: '50%', display: 'block', width: 32, height: 32 }} />
    </div>
  );
};

const CODE_DEMOS: CodeDemo[] = [
  {
    lang: "HTML",
    userPrompt: "Can you build a clean dark UI card using HTML and CSS?",
    introText: "Here is a clean dark UI card built with HTML & CSS:",
    code: `<div class="card" style="padding:24px;font-family:-apple-system,sans-serif;background:#18181b;color:#fff;border-radius:12px;text-align:center;border:1px solid #27272a;">
  <h2 style="font-size:20px;margin-bottom:8px;font-weight:600;">Quix Studio</h2>
  <p style="color:#a1a1aa;font-size:14px;margin-bottom:18px;">Next-generation code previewer powered by Quix Engine.</p>
  <button onclick="alert('Quix Action Initialized!')" style="padding:10px 20px;background:#fff;color:#000;border:none;border-radius:8px;font-weight:600;cursor:pointer;">Launch Demo</button>
</div>`,
    iframeDoc: `<div style="padding:16px;background:#000;min-height:100vh;display:flex;align-items:center;justify-content:center;">
<div style="padding:24px;font-family:-apple-system,sans-serif;background:#18181b;color:#fff;border-radius:12px;text-align:center;border:1px solid #27272a;width:100%;max-width:320px;">
  <h2 style="font-size:20px;margin-bottom:8px;font-weight:600;">Quix Studio</h2>
  <p style="color:#a1a1aa;font-size:14px;margin-bottom:18px;">Next-generation code previewer powered by Quix Engine.</p>
  <button onclick="alert('Quix Action Initialized!')" style="padding:10px 20px;background:#fff;color:#000;border:none;border-radius:8px;font-weight:600;cursor:pointer;">Launch Demo</button>
</div></div>`
  },
  {
    lang: "JSX",
    userPrompt: "Create an interactive counter component in React JSX.",
    introText: "Building an interactive state counter component using React JSX:",
    code: `import React, { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="counter-box">
      <h3>React Counter</h3>
      <div className="count-display">{count}</div>
      <div className="btn-group">
        <button onClick={() => setCount(c => c - 1)}>-</button>
        <button onClick={() => setCount(c => c + 1)}>+</button>
      </div>
    </div>
  );
}`,
    iframeDoc: `<div style="padding:24px;font-family:-apple-system,sans-serif;background:#18181b;color:#fff;border-radius:12px;text-align:center;border:1px solid #27272a;max-width:320px;margin:20px auto;">
  <h3 style="margin-bottom:12px;font-size:18px;">React Counter</h3>
  <div style="font-size:32px;font-weight:700;margin-bottom:16px;color:#38bdf8;">0</div>
  <button onclick="this.previousElementSibling.innerText = parseInt(this.previousElementSibling.innerText) + 1" style="padding:8px 20px;background:#38bdf8;color:#000;border:none;border-radius:8px;font-weight:600;cursor:pointer;">Increment</button>
</div>`
  },
  {
    lang: "TSX",
    userPrompt: "Show me a typed user badge component in React TSX.",
    introText: "Here is a strictly typed user profile card snippet using React TSX:",
    code: `interface UserProps {
  name: string;
  role: 'Admin' | 'Developer';
  active: boolean;
}

export const UserBadge: React.FC<UserProps> = ({ name, role, active }) => {
  return (
    <div className="user-badge">
      <span className={active ? 'status-online' : 'status-offline'} />
      <div>
        <strong>{name}</strong>
        <p>{role}</p>
      </div>
    </div>
  );
};`,
    iframeDoc: `<div style="padding:20px;font-family:-apple-system,sans-serif;background:#18181b;color:#fff;border-radius:12px;border:1px solid #27272a;max-width:320px;margin:20px auto;display:flex;align-items:center;gap:12px;">
  <div style="width:12px;height:12px;background:#4ade80;border-radius:50%;"></div>
  <div>
    <strong style="display:block;font-size:16px;">Aariz</strong>
    <span style="font-size:12px;color:#a1a1aa;">Lead Developer</span>
  </div>
</div>`
  }
];

export default function CoderPage({ userMessage, activeDemo }: CoderPageProps) {
  const [demoIndex, setDemoIndex] = useState<number>(0);
  const [introTyped, setIntroTyped] = useState<string>('');
  const [codeTyped, setCodeTyped] = useState<string>('');
  const [showCodeBlock, setShowCodeBlock] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);

  const currentDemo = activeDemo || CODE_DEMOS[demoIndex];
  const promptText = userMessage || currentDemo.userPrompt;

  useEffect(() => {
    let isCancelled = false;

    const runSequence = async () => {
      setIntroTyped('');
      setCodeTyped('');
      setShowCodeBlock(false);
      setIsDone(false);

      const introChars = currentDemo.introText.split('');
      for (let i = 0; i < introChars.length; i++) {
        if (isCancelled) return;
        await new Promise(r => setTimeout(r, 22));
        setIntroTyped(prev => prev + introChars[i]);
      }

      await new Promise(r => setTimeout(r, 400));
      if (isCancelled) return;

      setShowCodeBlock(true);

      const codeChars = currentDemo.code.split('');
      for (let i = 0; i < codeChars.length; i++) {
        if (isCancelled) return;
        await new Promise(r => setTimeout(r, 14));
        setCodeTyped(prev => prev + codeChars[i]);
      }

      setIsDone(true);

      if (!activeDemo) {
        await new Promise(r => setTimeout(r, 4000));
        if (isCancelled) return;
        setDemoIndex(prev => (prev + 1) % CODE_DEMOS.length);
      }
    };

    runSequence();

    return () => {
      isCancelled = true;
    };
  }, [demoIndex, currentDemo, activeDemo]);

  return (
    <div style={styles.appWrapper}>
      <style>{keyframesCSS}</style>

      <div id="chat-container" style={styles.chatContainer}>
        <div style={styles.chatContent}>
          <div className="message-user">
            {promptText}
          </div>

          <div className="message-ai">
            <div className="ai-content">
              <BubbleIndicator dimmed={isDone} />
              
              <div style={{ width: '100%', maxWidth: 640 }}>
                {introTyped && (
                  <p className="typing-text" style={{ marginBottom: showCodeBlock ? 14 : 0 }}>
                    {introTyped}
                  </p>
                )}

                {showCodeBlock && (
                  <CodeEmbedBlock
                    codeText={codeTyped}
                    lang={currentDemo.lang}
                    iframeDoc={currentDemo.iframeDoc}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const keyframesCSS = `
@keyframes overlayExpand {
  0% { opacity: 0; transform: scale(0.94); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes overlayCollapse {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.94); }
}

@keyframes iconMorphKeyframe {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(0.65) rotate(-90deg); }
  100% { transform: scale(1) rotate(0deg); }
}

.anim-overlay-expand {
  animation: overlayExpand 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.anim-overlay-collapse {
  animation: overlayCollapse 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.morph-btn {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.morph-btn.icon-morph svg {
  animation: iconMorphKeyframe 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

:root { color-scheme: dark; }
* { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }

.message-user {
  align-self: flex-end;
  max-width: 85%;
  margin-left: auto;
  margin-right: 20px;
  background-color: #2d2d30;
  color: #fff;
  padding: 12px 16px;
  border-radius: 18px 18px 4px 18px;
  font-size: 15px;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
  margin-bottom: 24px;
}

.message-ai {
  align-self: flex-start;
  width: 100%;
  padding: 0 20px;
  font-size: 16px;
  line-height: 1.6;
  color: #e5e7eb;
}
.ai-content {
  max-width: 800px;
  margin: 0 auto;
  min-height: 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.typing-text { display: block; line-height: 1.6; color: #e5e7eb; }

pre::-webkit-scrollbar { width: 4px; height: 4px; }
pre::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 2px; }
`;

const styles: { [key: string]: React.CSSProperties } = {
  appWrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#000',
    color: '#fff',
    fontFamily: "'Inter', -apple-system, sans-serif",
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: '32px'
  },
  chatContainer: {
    width: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  chatContent: {
    width: '100%',
    maxWidth: 650,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column'
  },
  codeBlock: {
    width: "100%",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,.12)",
    borderRadius: 8,
    overflow: "hidden",
    background: "#0d0d0f",
    marginTop: 4,
  },
  codeHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 14px",
    background: "#18181b",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "rgba(255,255,255,.07)",
  },
  codeLang: {
    fontSize: 11,
    color: "rgba(255,255,255,.45)",
    letterSpacing: ".08em",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  codeActions: { display: "flex", gap: 7 },
  codeBtn: {
    background: "rgba(255,255,255,.07)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,.1)",
    borderRadius: 8,
    color: "rgba(255,255,255,.75)",
    width: "28px",
    height: "28px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    fontFamily: "inherit",
    transition: "background .15s",
  },
  pre: {
    padding: "14px 16px",
    overflowX: "auto",
    fontSize: 13,
    lineHeight: 1.6,
    color: "#e5e7eb",
    fontFamily: "'Courier New', Courier, monospace",
    height: "132px",
    overflowY: "auto",
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-all"
  },
  fullScreenOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(13, 13, 15, 0.96)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    display: "flex",
    flexDirection: "column",
    width: "100vw",
    height: "100vh",
    transformOrigin: "center center",
  },
  overlayHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    background: "#18181b",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "rgba(255,255,255,.1)",
  },
  fullIframe: {
    width: "100%",
    height: "calc(100vh - 52px)",
    border: "none",
    display: "block",
    background: "#000",
  },
};
