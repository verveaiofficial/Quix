import React, { useEffect, useState } from "react";
import { useUIStore } from "../../store/uiStore";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { fetchChats, fetchMessages, ChatRecord } from "../../lib/history";

const drawerCSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
:root{color-scheme:dark;}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
#overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:40;opacity:0;pointer-events:none;transition:opacity .35s ease;}
#overlay.open{opacity:1;pointer-events:all;}
@media (min-width:768px){#overlay.open{opacity:0;pointer-events:none;}}
#drawer{position:fixed;top:0;left:0;bottom:0;width:280px;background:rgba(255,255,255,0.045);backdrop-filter:blur(40px) saturate(200%) brightness(1.1);-webkit-backdrop-filter:blur(40px) saturate(200%) brightness(1.1);border-right:1px solid rgba(255,255,255,0.12);box-shadow:8px 0 32px rgba(0,0,0,0.45),1px 0 0 rgba(255,255,255,0.08) inset,-1px 0 0 rgba(0,0,0,0.3) inset;z-index:50;display:flex;flex-direction:column;transform:translateX(-100%);transition:transform .35s cubic-bezier(.25,.46,.45,.94);}
@media (min-width:768px){#drawer{width:300px;}}
#drawer::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.01) 60%,transparent 100%);pointer-events:none;z-index:0;}
#drawer.open{transform:translateX(0);}
.drawer-inner{display:flex;flex-direction:column;flex:1;min-height:0;position:relative;z-index:1;}
.drawer-top{padding:52px 20px 0;flex-shrink:0;}
.drawer-scroll{flex:1;min-height:0;overflow-y:auto;padding:0 20px 16px;}
.drawer-scroll::-webkit-scrollbar{width:0;}
.brand{font-family:'Syne',sans-serif;font-weight:800;font-size:20px;letter-spacing:.14em;color:rgba(255,255,255,.95);margin-bottom:24px;}
.new-btn{width:100%;padding:11px 16px;background:transparent;border:1px solid rgba(255,255,255,0.25);border-radius:12px;color:rgba(255,255,255,.9);font-size:13px;font-family:'DM Sans',sans-serif;cursor:pointer;display:flex;align-items:center;gap:10px;margin-bottom:28px;transition:background .25s ease,border-color .25s ease;}
.new-btn:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.4);}
.hist-label{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.2);margin-bottom:10px;padding-left:4px;}
.hist-item{padding:10px 12px;border-radius:10px;cursor:pointer;transition:background .2s ease;}
.hist-item:hover{background:rgba(255,255,255,.06);}
.hist-item.current{background:rgba(255,255,255,.08);}
.hist-title{font-size:13px;color:rgba(255,255,255,.72);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px;}
.hist-time{font-size:10px;color:rgba(255,255,255,.25);}
.hist-empty{font-size:12px;color:rgba(255,255,255,.25);padding:10px 12px;line-height:1.5;}
.drawer-footer{flex-shrink:0;border-top:1px solid rgba(255,255,255,.06);padding:14px 20px 18px;display:flex;flex-direction:column;gap:12px;position:relative;z-index:1;}
.social-links{display:flex;flex-direction:column;gap:6px;}
.social-btn{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;color:rgba(255,255,255,.45);font-size:12.5px;text-decoration:none;transition:all .2s ease;}
.social-btn:hover{background:rgba(255,255,255,.06);color:rgba(255,255,255,.8);}
.watermark{font-size:9.5px;color:rgba(255,255,255,.15);letter-spacing:.06em;padding-left:10px;}
.signin-btn{width:100%;padding:11px 16px;background:transparent;border:1px solid rgba(255,255,255,0.25);border-radius:12px;color:rgba(255,255,255,.9);font-size:13px;font-family:'DM Sans',sans-serif;cursor:pointer;display:flex;align-items:center;gap:10px;margin-bottom:16px;transition:background .25s ease,border-color .25s ease;position:relative;z-index:1;}
.signin-btn:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.4);}
.user-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:16px;position:relative;z-index:1;}
.user-email{font-size:12px;color:rgba(255,255,255,.6);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.signout-btn{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:10px;color:rgba(255,255,255,.7);font-size:12px;font-family:'DM Sans',sans-serif;cursor:pointer;padding:8px 12px;transition:background .2s ease;}
.signout-btn:hover{background:rgba(255,255,255,.12);}
`;

function timeAgo(dateString: string): string {
  const then = new Date(dateString).getTime();
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function MenuDrawer() {
  const { drawerOpen, setDrawerOpen, openAuth } = useUIStore();
  const { resetChat, loadMessages, setCurrentChat, currentChatId } =
    useChatStore();
  const { session, signOut } = useAuthStore();

  const [chats, setChats] = useState<ChatRecord[]>([]);

  useEffect(() => {
    if (drawerOpen && session) {
      fetchChats().then(setChats);
    }
  }, [drawerOpen, session]);

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const handleNewChat = () => {
    resetChat();
    closeDrawer();
  };

  const handleOpenChat = async (chat: ChatRecord) => {
    const messages = await fetchMessages(chat.id);

    loadMessages(messages);
    setCurrentChat(chat.id, chat.title);
    closeDrawer();
  };

  const handleOpenAuth = () => {
    closeDrawer();

    setTimeout(() => {
      openAuth();
    }, 150);
  };

  const handleSignOut = async () => {
    await signOut();
    resetChat();
    setChats([]);
  };

  return (
    <>
      <style>{drawerCSS}</style>

      <div
        id="overlay"
        className={drawerOpen ? "open" : ""}
        onClick={closeDrawer}
      ></div>

      <div id="drawer" className={drawerOpen ? "open" : ""}>
        <div className="drawer-inner">
          <div className="drawer-top">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <div className="brand" style={{ marginBottom: 0 }}>
                QUIX
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,.3)",
                  letterSpacing: ".06em",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                C 100
              </div>
            </div>

            <button className="new-btn" onClick={handleNewChat}>
              <span>+</span> New Chat
            </button>
          </div>

          <div className="drawer-scroll">
            <div className="hist-label">Recent</div>

            {session ? (
              chats.length > 0 ? (
                <div id="hist-list">
                  {chats.map((chat) => (
                    <div
                      className={`hist-item ${
                        chat.id === currentChatId ? "current" : ""
                      }`}
                      key={chat.id}
                      onClick={() => handleOpenChat(chat)}
                    >
                      <div className="hist-title">{chat.title}</div>
                      <div className="hist-time">
                        {timeAgo(chat.updated_at)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="hist-empty">
                  No chats yet. Your conversations will appear here once
                  you start talking.
                </div>
              )
            ) : (
              <div className="hist-empty">
                Sign in to save your chat history.
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            padding: "0 20px 12px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {session ? (
            <div className="user-row">
              <span className="user-email">
                {session.user.email || "Signed in"}
              </span>

              <button className="signout-btn" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          ) : (
            <button className="signin-btn" onClick={handleOpenAuth}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Sign in
            </button>
          )}
        </div>

        <div className="drawer-footer">
          <div className="social-links">
            <a
              href="https://www.instagram.com/quix.ai3?igsh=bHV1MWRzemc2OGFi"
              target="_blank"
              rel="noreferrer"
              className="social-btn"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="0.8"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
              Instagram
            </a>

            <a
              href="https://x.com/Verve_ai_"
              target="_blank"
              rel="noreferrer"
              className="social-btn"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X / Formerly Twitter
            </a>
          </div>

          <div className="watermark">Quix · v1.3.0 · Uncensored</div>
        </div>
      </div>
    </>
  );
} React from "react";
import { useUIStore } from "../../store/uiStore";
import { useChatStore } from "../../store/chatStore";

interface HistItem {
  title: string;
  time: string;
}

const histData: HistItem[] = [
  { title: "Building Quix architecture", time: "2h ago" },
  { title: "GLM-5 API integration tips", time: "Yesterday" },
  { title: "Daraz product drop strategy", time: "2d ago" },
  { title: "DeepThink research flow", time: "3d ago" },
  { title: "Automation workflow", time: "5d ago" },
];

const drawerCSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');

:root {
  color-scheme: dark;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

#overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.5);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 40;
  opacity: 0;
  pointer-events: none;
  transition: opacity .35s ease;
}

#overlay.open {
  opacity: 1;
  pointer-events: all;
}

@media (min-width: 768px) {
  #overlay.open {
    opacity: 0;
    pointer-events: none;
  }
}

#drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: rgba(255,255,255,0.045);
  backdrop-filter: blur(40px) saturate(200%) brightness(1.1);
  -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.1);
  border-right: 1px solid rgba(255,255,255,0.12);
  box-shadow:
    8px 0 32px rgba(0,0,0,0.45),
    1px 0 0 rgba(255,255,255,0.08) inset,
    -1px 0 0 rgba(0,0,0,0.3) inset;
  z-index: 50;
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  transition: transform .35s cubic-bezier(.25,.46,.45,.94);
}

@media (min-width: 768px) {
  #drawer {
    width: 300px;
  }
}

#drawer::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.07) 0%,
    rgba(255,255,255,0.01) 60%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 0;
}

#drawer.open {
  transform: translateX(0);
}

.drawer-inner {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  position: relative;
  z-index: 1;
}

.drawer-top {
  padding: 52px 20px 0;
  flex-shrink: 0;
}

.drawer-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 20px 16px;
}

.drawer-scroll::-webkit-scrollbar {
  width: 0;
}

.brand {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 20px;
  letter-spacing: .14em;
  color: rgba(255,255,255,.95);
  margin-bottom: 24px;
}

.new-btn {
  width: 100%;
  padding: 11px 16px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 12px;
  color: rgba(255,255,255,.9);
  font-size: 13px;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
  transition: background .25s ease, border-color .25s ease;
}

.new-btn:hover {
  background: rgba(255,255,255,.07);
  border-color: rgba(255,255,255,.4);
}

.hist-label {
  font-size: 9px;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: rgba(255,255,255,.2);
  margin-bottom: 10px;
  padding-left: 4px;
}

.hist-item {
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background .2s ease;
}

.hist-item:hover {
  background: rgba(255,255,255,.06);
}

.hist-title {
  font-size: 13px;
  color: rgba(255,255,255,.72);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.hist-time {
  font-size: 10px;
  color: rgba(255,255,255,.25);
}

.drawer-footer {
  flex-shrink: 0;
  border-top: 1px solid rgba(255,255,255,.06);
  padding: 14px 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.social-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  color: rgba(255,255,255,.45);
  font-size: 12.5px;
  text-decoration: none;
  transition: all .2s ease;
}

.social-btn:hover {
  background: rgba(255,255,255,.06);
  color: rgba(255,255,255,.8);
}

.watermark {
  font-size: 9.5px;
  color: rgba(255,255,255,.15);
  letter-spacing: .06em;
  padding-left: 10px;
}

.signin-btn {
  width: 100%;
  padding: 11px 16px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 12px;
  color: rgba(255,255,255,.9);
  font-size: 13px;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  transition: background .25s ease, border-color .25s ease;
  position: relative;
  z-index: 1;
}

.signin-btn:hover {
  background: rgba(255,255,255,.07);
  border-color: rgba(255,255,255,.4);
}
`;

export default function MenuDrawer() {
  const { drawerOpen, setDrawerOpen, openAuth } = useUIStore();
  const { clearMessages } = useChatStore();

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const handleNewChat = () => {
    clearMessages();
    closeDrawer();
  };

  const handleOpenAuth = () => {
    closeDrawer();

    setTimeout(() => {
      openAuth();
    }, 150);
  };

  return (
    <>
      <style>{drawerCSS}</style>

      <div
        id="overlay"
        className={drawerOpen ? "open" : ""}
        onClick={closeDrawer}
      ></div>

      <div id="drawer" className={drawerOpen ? "open" : ""}>
        <div className="drawer-inner">
          <div className="drawer-top">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <div className="brand" style={{ marginBottom: 0 }}>
                QUIX
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,.3)",
                  letterSpacing: ".06em",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                C 100
              </div>
            </div>

            <button className="new-btn" onClick={handleNewChat}>
              <span>+</span> New Chat
            </button>
          </div>

          <div className="drawer-scroll">
            <div className="hist-label">Recent</div>

            <div id="hist-list">
              {histData.map((item, index) => (
                <div
                  className="hist-item"
                  key={index}
                  onClick={closeDrawer}
                >
                  <div className="hist-title">{item.title}</div>
                  <div className="hist-time">{item.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "0 20px 12px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <button className="signin-btn" onClick={handleOpenAuth}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Sign in
          </button>
        </div>

        <div className="drawer-footer">
          <div className="social-links">
            <a
              href="https://www.instagram.com/quix.ai3?igsh=bHV1MWRzemc2OGFi"
              target="_blank"
              rel="noreferrer"
              className="social-btn"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="0.8"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
              Instagram
            </a>

            <a
              href="https://x.com/Verve_ai_"
              target="_blank"
              rel="noreferrer"
              className="social-btn"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X / Formerly Twitter
            </a>
          </div>

          <div className="watermark">Quix · v1.3.0 · Uncensored</div>
        </div>
      </div>
    </>
  );
}
