import {
  AiUnavailableError,
  type VoiceGenerator,
  type VoiceGenerationInput,
  type VoiceGenerationResult,
} from "./types";

export class UnavailableVoiceGenerator implements VoiceGenerator {
  readonly meta = {
    id: "local-voice-stub",
    name: "Local Voice Generator",
    description:
      "Will synthesize voiceovers with a local TTS engine (no cloud TTS APIs).",
    appleSiliconFriendly: true,
    available: false,
    unavailableReason:
      "Voice generation is not connected yet. Local TTS support arrives in Phase 2.",
  };

  async generate(input: VoiceGenerationInput): Promise<VoiceGenerationResult> {
    void input;
    throw new AiUnavailableError(
      this.meta.id,
      this.meta.unavailableReason
    );
  }
}

export function createVoiceGenerator(): VoiceGenerator {
  return new UnavailableVoiceGenerator();
}
