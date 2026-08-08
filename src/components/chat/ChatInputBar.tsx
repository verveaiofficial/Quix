import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  MouseEvent,
  TouchEvent,
} from "react";

export interface PendingAttachment {
  id: string;
  name: string;
  kind: "image" | "pdf" | "text";
  mimeType: string;
  base64: string;
  text?: string;
  previewUrl?: string;
}

interface ChatInputBarProps {
  onSend?: (text: string, attachments: PendingAttachment[]) => void;
}

const rid = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function readFileAsAttachment(file: File): Promise<PendingAttachment | null> {
  return new Promise((resolve) => {
    if (file.size > 4 * 1024 * 1024) {
      resolve(null);
      return;
    }

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    const isText =
      file.type.startsWith("text/") ||
      /\.(md|txt|json|js|ts|tsx|jsx|html|css|csv)$/i.test(file.name);

    const reader = new FileReader();

    if (isImage || isPdf) {
      reader.onload = () => {
        const result = String(reader.result || "");
        const base64 = result.split(",")[1] || "";

        resolve({
          id: rid(),
          name: file.name,
          kind: isImage ? "image" : "pdf",
          mimeType: file.type,
          base64,
          previewUrl: isImage ? result : undefined,
        });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    } else if (isText) {
      reader.onload = () => {
        resolve({
          id: rid(),
          name: file.name,
          kind: "text",
          mimeType: file.type || "text/plain",
          base64: "",
          text: String(reader.result || ""),
        });
      };
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    } else {
      resolve(null);
    }
  });
}

const inputCSS = `
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
button { outline: none !important; -webkit-appearance: none; }
.input-wrapper { position: fixed; left: 0; right: 0; bottom: 0; padding: 8px 16px 14px 16px; background: linear-gradient(to top, #000 60%, transparent); z-index: 10; width: 100%; transition: bottom 0.05s linear; }
.input-bar { background: rgba(255, 255, 255, 0.045); backdrop-filter: blur(40px) saturate(200%) brightness(1.1); -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.1); border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45), 0 1px 0 rgba(255, 255, 255, 0.08) inset, 0 -1px 0 rgba(0, 0, 0, 0.3) inset; border-radius: 16px; width: 100%; max-width: 650px; margin: 0 auto; padding: 14px 18px 12px 18px; display: flex; flex-direction: column; position: relative; transition: border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease; }
.input-bar::before { content: ''; position: absolute; inset: 0; border-radius: 16px; background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 60%, transparent 100%); pointer-events: none; }
.input-bar:focus-within { border-color: rgba(255, 255, 255, 0.22); background: rgba(255, 255, 255, 0.065); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255,255,255,0.06), 0 1px 0 rgba(255, 255, 255, 0.1) inset; }
.attach-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; position: relative; z-index: 1; }
.attach-chip { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 6px 10px; font-size: 12px; color: rgba(255,255,255,0.75); max-width: 200px; }
.attach-chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.attach-thumb { width: 34px; height: 34px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(255,255,255,0.15); }
.attach-remove { background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; font-size: 14px; padding: 0 2px; line-height: 1; }
.attach-remove:hover { color: #fff; }
textarea { background: transparent; border: none; outline: none; color: #fff; -webkit-text-fill-color: #fff; caret-color: #fff; font-size: 16px; font-family: inherit; width: 100%; resize: none; min-height: 40px; max-height: 250px; line-height: 1.5; margin-bottom: 6px; position: relative; z-index: 1; }
textarea::placeholder { color: rgba(255,255,255,0.28); -webkit-text-fill-color: rgba(255,255,255,0.28); }
.action-row { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
.plus-btn { background: transparent; border: none; outline: none; color: rgba(255,255,255,0.4); width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 50%; transition: color 0.15s; position: relative; }
.plus-btn:active { color: #fff; }
.plus-btn.spin-cw svg { animation: spinCW 0.75s cubic-bezier(0.25, 0, 0.2, 1) forwards; }
.plus-btn.spin-ccw svg { animation: spinCCW 0.75s cubic-bezier(0.25, 0, 0.2, 1) forwards; }
@keyframes spinCW { from { transform: rotate(0deg); } to { transform: rotate(720deg); } }
@keyframes spinCCW { from { transform: rotate(0deg); } to { transform: rotate(-720deg); } }
.upload-menu { position: absolute; bottom: calc(100% + 10px); left: 0; background: rgba(18, 18, 22, 0.82); border: 1px solid rgba(255, 255, 255, 0.13); border-radius: 14px; overflow: hidden; min-width: 180px; box-shadow: 0 12px 32px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.06) inset; backdrop-filter: blur(30px) saturate(180%); -webkit-backdrop-filter: blur(30px) saturate(180%); z-index: 50; opacity: 0; pointer-events: none; transform: translateY(8px) scale(0.96); transform-origin: bottom left; transition: opacity 0.22s cubic-bezier(0.4,0,0.2,1), transform 0.22s cubic-bezier(0.4,0,0.2,1); }
.upload-menu.show { opacity: 1; pointer-events: all; transform: translateY(0) scale(1); }
.upload-opt { display: flex; align-items: center; gap: 12px; padding: 13px 16px; cursor: pointer; font-size: 14px; color: rgba(255,255,255,0.8); transition: background 0.15s, color 0.15s; border-bottom: 1px solid rgba(255,255,255,0.04); }
.upload-opt:last-child { border-bottom: none; }
.upload-opt:hover { background: rgba(255,255,255,0.08); color: #fff; }
.send-btn { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.1); outline: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; backdrop-filter: blur(10px); transition: background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease; }
.send-btn:not(:disabled) { background: #fff; border-color: transparent; }
.send-btn:not(:disabled) svg { stroke: #000; }
.send-btn:disabled { opacity: 0.25; cursor: not-allowed; }
.send-btn:disabled svg { stroke: rgba(255,255,255,0.6); }
`;

export default function ChatInputBar({ onSend }: ChatInputBarProps) {
  const [inputValue, setInputValue] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [spinClass, setSpinClass] = useState("");
  const [bottomOffset, setBottomOffset] = useState(0);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);

  const spinDirRef = useRef(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    setInputValue(value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        250
      )}px`;
    }
  };

  const preventFocusLoss = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
  };

  const toggleUploadMenu = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    setSpinClass("");

    setTimeout(() => {
      const cls = spinDirRef.current === 1 ? "spin-cw" : "spin-ccw";
      setSpinClass(cls);
      spinDirRef.current *= -1;
    }, 10);

    setMenuOpen((prev) => !prev);

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const triggerFile = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    closeMenu();
    fileInputRef.current?.click();
  };

  const triggerImage = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    closeMenu();
    imageInputRef.current?.click();
  };

  const handleFilesPicked = async (files: FileList | null) => {
    if (!files) return;

    const list = Array.from(files);

    const parsed = await Promise.all(list.map(readFileAsAttachment));

    const valid = parsed.filter(
      (item): item is PendingAttachment => item !== null
    );

    setAttachments((prev) => [...prev, ...valid]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSend = () => {
    const text = inputValue.trim();

    if (!text && attachments.length === 0) return;

    onSend?.(text, attachments);

    setInputValue("");
    setAttachments([]);

    if (textareaRef.current) {
      textareaRef.current.blur();
      textareaRef.current.style.height = "40px";
    }
  };

  useEffect(() => {
    const handleGlobalClick = () => {
      setMenuOpen(false);
    };

    document.addEventListener("click", handleGlobalClick);

    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  useEffect(() => {
    const handleViewportResize = () => {
      if (window.visualViewport) {
        const kb =
          window.innerHeight -
          window.visualViewport.height -
          window.visualViewport.offsetTop;

        setBottomOffset(Math.max(0, kb));
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          handleViewportResize
        );
      }
    };
  }, []);

  const handleBlur = () => {
    if (!menuOpen) {
      setBottomOffset(0);
    }
  };

  return (
    <>
      <style>{inputCSS}</style>

      <input
        type="file"
        ref={fileInputRef}
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          handleFilesPicked(e.target.files);
          e.target.value = "";
        }}
      />

      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          handleFilesPicked(e.target.files);
          e.target.value = "";
        }}
      />

      <div
        className="input-wrapper"
        style={{ bottom: `${bottomOffset}px` }}
      >
        <div className="input-bar">
          {attachments.length > 0 && (
            <div className="attach-row">
              {attachments.map((attachment) => (
                <div className="attach-chip" key={attachment.id}>
                  {attachment.kind === "image" && attachment.previewUrl ? (
                    <img
                      className="attach-thumb"
                      src={attachment.previewUrl}
                      alt={attachment.name}
                    />
                  ) : null}

                  <span>{attachment.name}</span>

                  <button
                    className="attach-remove"
                    onClick={() => removeAttachment(attachment.id)}
                    aria-label="Remove attachment"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            ref={textareaRef}
            placeholder="Ask Quix..."
            rows={1}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />

          <div className="action-row">
            <div style={{ position: "relative" }}>
              <button
                className={`plus-btn ${spinClass}`}
                onClick={toggleUploadMenu}
                onMouseDown={preventFocusLoss}
                onTouchStart={preventFocusLoss}
                aria-label="Upload options"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>

              <div className={`upload-menu ${menuOpen ? "show" : ""}`}>
                <div
                  className="upload-opt"
                  onClick={triggerFile}
                  onMouseDown={preventFocusLoss}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Upload file
                </div>

                <div
                  className="upload-opt"
                  onClick={triggerImage}
                  onMouseDown={preventFocusLoss}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  Upload image
                </div>
              </div>
            </div>

            <button
              className="send-btn"
              disabled={!inputValue.trim() && attachments.length === 0}
              onClick={handleSend}
              aria-label="Send message"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}