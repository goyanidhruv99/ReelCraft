"use client";

import { Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import type { MusicItem } from "@/types";
import { cn } from "@/lib/utils";

interface MusicCardProps {
  track: MusicItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onPreview: (id: string) => void;
}

export function MusicCard({
  track,
  selected,
  onSelect,
  onPreview,
}: MusicCardProps) {
  return (
    <Card
      className={cn(
        "transition-colors",
        selected && "border-[#6C4DFF] ring-2 ring-[#6C4DFF]/15"
      )}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] text-white">
          <Play className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[#172033]">{track.title}</p>
          <p className="mt-0.5 text-sm text-[#5B647A]">
            {track.category} · {formatDuration(track.durationSec)}
          </p>
          <Badge variant="success" className="mt-2">
            Licensed / local-ready
          </Badge>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPreview(track.id)}
            type="button"
          >
            Preview
          </Button>
          <Button
            size="sm"
            variant={selected ? "secondary" : "default"}
            onClick={() => onSelect(track.id)}
            type="button"
          >
            {selected ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Selected
              </>
            ) : (
              "Select"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
