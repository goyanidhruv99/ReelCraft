"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Film } from "lucide-react";
import { VideoCard } from "@/components/video/video-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useClientSnapshot } from "@/hooks/use-client-snapshot";
import { deleteVideo, getEmptyVideos, listVideos } from "@/services/storage/local-store";

export function VideosView() {
  const router = useRouter();
  const videos = useClientSnapshot(listVideos, getEmptyVideos);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#172033]">My Videos</h1>
          <p className="mt-2 text-sm text-[#5B647A]">
            Local drafts and workflow states saved on this device.
          </p>
        </div>
        <Button asChild>
          <Link href="/create">Create Video</Link>
        </Button>
      </div>

      {videos.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No videos yet"
          description="When you generate a draft from Create Video, it will appear here with status and actions."
          actionLabel="Create your first video"
          onAction={() => router.push("/create")}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onDelete={(id) => deleteVideo(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
