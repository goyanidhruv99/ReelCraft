import {
  AiUnavailableError,
  type ImageGenerator,
  type ImageGenerationInput,
  type ImageGenerationResult,
  type AiProviderMeta,
} from "./types";

export interface LocalImageGenerateInput {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  seed?: number;
  steps?: number;
  filename?: string;
}

export interface LocalImageGenerateResult {
  success: boolean;
  imagePath: string;
  width: number;
  height: number;
  seed?: number;
  generationTimeMs?: number;
}

export interface LocalImageHealth {
  available: boolean;
  engine: string;
  model: string;
  modelLoaded: boolean;
  device: string;
  defaultWidth: number;
  defaultHeight: number;
  busy?: boolean;
  message: string;
}

interface RawImageHealth {
  available?: boolean;
  engine?: string;
  model?: string;
  model_loaded?: boolean;
  modelLoaded?: boolean;
  device?: string;
  default_width?: number;
  default_height?: number;
  defaultWidth?: number;
  defaultHeight?: number;
  busy?: boolean;
  message?: string;
}

function normalizeHealth(raw: RawImageHealth): LocalImageHealth {
  return {
    available: Boolean(raw.available),
    engine: raw.engine || "diffusers-mps",
    model: raw.model || "stable-diffusion-v1-5",
    modelLoaded: Boolean(raw.modelLoaded ?? raw.model_loaded),
    device: raw.device || "unknown",
    defaultWidth: Number(raw.defaultWidth ?? raw.default_width ?? 576),
    defaultHeight: Number(raw.defaultHeight ?? raw.default_height ?? 1024),
    busy: Boolean(raw.busy),
    message: raw.message || "Unknown image service status.",
  };
}

export function getImageServiceConfig() {
  return {
    baseUrl: (
      process.env.IMAGE_SERVICE_URL || "http://127.0.0.1:8188"
    ).replace(/\/$/, ""),
    width: Number(process.env.IMAGE_WIDTH || 576),
    height: Number(process.env.IMAGE_HEIGHT || 1024),
    timeoutMs: Number(process.env.IMAGE_TIMEOUT_MS || 300_000),
  };
}

export class ImageServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "not_running" | "failed" | "bad_response"
  ) {
    super(message);
    this.name = "ImageServiceError";
  }
}

async function fetchJson<T>(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const data = (await res.json()) as T & { detail?: string; error?: string };
    if (!res.ok) {
      const detail =
        (typeof data.detail === "string" && data.detail) ||
        data.error ||
        `HTTP ${res.status}`;
      throw new ImageServiceError(
        detail.includes("not available")
          ? "Required local image model is not available."
          : detail.includes("failed")
            ? "Image generation failed. Please try again."
            : detail,
        res.status === 503 ? "not_running" : "failed"
      );
    }
    return data;
  } catch (error) {
    if (error instanceof ImageServiceError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new ImageServiceError(
        "Image generation timed out. Please try again.",
        "failed"
      );
    }
    throw new ImageServiceError(
      "Local image service is not running. Start it and try again.",
      "not_running"
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function getImageServiceHealth(): Promise<LocalImageHealth> {
  const { baseUrl } = getImageServiceConfig();
  try {
    const raw = await fetchJson<RawImageHealth>(
      `${baseUrl}/health`,
      { method: "GET" },
      5_000
    );
    return normalizeHealth(raw);
  } catch {
    return {
      available: false,
      engine: "diffusers-mps",
      model: process.env.REELCRAFT_IMAGE_MODEL || "stable-diffusion-v1-5",
      modelLoaded: false,
      device: "unknown",
      defaultWidth: 576,
      defaultHeight: 1024,
      busy: false,
      message: "Local image service is not running. Start it and try again.",
    };
  }
}

export async function generateLocalImage(
  input: LocalImageGenerateInput
): Promise<LocalImageGenerateResult> {
  const { baseUrl, width, height, timeoutMs } = getImageServiceConfig();

  const payload = {
    prompt: input.prompt,
    negative_prompt: input.negativePrompt,
    width: input.width || width,
    height: input.height || height,
    seed: input.seed,
    steps: input.steps,
    filename: input.filename,
  };

  const maxAttempts = 8;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const data = await fetchJson<{
        success: boolean;
        image_path: string;
        width: number;
        height: number;
        seed: number;
        generation_time_ms: number;
      }>(
        `${baseUrl}/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
        timeoutMs
      );

      if (!data.success || !data.image_path) {
        throw new ImageServiceError(
          "Image generation failed. Please try again.",
          "bad_response"
        );
      }

      return {
        success: true,
        imagePath: data.image_path,
        width: data.width,
        height: data.height,
        seed: data.seed,
        generationTimeMs: data.generation_time_ms,
      };
    } catch (error) {
      lastError = error;
      const busy =
        error instanceof ImageServiceError &&
        /busy/i.test(error.message);
      if (busy && attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 5_000));
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new ImageServiceError("Image generation failed. Please try again.", "failed");
}

export class LocalDiffusersImageGenerator implements ImageGenerator {
  readonly meta: AiProviderMeta = {
    id: "local-diffusers-mps",
    name: "Local Diffusers (MPS)",
    description:
      "Generates scene stills with Stable Diffusion via a local Apple Silicon service.",
    appleSiliconFriendly: true,
    available: true,
  };

  async generate(input: ImageGenerationInput): Promise<ImageGenerationResult> {
    try {
      const result = await generateLocalImage({
        prompt: input.prompt,
        negativePrompt: input.negativePrompt,
        width: input.width || getImageServiceConfig().width,
        height: input.height || getImageServiceConfig().height,
        seed: input.seed,
      });
      return { imagePath: result.imagePath };
    } catch (error) {
      if (error instanceof ImageServiceError) {
        throw new AiUnavailableError(this.meta.id, error.message);
      }
      throw new AiUnavailableError(
        this.meta.id,
        "Image generation failed. Please try again."
      );
    }
  }
}

export function createImageGenerator(): ImageGenerator {
  return new LocalDiffusersImageGenerator();
}
