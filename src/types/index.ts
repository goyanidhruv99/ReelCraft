/** Shared domain types for ReelCraft */

export type VideoStatus =
  | "draft"
  | "script_pending"
  | "script_ready"
  | "scenes_pending"
  | "scenes_ready"
  | "rendering"
  | "completed"
  | "failed";

export type CreationMode = "text-to-video" | "story-to-video" | "template";

export type AspectRatio = "9:16" | "16:9" | "1:1";

export type VideoStyle =
  | "cinematic"
  | "realistic"
  | "cartoon"
  | "anime"
  | "documentary";

export type TopicChip =
  | "Story"
  | "Motivation"
  | "Life Lessons"
  | "Facts"
  | "Comedy"
  | "Technology"
  | "Kids"
  | "Horror";

export interface VideoDraftSettings {
  language: string;
  videoStyle: VideoStyle;
  aspectRatio: AspectRatio;
  durationSec: number;
  topic?: TopicChip;
}

export interface VideoDraft {
  id: string;
  title: string;
  idea: string;
  /** Legacy plain-text script field (kept for compatibility) */
  script: string | null;
  /** Structured Phase 2 script from local LLM */
  generatedScript?: import("./script").GeneratedVideoScript | null;
  status: VideoStatus;
  mode: CreationMode;
  settings: VideoDraftSettings;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string | null;
}

export interface TemplateItem {
  id: string;
  title: string;
  category: string;
  description: string;
  thumbnailGradient: string;
  promptHint: string;
  isPopular?: boolean;
}

export interface VoiceItem {
  id: string;
  name: string;
  language: string;
  gender: "Male" | "Female" | "Neutral";
  style: string;
  previewAvailable: boolean;
}

export interface MusicItem {
  id: string;
  title: string;
  category: string;
  durationSec: number;
  previewAvailable: boolean;
  licensed: boolean;
}

export interface BrandingSettings {
  channelName: string;
  logoDataUrl: string | null;
  watermarkEnabled: boolean;
  watermarkPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  instagramHandle: string;
  youtubeChannelName: string;
}

export interface AppSettings {
  defaultLanguage: string;
  defaultStyle: VideoStyle;
  defaultAspectRatio: AspectRatio;
  defaultDurationSec: number;
  sidebarCollapsed: boolean;
  uiLanguage: string;
}

export interface GenerationJobStatus {
  videoId: string;
  stage: VideoStatus;
  message: string;
  progress: number;
  available: boolean;
}

export type {
  AiHealthStatus,
  GeneratedVideoScript,
  ScriptGenerateRequest,
  ScriptScene,
} from "./script";

export type {
  CharacterProfile,
  ImageGenerateRequest,
  ImageGenerateResponse,
  ImageHealthStatus,
  SceneImageMeta,
  SceneImageStatus,
} from "./image";
