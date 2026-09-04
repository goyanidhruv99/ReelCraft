import type { ScriptGenerateRequest } from "@/types/script";

const LANGUAGE_GUIDANCE: Record<string, string> = {
  hi: "Write ALL narration, title, hook, and description in natural Hindi (Devanagari script). Spoken, conversational Hindi suitable for YouTube Shorts voiceover.",
  en: "Write ALL narration, title, hook, and description in clear natural English suitable for YouTube Shorts voiceover.",
  gu: "Write ALL narration, title, hook, and description in natural Gujarati script. Spoken, conversational Gujarati suitable for YouTube Shorts voiceover.",
  "hi-en":
    "Write ALL narration, title, hook, and description in Hinglish — natural Hindi-English mix as Indians speak in everyday conversation (e.g. 'Woh ladka mehnat karta hai every single day'). Do not use pure Hindi Devanagari only; mix English words naturally.",
  hinglish:
    "Write ALL narration, title, hook, and description in Hinglish — natural Hindi-English mix as Indians speak in everyday conversation.",
};

function resolveLanguageGuidance(language: string): string {
  const key = language.toLowerCase();
  return (
    LANGUAGE_GUIDANCE[key] ||
    `Write ALL narration, title, hook, and description in ${language}.`
  );
}

function sceneCountForDuration(durationSeconds: number): { min: number; max: number; words: string } {
  if (durationSeconds <= 30) {
    return { min: 4, max: 5, words: "60-80" };
  }
  if (durationSeconds <= 60) {
    return { min: 6, max: 8, words: "120-150" };
  }
  return { min: 8, max: 10, words: "180-220" };
}

export function buildScriptSystemPrompt(): string {
  return `You are ReelCraft's local short-form story writer for YouTube Shorts and Instagram Reels.

You write high-retention vertical video scripts.

Hard rules:
- Output ONLY valid JSON. No markdown fences. No commentary.
- Never use copyrighted characters, movie plots, brand IP, or existing famous storylines.
- Narration must sound natural when spoken aloud: short sentences, strong rhythm.
- Do NOT put camera directions, subtitle text, or on-screen text inside narration.
- visualDescription must ALWAYS be written in English, even when narration is Hindi/Gujarati/Hinglish. This is mandatory for future image models.
- visualDescription must be detailed, cinematic, vertical (9:16) composition, useful for image generation.
- visualDescription must NOT include written text, logos, watermarks, or subtitles in the image.
- Never put Hindi/Gujarati/Hinglish text inside visualDescription.
- First scene must deliver a strong hook in the first 2-3 seconds of spoken content.
- Story structure: hook → setup → conflict/problem → progression → emotional or surprising ending.
- Keep scenes focused. One clear visual beat per scene.`;
}

export function buildScriptUserPrompt(input: ScriptGenerateRequest): string {
  const lang = resolveLanguageGuidance(input.language);
  const { min, max, words } = sceneCountForDuration(input.durationSeconds);
  const topicLine = input.topic
    ? `Topic category: ${input.topic}`
    : "Topic category: general storytelling";

  return `Create an original YouTube Shorts story script from this idea:

IDEA:
${input.idea.trim()}

${topicLine}
Language instructions: ${lang}
Visual style: ${input.style}
Target duration: ~${input.durationSeconds} seconds
Target spoken length: about ${words} words total across all narration.
Scene count: ${min}-${max} scenes.
Each scene needs: sceneNumber, durationSeconds, narration, visualDescription, emotion, transition.
CRITICAL: narration uses the selected language. visualDescription MUST be English only (detailed cinematic image prompt).
Scene durations must add up to approximately ${input.durationSeconds} seconds.

Return JSON with exactly this shape:
{
  "title": "string",
  "hook": "string — opening line that grabs attention in 2-3 seconds",
  "description": "string — one short summary of the story",
  "language": "${input.language}",
  "style": "${input.style}",
  "durationSeconds": ${input.durationSeconds},
  "scenes": [
    {
      "sceneNumber": 1,
      "durationSeconds": 8,
      "narration": "spoken lines only",
      "visualDescription": "Detailed English visual prompt for image generation, cinematic, vertical composition, no text overlays",
      "emotion": "e.g. hopeful / tense / warm",
      "transition": "e.g. cut / fade / match cut"
    }
  ]
}`;
}
