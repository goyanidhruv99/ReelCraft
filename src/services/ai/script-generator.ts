import type {
  GeneratedVideoScript,
  ScriptGenerateRequest,
  ScriptScene,
} from "@/types/script";
import {
  buildScriptSystemPrompt,
  buildScriptUserPrompt,
} from "./prompt-builder";
import {
  OllamaError,
  extractJsonObject,
  ollamaChat,
} from "./ollama-client";
import {
  AiUnavailableError,
  type ScriptGenerationInput,
  type ScriptGenerationResult,
  type ScriptGenerator,
} from "./types";

function isScene(value: unknown): value is ScriptScene {
  if (!value || typeof value !== "object") return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.sceneNumber === "number" &&
    typeof s.durationSeconds === "number" &&
    typeof s.narration === "string" &&
    typeof s.visualDescription === "string" &&
    typeof s.emotion === "string" &&
    typeof s.transition === "string"
  );
}

export function parseGeneratedScript(
  raw: unknown,
  fallback: ScriptGenerateRequest
): GeneratedVideoScript {
  if (!raw || typeof raw !== "object") {
    throw new OllamaError(
      "Script generation failed. Please try again.",
      "bad_response"
    );
  }

  const data = raw as Record<string, unknown>;
  const scenesRaw = Array.isArray(data.scenes) ? data.scenes : [];
  const scenes = scenesRaw.filter(isScene).map((scene, index) => ({
    sceneNumber:
      typeof scene.sceneNumber === "number" ? scene.sceneNumber : index + 1,
    durationSeconds: Math.max(1, Number(scene.durationSeconds) || 8),
    narration: String(scene.narration || "").trim(),
    visualDescription: String(scene.visualDescription || "").trim(),
    emotion: String(scene.emotion || "neutral").trim(),
    transition: String(scene.transition || "cut").trim(),
  }));

  if (scenes.length === 0) {
    throw new OllamaError(
      "Script generation failed. Please try again.",
      "bad_response"
    );
  }

  const title = String(data.title || "Untitled Short").trim();
  const hook = String(data.hook || scenes[0]?.narration || "").trim();
  const description = String(data.description || "").trim();

  return {
    title,
    hook,
    description,
    language: String(data.language || fallback.language),
    style: String(data.style || fallback.style),
    durationSeconds: Number(data.durationSeconds) || fallback.durationSeconds,
    scenes,
  };
}

export async function generateStructuredScript(
  input: ScriptGenerateRequest
): Promise<GeneratedVideoScript> {
  const idea = input.idea.trim();
  if (!idea) {
    throw new OllamaError("Enter a video idea before generating.", "bad_response");
  }

  const messages = [
    { role: "system" as const, content: buildScriptSystemPrompt() },
    { role: "user" as const, content: buildScriptUserPrompt(input) },
  ];

  const attempt = async (retryHint?: string) => {
    const chatMessages = retryHint
      ? [
          ...messages,
          {
            role: "user" as const,
            content: retryHint,
          },
        ]
      : messages;

    const content = await ollamaChat(chatMessages, {
      temperature: 0.7,
      format: "json",
    });
    const parsed = extractJsonObject(content);
    return parseGeneratedScript(parsed, input);
  };

  try {
    return await attempt();
  } catch (error) {
    if (error instanceof OllamaError && error.code === "bad_response") {
      return await attempt(
        "Your previous reply was invalid. Return ONLY valid JSON matching the required schema, with a non-empty scenes array."
      );
    }
    throw error;
  }
}

/**
 * ScriptGenerator implementation backed by local Ollama.
 */
export class OllamaScriptGenerator implements ScriptGenerator {
  readonly meta = {
    id: "ollama-script",
    name: "Ollama Script Generator",
    description:
      "Generates structured Shorts scripts via a local Ollama model on Apple Silicon.",
    appleSiliconFriendly: true,
    available: true,
  };

  async generate(input: ScriptGenerationInput): Promise<ScriptGenerationResult> {
    try {
      const structured = await generateStructuredScript({
        idea: input.idea,
        language: input.language,
        style: input.style || "cinematic",
        durationSeconds: input.durationSec,
        topic: input.topic,
      });

      return {
        title: structured.title,
        script: JSON.stringify(structured),
        estimatedDurationSec: structured.durationSeconds,
      };
    } catch (error) {
      if (error instanceof OllamaError) {
        throw new AiUnavailableError(this.meta.id, error.message);
      }
      throw new AiUnavailableError(
        this.meta.id,
        "Script generation failed. Please try again."
      );
    }
  }
}

export function createScriptGenerator(): ScriptGenerator {
  return new OllamaScriptGenerator();
}
