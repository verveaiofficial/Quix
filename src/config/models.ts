export type ModelId =
  | "flash"
  | "lite"
  | "coder"
  | "thinking"
  | "deepthink"
  | "imagine";

export interface ModelConfig {
  id: ModelId;
  name: string;
  description: string;
  type: "chat" | "iframe";
  iframeUrl?: string;
  thinking?: boolean;
  tools?: {
    markdown?: boolean;
    code?: boolean;
    preview?: boolean;
    research?: boolean;
    reasoning?: boolean;
  };
}

export const MODELS: Record<ModelId, ModelConfig> = {
  flash: {
    id: "flash",
    name: "Quix 3 Flash",
    description: "Balanced intelligence for daily tasks",
    type: "chat",
    thinking: false,
    tools: {
      markdown: true,
    },
  },

  lite: {
    id: "lite",
    name: "Quix 3 Lite",
    description: "Instant replies",
    type: "chat",
    thinking: false,
    tools: {
      markdown: true,
    },
  },

  coder: {
    id: "coder",
    name: "Quix 3 Coder",
    description: "Build apps and sites",
    type: "chat",
    thinking: false,
    tools: {
      markdown: true,
      code: true,
      preview: true,
    },
  },

  thinking: {
    id: "thinking",
    name: "Quix 3.1 Thinking",
    description: "Advanced reasoning & research",
    type: "chat",
    thinking: true,
    tools: {
      markdown: true,
      research: true,
      reasoning: true,
    },
  },

  deepthink: {
    id: "deepthink",
    name: "DeepThink",
    description: "5-minute deep research & reasoning",
    type: "chat",
    thinking: true,
    tools: {
      markdown: true,
      research: true,
      reasoning: true,
    },
  },

  imagine: {
    id: "imagine",
    name: "Imagine 1.5",
    description: "Generate unique images with Quix",
    type: "iframe",
    iframeUrl: "https://quiximage.lovable.app/",
    tools: {},
  },
};
