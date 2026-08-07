import React, { useEffect, useState } from "react";
import LoadingScreen from "./components/loading/LoadingScreen";
import { useChatStore } from "./store/chatStore";
import { MODELS } from "./config/models";

export default function App() {
  const [loading, setLoading] = useState(true);
  const { activeModel } = useChatStore();
  const model = MODELS[activeModel];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 7800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        height: "100dvh",
        background: "#000",
        color: "#fff",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {loading && <LoadingScreen />}

      {!loading && (
        <div style={{ height: "100%", paddingTop: 56 }}>
          {model.type === "iframe" ? (
            <iframe
              src={model.iframeUrl}
              title={model.name}
              style={{
                width: "100%",
                height: "calc(100dvh - 56px)",
                border: "none",
                display: "block",
                background: "#000",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  maxWidth: 650,
                  margin: "0 auto",
                  padding: "24px 20px 120px",
                }}
              >
                {/* Chat messages will render here */}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
