/**
 * Character profile preparation for future consistency work (Phase 3).
 * Injected into image prompts — does not guarantee identical faces yet.
 */

export interface CharacterProfile {
  name: string;
  age?: number | null;
  gender?: string | null;
  appearance: string;
  clothing: string;
  visualIdentity: string;
  location?: string | null;
}

export type SceneImageStatus =
  | "pending"
  | "generating"
  | "ready"
  | "failed"
  | "skipped";

export interface SceneImageMeta {
  status: SceneImageStatus;
  imagePath?: string | null;
  /** Public URL path served by ReelCraft, e.g. /api/media/... */
  imageUrl?: string | null;
  imagePrompt?: string | null;
  negativePrompt?: string | null;
  seed?: number | null;
  width?: number | null;
  height?: number | null;
  generationTimeMs?: number | null;
  error?: string | null;
}

export interface ImageGenerateRequest {
  projectId: string;
  sceneId: string;
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  seed?: number;
}

export interface ImageGenerateResponse {
  success: boolean;
  image?: {
    path: string;
    url: string;
    width: number;
    height: number;
    seed: number;
    generationTimeMs?: number;
  };
  error?: string;
}

export interface ImageHealthStatus {
  available: boolean;
  engine: string;
  model: string;
  modelLoaded: boolean;
  device: string;
  defaultWidth: number;
  defaultHeight: number;
  message: string;
}
