"use client";

import { useState } from "react";
import { MusicCard } from "@/components/music/music-card";
import { UnavailableNotice } from "@/components/ui/unavailable-notice";
import { MUSIC_TRACKS } from "@/data/catalog";
import { useClientSnapshot } from "@/hooks/use-client-snapshot";
import {
  getSelectedMusicId,
  setSelectedMusicId,
} from "@/services/storage/local-store";

export function MusicView() {
  const selected = useClientSnapshot(getSelectedMusicId, () => null);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#172033]">Music</h1>
        <p className="mt-2 text-sm text-[#5B647A]">
          Browse licensed / locally stored tracks. No copyrighted commercial
          music is bundled.
        </p>
      </div>

      <UnavailableNotice
        title="Audio files not bundled yet"
        message="Track metadata and selection work now. Actual audio files and preview playback will use locally stored licensed assets."
      />

      {notice ? (
        <UnavailableNotice title="Preview" message={notice} variant="warning" />
      ) : null}

      <div className="space-y-3">
        {MUSIC_TRACKS.map((track) => (
          <MusicCard
            key={track.id}
            track={track}
            selected={selected === track.id}
            onSelect={(id) => setSelectedMusicId(id)}
            onPreview={() =>
              setNotice(
                "Music preview is unavailable until local audio assets are added."
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
