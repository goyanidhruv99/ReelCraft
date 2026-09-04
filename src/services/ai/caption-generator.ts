/**
 * Placeholder AI generator methods intentionally ignore inputs until
 * local model providers are connected in Phase 2+.
 */

import {
  AiUnavailableError,
  type CaptionGenerator,
  type CaptionGenerationInput,
  type CaptionGenerationResult,
} from "./types";

export class UnavailableCaptionGenerator implements CaptionGenerator {
  readonly meta = {
    id: "local-caption-stub",
    name: "Local Caption Generator",
    description:
      "Will produce timed captions aligned to voiceover audio.",
    appleSiliconFriendly: true,
    available: false,
    unavailableReason:
      "Caption generation is not connected yet. Local support arrives in Phase 2.",
  };

  async generate(
    input: CaptionGenerationInput
  ): Promise<CaptionGenerationResult> {
    void input;
    throw new AiUnavailableError(
      this.meta.id,
      this.meta.unavailableReason
    );
  }
}

export function createCaptionGenerator(): CaptionGenerator {
  return new UnavailableCaptionGenerator();
}
