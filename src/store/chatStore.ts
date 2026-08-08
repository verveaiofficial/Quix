import { create } from "zustand";
import { ModelId } from "../config/models";

export type MessageStatus =
  | "sending"
  | "thinking"
  | "streaming"
  | "done"
  | "error";

export type MessageKind = "text" | "code" | "reasoning";

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  model: ModelId;
  content: string;
  createdAt: number;
  status?: MessageStatus;
  kind?: MessageKind;
}

interface ChatState {
  activeModel: ModelId;
  messages: ChatMessage[];
  isSending: boolean;

  setActiveModel: (model: ModelId) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
  clearMessages: () => void;
  setIsSending: (sending: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeModel: "flash",
  messages: [],
  isSending: false,

  setActiveModel: (model) => {
    set({ activeModel: model });
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  updateMessage: (id, patch) => {
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === id
          ? {
              ...message,
              ...patch,
            }
          : message
      ),
    }));
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  setIsSending: (sending) => {
    set({ isSending: sending });
  },
}));
