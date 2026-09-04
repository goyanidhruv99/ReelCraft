/**
 * Structured video script produced by the local LLM (Phase 2+).
 */

import type { CharacterProfile, SceneImageMeta } from "./image";

export interface ScriptScene {
  sceneNumber: number;
  durationSeconds: number;
  narration: string;
  visualDescription: string;
  emotion: string;
  transition: string;
  /** Stable id for image generation / storage */
  id?: string;
  imagePrompt?: string | null;
  negativePrompt?: string | null;
  image?: SceneImageMeta | null;
}

export interface GeneratedVideoScript {
  title: string;
  hook: string;
  description: string;
  language: string;
  style: string;
  durationSeconds: number;
  scenes: ScriptScene[];
  characterProfile?: CharacterProfile | null;
}

export interface ScriptGenerateRequest {
  idea: string;
  language: string;
  style: string;
  durationSeconds: number;
  topic?: string;
}

export type AiHealthCode =
  | "ready"
  | "ollama_not_installed"
  | "ollama_not_running"
  | "model_missing"
  | "unknown";

export interface AiHealthStatus {
  available: boolean;
  ollama: boolean;
  model: string;
  modelInstalled: boolean;
  code: AiHealthCode;
  message: string;
}
