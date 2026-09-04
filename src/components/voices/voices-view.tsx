"use client";

import { useState } from "react";
import { VoiceCard } from "@/components/voices/voice-card";
import { UnavailableNotice } from "@/components/ui/unavailable-notice";
import { VOICES } from "@/data/catalog";
import { useClientSnapshot } from "@/hooks/use-client-snapshot";
import {
  getSelectedVoiceId,
  setSelectedVoiceId,
} from "@/services/storage/local-store";

export function VoicesView() {
  const selected = useClientSnapshot(getSelectedVoiceId, () => null);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#172033]">Voices</h1>
        <p className="mt-2 text-sm text-[#5B647A]">
          Choose a default narrator for future voiceovers. TTS is not connected
          yet.
        </p>
      </div>

      <UnavailableNotice
        title="Preview unavailable"
        message="Local TTS audio previews will arrive when a voice provider is connected. Selection is saved locally."
      />

      {notice ? (
        <UnavailableNotice title="Preview" message={notice} variant="warning" />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {VOICES.map((voice) => (
          <VoiceCard
            key={voice.id}
            voice={voice}
            selected={selected === voice.id}
            onSelect={(id) => setSelectedVoiceId(id)}
            onPreview={() =>
              setNotice(
                "Voice preview is not available yet. No TTS engine is connected in Phase 1."
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
