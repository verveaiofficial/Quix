import React from "react";

interface UserMessageProps {
  content: string;
}

export default function UserMessage({ content }: UserMessageProps) {
  return <div className="message-user">{content}</div>;
}
