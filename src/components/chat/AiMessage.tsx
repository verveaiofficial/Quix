import React, { useEffect } from "react";
import BubbleIndicator from "./BubbleIndicator";
import { useStreamText } from "../../hooks/useStreamText";
import { useChatStore, ChatMessage } from "../../store/chatStore";

interface AiMessageProps {
  message: ChatMessage;
}

export default function AiMessage({ message }: AiMessageProps) {
  const { updateMessage } = useChatStore();

  const shouldStream = message.status === "streaming";

  const shown = useStreamText(message.content, shouldStream, 16);

  const displayed = shouldStream ? shown : message.content;

  const isDone = message.status === "done" || message.status === "error";

  useEffect(() => {
    if (!shouldStream) return;

    if (shown.length >= message.content.length) {
      const timer = setTimeout(() => {
        updateMessage(message.id, {
          status: "done",
        });
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [
    shouldStream,
    shown,
    message.content.length,
    message.id,
    updateMessage,
  ]);

  return (
    <div className="message-ai">
      <div className="ai-content">
        <BubbleIndicator dimmed={isDone} />

        <div
          style={{
            width: "100%",
            maxWidth: 640,
          }}
        >
          {message.status === "thinking" && (
            <p
              className="typing-text"
              style={{
                color: "rgba(255,255,255,0.35)",
              }}
            >
              Quix is warming up...
            </p>
          )}

          {(message.status === "streaming" ||
            message.status === "done" ||
            message.status === "error") && (
            <p className="typing-text">
              {displayed}

              {shouldStream && shown.length < message.content.length && (
                <span className="stream-cursor" />
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
