import React, { useEffect, useState } from "react";
import LoadingScreen from "./components/loading/LoadingScreen";
import ChatHeader from "./components/layout/ChatHeader";
import MenuDrawer from "./components/layout/MenuDrawer";
import AuthScreen from "./components/layout/AuthScreen";
import ChatInputBar from "./components/chat/ChatInputBar";
import MessageList from "./components/chat/MessageList";
import { useChatStore } from "./store/chatStore";
import { useAuthStore } from "./store/authStore";
import { MODELS, ChatModelId } from "./config/models";
import { buildModelPrompt } from "./lib/prompt";
import { askGemini } from "./lib/gemini";
import { createChat, insertMessage, touchChat } from "./lib/history";

export default function App() {
  const [loading, setLoading] = useState(true);

  const {
    activeModel,
    addMessage,
    updateMessage,
    isSending,
    setIsSending,
  } = useChatStore();

  const model = MODELS[activeModel];

  useEffect(() => {
    useAuthStore.getState().init();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 7800);

    return () => clearTimeout(timer);
  }, []);

  const handleSend = async (text: string) => {
    if (isSending) return;

    if (model.type !== "chat") return;

    const chatModel = activeModel as ChatModelId;

    const userMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role: "user" as const,
      model: chatModel,
      content: text,
      createdAt: Date.now(),
      status: "done" as const,
      kind: "text" as const,
    };

    const aiMessageId = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;

    const session = useAuthStore.getState().session;

    let chatId = useChatStore.getState().currentChatId;

    if (session) {
      if (!chatId) {
        const title = text.slice(0, 40) || "New Chat";

        chatId = await createChat(title);

        if (chatId) {
          useChatStore.getState().setCurrentChat(chatId, title);
        }
      }

      if (chatId) {
        insertMessage(chatId, userMessage);
        touchChat(chatId);
      }
    }

    addMessage(userMessage);

    addMessage({
      id: aiMessageId,
      role: "ai",
      model: chatModel,
      content: "",
      createdAt: Date.now(),
      status: "thinking",
      kind: "text",
    });

    setIsSending(true);

    try {
      const history = useChatStore
        .getState()
        .messages.filter(
          (message) =>
            message.id !== aiMessageId && message.content.trim() !== ""
        );

      const prompt = buildModelPrompt(chatModel, text, history);

      const answer = await askGemini(chatModel, prompt);

      updateMessage(aiMessageId, {
        content: answer,
        status: "streaming",
      });
    } catch {
      updateMessage(aiMessageId, {
        content:
          "Quix could not reach the model. Check the API key for this model and try again.",
        status: "error",
      });
    } finally {
      setIsSending(false);
    }
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
          <MessageList />

          <ChatInputBar onSend={handleSend} />
        </>
      )}
    </div>
  );
} React, { useEffect, useState } from "react";
import LoadingScreen from "./components/loading/LoadingScreen";
import ChatHeader from "./components/layout/ChatHeader";
import MenuDrawer from "./components/layout/MenuDrawer";
import AuthScreen from "./components/layout/AuthScreen";
import ChatInputBar from "./components/chat/ChatInputBar";
import MessageList from "./components/chat/MessageList";
import { useChatStore } from "./store/chatStore";
import { MODELS, ChatModelId } from "./config/models";
import { buildModelPrompt } from "./lib/prompt";
import { askGemini } from "./lib/gemini";

export default function App() {
  const [loading, setLoading] = useState(true);

  const {
    activeModel,
    addMessage,
    updateMessage,
    isSending,
    setIsSending,
  } = useChatStore();

  const model = MODELS[activeModel];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 7800);

    return () => clearTimeout(timer);
  }, []);

  const handleSend = async (text: string) => {
    if (isSending) return;

    if (model.type !== "chat") return;

    const chatModel = activeModel as ChatModelId;

    const userMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role: "user" as const,
      model: chatModel,
      content: text,
      createdAt: Date.now(),
      status: "done" as const,
      kind: "text" as const,
    };

    const aiMessageId = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;

    addMessage(userMessage);

    addMessage({
      id: aiMessageId,
      role: "ai",
      model: chatModel,
      content: "",
      createdAt: Date.now(),
      status: "thinking",
      kind: "text",
    });

    setIsSending(true);

    try {
      const history = useChatStore
        .getState()
        .messages.filter(
          (message) =>
            message.id !== aiMessageId && message.content.trim() !== ""
        );

      const prompt = buildModelPrompt(chatModel, text, history);

      const answer = await askGemini(chatModel, prompt);

      updateMessage(aiMessageId, {
        content: answer,
        status: "streaming",
      });
    } catch {
      updateMessage(aiMessageId, {
        content:
          "Quix could not reach the model. Check the API key for this model and try again.",
        status: "error",
      });
    } finally {
      setIsSending(false);
    }
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
          <MessageList />

          <ChatInputBar onSend={handleSend} />
        </>
      )}
    </div>
  );
}