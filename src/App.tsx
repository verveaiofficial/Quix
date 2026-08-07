import React, { useEffect, useRef, useState } from "react";
import LoadingScreen from "./components/loading/LoadingScreen";
import ChatHeader from "./components/layout/ChatHeader";
import MenuDrawer from "./components/layout/MenuDrawer";
import AuthScreen from "./components/layout/AuthScreen";
import ChatInputBar from "./components/chat/ChatInputBar";
import { useChatStore } from "./store/chatStore";
import { MODELS } from "./config/models";

export default function App() {
  const [loading, setLoading] = useState(true);

  const { activeModel, messages, addMessage } = useChatStore();
  const model = MODELS[activeModel];

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 7800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text: string) => {
    addMessage({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role: "user",
      model: activeModel,
      content: text,
      createdAt: Date.now(),
    });
  };

  if (loading) {
    return <LoadingScreen />;
  }

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
      <ChatHeader />
      <MenuDrawer />
      <AuthScreen />

      {model.type === "iframe" ? (
        <div
          style={{
            position: "fixed",
            top: 56,
            left: 0,
            right: 0,
            bottom: 0,
            background: "#000",
            zIndex: 5,
          }}
        >
          <iframe
            src={model.iframeUrl}
            title={model.name}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block",
              background: "#000",
            }}
          />
        </div>
      ) : (
        <>
          <div
            ref={scrollRef}
            style={{
              position: "fixed",
              top: 56,
              left: 0,
              right: 0,
              bottom: 0,
              overflowY: "auto",
              zIndex: 1,
            }}
          >
            <div
              style={{
                maxWidth: 650,
                margin: "0 auto",
                padding: "24px 20px 140px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {messages.map((message) => {
                if (message.role === "user") {
                  return (
                    <div
                      key={message.id}
                      style={{
                        alignSelf: "flex-end",
                        maxWidth: "85%",
                        background: "#1e1e20",
                        color: "#fff",
                        padding: "12px 16px",
                        borderRadius: "18px 18px 4px 18px",
                        fontSize: 15,
                        lineHeight: 1.5,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        marginBottom: 24,
                      }}
                    >
                      {message.content}
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>

          <ChatInputBar onSend={handleSend} />
        </>
      )}
    </div>
  );
}
