"use client";

import { useCallback } from "react";
import { useClientSnapshot } from "@/hooks/use-client-snapshot";
import { listVideos } from "@/services/storage/local-store";
import type { VideoDraft } from "@/types";

export function useLocalVideos() {
  const videos = useClientSnapshot(listVideos, () => [] as VideoDraft[]);

  const refresh = useCallback(() => {
    // Writes already emit via local-store; retained for caller API symmetry.
  }, []);

  return { videos, ready: true as const, refresh };
}
