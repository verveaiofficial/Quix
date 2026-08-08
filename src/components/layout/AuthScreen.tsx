import React, { useState } from "react";
import { useUIStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";

type AuthTab = "signin" | "signup";

const authCSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
#auth-screen{position:fixed;inset:0;z-index:200;background:rgba(255,255,255,0.045);backdrop-filter:blur(40px) saturate(200%) brightness(1.1);-webkit-backdrop-filter:blur(40px) saturate(200%) brightness(1.1);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 24px;opacity:0;pointer-events:none;transform:translateY(30px);transition:opacity .35s ease,transform .35s ease;}
#auth-screen.show{opacity:1;pointer-events:all;transform:translateY(0);}
.auth-back{position:absolute;top:18px;left:16px;background:none;border:none;outline:none;cursor:pointer;color:rgba(255,255,255,.55);padding:8px;display:flex;align-items:center;gap:6px;font-size:14px;font-family:'DM Sans',sans-serif;transition:color .2s ease;}
.auth-back:hover{color:#fff;}
.auth-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:28px;letter-spacing:.14em;color:#fff;margin-bottom:8px;}
.auth-tagline{font-size:13px;color:rgba(255,255,255,.35);margin-bottom:36px;text-align:center;}
.auth-tabs{display:flex;background:rgba(255,255,255,0.045);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:4px;margin-bottom:20px;width:100%;max-width:340px;backdrop-filter:blur(40px) saturate(200%) brightness(1.1);-webkit-backdrop-filter:blur(40px) saturate(200%) brightness(1.1);box-shadow:0 8px 32px rgba(0,0,0,0.45),0 1px 0 rgba(255,255,255,0.08) inset,0 -1px 0 rgba(0,0,0,0.3) inset;position:relative;overflow:hidden;}
.auth-tabs::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.01) 60%,transparent 100%);pointer-events:none;}
.auth-tab{flex:1;padding:10px;border:none;background:transparent;outline:none;color:rgba(255,255,255,.45);font-size:13.5px;font-weight:500;font-family:'DM Sans',sans-serif;cursor:pointer;border-radius:12px;transition:all .3s ease;position:relative;z-index:1;}
.auth-tab.active{background:rgba(255,255,255,0.09);border:1px solid rgba(255,255,255,0.14);color:rgba(255,255,255,.95);box-shadow:0 1px 0 rgba(255,255,255,0.08) inset;}
.auth-form{width:100%;max-width:340px;display:flex;flex-direction:column;gap:12px;}
.auth-field{width:100%;padding:14px 16px;background:rgba(255,255,255,0.045);border:1px solid rgba(255,255,255,0.12);border-radius:16px;color:rgba(255,255,255,.88);font-size:15px;font-family:'DM Sans',sans-serif;outline:none;backdrop-filter:blur(40px) saturate(200%) brightness(1.1);-webkit-backdrop-filter:blur(40px) saturate(200%) brightness(1.1);box-shadow:0 8px 32px rgba(0,0,0,0.45),0 1px 0 rgba(255,255,255,0.08) inset,0 -1px 0 rgba(0,0,0,0.3) inset;transition:border-color .3s,background .3s,box-shadow .3s;}
.auth-field::placeholder{color:rgba(255,255,255,.28);}
.auth-field:focus{border-color:rgba(255,255,255,0.22);background:rgba(255,255,255,0.065);box-shadow:0 12px 40px rgba(0,0,0,0.55),0 0 0 1px rgba(255,255,255,0.06),0 1px 0 rgba(255,255,255,0.1) inset;}
.auth-submit{width:100%;padding:14px;background:#fff;color:#000;border:none;outline:none;border-radius:14px;font-size:15px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:background .25s ease,opacity .25s ease;margin-top:4px;}
.auth-submit:hover{background:#e8e8e8;}
.auth-submit:disabled{opacity:.5;cursor:not-allowed;}
.auth-switch{text-align:center;font-size:13px;color:rgba(255,255,255,.35);margin-top:4px;}
.auth-switch span{color:rgba(255,255,255,.8);cursor:pointer;text-decoration:underline;}
.auth-error{width:100%;max-width:340px;text-align:center;font-size:12.5px;color:#ff8080;margin-bottom:10px;}
.auth-notice{width:100%;max-width:340px;text-align:center;font-size:12.5px;color:#7dd3fc;margin-bottom:10px;}
`;

export default function AuthScreen() {
  const { authOpen, closeAuth } = useUIStore();
  const { signIn, signUp, busy, error, notice } = useAuthStore();

  const [authTab, setAuthTab] = useState<AuthTab>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLocalError(null);

    const ok = await signIn(email.trim(), password);

    if (ok) {
      closeAuth();
    }
  };

  const handleSignUp = async () => {
    setLocalError(null);

    if (password !== confirm) {
      setLocalError("Passwords do not match.");
      return;
    }

    const ok = await signUp(name.trim(), email.trim(), password);

    if (ok) {
      closeAuth();
    }
  };

  return (
    <>
      <style>{authCSS}</style>

      <div id="auth-screen" className={authOpen ? "show" : ""}>
        <button className="auth-back" onClick={closeAuth}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        <div className="auth-logo">QUIX</div>
        <div className="auth-tagline">Your AI. Your space.</div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${authTab === "signin" ? "active" : ""}`}
            onClick={() => setAuthTab("signin")}
          >
            Sign in
          </button>

          <button
            className={`auth-tab ${authTab === "signup" ? "active" : ""}`}
            onClick={() => setAuthTab("signup")}
          >
            Sign up
          </button>
        </div>

        {(error || localError) && (
          <div className="auth-error">{error || localError}</div>
        )}

        {notice && <div className="auth-notice">{notice}</div>}

        {authTab === "signin" && (
          <div className="auth-form">
            <input
              className="auth-field"
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="auth-field"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className="auth-submit"
              disabled={busy}
              onClick={handleSignIn}
            >
              {busy ? "Signing in..." : "Sign in"}
            </button>

            <div className="auth-switch">
              Don't have an account?{" "}
              <span onClick={() => setAuthTab("signup")}>Sign up</span>
            </div>
          </div>
        )}

        {authTab === "signup" && (
          <div className="auth-form">
            <input
              className="auth-field"
              type="text"
              placeholder="Full name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="auth-field"
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="auth-field"
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              className="auth-field"
              type="password"
              placeholder="Confirm password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            <button
              className="auth-submit"
              disabled={busy}
              onClick={handleSignUp}
            >
              {busy ? "Creating account..." : "Create account"}
            </button>

            <div className="auth-switch">
              Already have an account?{" "}
              <span onClick={() => setAuthTab("signin")}>Sign in</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}