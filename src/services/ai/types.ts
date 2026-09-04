/**
 * AI provider abstractions for ReelCraft.
 * Phase 1: interfaces + unavailable stubs only.
 * Phase 2+: plug in local/open-source model implementations.
 * Do not hard-code paid API providers in the UI.
 */

export type AiProviderId = string;

export interface AiProviderMeta {
  id: AiProviderId;
  name: string;
  description: string;
  /** Whether this provider can run on Apple Silicon with ~16GB unified memory */
  appleSiliconFriendly: boolean;
  available: boolean;
  unavailableReason?: string;
}

export interface ScriptGenerationInput {
  idea: string;
  language: string;
  topic?: string;
  durationSec: number;
  style?: string;
}

export interface ScriptGenerationResult {
  script: string;
  title: string;
  estimatedDurationSec: number;
}

export interface ScriptGenerator {
  readonly meta: AiProviderMeta;
  generate(input: ScriptGenerationInput): Promise<ScriptGenerationResult>;
}

export interface SceneDefinition {
  order: number;
  narration: string;
  visualPrompt: string;
  durationSec: number;
}

export interface SceneGenerationInput {
  script: string;
  language: string;
  style: string;
  aspectRatio: string;
}

export interface SceneGenerationResult {
  scenes: SceneDefinition[];
}

export interface SceneGenerator {
  readonly meta: AiProviderMeta;
  generate(input: SceneGenerationInput): Promise<SceneGenerationResult>;
}

export interface ImageGenerationInput {
  prompt: string;
  style: string;
  aspectRatio: string;
  width?: number;
  height?: number;
}

export interface ImageGenerationResult {
  /** Local file path or data URL once generated */
  imagePath: string;
}

export interface ImageGenerator {
  readonly meta: AiProviderMeta;
  generate(input: ImageGenerationInput): Promise<ImageGenerationResult>;
}

export interface VoiceGenerationInput {
  text: string;
  language: string;
  voiceId: string;
}

export interface VoiceGenerationResult {
  audioPath: string;
  durationSec: number;
}

export interface VoiceGenerator {
  readonly meta: AiProviderMeta;
  generate(input: VoiceGenerationInput): Promise<VoiceGenerationResult>;
}

export interface CaptionCue {
  startSec: number;
  endSec: number;
  text: string;
}

export interface CaptionGenerationInput {
  script: string;
  language: string;
  audioDurationSec: number;
}

export interface CaptionGenerationResult {
  cues: CaptionCue[];
  format: "srt" | "vtt";
}

export interface CaptionGenerator {
  readonly meta: AiProviderMeta;
  generate(input: CaptionGenerationInput): Promise<CaptionGenerationResult>;
}

export class AiUnavailableError extends Error {
  constructor(
    public readonly providerId: string,
    message = "This AI capability is not available yet."
  ) {
    super(message);
    this.name = "AiUnavailableError";
  }
}
