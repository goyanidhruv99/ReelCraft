"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  ArrowRight,
  Lightbulb,
  Loader2,
  RefreshCw,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { UnavailableNotice } from "@/components/ui/unavailable-notice";
import { useClientSnapshot } from "@/hooks/use-client-snapshot";
import {
  getVideo,
  updateGeneratedScript,
} from "@/services/storage/local-store";
import { STATUS_LABELS } from "@/data/catalog";
import type { GeneratedVideoScript, ScriptScene } from "@/types";

function emptyScriptFromIdea(
  idea: string,
  language: string,
  style: string,
  durationSeconds: number
): GeneratedVideoScript {
  return {
    title: idea.slice(0, 48) || "Untitled Short",
    hook: "",
    description: "",
    language,
    style,
    durationSeconds,
    scenes: [],
  };
}

export function ScriptWorkspace({ videoId }: { videoId: string }) {
  const video = useClientSnapshot(
    () => getVideo(videoId),
    () => null
  );

  const storedScript = video?.generatedScript ?? null;
  const [draft, setDraft] = useState<GeneratedVideoScript | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const script = useMemo(() => {
    if (draft) return draft;
    if (storedScript) return storedScript;
    if (!video) return null;
    return emptyScriptFromIdea(
      video.idea,
      video.settings.language,
      video.settings.videoStyle,
      video.settings.durationSec
    );
  }, [draft, storedScript, video]);

  const updateScript = useCallback(
    (updater: (prev: GeneratedVideoScript) => GeneratedVideoScript) => {
      setDraft((prev) => {
        const base =
          prev ||
          storedScript ||
          (video
            ? emptyScriptFromIdea(
                video.idea,
                video.settings.language,
                video.settings.videoStyle,
                video.settings.durationSec
              )
            : null);
        if (!base) return prev;
        return updater(base);
      });
      setSaved(false);
    },
    [storedScript, video]
  );

  const updateScene = useCallback(
    (index: number, patch: Partial<ScriptScene>) => {
      updateScript((prev) => ({
        ...prev,
        scenes: prev.scenes.map((scene, i) =>
          i === index ? { ...scene, ...patch } : scene
        ),
      }));
    },
    [updateScript]
  );

  const handleSave = () => {
    if (!video || !script) return;
    updateGeneratedScript(video.id, script);
    setDraft(null);
    setSaved(true);
    setMessage("Script saved to this draft.");
  };

  const handleRegenerate = async () => {
    if (!video) return;
    setBusy(true);
    setMessage(null);
    setSaved(false);

    try {
      const res = await fetch("/api/ai/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: video.idea,
          language: video.settings.language,
          style: video.settings.videoStyle,
          durationSeconds: video.settings.durationSec,
          topic: video.settings.topic,
        }),
      });
      const data = (await res.json()) as {
        script?: GeneratedVideoScript;
        error?: string;
      };

      if (!res.ok || !data.script) {
        setMessage(data.error || "Script generation failed. Please try again.");
        return;
      }

      updateGeneratedScript(video.id, data.script);
      setDraft(null);
      setMessage("New script generated with local AI.");
    } catch {
      setMessage("Script generation failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleContinue = () => {
    setMessage(
      "Scene image generation is not available in Phase 2. Your script is ready — images, voice, and render come next."
    );
  };

  if (!video || !script) {
    return (
      <div className="space-y-4">
        <UnavailableNotice
          variant="warning"
          title="Draft not found"
          message="This video draft does not exist in local storage. Create a new video to continue."
        />
        <Button asChild>
          <Link href="/create">Back to Create</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6C4DFF]">
            Script workspace
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#172033] sm:text-3xl">
            {script.title || video.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge>{STATUS_LABELS[video.status] ?? video.status}</Badge>
            <span className="text-sm text-[#5B647A]">
              {script.language} · {script.style} · ~{script.durationSeconds}s
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" asChild>
            <Link href="/videos">My Videos</Link>
          </Button>
          <Button
            variant="secondary"
            onClick={() => void handleRegenerate()}
            disabled={busy}
            type="button"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Regenerate Script
          </Button>
          <Button onClick={handleSave} type="button">
            <Save className="h-4 w-4" />
            Save Script
          </Button>
        </div>
      </div>

      {message ? (
        <UnavailableNotice
          title={saved ? "Saved" : "Status"}
          message={message}
          variant={message.toLowerCase().includes("failed") || message.toLowerCase().includes("not running") || message.toLowerCase().includes("not installed") ? "warning" : "info"}
        />
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-[#6C4DFF]" />
              Original idea
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap rounded-xl bg-[#F7F8FF] p-4 text-sm leading-relaxed text-[#172033]">
              {video.idea}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Script summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={script.title}
                onChange={(e) =>
                  updateScript((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hook">Hook</Label>
              <Textarea
                id="hook"
                value={script.hook}
                onChange={(e) =>
                  updateScript((prev) => ({ ...prev, hook: e.target.value }))
                }
                className="min-h-[72px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={script.description}
                onChange={(e) =>
                  updateScript((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="min-h-[72px]"
              />
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <MetaChip label="Language" value={script.language} />
              <MetaChip label="Style" value={script.style} />
              <MetaChip
                label="Duration"
                value={`${script.durationSeconds}s`}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#172033]">
            Scenes ({script.scenes.length})
          </h2>
          <Button variant="gradient" onClick={handleContinue} type="button">
            Continue to scenes
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {script.scenes.length === 0 ? (
          <UnavailableNotice
            variant="warning"
            title="No script yet"
            message="Generate or regenerate a script with local AI to populate editable scenes."
          />
        ) : (
          <div className="space-y-4">
            {script.scenes.map((scene, index) => (
              <Card key={`${scene.sceneNumber}-${index}`}>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-base">
                    Scene {scene.sceneNumber}
                  </CardTitle>
                  <Badge variant="muted">{scene.durationSeconds}s</Badge>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Narration</Label>
                    <Textarea
                      value={scene.narration}
                      onChange={(e) =>
                        updateScene(index, { narration: e.target.value })
                      }
                      className="min-h-[90px]"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Visual description</Label>
                    <Textarea
                      value={scene.visualDescription}
                      onChange={(e) =>
                        updateScene(index, {
                          visualDescription: e.target.value,
                        })
                      }
                      className="min-h-[110px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Emotion</Label>
                    <Input
                      value={scene.emotion}
                      onChange={(e) =>
                        updateScene(index, { emotion: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Transition</Label>
                    <Input
                      value={scene.transition}
                      onChange={(e) =>
                        updateScene(index, { transition: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Duration (seconds)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={scene.durationSeconds}
                      onChange={(e) =>
                        updateScene(index, {
                          durationSeconds: Number(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#F7F8FF] px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-[#8B93A7]">
        {label}
      </p>
      <p className="mt-0.5 font-medium text-[#172033]">{value}</p>
    </div>
  );
}
