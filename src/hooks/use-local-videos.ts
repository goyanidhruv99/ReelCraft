"use client";

import { useCallback } from "react";
import { useClientSnapshot } from "@/hooks/use-client-snapshot";
import { listVideos, getEmptyVideos } from "@/services/storage/local-store";

export function useLocalVideos() {
  const videos = useClientSnapshot(listVideos, getEmptyVideos);

  const refresh = useCallback(() => {
    // Writes already emit via local-store; retained for caller API symmetry.
  }, []);

  return { videos, ready: true as const, refresh };
}
