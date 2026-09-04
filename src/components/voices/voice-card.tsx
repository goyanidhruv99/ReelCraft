"use client";

import { Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { VoiceItem } from "@/types";
import { cn } from "@/lib/utils";

interface VoiceCardProps {
  voice: VoiceItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onPreview: (id: string) => void;
}

export function VoiceCard({
  voice,
  selected,
  onSelect,
  onPreview,
}: VoiceCardProps) {
  return (
    <Card
      className={cn(
        "transition-colors",
        selected && "border-[#6C4DFF] ring-2 ring-[#6C4DFF]/15"
      )}
    >
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-[#172033]">{voice.name}</p>
            <p className="mt-1 text-sm text-[#5B647A]">
              {voice.language} · {voice.gender}
            </p>
            <Badge variant="muted" className="mt-2">
              {voice.style}
            </Badge>
          </div>
          {selected ? (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF0FF] text-[#6C4DFF]">
              <Check className="h-4 w-4" />
            </span>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => onPreview(voice.id)}
            type="button"
          >
            <Play className="h-3.5 w-3.5" />
            Preview
          </Button>
          <Button
            size="sm"
            className="flex-1"
            variant={selected ? "secondary" : "default"}
            onClick={() => onSelect(voice.id)}
            type="button"
          >
            {selected ? "Selected" : "Select"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
