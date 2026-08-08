  flash: {
    id: "flash",
    name: "Quix 3 Flash",
    description: "Balanced intelligence for daily tasks",
    type: "chat",
    thinking: false,
    geminiModel: "gemini-3.5-flash-lite", // <-- CHANGE THIS
    apiKeyEnv: "VITE_GEMINI_FLASH_API_KEY",
    tools: { markdown: true },
  },
  // ... do the same for lite, coder, thinking, deepthink
