import React, { useState, useRef, useEffect } from "react";

export type CodeLanguage = "HTML" | "JSX" | "TSX";

interface CodeEmbedBlockProps {
  codeText: string;
  lang: CodeLanguage;
  iframeDoc?: string;
}

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

const CopyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const PlayIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

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
.anim-overlay-expand { animation: overlayExpand 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.anim-overlay-collapse { animation: overlayCollapse 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
.morph-btn { transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.morph-btn.icon-morph svg { animation: iconMorphKeyframe 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
.ceb-pre::-webkit-scrollbar { width: 4px; height: 4px; }
.ceb-pre::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 2px; }
`;

const styles: { [key: string]: React.CSSProperties } = {
  codeBlock: {
    width: "100%",
    borderWidth: 1,
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
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "rgba(255,255,255,.07)",
  },
  codeLang: {
    fontSize: 11,
    color: "rgba(255,255,255,.45)",
    letterSpacing: ".08em",
    fontWeight: 600,
    textTransform: "uppercase",
  },
  codeActions: { display: "flex", gap: 7 },
  codeBtn: {
    background: "rgba(255,255,255,.07)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,.1)",
    borderRadius: 8,
    color: "rgba(255,255,255,.75)",
    width: 28,
    height: 28,
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
    height: 132,
    overflowY: "auto",
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
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
    borderBottomWidth: 1,
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

export default function CodeEmbedBlock({
  codeText,
  lang,
  iframeDoc,
}: CodeEmbedBlockProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [previewAnim, setPreviewAnim] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [copyMorph, setCopyMorph] = useState(false);
  const [playMorph, setPlayMorph] = useState(false);
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
      <style>{keyframesCSS}</style>

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

          {iframeDoc && (
            <button
              onClick={handlePreviewToggle}
              title={open ? "Close Preview" : "Preview Code"}
              className={`morph-btn ${playMorph ? "icon-morph" : ""}`}
              style={styles.codeBtn}
            >
              {open ? <CloseIcon /> : <PlayIcon />}
            </button>
          )}
        </div>
      </div>

      <pre ref={preRef} className="ceb-pre" style={styles.pre}>
        <code>{codeText}</code>
      </pre>

      {previewVisible && iframeDoc && (
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
}
