import { MODELS, ChatModelId } from "../config/models";

const FALLBACK_MODEL = "gemini-3.5-flash-lite";

export interface GeminiSource {
  title: string;
  uri: string;
}

export interface GeminiAttachment {
  kind: "image" | "pdf" | "text";
  mimeType: string;
  base64: string;
  text?: string;
  name: string;
}

export interface GeminiResult {
  text: string;
  sources: GeminiSource[];
}

function getApiKeyForModel(model: ChatModelId): string {
  const config = MODELS[model];
  const env = import.meta.env as Record<string, string | undefined>;

  if (!config.apiKeyEnv) return "";

  return env[config.apiKeyEnv] ?? "";
}

export function getGeminiModelForModel(model: ChatModelId): string {
  return MODELS[model].geminiModel ?? FALLBACK_MODEL;
}

async function callGemini(
  model: ChatModelId,
  parts: any[],
  search: boolean
): Promise<any> {
  const apiKey = getApiKeyForModel(model);
  const geminiModel = getGeminiModelForModel(model);

  const body: any = {
    contents: [
      {
        parts,
      },
    ],
  };

  if (search) {
    body.tools = [{ google_search: {} }];
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error("Gemini request failed");
  }

  return response.json();
}

function parseResult(data: any): GeminiResult {
  const parts = data?.candidates?.[0]?.content?.parts ?? [];

  const text = parts
    .map((p: any) => p?.text)
    .filter(Boolean)
    .join("");

  const chunks = data?.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];

  const seen = new Set<string>();
  const sources: GeminiSource[] = [];

  chunks.forEach((chunk: any) => {
    const uri = chunk?.web?.uri;

    if (uri && !seen.has(uri)) {
      seen.add(uri);
      sources.push({
        title: chunk?.web?.title ?? uri,
        uri,
      });
    }
  });

  return { text, sources };
}

export async function askGemini(
  model: ChatModelId,
  prompt: string,
  opts?: {
    search?: boolean;
    attachments?: GeminiAttachment[];
  }
): Promise<GeminiResult> {
  const parts: any[] = [
    {
      text: prompt,
    },
  ];

  (opts?.attachments ?? []).forEach((attachment) => {
    if (attachment.kind === "text") {
      parts.push({
        text: `\n\n--- Attached file: ${attachment.name} ---\n${attachment.text ?? ""}`,
      });
    } else {
      parts.push({
        inline_data: {
          mime_type: attachment.mimeType,
          data: attachment.base64,
        },
      });
    }
  });

  try {
    const data = await callGemini(model, parts, !!opts?.search);
    const result = parseResult(data);

    if (!result.text) {
      throw new Error("Empty Gemini response");
    }

    return result;
  } catch (error) {
    if (opts?.search) {
      const data = await callGemini(model, parts, false);
      const result = parseResult(data);

      if (!result.text) {
        throw new Error("Empty Gemini response");
      }

      return result;
    }

    throw error;
  }
}