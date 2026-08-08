import React, { useEffect } from "react";
import BubbleIndicator from "./BubbleIndicator";
import ThinkingStatus from "../thinking/ThinkingStatus";
import { MarkdownText } from "../../lib/markdown";
import { useStreamText } from "../../hooks/useStreamText";
import { useChatStore, ChatMessage } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { insertMessage } from "../../lib/history";

interface AiMessageProps {
  message: ChatMessage;
}

export default function AiMessage({ message }: AiMessageProps) {
  const { updateMessage } = useChatStore();

  const shouldStream = message.status === "streaming";

  const shown = useStreamText(message.content, shouldStream, 16);

  const isDone = message.status === "done" || message.status === "error";

  const isThinkingModel =
    message.model === "thinking" || message.model === "deepthink";

  const isCoder = message.model === "coder";

  useEffect(() => {
    if (!shouldStream) return;

    if (shown.length >= message.content.length) {
      const timer = setTimeout(() => {
        updateMessage(message.id, {
          status: "done",
        });

        const { currentChatId } = useChatStore.getState();
        const session = useAuthStore.getState().session;

        if (currentChatId && session) {
          insertMessage(currentChatId, {
            ...message,
            status: "done",
          });
        }
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [shouldStream, shown, message, updateMessage]);

  return (
    <div className="message-ai">
      <div className="ai-content">
        {isThinkingModel ? (
          <ThinkingStatus
            done={message.status !== "thinking"}
            deep={message.model === "deepthink"}
            sources={message.sources}
          />
        ) : (
          <BubbleIndicator dimmed={isDone} />
        )}

        <div
          style={{
            width: "100%",
            maxWidth: 640,
          }}
        >
          {message.status === "thinking" && !isThinkingModel && (
            <p
              className="typing-text"
              style={{
                color: "rgba(255,255,255,0.35)",
              }}
            >
              Quix is warming up...
            </p>
          )}

          {shouldStream && (
            <p className="typing-text">
              {shown}

              {shown.length < message.content.length && (
                <span className="stream-cursor" />
              )}
            </p>
          )}

          {message.status === "done" && (
            <MarkdownText text={message.content} enablePreview={isCoder} />
          )}

          {message.status === "error" && (
            <p
              className="typing-text"
              style={{
                color: "#ff8080",
              }}
            >
              {message.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
