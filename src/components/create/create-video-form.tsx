"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ComponentType } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Film,
  Languages,
  Loader2,
  MonitorSmartphone,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UnavailableNotice } from "@/components/ui/unavailable-notice";
import {
  ASPECT_OPTIONS,
  DURATION_OPTIONS,
  LANGUAGE_OPTIONS,
  STYLE_OPTIONS,
  TEMPLATES,
  TOPIC_CHIPS,
} from "@/data/catalog";
import {
  buildSettingsFromForm,
  createDraft,
  saveGeneratedScript,
} from "@/services/storage/local-store";
import type { CreationMode, GeneratedVideoScript, TopicChip } from "@/types";
import { cn } from "@/lib/utils";

const FEATURES = [
  "Local-first workflow",
  "Local LLM scripts",
  "Realistic Voices (later)",
  "Stunning Visuals (later)",
  "Auto Captions (later)",
  "Ready for YouTube Shorts",
];

export function CreateVideoForm({
  initialIdea = "",
  initialTemplateId,
}: {
  initialIdea?: string;
  initialTemplateId?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<CreationMode>(
    initialTemplateId ? "template" : "text-to-video"
  );
  const [idea, setIdea] = useState(initialIdea);
  const [topic, setTopic] = useState<TopicChip | undefined>();
  const [language, setLanguage] = useState("hi");
  const [videoStyle, setVideoStyle] = useState("cinematic");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [durationSec, setDurationSec] = useState("60");
  const [templateId, setTemplateId] = useState(initialTemplateId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const charCount = idea.length;
  const maxChars = 500;

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((t) => t.id === templateId),
    [templateId]
  );

  const handleGenerate = async () => {
    setError(null);
    const trimmed = idea.trim();
    if (!trimmed) {
      setError("Enter a video idea before generating.");
      return;
    }
    if (mode === "template" && !templateId) {
      setError("Select a template or switch to Text to Video.");
      return;
    }

    setSubmitting(true);

    const draft = createDraft({
      idea: trimmed,
      mode,
      templateId: mode === "template" ? templateId : undefined,
      title: selectedTemplate?.title,
      settings: buildSettingsFromForm({
        language,
        videoStyle,
        aspectRatio,
        durationSec: Number(durationSec),
        topic,
      }),
    });

    try {
      const res = await fetch("/api/ai/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: trimmed,
          language,
          style: videoStyle,
          durationSeconds: Number(durationSec),
          topic,
        }),
      });

      const data = (await res.json()) as {
        script?: GeneratedVideoScript;
        error?: string;
      };

      if (!res.ok || !data.script) {
        setError(data.error || "Script generation failed. Please try again.");
        setSubmitting(false);
        router.push(`/create/script?id=${draft.id}`);
        return;
      }

      saveGeneratedScript(draft.id, data.script);
      router.push(`/create/script?id=${draft.id}`);
    } catch {
      setError("Script generation failed. Please try again.");
      setSubmitting(false);
      router.push(`/create/script?id=${draft.id}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6C4DFF]">
          Turn ideas into reality
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#172033] sm:text-4xl">
          Create{" "}
          <span className="bg-gradient-to-r from-[#6C4DFF] to-[#EC4899] bg-clip-text text-transparent">
            Viral Shorts
          </span>{" "}
          with AI
        </h1>
        <p className="mt-3 text-base text-[#5B647A]">
          Just type your idea, and let AI handle the rest.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card className="overflow-hidden">
          <CardContent className="space-y-5 p-5 sm:p-6">
            <Tabs
              value={mode}
              onValueChange={(v) => setMode(v as CreationMode)}
            >
              <TabsList className="h-auto w-full flex-wrap justify-start">
                <TabsTrigger value="text-to-video">Text to Video</TabsTrigger>
                <TabsTrigger value="story-to-video">Story to Video</TabsTrigger>
                <TabsTrigger value="template">Template</TabsTrigger>
              </TabsList>

              <TabsContent value="text-to-video" className="mt-5 space-y-4">
                <IdeaField
                  idea={idea}
                  setIdea={setIdea}
                  charCount={charCount}
                  maxChars={maxChars}
                  placeholder='Write your video idea here... e.g. "एक गरीब लड़का मेहनत करके बड़ा बिजनेसमैन बनता है"'
                />
              </TabsContent>

              <TabsContent value="story-to-video" className="mt-5 space-y-4">
                <IdeaField
                  idea={idea}
                  setIdea={setIdea}
                  charCount={charCount}
                  maxChars={maxChars}
                  placeholder="Paste or write your full story. ReelCraft will turn it into scenes with local AI."
                />
              </TabsContent>

              <TabsContent value="template" className="mt-5 space-y-4">
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATES.map((tpl) => (
                      <SelectItem key={tpl.id} value={tpl.id}>
                        {tpl.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate ? (
                  <p className="text-sm text-[#5B647A]">
                    Hint: {selectedTemplate.promptHint}
                  </p>
                ) : null}
                <IdeaField
                  idea={idea}
                  setIdea={setIdea}
                  charCount={charCount}
                  maxChars={maxChars}
                  placeholder="Customize the template idea..."
                />
              </TabsContent>
            </Tabs>

            <div className="flex flex-wrap gap-2">
              {TOPIC_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() =>
                    setTopic((prev) => (prev === chip ? undefined : chip))
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    topic === chip
                      ? "border-[#6C4DFF] bg-[#EEF0FF] text-[#6C4DFF]"
                      : "border-[#E4E7F5] bg-white text-[#44506A] hover:border-[#C9CEEA] hover:bg-[#F8F9FF]"
                  )}
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SettingSelect
                icon={Languages}
                label="Language"
                value={language}
                onChange={setLanguage}
                options={LANGUAGE_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
              />
              <SettingSelect
                icon={Wand2}
                label="Video Style"
                value={videoStyle}
                onChange={setVideoStyle}
                options={STYLE_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
              />
              <SettingSelect
                icon={MonitorSmartphone}
                label="Aspect Ratio"
                value={aspectRatio}
                onChange={setAspectRatio}
                options={ASPECT_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
              />
              <SettingSelect
                icon={Clock}
                label="Duration"
                value={durationSec}
                onChange={setDurationSec}
                options={DURATION_OPTIONS.map((o) => ({
                  value: String(o.value),
                  label: o.label,
                }))}
              />
            </div>

            {error ? (
              <UnavailableNotice
                variant="warning"
                title="Generation issue"
                message={error}
              />
            ) : (
              <UnavailableNotice
                title="Local AI script generation"
                message="Generate Video calls your local Ollama model for a structured script. Images, voice, and final render come in later phases."
              />
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/settings"
                className="text-sm font-medium text-[#6C4DFF] hover:underline"
              >
                Advanced Settings
              </Link>
              <Button
                variant="gradient"
                size="lg"
                className="min-w-[200px]"
                onClick={() => void handleGenerate()}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Video
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="relative aspect-[9/16] bg-gradient-to-b from-[#2A2250] via-[#4C3A8C] to-[#EC4899]">
              <div className="absolute inset-0 flex flex-col items-center justify-end p-5 text-center text-white">
                <div className="mb-auto mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                  <Film className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold leading-snug">
                  छोटे सपनों से बड़ी उड़ान
                </p>
                <p className="mt-2 text-[11px] text-white/75">
                  Preview mockup · 9:16
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-4">
              {FEATURES.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-sm text-[#44506A]"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#6C4DFF]" />
                  {feature}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function IdeaField({
  idea,
  setIdea,
  charCount,
  maxChars,
  placeholder,
}: {
  idea: string;
  setIdea: (v: string) => void;
  charCount: number;
  maxChars: number;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value.slice(0, maxChars))}
        placeholder={placeholder}
        className="min-h-[160px] pb-8"
      />
      <span className="pointer-events-none absolute bottom-3 right-4 text-xs text-[#9AA3B8]">
        {charCount}/{maxChars}
      </span>
    </div>
  );
}

function SettingSelect({
  icon: Icon,
  label,
  value,
  onChange,
  options,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-[#8B93A7]">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <div className="flex min-w-0 items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-[#6C4DFF]" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
