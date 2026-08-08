import React, { useEffect, useRef } from "react";
import { useChatStore } from "../../store/chatStore";
import UserMessage from "./UserMessage";
import AiMessage from "./AiMessage";

const messageListCSS = `
.message-scroll {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  z-index: 1;
}

.message-scroll::-webkit-scrollbar {
  width: 0;
}

.message-container {
  width: 100%;
  max-width: 650px;
  margin: 0 auto;
  padding: 24px 20px 140px;
  display: flex;
  flex-direction: column;
}

.message-user {
  align-self: flex-end;
  max-width: 85%;
  margin-left: auto;
  background-color: #1e1e20;
  color: #fff;
  padding: 12px 16px;
  border-radius: 18px 18px 4px 18px;
  font-size: 15px;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
  margin-bottom: 24px;
}

.message-ai {
  align-self: flex-start;
  width: 100%;
  font-size: 16px;
  line-height: 1.6;
  color: #e5e7eb;
  margin-bottom: 24px;
}

.ai-content {
  width: 100%;
  min-height: 32px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
}

.typing-text {
  display: block;
  line-height: 1.6;
  color: #e5e7eb;
  white-space: pre-wrap;
  word-break: break-word;
}

.stream-cursor {
  display: inline-block;
  width: 7px;
  height: 16px;
  background: rgba(255,255,255,0.7);
  margin-left: 3px;
  vertical-align: middle;
  animation: quixCursorBlink 1s steps(1) infinite;
}

@keyframes quixCursorBlink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
`;

export default function MessageList() {
  const messages = useChatStore((state) => state.messages);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <style>{messageListCSS}</style>

      <div className="message-scroll" ref={scrollRef}>
        <div className="message-container">
          {messages.map((message) => {
            if (message.role === "user") {
              return (
                <UserMessage
                  key={message.id}
                  content={message.content}
                />
              );
            }

            return <AiMessage key={message.id} message={message} />;
          })}
        </div>
      </div>
    </>
  );
}
