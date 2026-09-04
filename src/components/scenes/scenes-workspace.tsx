"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ImageIcon,
  Loader2,
  RefreshCw,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnavailableNotice } from "@/components/ui/unavailable-notice";
import { useClientSnapshot } from "@/hooks/use-client-snapshot";
import {
  getEmptyVideo,
  getVideo,
  prepareScriptForScenes,
  saveVideo,
} from "@/services/storage/local-store";
import type {
  ImageHealthStatus,
  ScriptScene,
  VideoDraft,
} from "@/types";
import { cn } from "@/lib/utils";

export function ScenesWorkspace({ videoId }: { videoId: string }) {
  const stored = useClientSnapshot(() => getVideo(videoId), getEmptyVideo);
  const [draft, setDraft] = useState<VideoDraft | null>(null);
  const video = draft ?? stored;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [busyAll, setBusyAll] = useState(false);
  const [busyOne, setBusyOne] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [imageHealth, setImageHealth] = useState<ImageHealthStatus | null>(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/ai/image/health", { cache: "no-store" });
        const data = (await res.json()) as ImageHealthStatus;
        if (active) setImageHealth(data);
      } catch {
        if (active) {
          setImageHealth({
            available: false,
            engine: "diffusers-mps",
            model: "unknown",
            modelLoaded: false,
            device: "unknown",
            defaultWidth: 576,
            defaultHeight: 1024,
            message: "Local image service is not running. Start it and try again.",
          });
        }
      }
    };
    const t = window.setTimeout(() => void load(), 0);
    const interval = window.setInterval(() => void load(), 20_000);
    return () => {
      active = false;
      window.clearTimeout(t);
      window.clearInterval(interval);
    };
  }, []);

  const script = useMemo(() => {
    if (!video?.generatedScript) return null;
    return prepareScriptForScenes(
      video.id,
      video.generatedScript,
      video.settings.videoStyle
    );
  }, [video]);

  const scenes = script?.scenes ?? [];
  const selected = scenes[selectedIndex] ?? null;

  const persist = useCallback(
    (next: VideoDraft) => {
      saveVideo(next);
      setDraft(next);
    },
    []
  );

  const updateScene = useCallback(
    (index: number, patch: Partial<ScriptScene>) => {
      if (!video || !script) return;
      const nextScenes = script.scenes.map((scene, i) =>
        i === index ? { ...scene, ...patch } : scene
      );
      const next: VideoDraft = {
        ...video,
        generatedScript: {
          ...script,
          scenes: nextScenes,
        },
        updatedAt: new Date().toISOString(),
      };
      persist(next);
    },
    [persist, script, video]
  );

  const generateOne = useCallback(
    async (index: number, forceNewSeed = false) => {
      const latest = getVideo(videoId);
      if (!latest?.generatedScript) return false;
      const prepared = prepareScriptForScenes(
        latest.id,
        latest.generatedScript,
        latest.settings.videoStyle
      );
      const scene = prepared.scenes[index];
      if (!scene) return false;

      const seed =
        forceNewSeed || scene.image?.seed == null
          ? Math.floor(Math.random() * 2_147_483_646)
          : scene.image.seed;

      const mark = (
        imagePatch: NonNullable<ScriptScene["image"]>
      ) => {
        const current = getVideo(videoId);
        if (!current?.generatedScript) return;
        const nextScenes = current.generatedScript.scenes.map((s, i) =>
          i === index
            ? {
                ...s,
                imagePrompt: scene.imagePrompt,
                negativePrompt: scene.negativePrompt,
                image: imagePatch,
              }
            : s
        );
        persist({
          ...current,
          generatedScript: {
            ...current.generatedScript,
            scenes: nextScenes,
          },
          updatedAt: new Date().toISOString(),
        });
      };

      mark({
        ...(scene.image || { status: "pending" }),
        status: "generating",
        error: null,
        seed,
        imagePrompt: scene.imagePrompt,
        negativePrompt: scene.negativePrompt,
      });

      try {
        const res = await fetch("/api/ai/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: latest.id,
            sceneId: scene.id,
            sceneNumber: scene.sceneNumber,
            prompt: scene.imagePrompt,
            negativePrompt: scene.negativePrompt,
            seed,
            width: 576,
            height: 1024,
          }),
        });
        const data = (await res.json()) as {
          success?: boolean;
          error?: string;
          image?: {
            path: string;
            url: string;
            width: number;
            height: number;
            seed: number;
            generationTimeMs?: number;
          };
        };

        if (!res.ok || !data.success || !data.image) {
          mark({
            ...(scene.image || { status: "failed" }),
            status: "failed",
            error: data.error || "Image generation failed. Please try again.",
            seed,
          });
          setMessage(data.error || "Image generation failed. Please try again.");
          return false;
        }

        mark({
          status: "ready",
          imagePath: data.image.path,
          imageUrl: data.image.url,
          imagePrompt: scene.imagePrompt,
          negativePrompt: scene.negativePrompt,
          seed: data.image.seed,
          width: data.image.width,
          height: data.image.height,
          generationTimeMs: data.image.generationTimeMs ?? null,
          error: null,
        });
        return true;
      } catch {
        mark({
          ...(scene.image || { status: "failed" }),
          status: "failed",
          error: "Image generation failed. Please try again.",
          seed,
        });
        setMessage("Image generation failed. Please try again.");
        return false;
      }
    },
    [persist, videoId]
  );

  const handleGenerateAll = async () => {
    if (!scenes.length) return;
    setBusyAll(true);
    cancelRef.current = false;
    setMessage(null);

    for (let i = 0; i < scenes.length; i += 1) {
      if (cancelRef.current) break;
      setSelectedIndex(i);
      setProgress(`Generating Scene ${i + 1} of ${scenes.length}`);
      const current = getVideo(videoId)?.generatedScript?.scenes[i];
      if (current?.image?.status === "ready") continue;
      const ok = await generateOne(i, true);
      if (!ok) break;
    }

    setProgress(null);
    setBusyAll(false);
    setMessage("Scene image generation finished (or stopped).");
  };

  const handleRegenerate = async () => {
    if (selectedIndex < 0) return;
    setBusyOne(true);
    setMessage(null);
    setProgress(`Regenerating Scene ${selectedIndex + 1}`);
    await generateOne(selectedIndex, true);
    setProgress(null);
    setBusyOne(false);
  };

  const handleGenerateSelected = async () => {
    if (selectedIndex < 0) return;
    setBusyOne(true);
    setMessage(null);
    setProgress(`Generating Scene ${selectedIndex + 1}`);
    await generateOne(selectedIndex, false);
    setProgress(null);
    setBusyOne(false);
  };

  if (!video || !script) {
    return (
      <div className="space-y-4">
        <UnavailableNotice
          variant="warning"
          title="Draft not found"
          message="Open a script from Create Video first."
        />
        <Button asChild>
          <Link href="/create">Back to Create</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6C4DFF]">
            Scene images
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#172033] sm:text-3xl">
            {script.title}
          </h1>
          <p className="mt-1 text-sm text-[#5B647A]">
            {scenes.length} scenes · {script.characterProfile?.name || "Character"} ·
            local SD image generation
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" asChild>
            <Link href={`/create/script?id=${video.id}`}>Back to script</Link>
          </Button>
          {busyAll ? (
            <Button
              variant="danger"
              type="button"
              onClick={() => {
                cancelRef.current = true;
              }}
            >
              Stop after current
            </Button>
          ) : (
            <Button
              variant="gradient"
              type="button"
              onClick={() => void handleGenerateAll()}
              disabled={busyOne || scenes.length === 0}
            >
              <Sparkles className="h-4 w-4" />
              Generate Images
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={imageHealth?.available ? "success" : "warning"}>
          Image AI · {imageHealth?.available ? "Ready" : "Offline"}
        </Badge>
        {progress ? (
          <span className="inline-flex items-center gap-2 text-sm text-[#6C4DFF]">
            <Loader2 className="h-4 w-4 animate-spin" />
            {progress}
          </span>
        ) : null}
      </div>

      {message ? <UnavailableNotice title="Status" message={message} /> : null}
      {imageHealth && !imageHealth.available ? (
        <UnavailableNotice
          variant="warning"
          title="Local image service offline"
          message={`${imageHealth.message} Run: npm run image:server`}
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)_320px]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-sm">Scenes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {scenes.map((scene, index) => {
              const status = scene.image?.status || "pending";
              return (
                <button
                  key={scene.id || scene.sceneNumber}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full rounded-xl border px-3 py-2.5 text-left transition-colors",
                    selectedIndex === index
                      ? "border-[#6C4DFF] bg-[#F5F7FF]"
                      : "border-[#E8EAF5] hover:bg-[#FAFBFF]"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#172033]">
                      Scene {String(scene.sceneNumber).padStart(2, "0")}
                    </p>
                    <Badge
                      variant={
                        status === "ready"
                          ? "success"
                          : status === "generating"
                            ? "default"
                            : status === "failed"
                              ? "warning"
                              : "muted"
                      }
                    >
                      {status === "ready"
                        ? "Ready"
                        : status === "generating"
                          ? "Generating…"
                          : status === "failed"
                            ? "Failed"
                            : "Not generated"}
                    </Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-[#5B647A]">
                    {scene.narration}
                  </p>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex min-h-[520px] items-center justify-center bg-[#EEF0F8] p-4">
            {selected?.image?.status === "ready" && selected.image.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selected.image.imageUrl}
                alt={`Scene ${selected.sceneNumber}`}
                className="max-h-[640px] w-auto max-w-full rounded-2xl border border-[#E4E7F5] object-contain shadow-sm"
              />
            ) : selected?.image?.status === "generating" ? (
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#6C4DFF]" />
                <p className="mt-3 text-sm text-[#5B647A]">Generating image…</p>
              </div>
            ) : (
              <div className="text-center text-[#8B93A7]">
                <ImageIcon className="mx-auto h-10 w-10 opacity-50" />
                <p className="mt-3 text-sm">No image yet for this scene</p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Scene {selected ? String(selected.sceneNumber).padStart(2, "0") : "--"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="image">
              <TabsList className="w-full">
                <TabsTrigger value="image" className="flex-1">
                  Image
                </TabsTrigger>
                <TabsTrigger value="motion" className="flex-1">
                  Motion
                </TabsTrigger>
                <TabsTrigger value="caption" className="flex-1">
                  Caption
                </TabsTrigger>
                <TabsTrigger value="audio" className="flex-1">
                  Audio
                </TabsTrigger>
              </TabsList>

              <TabsContent value="image" className="mt-4 space-y-3">
                {selected ? (
                  <>
                    <div className="rounded-xl bg-[#F7F8FF] p-3 text-sm text-[#44506A]">
                      <p className="font-medium text-[#172033]">Narration</p>
                      <p className="mt-1 whitespace-pre-wrap">{selected.narration}</p>
                      <p className="mt-3 font-medium text-[#172033]">
                        Visual description
                      </p>
                      <p className="mt-1 whitespace-pre-wrap">
                        {selected.visualDescription}
                      </p>
                      <p className="mt-3 text-xs text-[#8B93A7]">
                        Duration {selected.durationSeconds}s · {selected.emotion} ·{" "}
                        {selected.transition}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Image prompt</Label>
                      <Textarea
                        value={selected.imagePrompt || ""}
                        onChange={(e) =>
                          updateScene(selectedIndex, {
                            imagePrompt: e.target.value,
                          })
                        }
                        className="min-h-[110px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Negative prompt</Label>
                      <Textarea
                        value={selected.negativePrompt || ""}
                        onChange={(e) =>
                          updateScene(selectedIndex, {
                            negativePrompt: e.target.value,
                          })
                        }
                        className="min-h-[90px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Seed</Label>
                      <Input
                        type="number"
                        value={selected.image?.seed ?? ""}
                        onChange={(e) =>
                          updateScene(selectedIndex, {
                            image: {
                              ...(selected.image || { status: "pending" }),
                              status: selected.image?.status || "pending",
                              seed: Number(e.target.value) || null,
                            },
                          })
                        }
                        placeholder="Random if empty"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        type="button"
                        onClick={() => void handleGenerateSelected()}
                        disabled={busyAll || busyOne}
                      >
                        {busyOne ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Wand2 className="h-4 w-4" />
                        )}
                        Generate Image
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => void handleRegenerate()}
                        disabled={busyAll || busyOne}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Regenerate Image
                      </Button>
                    </div>

                    {selected.image?.generationTimeMs ? (
                      <p className="text-xs text-[#8B93A7]">
                        Last generation: {selected.image.generationTimeMs} ms ·{" "}
                        {selected.image.width}×{selected.image.height}
                      </p>
                    ) : null}
                    {selected.image?.error ? (
                      <UnavailableNotice
                        variant="warning"
                        title="Generation error"
                        message={selected.image.error}
                      />
                    ) : null}
                  </>
                ) : null}
              </TabsContent>

              <TabsContent value="motion" className="mt-4">
                <UnavailableNotice message="Motion is coming in a later phase." />
              </TabsContent>
              <TabsContent value="caption" className="mt-4">
                <UnavailableNotice message="Captions are coming in a later phase." />
              </TabsContent>
              <TabsContent value="audio" className="mt-4">
                <UnavailableNotice message="Audio / voice is coming in a later phase." />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
