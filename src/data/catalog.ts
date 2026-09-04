import type { MusicItem, TemplateItem, VoiceItem } from "@/types";

export const TEMPLATES: TemplateItem[] = [
  {
    id: "tpl-motivational",
    title: "Motivational Story",
    category: "Motivational",
    description: "Rise-from-struggle arcs that inspire action.",
    thumbnailGradient: "from-violet-500 to-indigo-600",
    promptHint: "A person who never gave up and finally succeeded.",
    isPopular: true,
  },
  {
    id: "tpl-moral",
    title: "Moral Story",
    category: "Moral Stories",
    description: "Short fables with a clear life lesson.",
    thumbnailGradient: "from-emerald-400 to-teal-600",
    promptHint: "A story that teaches honesty and kindness.",
    isPopular: true,
  },
  {
    id: "tpl-funny",
    title: "Funny Jokes",
    category: "Funny",
    description: "Light comedy punches for short-form laughs.",
    thumbnailGradient: "from-amber-400 to-orange-500",
    promptHint: "A funny everyday situation with a twist ending.",
    isPopular: true,
  },
  {
    id: "tpl-facts",
    title: "Amazing Facts",
    category: "Facts",
    description: "Surprising facts delivered with punchy visuals.",
    thumbnailGradient: "from-sky-400 to-blue-600",
    promptHint: "Share 5 surprising facts about space.",
    isPopular: true,
  },
  {
    id: "tpl-historical",
    title: "Historical Facts",
    category: "Historical",
    description: "Bite-sized history moments for curious minds.",
    thumbnailGradient: "from-stone-500 to-amber-700",
    promptHint: "Tell a lesser-known story from Indian history.",
    isPopular: true,
  },
  {
    id: "tpl-tech",
    title: "Tech Facts",
    category: "Technology",
    description: "Explain tech concepts simply and visually.",
    thumbnailGradient: "from-cyan-400 to-blue-700",
    promptHint: "Explain how AI works in simple Hindi.",
    isPopular: true,
  },
  {
    id: "tpl-kids",
    title: "Kids Story",
    category: "Kids",
    description: "Gentle stories suitable for younger viewers.",
    thumbnailGradient: "from-pink-400 to-rose-500",
    promptHint: "A friendly animal learns to share with friends.",
    isPopular: true,
  },
  {
    id: "tpl-horror",
    title: "Horror Story",
    category: "Horror",
    description: "Atmospheric short horror with a twist.",
    thumbnailGradient: "from-slate-700 to-red-900",
    promptHint: "A quiet village house that whispers at night.",
    isPopular: true,
  },
  {
    id: "tpl-life",
    title: "Life Lessons",
    category: "Life Lessons",
    description: "Reflective shorts about everyday wisdom.",
    thumbnailGradient: "from-fuchsia-500 to-purple-700",
    promptHint: "A lesson about patience and long-term thinking.",
    isPopular: true,
  },
];

export const TEMPLATE_CATEGORIES = [
  "All",
  "Motivational",
  "Moral Stories",
  "Funny",
  "Facts",
  "Historical",
  "Technology",
  "Kids",
  "Horror",
  "Life Lessons",
] as const;

export const VOICES: VoiceItem[] = [
  {
    id: "voice-arjun",
    name: "Arjun",
    language: "Hindi",
    gender: "Male",
    style: "Warm narrator",
    previewAvailable: false,
  },
  {
    id: "voice-meera",
    name: "Meera",
    language: "Hindi",
    gender: "Female",
    style: "Soft storytelling",
    previewAvailable: false,
  },
  {
    id: "voice-kabir",
    name: "Kabir",
    language: "Hindi",
    gender: "Male",
    style: "Energetic",
    previewAvailable: false,
  },
  {
    id: "voice-aisha",
    name: "Aisha",
    language: "English",
    gender: "Female",
    style: "Clear & calm",
    previewAvailable: false,
  },
  {
    id: "voice-noah",
    name: "Noah",
    language: "English",
    gender: "Male",
    style: "Documentary",
    previewAvailable: false,
  },
  {
    id: "voice-priya",
    name: "Priya",
    language: "Hindi",
    gender: "Female",
    style: "Motivational",
    previewAvailable: false,
  },
];

/** Royalty-free / original placeholders — no copyrighted tracks */
export const MUSIC_TRACKS: MusicItem[] = [
  {
    id: "music-uplift",
    title: "Morning Climb",
    category: "Motivational",
    durationSec: 62,
    previewAvailable: false,
    licensed: true,
  },
  {
    id: "music-soft",
    title: "Quiet Horizon",
    category: "Ambient",
    durationSec: 75,
    previewAvailable: false,
    licensed: true,
  },
  {
    id: "music-playful",
    title: "Sunny Steps",
    category: "Comedy",
    durationSec: 48,
    previewAvailable: false,
    licensed: true,
  },
  {
    id: "music-focus",
    title: "Circuit Glow",
    category: "Technology",
    durationSec: 58,
    previewAvailable: false,
    licensed: true,
  },
  {
    id: "music-kids",
    title: "Paper Planes",
    category: "Kids",
    durationSec: 54,
    previewAvailable: false,
    licensed: true,
  },
  {
    id: "music-dark",
    title: "Empty Corridor",
    category: "Horror",
    durationSec: 70,
    previewAvailable: false,
    licensed: true,
  },
];

export const TOPIC_CHIPS = [
  "Story",
  "Motivation",
  "Life Lessons",
  "Facts",
  "Comedy",
  "Technology",
  "Kids",
  "Horror",
] as const;

export const LANGUAGE_OPTIONS = [
  { value: "hi", label: "Hindi" },
  { value: "en", label: "English" },
  { value: "gu", label: "Gujarati" },
  { value: "hi-en", label: "Hinglish" },
] as const;

export const STYLE_OPTIONS = [
  { value: "cinematic", label: "Cinematic" },
  { value: "realistic", label: "Realistic" },
  { value: "cartoon", label: "Cartoon" },
  { value: "anime", label: "Anime" },
  { value: "documentary", label: "Documentary" },
] as const;

export const ASPECT_OPTIONS = [
  { value: "9:16", label: "9:16 (Shorts)" },
  { value: "16:9", label: "16:9 (Landscape)" },
  { value: "1:1", label: "1:1 (Square)" },
] as const;

export const DURATION_OPTIONS = [
  { value: 30, label: "~ 30 Seconds" },
  { value: 60, label: "~ 1 Minute" },
  { value: 90, label: "~ 90 Seconds" },
] as const;

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  script_pending: "Script pending",
  script_ready: "Script ready",
  scenes_pending: "Scenes pending",
  scenes_ready: "Scenes ready",
  rendering: "Rendering",
  completed: "Completed",
  failed: "Failed",
};
