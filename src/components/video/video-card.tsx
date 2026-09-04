"use client";

import Link from "next/link";
import { Film, MoreHorizontal, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { STATUS_LABELS } from "@/data/catalog";
import { formatDuration, formatRelativeTime } from "@/lib/utils";
import type { VideoDraft } from "@/types";

interface VideoCardProps {
  video: VideoDraft;
  onDelete?: (id: string) => void;
}

export function VideoCard({ video, onDelete }: VideoCardProps) {
  const statusVariant =
    video.status === "completed"
      ? "success"
      : video.status === "failed"
        ? "warning"
        : video.status === "script_ready"
          ? "default"
          : "muted";

  return (
    <Card className="flex gap-3 p-3 transition-colors hover:border-[#D5DAF0]">
      <Link
        href={`/create/script?id=${video.id}`}
        className="relative h-20 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-[#6C4DFF] to-[#EC4899]"
      >
        <div className="flex h-full w-full items-center justify-center text-white/90">
          <Film className="h-5 w-5" />
        </div>
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/create/script?id=${video.id}`}
              className="line-clamp-1 text-sm font-semibold text-[#172033] hover:text-[#6C4DFF]"
            >
              {video.title}
            </Link>
            <p className="mt-1 text-xs text-[#8B93A7]">
              {formatDuration(video.settings.durationSec)} ·{" "}
              {formatRelativeTime(video.updatedAt)}
            </p>
          </div>
          {onDelete ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-[#8B93A7]"
              aria-label="Delete video"
              onClick={() => onDelete(video.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : (
            <MoreHorizontal className="h-4 w-4 shrink-0 text-[#C0C5D6]" />
          )}
        </div>
        <div className="mt-2">
          <Badge variant={statusVariant}>
            {STATUS_LABELS[video.status] ?? video.status}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
