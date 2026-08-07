import React, { useState } from 'react';

type AuthTab = 'signin' | 'signup';

export interface HistItem {
  id?: string;
  title: string;
  time: string;
}

interface SidebarProps {
  /** Controls if drawer menu is open */
  isOpen?: boolean;
  /** Function to toggle drawer menu */
  onToggleMenu?: () => void;
  /** Function when 'New Chat' button is clicked */
  onNewChat?: () => void;
  /** Custom chat history array (falls back to default demo items if not passed) */
  historyItems?: HistItem[];
  /** Callback when user selects a chat item from history */
  onSelectHistory?: (item: HistItem) => void;
  /** Callback when user authenticates */
  onAuthSubmit?: (type: AuthTab, data: Record<string, string>) => void;
}

const defaultHistData: HistItem[] = [
  { id: '1', title: 'Building Quix architecture', time: '2h ago' },
  { id: '2', title: 'GLM-5 API integration tips', time: 'Yesterday' },
  { id: '3', title: 'Daraz product drop strategy', time: '2d ago' },
  { id: '4', title: 'DeepThink research flow', time: '3d ago' },
  { id: '5', title: 'Automation workflow', time: '5d ago' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen: externalIsOpen,
  onToggleMenu,
  onNewChat,
  historyItems = defaultHistData,
  onSelectHistory,
  onAuthSubmit,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<AuthTab>('signin');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Use controlled open state if provided, otherwise internal fallback
  const isMenuOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const menuClose = () => {
    if (onToggleMenu && isMenuOpen) onToggleMenu();
    else setInternalIsOpen(false);
  };

  const toggleMenu = () => {
    if (onToggleMenu) {
      onToggleMenu();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const openAuth = () => {
    menuClose();
    setTimeout(() => setIsAuthOpen(true), 150);
  };

  const closeAuth = () => setIsAuthOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAuthSubmit) {
      onAuthSubmit(authTab, { email, password, fullName, confirmPassword });
    }
    closeAuth();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        :root { color-scheme: dark; }

        #quix-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,.5);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          z-index: 40; opacity: 0; pointer-events: none;
          transition: opacity .35s ease;
        }
        #quix-overlay.open { opacity: 1; pointer-events: all; }

        @media (min-width: 768px) {
          #quix-overlay.open {
            opacity: 0;
            pointer-events: none;
          }
        }

        #quix-drawer {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: 280px;
          background: rgba(255,255,255,0.045);
          backdrop-filter: blur(40px) saturate(200%) brightness(1.1);
          -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.1);
          border-right: 1px solid rgba(255,255,255,0.12);
          box-shadow: 8px 0 32px rgba(0,0,0,0.45), 1px 0 0 rgba(255,255,255,0.08) inset, -1px 0 0 rgba(0,0,0,0.3) inset;
          z-index: 50; display: flex; flex-direction: column;
          transform: translateX(-100%);
          transition: transform .35s cubic-bezier(.25,.46,.45,.94);
        }

        @media (min-width: 768px) {
          #quix-drawer {
            width: 300px;
          }
        }

        #quix-drawer::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 60%, transparent 100%);
          pointer-events: none; z-index: 0;
        }
        #quix-drawer.open { transform: translateX(0); }

        .drawer-inner { display: flex; flex-direction: column; flex: 1; min-height: 0; position: relative; z-index: 1; }
        .drawer-top { padding: 52px 20px 0; flex-shrink: 0; }
        .drawer-scroll { flex: 1; min-height: 0; overflow-y: auto; padding: 0 20px 16px; }
        .drawer-scroll::-webkit-scrollbar { width: 0; }
        .brand { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; letter-spacing: .14em; color: rgba(255,255,255,.95); margin-bottom: 24px; }

        .new-btn {
          width: 100%; padding: 11px 16px;
          background: transparent; border: 1px solid rgba(255,255,255,0.25);
          border-radius: 12px; color: rgba(255,255,255,.9);
          font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer;
          display: flex; align-items: center; gap: 10px; margin-bottom: 28px;
          transition: background .25s ease, border-color .25s ease;
        }
        .new-btn:hover { background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.4); }

        .hist-label { font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.2); margin-bottom: 10px; padding-left: 4px; }
        .hist-item { padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: background .2s ease; }
        .hist-item:hover { background: rgba(255,255,255,.06); }
        .hist-title { font-size: 13px; color: rgba(255,255,255,.72); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
        .hist-time { font-size: 10px; color: rgba(255,255,255,.25); }

        .drawer-footer { flex-shrink: 0; border-top: 1px solid rgba(255,255,255,.06); padding: 14px 20px 18px; display: flex; flex-direction: column; gap: 12px; position: relative; z-index: 1; }
        .social-links { display: flex; flex-direction: column; gap: 6px; }
        .social-btn { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; color: rgba(255,255,255,.45); font-size: 12.5px; text-decoration: none; transition: all .2s ease; }
        .social-btn:hover { background: rgba(255,255,255,.06); color: rgba(255,255,255,.8); }
        .watermark { font-size: 9.5px; color: rgba(255,255,255,.15); letter-spacing: .06em; padding-left: 10px; }

        .signin-btn {
          width: 100%; padding: 11px 16px;
          background: transparent; border: 1px solid rgba(255,255,255,0.25);
          border-radius: 12px; color: rgba(255,255,255,.9); font-size: 13px;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
          transition: background .25s ease, border-color .25s ease; position: relative; z-index: 1;
        }
        .signin-btn:hover { background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.4); }

        #open-btn { position: fixed; top: 16px; left: 16px; z-index: 60; background: none; border: none; outline: none; cursor: pointer; display: flex; flex-direction: column; gap: 5px; padding: 8px; transition: left .35s cubic-bezier(.25,.46,.45,.94); }
        #open-btn.open { left: 236px; }
        @media (min-width: 768px) {
          #open-btn.open { left: 256px; }
        }

        #open-btn span { display: block; height: 1.5px; background: rgba(255,255,255,.65); border-radius: 2px; transform-origin: center; transition: transform .25s cubic-bezier(.4,0,.2,1), opacity .25s cubic-bezier(.4,0,.2,1), width .25s cubic-bezier(.4,0,.2,1); }
        #open-btn span:nth-child(1) { width: 18px; }
        #open-btn span:nth-child(2) { width: 13px; }
        #open-btn span:nth-child(3) { width: 18px; }
        #open-btn.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        #open-btn.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        #open-btn.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        #auth-screen {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(255,255,255,0.045);
          backdrop-filter: blur(40px) saturate(200%) brightness(1.1);
          -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.1);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 0 24px; opacity: 0; pointer-events: none;
          transform: translateY(30px); transition: opacity .35s ease, transform .35s ease;
        }
        #auth-screen.show { opacity: 1; pointer-events: all; transform: translateY(0); }

        .auth-back { position: absolute; top: 18px; left: 16px; background: none; border: none; outline: none; cursor: pointer; color: rgba(255,255,255,.55); padding: 8px; display: flex; align-items: center; gap: 6px; font-size: 14px; font-family: 'DM Sans', sans-serif; transition: color .2s ease; }
        .auth-back:hover { color: #fff; }
        .auth-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; letter-spacing: .14em; color: #fff; margin-bottom: 8px; }
        .auth-tagline { font-size: 13px; color: rgba(255,255,255,.35); margin-bottom: 36px; text-align: center; }

        .auth-tabs {
          display: flex;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          padding: 4px;
          margin-bottom: 20px;
          width: 100%; max-width: 340px;
          backdrop-filter: blur(40px) saturate(200%) brightness(1.1);
          -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.1);
          box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.08) inset, 0 -1px 0 rgba(0,0,0,0.3) inset;
          position: relative; overflow: hidden;
        }
        .auth-tabs::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 60%, transparent 100%);
          pointer-events: none;
        }
        .auth-tab {
          flex: 1; padding: 10px; border: none; background: transparent; outline: none;
          color: rgba(255,255,255,.45); font-size: 13.5px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer; border-radius: 12px;
          transition: all .3s ease; position: relative; z-index: 1;
        }
        .auth-tab.active {
          background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.14);
          color: rgba(255,255,255,.95);
          box-shadow: 0 1px 0 rgba(255,255,255,0.08) inset;
        }

        .auth-form { width: 100%; max-width: 340px; display: flex; flex-direction: column; gap: 12px; }

        .auth-field {
          width: 100%; padding: 14px 16px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          color: rgba(255,255,255,.88);
          font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none;
          backdrop-filter: blur(40px) saturate(200%) brightness(1.1);
          -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.1);
          box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.08) inset, 0 -1px 0 rgba(0,0,0,0.3) inset;
          transition: border-color .3s, background .3s, box-shadow .3s;
        }
        .auth-field::placeholder { color: rgba(255,255,255,.28); }
        .auth-field:focus {
          border-color: rgba(255,255,255,0.22);
          background: rgba(255,255,255,0.065);
          box-shadow: 0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06), 0 1px 0 rgba(255,255,255,0.1) inset;
        }

        .auth-submit {
          width: 100%; padding: 14px; background: #fff; color: #000; border: none; outline: none;
          border-radius: 14px; font-size: 15px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background .25s ease; margin-top: 4px;
        }
        .auth-submit:hover { background: #e8e8e8; }
        .auth-switch { text-align: center; font-size: 13px; color: rgba(255,255,255,.35); margin-top: 4px; }
        .auth-switch span { color: rgba(255,255,255,.8); cursor: pointer; text-decoration: underline; }
      `}</style>

      {/* Background Overlay */}
      <div id="quix-overlay" className={isMenuOpen ? 'open' : ''} onClick={menuClose} />

      {/* Drawer Menu */}
      <div id="quix-drawer" className={isMenuOpen ? 'open' : ''}>
        <div className="drawer-inner">
          <div className="drawer-top">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div className="brand" style={{ marginBottom: 0 }}>QUIX</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.3)', letterSpacing: '.06em', fontFamily: "'DM Sans', sans-serif" }}>C 100</div>
            </div>
            <button
              className="new-btn"
              onClick={() => {
                menuClose();
                if (onNewChat) onNewChat();
              }}
            >
              <span>+</span> New Chat
            </button>
          </div>
          <div className="drawer-scroll">
            <div className="hist-label">Recent</div>
            <div id="hist-list">
              {historyItems.map((h, i) => (
                <div
                  className="hist-item"
                  key={h.id || i}
                  onClick={() => {
                    menuClose();
                    if (onSelectHistory) onSelectHistory(h);
                  }}
                >
                  <div className="hist-title">{h.title}</div>
                  <div className="hist-time">{h.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: '0 20px 12px', position: 'relative', zIndex: 1 }}>
          <button className="signin-btn" onClick={openAuth}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Sign in
          </button>
        </div>
        <div className="drawer-footer">
          <div className="social-links">
            <a href="https://www.instagram.com/quix.ai3?igsh=bHV1MWRzemc2OGFi" target="_blank" rel="noreferrer" className="social-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
              </svg>
              Instagram
            </a>
            <a href="https://x.com/Verve_ai_" target="_blank" rel="noreferrer" className="social-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X / Formerly Twitter
            </a>
          </div>
          <div className="watermark">Quix · v1.3.0 · Uncensored</div>
        </div>
      </div>

      {/* Animated Hamburger Trigger Button */}
      <button id="open-btn" className={isMenuOpen ? 'open' : ''} onClick={toggleMenu} aria-label="Toggle Menu">
        <span />
        <span />
        <span />
      </button>

      {/* Auth Screen Modal */}
      <div id="auth-screen" className={isAuthOpen ? 'show' : ''}>
        <button className="auth-back" onClick={closeAuth}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <div className="auth-logo">QUIX</div>
        <div className="auth-tagline">Your AI. Your space.</div>
        <div className="auth-tabs">
          <button className={`auth-tab ${authTab === 'signin' ? 'active' : ''}`} onClick={() => setAuthTab('signin')}>Sign in</button>
          <button className={`auth-tab ${authTab === 'signup' ? 'active' : ''}`} onClick={() => setAuthTab('signup')}>Sign up</button>
        </div>

        {authTab === 'signin' && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              className="auth-field"
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="auth-field"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button className="auth-submit" type="submit">Sign in</button>
            <div className="auth-switch">Don't have an account? <span onClick={() => setAuthTab('signup')}>Sign up</span></div>
          </form>
        )}

        {authTab === 'signup' && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              className="auth-field"
              type="text"
              placeholder="Full name"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <input
              className="auth-field"
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="auth-field"
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              className="auth-field"
              type="password"
              placeholder="Confirm password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button className="auth-submit" type="submit">Create account</button>
            <div className="auth-switch">Already have an account? <span onClick={() => setAuthTab('signin')}>Sign in</span></div>
          </form>
        )}
      </div>
    </>
  );
};

// Preview Wrapper Container for live testing
export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#050508', color: '#fff', padding: '80px 24px', fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar />
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', marginBottom: '16px' }}>QUIX AI</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', lineHeight: '1.6' }}>
          Tap the hamburger menu icon at top-left to test your slide-out drawer menu and glassmorphic Sign in / Sign up screen!
        </p>
      </div>
    </div>
  );
  }
