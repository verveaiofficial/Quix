import { MODELS, ChatModelId } from "../config/models";
import {
  globalKnowledge,
  flashInstructions,
  liteInstructions,
  coderInstructions,
  thinkingInstructions,
  deepthinkInstructions,
} from "./instructions";
import type { ChatMessage } from "../store/chatStore";

const instructionMap: Record<ChatModelId, string> = {
  flash: flashInstructions,
  lite: liteInstructions,
  coder: coderInstructions,
  thinking: thinkingInstructions,
  deepthink: deepthinkInstructions,
};

export function buildModelPrompt(
  model: ChatModelId,
  userMessage: string,
  history: ChatMessage[]
): string {
  const config = MODELS[model];
  const instructions = instructionMap[model] ?? "";

  const recentHistory = history
    .slice(-12)
    .map((message) => {
      const sender = message.role === "user" ? "User" : config.name;
      return `${sender}: ${message.content}`;
    })
    .join("\n");

  return `You are ${config.name} inside Quix AI.
${config.description}

MODEL INSTRUCTIONS:
${instructions}

GLOBAL KNOWLEDGE:
${globalKnowledge}

RECENT CHAT HISTORY:
${recentHistory}

CURRENT USER MESSAGE:
${userMessage}

Respond as ${config.name}. Follow the model instructions exactly.`;
}
