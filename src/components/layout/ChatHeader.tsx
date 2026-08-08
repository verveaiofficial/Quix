import React, { useEffect, useRef, useState } from "react";
import { MODELS, ModelId } from "../../config/models";
import { useChatStore } from "../../store/chatStore";
import { useUIStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import { renameChat, deleteChat } from "../../lib/history";

const MODEL_ORDER: ModelId[] = [
  "flash",
  "lite",
  "coder",
  "thinking",
  "deepthink",
  "imagine",
];

const headerCSS = `
:root { color-scheme: dark; }
* { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent !important; outline: none !important; }
*:focus, *:active, *::focus-visible { outline: none !important; box-shadow: none !important; -webkit-tap-highlight-color: transparent !important; }
#chat-header { position: fixed; top: 0; left: 0; right: 0; height: 56px; z-index: 30; display: flex; align-items: center; justify-content: space-between; padding: 0 14px; background: rgba(18,18,22,0.94); border-bottom: 1px solid rgba(255,255,255,0.12); backdrop-filter: blur(40px) saturate(200%) brightness(1.1); -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.1); box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.08) inset, 0 -1px 0 rgba(0,0,0,0.3) inset; }
#chat-header::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 60%, transparent 100%); pointer-events: none; z-index: 0; }
.chat-hamburger { background: none; border: none; cursor: pointer; padding: 6px; display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; color: #ffffff; position: relative; z-index: 1; }
.chat-hamburger span { display: block; height: 1.5px; border-radius: 1px; background: currentColor; }
.chat-hamburger span:nth-child(1) { width: 14px; }
.chat-hamburger span:nth-child(2) { width: 10px; }
.chat-hamburger span:nth-child(3) { width: 14px; }
.header-center { flex: 1; display: flex; justify-content: center; align-items: center; position: relative; z-index: 1; }
.status-badge { display: flex; align-items: center; gap: 6px; color: rgba(255,255,255,.85); font-size: 14px; font-weight: 500; cursor: pointer; padding: 6px 12px; border-radius: 20px; user-select: none; }
.chevron-icon { width: 10px; height: 10px; stroke-width: 2.5; color: #9ba1a6; transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1); }
.status-badge.active .chevron-icon { transform: rotate(90deg); }
.beta-tag { color: #9ba1a6; margin-left: 3px; font-size: inherit; font-weight: inherit; }
.mode-menu { position: fixed; top: 64px; left: 50%; transform: translate(-50%, -12px); background: rgba(18,18,22,0.96); border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; width: 260px; padding: 6px 4px; display: flex; flex-direction: column; gap: 4px; backdrop-filter: blur(40px) saturate(200%) brightness(1.1); -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.1); box-shadow: 0 16px 40px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.08) inset; z-index: 25; opacity: 0; visibility: hidden; pointer-events: none; transition: opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1), transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.28s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; }
.mode-menu::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 60%, transparent 100%); pointer-events: none; }
.mode-menu.show { opacity: 1; visibility: visible; pointer-events: all; transform: translate(-50%, 0); }
.mode-item { padding: 10px 8px; border-radius: 10px; color: #ffffff; cursor: pointer; display: flex; flex-direction: row; align-items: center; gap: 8px; transition: background 0.2s ease; position: relative; z-index: 1; }
.mode-item:hover { background: rgba(255, 255, 255, 0.04); }
.mode-item-content { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.mode-title { font-size: 13.5px; font-weight: 500; display: flex; align-items: center; }
.mode-desc { font-size: 11px; color: #9ba1a6; line-height: 1.3; }
.mode-checkmark-svg { width: 15px; height: 15px; stroke: #ffffff; stroke-width: 2.2; flex-shrink: 0; }
.hdr-dots-btn { background: none; border: none; cursor: pointer; padding: 6px; display: flex; align-items: center; justify-content: center; color: #ffffff; border-radius: 8px; flex-shrink: 0; width: 36px; height: 36px; position: relative; z-index: 1; }
.dots-container { position: relative; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; }
.dots-container span { position: absolute; background: currentColor; transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.32s cubic-bezier(0.4, 0, 0.2, 1), width 0.32s cubic-bezier(0.4, 0, 0.2, 1), height 0.32s cubic-bezier(0.4, 0, 0.2, 1), left 0.32s cubic-bezier(0.4, 0, 0.2, 1), top 0.32s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.32s cubic-bezier(0.4, 0, 0.2, 1); }
.dots-container span:nth-child(1) { left: 0px; top: 7.5px; width: 3px; height: 3px; border-radius: 50%; }
.dots-container span:nth-child(2) { left: 7.5px; top: 7.5px; width: 3px; height: 3px; border-radius: 50%; }
.dots-container span:nth-child(3) { left: 15px; top: 7.5px; width: 3px; height: 3px; border-radius: 50%; }
.hdr-dots-btn.active .dots-container span:nth-child(1) { left: 0px; top: 8px; width: 18px; height: 1.5px; border-radius: 2px; transform: rotate(45deg); }
.hdr-dots-btn.active .dots-container span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.hdr-dots-btn.active .dots-container span:nth-child(3) { left: 0px; top: 8px; width: 18px; height: 1.5px; border-radius: 2px; transform: rotate(-45deg); }
#chat-options-menu { position: fixed; top: 64px; right: 14px; background: rgba(18,18,22,0.96); border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; overflow: hidden; min-width: 180px; backdrop-filter: blur(40px) saturate(200%) brightness(1.1); -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.1); box-shadow: 0 16px 40px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.08) inset; z-index: 25; opacity: 0; pointer-events: none; transition: opacity 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94), visibility 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
#chat-options-menu::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 60%, transparent 100%); pointer-events: none; z-index: 0; }
#chat-options-menu.show { opacity: 1; pointer-events: all; }
.chat-opt { padding: 14px 18px; cursor: pointer; font-size: 14px; color: rgba(255,255,255,.8); display: flex; align-items: center; gap: 12px; transition: background 0.15s; border-bottom: 1px solid rgba(255,255,255,.06); position: relative; z-index: 1; }
.chat-opt:last-child { border-bottom: none; }
.chat-opt:hover { background: rgba(255, 255, 255, 0.04); }
.chat-opt.danger { color: #ff5f5f; }
.chat-opt.danger:hover { background: rgba(255, 60, 60, 0.06); }
#rename-modal { position: fixed; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.7); backdrop-filter: blur(6px); opacity: 0; pointer-events: none; transition: opacity .2s; }
#rename-modal.show { opacity: 1; pointer-events: all; }
.rename-box { background: rgba(255,255,255,0.055); border: 1px solid rgba(255,255,255,0.14); border-radius: 20px; padding: 24px 20px; width: calc(100% - 48px); max-width: 340px; backdrop-filter: blur(40px) saturate(200%) brightness(1.1); -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.1); box-shadow: 0 8px 32px rgba(0,0,0,0.5); position: relative; overflow: hidden; }
.rename-box::before { content: ''; position: absolute; inset: 0; border-radius: 20px; background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 60%, transparent 100%); pointer-events: none; }
.rename-box h3 { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 16px; position: relative; z-index: 1; }
.rename-input { width: 100%; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 12px 14px; color: #fff; font-size: 15px; font-family: inherit; outline: none; position: relative; z-index: 1; backdrop-filter: blur(10px); transition: border-color .2s; }
.rename-input:focus { border-color: rgba(255,255,255,.25); }
.rename-actions { display: flex; gap: 10px; margin-top: 14px; position: relative; z-index: 1; }
.rename-cancel, .rename-save { flex: 1; padding: 11px; border-radius: 10px; border: none; font-size: 14px; font-family: inherit; cursor: pointer; font-weight: 500; transition: opacity 0.15s; }
.rename-cancel { background: rgba(255,255,255,.07); color: rgba(255,255,255,.7); }
.rename-cancel:hover { opacity: 0.8; }
.rename-save { background: #fff; color: #000; }
.rename-save:hover { opacity: 0.9; }
`;

export default function ChatHeader() {
  const {
    activeModel,
    setActiveModel,
    chatTitle,
    setChatTitle,
    currentChatId,
    resetChat,
  } = useChatStore();

  const { toggleDrawer } = useUIStore();
  const { session } = useAuthStore();

  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameInputVal, setRenameInputVal] = useState("New Chat");

  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenameModalOpen && renameInputRef.current) {
      setTimeout(() => renameInputRef.current?.focus(), 100);
    }
  }, [isRenameModalOpen]);

  useEffect(() => {
    const handleGlobalClick = () => {
      setIsModeMenuOpen(false);
      setIsOptionsMenuOpen(false);
    };

    window.addEventListener("click", handleGlobalClick);

    return () => {
      window.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  const handleModeMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModeMenuOpen((prev) => !prev);
    setIsOptionsMenuOpen(false);
  };

  const handleOptionsMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModeMenuOpen(false);
    setIsOptionsMenuOpen((prev) => !prev);
  };

  const handleSetMode = (modelId: ModelId, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveModel(modelId);
    setIsModeMenuOpen(false);
  };

  const handleOpenRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOptionsMenuOpen(false);
    setRenameInputVal(chatTitle);
    setIsRenameModalOpen(true);
  };

  const handleCloseRename = () => {
    setIsRenameModalOpen(false);
  };

  const handleSaveRename = () => {
    const trimmed = renameInputVal.trim();

    if (trimmed) {
      setChatTitle(trimmed);

      if (session && currentChatId) {
        renameChat(currentChatId, trimmed);
      }
    }

    setIsRenameModalOpen(false);
  };

  const handleDeleteChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOptionsMenuOpen(false);

    if (session && currentChatId) {
      deleteChat(currentChatId);
    }

    resetChat();
  };

  const currentModel = MODELS[activeModel];

  return (
    <>
      <style>{headerCSS}</style>

      <div id="chat-header">
        <button
          className="chat-hamburger"
          onClick={toggleDrawer}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="header-center">
          <div
            className={`status-badge ${isModeMenuOpen ? "active" : ""}`}
            onClick={handleModeMenuToggle}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              {currentModel.name}
              {activeModel === "deepthink" && (
                <span className="beta-tag">Beta</span>
              )}
            </span>

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="chevron-icon"
            >
              <path
                d="M9 5l7 7-7 7"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <button
          className={`hdr-dots-btn ${isOptionsMenuOpen ? "active" : ""}`}
          onClick={handleOptionsMenuToggle}
          aria-label="Chat options"
        >
          <div className="dots-container">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      <div className={`mode-menu ${isModeMenuOpen ? "show" : ""}`}>
        {MODEL_ORDER.map((modelId) => {
          const model = MODELS[modelId];
          const selected = activeModel === modelId;

          return (
            <div
              key={modelId}
              className="mode-item"
              onClick={(e) => handleSetMode(modelId, e)}
            >
              {selected ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mode-checkmark-svg"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <div
                  style={{
                    width: "15px",
                    flexShrink: 0,
                  }}
                ></div>
              )}

              <div className="mode-item-content">
                <span className="mode-title">
                  {model.name}
                  {modelId === "deepthink" && (
                    <span className="beta-tag">Beta</span>
                  )}
                </span>
                <span className="mode-desc">{model.description}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        id="chat-options-menu"
        className={isOptionsMenuOpen ? "show" : ""}
      >
        <div className="chat-opt" onClick={handleOpenRename}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Rename chat
        </div>

        <div className="chat-opt danger" onClick={handleDeleteChat}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
          Delete chat
        </div>
      </div>

      <div
        id="rename-modal"
        className={isRenameModalOpen ? "show" : ""}
        onClick={handleCloseRename}
      >
        <div
          className="rename-box"
          onClick={(e) => e.stopPropagation()}
        >
          <h3>Rename Chat</h3>

          <input
            ref={renameInputRef}
            className="rename-input"
            type="text"
            placeholder="Chat name..."
            value={renameInputVal}
            onChange={(e) => setRenameInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSaveRename();
              }
            }}
          />

          <div className="rename-actions">
            <button
              className="rename-cancel"
              onClick={handleCloseRename}
            >
              Cancel
            </button>

            <button
              className="rename-save"
              onClick={handleSaveRename}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}