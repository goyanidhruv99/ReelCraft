/**
 * Video renderer abstraction for FFmpeg-based composition.
 * Phase 1: interface + unavailable stub only.
 */

export interface RenderSceneAsset {
  order: number;
  imagePath: string;
  durationSec: number;
}

export interface VideoRenderInput {
  scenes: RenderSceneAsset[];
  voiceoverPath?: string;
  musicPath?: string;
  captionsPath?: string;
  aspectRatio: "9:16" | "16:9" | "1:1";
  outputPath: string;
  watermarkPath?: string;
  watermarkPosition?: string;
}

export interface VideoRenderResult {
  outputPath: string;
  durationSec: number;
}

export interface VideoRenderer {
  readonly id: string;
  readonly available: boolean;
  readonly unavailableReason?: string;
  render(input: VideoRenderInput): Promise<VideoRenderResult>;
}

export class RendererUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RendererUnavailableError";
  }
}

export class UnavailableFfmpegRenderer implements VideoRenderer {
  readonly id = "ffmpeg-local";
  readonly available = false;
  readonly unavailableReason =
    "FFmpeg video rendering is not wired up yet. It will run locally in a later phase.";

  async render(input: VideoRenderInput): Promise<VideoRenderResult> {
    void input;
    throw new RendererUnavailableError(this.unavailableReason);
  }
}

export function createVideoRenderer(): VideoRenderer {
  return new UnavailableFfmpegRenderer();
}
