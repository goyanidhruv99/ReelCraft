import type {
  AppSettings,
  BrandingSettings,
  CreationMode,
  TopicChip,
  VideoDraft,
  VideoDraftSettings,
  VideoStyle,
  AspectRatio,
  GeneratedVideoScript,
} from "@/types";
import { emitLocalStoreChange } from "@/lib/local-store-events";
import {
  buildDefaultSceneImageFields,
  extractCharacterProfile,
} from "@/services/ai/image-prompt-builder";

const VIDEOS_KEY = "reelcraft.videos";
const BRANDING_KEY = "reelcraft.branding";
const SETTINGS_KEY = "reelcraft.settings";
const SELECTED_VOICE_KEY = "reelcraft.selectedVoice";
const SELECTED_MUSIC_KEY = "reelcraft.selectedMusic";

const jsonCache = new Map<string, { raw: string | null; value: unknown }>();
const EMPTY_VIDEOS: VideoDraft[] = [];
const EMPTY_VIDEO: VideoDraft | null = null;

export function getEmptyVideos(): VideoDraft[] {
  return EMPTY_VIDEOS;
}

export function getEmptyVideo(): VideoDraft | null {
  return EMPTY_VIDEO;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readJsonCached<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    const cached = jsonCache.get(key);
    if (cached && cached.raw === raw) {
      return cached.value as T;
    }
    if (raw == null) {
      jsonCache.set(key, { raw, value: fallback });
      return fallback;
    }
    const value = JSON.parse(raw) as T;
    jsonCache.set(key, { raw, value });
    return value;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!canUseStorage()) return;
  const raw = JSON.stringify(value);
  localStorage.setItem(key, raw);
  jsonCache.set(key, { raw, value });
  emitLocalStoreChange();
}

function createId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `rc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const defaultDraftSettings: VideoDraftSettings = {
  language: "hi",
  videoStyle: "cinematic",
  aspectRatio: "9:16",
  durationSec: 60,
};

export const defaultAppSettings: AppSettings = {
  defaultLanguage: "hi",
  defaultStyle: "cinematic",
  defaultAspectRatio: "9:16",
  defaultDurationSec: 60,
  sidebarCollapsed: false,
  uiLanguage: "en",
};

export const defaultBranding: BrandingSettings = {
  channelName: "",
  logoDataUrl: null,
  watermarkEnabled: false,
  watermarkPosition: "bottom-right",
  instagramHandle: "",
  youtubeChannelName: "",
};

let videosSnapshot: VideoDraft[] = EMPTY_VIDEOS;
let videosSnapshotKey: string | null = null;

export function listVideos(): VideoDraft[] {
  if (!canUseStorage()) return EMPTY_VIDEOS;
  const raw = localStorage.getItem(VIDEOS_KEY);
  if (raw === videosSnapshotKey) return videosSnapshot;

  try {
    const videos = raw ? (JSON.parse(raw) as VideoDraft[]) : [];
    videosSnapshot = [...videos].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    videosSnapshotKey = raw;
    return videosSnapshot;
  } catch {
    videosSnapshot = EMPTY_VIDEOS;
    videosSnapshotKey = raw;
    return videosSnapshot;
  }
}

export function getVideo(id: string): VideoDraft | null {
  return listVideos().find((v) => v.id === id) ?? null;
}

export function saveVideo(video: VideoDraft): VideoDraft {
  const videos = listVideos();
  const index = videos.findIndex((v) => v.id === video.id);
  const next = [...videos];
  if (index >= 0) {
    next[index] = video;
  } else {
    next.unshift(video);
  }
  writeJson(VIDEOS_KEY, next);
  videosSnapshotKey = null;
  return video;
}

export function deleteVideo(id: string): void {
  writeJson(
    VIDEOS_KEY,
    listVideos().filter((v) => v.id !== id)
  );
  videosSnapshotKey = null;
}

export function createDraft(params: {
  idea: string;
  mode: CreationMode;
  settings: VideoDraftSettings;
  templateId?: string;
  title?: string;
}): VideoDraft {
  const now = new Date().toISOString();
  const title =
    params.title?.trim() ||
    params.idea.trim().slice(0, 48) ||
    "Untitled video";

  const draft: VideoDraft = {
    id: createId(),
    title,
    idea: params.idea.trim(),
    script: null,
    status: "script_pending",
    mode: params.mode,
    settings: params.settings,
    templateId: params.templateId,
    createdAt: now,
    updatedAt: now,
    thumbnailUrl: null,
  };

  return saveVideo(draft);
}

export function updateVideoScript(
  id: string,
  script: string | null,
  status: VideoDraft["status"] = "script_ready"
): VideoDraft | null {
  const existing = getVideo(id);
  if (!existing) return null;
  const updated: VideoDraft = {
    ...existing,
    script,
    status,
    updatedAt: new Date().toISOString(),
  };
  return saveVideo(updated);
}

export function saveGeneratedScript(
  id: string,
  generatedScript: import("@/types").GeneratedVideoScript
): VideoDraft | null {
  const existing = getVideo(id);
  if (!existing) return null;
  const prepared = prepareScriptForScenes(id, generatedScript, existing.settings.videoStyle);
  const narration = prepared.scenes.map((s) => s.narration).join("\n\n");
  const updated: VideoDraft = {
    ...existing,
    title: prepared.title || existing.title,
    generatedScript: prepared,
    script: narration,
    status: "script_ready",
    updatedAt: new Date().toISOString(),
  };
  return saveVideo(updated);
}

export function updateGeneratedScript(
  id: string,
  generatedScript: import("@/types").GeneratedVideoScript
): VideoDraft | null {
  return saveGeneratedScript(id, generatedScript);
}

export function prepareScriptForScenes(
  projectId: string,
  script: GeneratedVideoScript,
  style: string
): GeneratedVideoScript {
  const character =
    script.characterProfile || extractCharacterProfile(script);

  const scenes = script.scenes.map((scene, index) => {
    const sceneNumber = scene.sceneNumber || index + 1;
    const defaults = buildDefaultSceneImageFields(scene, style, character);
    return {
      ...scene,
      id: scene.id || `scn_${projectId.slice(0, 8)}_${sceneNumber}`,
      sceneNumber,
      imagePrompt: scene.imagePrompt || defaults.imagePrompt,
      negativePrompt: scene.negativePrompt || defaults.negativePrompt,
      image: scene.image || {
        status: "pending" as const,
        imagePath: null,
        imageUrl: null,
        imagePrompt: scene.imagePrompt || defaults.imagePrompt,
        negativePrompt: scene.negativePrompt || defaults.negativePrompt,
        seed: null,
        width: null,
        height: null,
        generationTimeMs: null,
        error: null,
      },
    };
  });

  return {
    ...script,
    characterProfile: character,
    scenes,
  };
}

export function markScenesReady(id: string): VideoDraft | null {
  const existing = getVideo(id);
  if (!existing?.generatedScript) return null;
  const prepared = prepareScriptForScenes(
    id,
    existing.generatedScript,
    existing.settings.videoStyle
  );
  const updated: VideoDraft = {
    ...existing,
    generatedScript: prepared,
    status: "scenes_pending",
    updatedAt: new Date().toISOString(),
  };
  return saveVideo(updated);
}

export function getBranding(): BrandingSettings {
  return readJsonCached(BRANDING_KEY, defaultBranding);
}

export function saveBranding(settings: BrandingSettings): void {
  writeJson(BRANDING_KEY, settings);
}

export function getAppSettings(): AppSettings {
  return readJsonCached(SETTINGS_KEY, defaultAppSettings);
}

export function saveAppSettings(settings: AppSettings): void {
  writeJson(SETTINGS_KEY, settings);
}

export function getSelectedVoiceId(): string | null {
  return readJsonCached<string | null>(SELECTED_VOICE_KEY, null);
}

export function setSelectedVoiceId(id: string): void {
  writeJson(SELECTED_VOICE_KEY, id);
}

export function getSelectedMusicId(): string | null {
  return readJsonCached<string | null>(SELECTED_MUSIC_KEY, null);
}

export function setSelectedMusicId(id: string): void {
  writeJson(SELECTED_MUSIC_KEY, id);
}

export function buildSettingsFromForm(input: {
  language: string;
  videoStyle: string;
  aspectRatio: string;
  durationSec: number;
  topic?: TopicChip;
}): VideoDraftSettings {
  return {
    language: input.language,
    videoStyle: input.videoStyle as VideoStyle,
    aspectRatio: input.aspectRatio as AspectRatio,
    durationSec: input.durationSec,
    topic: input.topic,
  };
}
