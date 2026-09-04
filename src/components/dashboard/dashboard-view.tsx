"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Clapperboard,
  Film,
  Library,
  Mic2,
  Music2,
  Sparkles,
} from "lucide-react";
import { useMemo, type ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VideoCard } from "@/components/video/video-card";
import { TemplateCard } from "@/components/templates/template-card";
import { EmptyState } from "@/components/ui/empty-state";
import { TEMPLATES } from "@/data/catalog";
import { useClientSnapshot } from "@/hooks/use-client-snapshot";
import { getAiServices } from "@/services/ai";
import { getEmptyVideos, listVideos } from "@/services/storage/local-store";

export function DashboardView() {
  const router = useRouter();
  const videos = useClientSnapshot(listVideos, getEmptyVideos);
  const ai = useMemo(() => getAiServices(), []);
  const pending = videos.filter((v) =>
    ["script_pending", "scenes_pending", "rendering"].includes(v.status)
  );
  const popular = TEMPLATES.filter((t) => t.isPopular).slice(0, 6);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 rounded-3xl border border-[#E4E7F5] bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6C4DFF]">
            Welcome to ReelCraft
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#172033]">
            Ready to craft your next short?
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[#5B647A]">
            Start from an idea, prepare a draft workflow, and build toward
            script, scenes, voice, and final 9:16 video — all local-first.
          </p>
        </div>
        <Button variant="gradient" size="lg" asChild>
          <Link href="/create">
            <Sparkles className="h-4 w-4" />
            Create Video
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Videos in library"
          value={String(videos.length)}
          hint="Stored locally on this device"
        />
        <StatCard
          label="In progress"
          value={String(pending.length)}
          hint="Drafts awaiting the next step"
        />
        <StatCard
          label="Templates"
          value={String(TEMPLATES.length)}
          hint="Ready-to-adapt story starters"
        />
        <StatCard
          label="AI providers"
          value={`${[ai.script, ai.scene, ai.image, ai.voice, ai.caption].filter((p) => p.meta.available).length}/5`}
          hint="Connected local providers"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent videos</CardTitle>
            <Link
              href="/videos"
              className="text-sm font-medium text-[#6C4DFF] hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {videos.length === 0 ? (
              <EmptyState
                icon={Film}
                title="No videos yet"
                description="Create your first draft to see it here. Phase 1 saves workflow state locally."
                actionLabel="Create Video"
                onAction={() => router.push("/create")}
              />
            ) : (
              videos.slice(0, 4).map((video) => (
                <VideoCard key={video.id} video={video} />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generation status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatusRow
              label="Script generator"
              available={ai.script.meta.available}
            />
            <StatusRow
              label="Scene generator"
              available={ai.scene.meta.available}
            />
            <StatusRow
              label="Image generator"
              available={ai.image.meta.available}
            />
            <StatusRow
              label="Voice generator"
              available={ai.voice.meta.available}
            />
            <StatusRow
              label="Caption generator"
              available={ai.caption.meta.available}
            />
            <p className="pt-1 text-xs text-[#8B93A7]">
              Script generation runs on local Ollama. Other providers stay modular stubs.
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#172033]">
            Popular templates
          </h2>
          <Link
            href="/templates"
            className="text-sm font-medium text-[#6C4DFF] hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {popular.map((tpl) => (
            <TemplateCard key={tpl.id} template={tpl} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-[#172033]">
          Quick actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            href="/create"
            icon={Clapperboard}
            title="New draft"
            description="Start a Text to Video workflow"
          />
          <QuickAction
            href="/templates"
            icon={Library}
            title="Browse templates"
            description="Pick a story structure"
          />
          <QuickAction
            href="/voices"
            icon={Mic2}
            title="Choose a voice"
            description="Select default narrator"
          />
          <QuickAction
            href="/music"
            icon={Music2}
            title="Pick music"
            description="Licensed / local tracks"
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-[#8B93A7]">
          {label}
        </p>
        <p className="mt-2 text-3xl font-bold text-[#172033]">{value}</p>
        <p className="mt-1 text-xs text-[#5B647A]">{hint}</p>
      </CardContent>
    </Card>
  );
}

function StatusRow({
  label,
  available,
}: {
  label: string;
  available: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[#F7F8FF] px-3 py-2.5">
      <span className="text-sm text-[#44506A]">{label}</span>
      <Badge variant={available ? "success" : "muted"}>
        {available ? "Ready" : "Unavailable"}
      </Badge>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-[#E8EAF5] bg-white p-4 transition-colors hover:border-[#D0D5EF] hover:bg-[#FAFBFF]"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF0FF] text-[#6C4DFF]">
        <Icon className="h-5 w-5" />
      </div>
      <p className="font-semibold text-[#172033]">{title}</p>
      <p className="mt-1 text-sm text-[#5B647A]">{description}</p>
    </Link>
  );
}
