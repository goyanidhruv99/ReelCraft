import { createCaptionGenerator } from "./caption-generator";
import { createImageGenerator } from "./image-generator";
import { createSceneGenerator } from "./scene-generator";
import { createScriptGenerator } from "./script-generator";
import { createVoiceGenerator } from "./voice-generator";
import type {
  CaptionGenerator,
  ImageGenerator,
  SceneGenerator,
  ScriptGenerator,
  VoiceGenerator,
} from "./types";

export type {
  AiProviderMeta,
  CaptionCue,
  CaptionGenerationInput,
  CaptionGenerationResult,
  CaptionGenerator,
  ImageGenerationInput,
  ImageGenerationResult,
  ImageGenerator,
  SceneDefinition,
  SceneGenerationInput,
  SceneGenerationResult,
  SceneGenerator,
  ScriptGenerationInput,
  ScriptGenerationResult,
  ScriptGenerator,
  VoiceGenerationInput,
  VoiceGenerationResult,
  VoiceGenerator,
} from "./types";

export { AiUnavailableError } from "./types";
export { generateStructuredScript, parseGeneratedScript } from "./script-generator";
export { getAiHealth, getOllamaConfig, OllamaError } from "./ollama-client";
export {
  createImageGenerator,
  generateLocalImage,
  getImageServiceHealth,
  getImageServiceConfig,
  ImageServiceError,
} from "./image-generator";
export {
  buildSceneImagePrompt,
  buildDefaultSceneImageFields,
  extractCharacterProfile,
  DEFAULT_NEGATIVE_PROMPT,
} from "./image-prompt-builder";


export interface AiServices {
  script: ScriptGenerator;
  scene: SceneGenerator;
  image: ImageGenerator;
  voice: VoiceGenerator;
  caption: CaptionGenerator;
}

export function getAiServices(): AiServices {
  return {
    script: createScriptGenerator(),
    scene: createSceneGenerator(),
    image: createImageGenerator(),
    voice: createVoiceGenerator(),
    caption: createCaptionGenerator(),
  };
}
