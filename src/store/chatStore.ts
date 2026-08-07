import { create } from "zustand";
import { ModelId } from "../config/models";

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  model: ModelId;
  content: string;
  createdAt: number;
}

interface ChatState {
  activeModel: ModelId;
  messages: ChatMessage[];
  setActiveModel: (model: ModelId) => void;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeModel: "flash",
  messages: [],

  setActiveModel: (model) => {
    set({ activeModel: model });
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  clearMessages: () => {
    set({ messages: [] });
  },
}));
