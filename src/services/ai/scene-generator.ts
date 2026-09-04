import {
  AiUnavailableError,
  type SceneGenerator,
  type SceneGenerationInput,
  type SceneGenerationResult,
} from "./types";

export class UnavailableSceneGenerator implements SceneGenerator {
  readonly meta = {
    id: "local-scene-stub",
    name: "Local Scene Generator",
    description:
      "Will break scripts into timed scenes with visual prompts using a local model.",
    appleSiliconFriendly: true,
    available: false,
    unavailableReason:
      "Scene generation is not connected yet. Local model support arrives in Phase 2.",
  };

  async generate(input: SceneGenerationInput): Promise<SceneGenerationResult> {
    void input;
    throw new AiUnavailableError(
      this.meta.id,
      this.meta.unavailableReason
    );
  }
}

export function createSceneGenerator(): SceneGenerator {
  return new UnavailableSceneGenerator();
}
