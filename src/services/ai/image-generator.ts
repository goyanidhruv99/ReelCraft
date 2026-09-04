import {
  AiUnavailableError,
  type ImageGenerator,
  type ImageGenerationInput,
  type ImageGenerationResult,
} from "./types";

export class UnavailableImageGenerator implements ImageGenerator {
  readonly meta = {
    id: "local-image-stub",
    name: "Local Image Generator",
    description:
      "Will generate scene stills via a local diffusion model optimized for Apple Silicon.",
    appleSiliconFriendly: true,
    available: false,
    unavailableReason:
      "Image generation is not connected yet. Local model support arrives in Phase 2.",
  };

  async generate(input: ImageGenerationInput): Promise<ImageGenerationResult> {
    void input;
    throw new AiUnavailableError(
      this.meta.id,
      this.meta.unavailableReason
    );
  }
}

export function createImageGenerator(): ImageGenerator {
  return new UnavailableImageGenerator();
}
