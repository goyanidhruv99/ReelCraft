import type { AiHealthStatus } from "@/types/script";

export class OllamaError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "not_running"
      | "model_missing"
      | "timeout"
      | "bad_response"
      | "unknown"
  ) {
    super(message);
    this.name = "OllamaError";
  }
}

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  timeoutMs: number;
}

export function getOllamaConfig(): OllamaConfig {
  return {
    baseUrl: (process.env.OLLAMA_BASE_URL || "http://localhost:11434").replace(
      /\/$/,
      ""
    ),
    model: process.env.OLLAMA_MODEL || "qwen3:8b",
    timeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS || 180_000),
  };
}

interface OllamaTagsResponse {
  models?: Array<{ name: string; model?: string }>;
}

interface OllamaGenerateResponse {
  response?: string;
  message?: { content?: string };
  error?: string;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new OllamaError(
        "Local AI request timed out. Please try again.",
        "timeout"
      );
    }
    throw new OllamaError(
      "Local AI is not running. Start Ollama and try again.",
      "not_running"
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function checkOllamaReachable(
  baseUrl = getOllamaConfig().baseUrl
): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(
      `${baseUrl}/api/tags`,
      { method: "GET" },
      5_000
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function listOllamaModels(
  baseUrl = getOllamaConfig().baseUrl
): Promise<string[]> {
  const res = await fetchWithTimeout(
    `${baseUrl}/api/tags`,
    { method: "GET" },
    8_000
  );
  if (!res.ok) {
    throw new OllamaError(
      "Local AI is not running. Start Ollama and try again.",
      "not_running"
    );
  }
  const data = (await res.json()) as OllamaTagsResponse;
  return (data.models || []).map((m) => m.name || m.model || "").filter(Boolean);
}

export function modelMatches(installed: string[], wanted: string): boolean {
  const target = wanted.toLowerCase();
  return installed.some((name) => {
    const n = name.toLowerCase();
    return n === target || n.startsWith(`${target}:`) || n.startsWith(`${target}-`);
  });
}

export async function getAiHealth(): Promise<AiHealthStatus> {
  const { baseUrl, model } = getOllamaConfig();

  let reachable = false;
  try {
    reachable = await checkOllamaReachable(baseUrl);
  } catch {
    reachable = false;
  }

  if (!reachable) {
    return {
      available: false,
      ollama: false,
      model,
      modelInstalled: false,
      code: "ollama_not_running",
      message: "Local AI is not running. Start Ollama and try again.",
    };
  }

  let models: string[] = [];
  try {
    models = await listOllamaModels(baseUrl);
  } catch {
    return {
      available: false,
      ollama: false,
      model,
      modelInstalled: false,
      code: "ollama_not_running",
      message: "Local AI is not running. Start Ollama and try again.",
    };
  }

  const installed = modelMatches(models, model);
  if (!installed) {
    return {
      available: false,
      ollama: true,
      model,
      modelInstalled: false,
      code: "model_missing",
      message: "Required local AI model is not installed.",
    };
  }

  return {
    available: true,
    ollama: true,
    model,
    modelInstalled: true,
    code: "ready",
    message: "Local AI is ready.",
  };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Generate text via Ollama chat API (preferred for instruction following).
 */
export async function ollamaChat(
  messages: ChatMessage[],
  options?: { temperature?: number; format?: "json" }
): Promise<string> {
  const { baseUrl, model, timeoutMs } = getOllamaConfig();

  const health = await getAiHealth();
  if (!health.ollama) {
    throw new OllamaError(health.message, "not_running");
  }
  if (!health.modelInstalled) {
    throw new OllamaError(health.message, "model_missing");
  }

  const res = await fetchWithTimeout(
    `${baseUrl}/api/chat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        format: options?.format === "json" ? "json" : undefined,
        // Qwen3 thinking mode is too slow for Shorts scripts on 16GB M2.
        think: false,
        options: {
          temperature: options?.temperature ?? 0.7,
          num_ctx: 4096,
          num_predict: 2500,
        },
      }),
    },
    timeoutMs
  );

  if (!res.ok) {
    let detail = "";
    try {
      const errBody = (await res.json()) as OllamaGenerateResponse;
      detail = errBody.error || "";
    } catch {
      detail = "";
    }
    if (res.status === 404 || /not found/i.test(detail)) {
      throw new OllamaError(
        "Required local AI model is not installed.",
        "model_missing"
      );
    }
    throw new OllamaError(
      "Script generation failed. Please try again.",
      "bad_response"
    );
  }

  const data = (await res.json()) as OllamaGenerateResponse;
  const content = data.message?.content?.trim() || data.response?.trim() || "";
  if (!content) {
    throw new OllamaError(
      "Script generation failed. Please try again.",
      "bad_response"
    );
  }
  return content;
}

export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      return JSON.parse(fenced[1].trim());
    }
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new OllamaError(
      "Script generation failed. Please try again.",
      "bad_response"
    );
  }
}
