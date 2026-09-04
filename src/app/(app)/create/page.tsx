import Link from "next/link";
import type { ComponentType } from "react";
import {
  Download,
  Lightbulb,
  Pencil,
  Sparkles,
} from "lucide-react";
import { CreateVideoForm } from "@/components/create/create-video-form";
import { Card, CardContent } from "@/components/ui/card";
import { TemplateCard } from "@/components/templates/template-card";
import { TEMPLATES } from "@/data/catalog";

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; idea?: string }>;
}) {
  const params = await searchParams;
  const template = TEMPLATES.find((t) => t.id === params.template);
  const initialIdea = params.idea ?? template?.promptHint ?? "";

  return (
    <div className="space-y-10">
      <CreateVideoForm
        initialIdea={initialIdea}
        initialTemplateId={params.template}
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
        <Card>
          <CardContent className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[#172033]">
              How it works?
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Step
                icon={Lightbulb}
                color="bg-[#EEF0FF] text-[#6C4DFF]"
                title="Enter your idea"
                description="Describe the story or topic."
              />
              <Step
                icon={Sparkles}
                color="bg-pink-50 text-pink-600"
                title="AI generates"
                description="Script, scenes, voice (Phase 2+)."
              />
              <Step
                icon={Pencil}
                color="bg-orange-50 text-orange-600"
                title="Customize"
                description="Edit script and branding."
              />
              <Step
                icon={Download}
                color="bg-emerald-50 text-emerald-600"
                title="Download & share"
                description="Export 9:16 for Shorts."
              />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#F7F8FF] to-[#EEF0FF]">
          <CardContent className="flex h-full flex-col justify-center p-5">
            <p className="text-sm italic leading-relaxed text-[#44506A]">
              “Great content creates opportunities.”
            </p>
            <p className="mt-3 text-xs font-medium text-[#6C4DFF]">
              — Keep Creating
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {TEMPLATES.slice(0, 8).map((tpl) => (
            <TemplateCard key={tpl.id} template={tpl} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Step({
  icon: Icon,
  color,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  color: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#172033]">{title}</p>
        <p className="mt-0.5 text-xs text-[#5B647A]">{description}</p>
      </div>
    </div>
  );
}
