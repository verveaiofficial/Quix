const GEMINI_MODEL =
  import.meta.env.VITE_GEMINI_MODEL || "gemini-3.5-flash-lite"; { MODELS, ChatModelId } from "../config/models";

const FALLBACK_MODEL = "gemini-3.5-flash-lite";

function getApiKeyForModel(model: ChatModelId): string {
  const config = MODELS[model];
  const env = import.meta.env as Record<string, string | undefined>;

  if (!config.apiKeyEnv) return "";

  return env[config.apiKeyEnv] ?? "";
}

export function getGeminiModelForModel(model: ChatModelId): string {
  return MODELS[model].geminiModel ?? FALLBACK_MODEL;
}

export async function askGemini(
  model: ChatModelId,
  prompt: string
): Promise<string> {
  const apiKey = getApiKeyForModel(model);
  const geminiModel = getGeminiModelForModel(model);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Gemini request failed");
  }

  const data = await response.json();

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!text) {
    throw new Error("Empty Gemini response");
  }

  return text;
}