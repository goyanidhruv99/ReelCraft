import type { CharacterProfile } from "@/types/image";
import type { GeneratedVideoScript, ScriptScene } from "@/types/script";

export const DEFAULT_NEGATIVE_PROMPT = [
  "text",
  "subtitle",
  "captions",
  "watermark",
  "logo",
  "signature",
  "words",
  "letters",
  "title",
  "distorted face",
  "deformed hands",
  "extra fingers",
  "missing fingers",
  "duplicate people",
  "malformed anatomy",
  "blurry face",
  "low quality",
  "cropped head",
  "unnatural proportions",
  "extra limbs",
  "mutated hands",
  "bad anatomy",
  "poorly drawn face",
  "disfigured",
  "jpeg artifacts",
].join(", ");

/** Keep style short — SD1.5 CLIP truncates at 77 tokens. */
const STYLE_SUFFIX: Record<string, string> = {
  cinematic:
    "cinematic illustration, natural light, vertical portrait, expressive face",
  realistic:
    "photorealistic, soft daylight, vertical portrait, realistic proportions",
  cartoon:
    "stylized cartoon, clean shapes, vertical portrait, soft shading",
  anime:
    "anime illustration, clean linework, vertical portrait, expressive eyes",
  documentary:
    "documentary photo style, natural light, vertical portrait, candid",
};

/**
 * Heuristic character extraction for Phase 3 consistency preparation.
 * Not LLM-based — produces a reusable visual identity string.
 */
export function extractCharacterProfile(
  script: GeneratedVideoScript
): CharacterProfile {
  const blob = [
    script.title,
    script.description,
    script.hook,
    ...script.scenes.map((s) => `${s.narration} ${s.visualDescription}`),
  ]
    .join(" ")
    .toLowerCase();

  const isFemale =
    /\b(girl|woman|daughter|mother|ladki|mahila|beti)\b/i.test(blob) &&
    !/\b(boy|man|father|ladka|beta)\b/i.test(blob);
  const isChild = /\b(child|kid|boy|girl|teenager|17|16|15|ladka|ladki)\b/i.test(
    blob
  );

  const gender = isFemale ? "female" : "male";
  const age = isChild ? 17 : 28;
  const name = isFemale ? "Asha" : "Ravi";
  const clothing = isFemale
    ? "simple cotton salwar kameez in muted colors"
    : "faded blue shirt and worn trousers";
  const appearance = isFemale
    ? "slim young Indian woman, warm brown eyes, long dark hair tied simply"
    : "slim Indian teenager, short black hair, determined expression, warm brown skin";
  const location = /village|gaon|rural/i.test(blob)
    ? "rural India"
    : "India";

  const visualIdentity = [
    `${age}-year-old Indian ${gender}`,
    appearance,
    clothing,
    location,
  ].join(", ");

  return {
    name,
    age,
    gender,
    appearance,
    clothing,
    visualIdentity,
    location,
  };
}

/** Prefer visualDescription; inject a short character cue for consistency prep. */
export function buildSceneImagePrompt(input: {
  visualDescription: string;
  style?: string;
  emotion?: string;
  character?: CharacterProfile | null;
}): string {
  const styleKey = (input.style || "cinematic").toLowerCase();
  const style = STYLE_SUFFIX[styleKey] || STYLE_SUFFIX.cinematic;
  let base = input.visualDescription.trim().replace(/\s+/g, " ");
  // Leave room for style + character (CLIP ~77 tokens)
  if (base.length > 220) {
    base = `${base.slice(0, 217).trim()}...`;
  }
  const characterCue = input.character
    ? `${input.character.age}yo Indian ${input.character.gender}, ${input.character.appearance.split(",")[0]}`
    : "";
  const emotionLine = input.emotion ? `${input.emotion} mood` : "";

  return [base, characterCue, emotionLine, style]
    .filter(Boolean)
    .join(", ");
}

export function buildDefaultSceneImageFields(
  scene: ScriptScene,
  style: string,
  character: CharacterProfile | null
): { imagePrompt: string; negativePrompt: string } {
  return {
    imagePrompt: buildSceneImagePrompt({
      visualDescription: scene.visualDescription,
      style,
      emotion: scene.emotion,
      character,
    }),
    negativePrompt: DEFAULT_NEGATIVE_PROMPT,
  };
}
