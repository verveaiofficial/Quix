import React from "react";
import { AttachmentMeta } from "../../store/chatStore";

interface UserMessageProps {
  content: string;
  attachments?: AttachmentMeta[];
}

export default function UserMessage({ content, attachments }: UserMessageProps) {
  return (
    <div className="message-user">
      {attachments && attachments.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: content ? 10 : 0,
          }}
        >
          {attachments.map((attachment, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: "4px 8px",
                fontSize: 11,
                color: "rgba(255,255,255,0.7)",
                maxWidth: 160,
              }}
            >
              {attachment.kind === "image" && attachment.previewUrl ? (
                <img
                  src={attachment.previewUrl}
                  alt={attachment.name}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    objectFit: "cover",
                  }}
                />
              ) : null}

              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {attachment.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {content}
    </div>
  );
}
