"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ASPECT_OPTIONS,
  DURATION_OPTIONS,
  LANGUAGE_OPTIONS,
  STYLE_OPTIONS,
} from "@/data/catalog";
import { useClientSnapshot } from "@/hooks/use-client-snapshot";
import {
  defaultAppSettings,
  getAppSettings,
  saveAppSettings,
} from "@/services/storage/local-store";
import type { AppSettings, AspectRatio, VideoStyle } from "@/types";
import { UnavailableNotice } from "@/components/ui/unavailable-notice";

export function SettingsView() {
  const stored = useClientSnapshot(getAppSettings, () => defaultAppSettings);
  const [draft, setDraft] = useState<AppSettings | null>(null);
  const form = draft ?? stored;
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setDraft((prev) => ({ ...(prev ?? stored), [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveAppSettings(form);
    setDraft(null);
    setSaved(true);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#172033]">Settings</h1>
        <p className="mt-2 text-sm text-[#5B647A]">
          Application defaults for new video drafts. Stored locally in Phase 1.
        </p>
      </div>

      <UnavailableNotice message="Cloud sync and NestJS-backed settings are planned for a later phase. Current preferences stay on this device." />

      <Card>
        <CardHeader>
          <CardTitle>Creation defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default language</Label>
            <Select
              value={form.defaultLanguage}
              onValueChange={(v) => update("defaultLanguage", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Default video style</Label>
            <Select
              value={form.defaultStyle}
              onValueChange={(v) => update("defaultStyle", v as VideoStyle)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STYLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Default aspect ratio</Label>
            <Select
              value={form.defaultAspectRatio}
              onValueChange={(v) =>
                update("defaultAspectRatio", v as AspectRatio)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASPECT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Default duration</Label>
            <Select
              value={String(form.defaultDurationSec)}
              onValueChange={(v) => update("defaultDurationSec", Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#E8EAF5] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#172033]">
                Collapse sidebar by default
              </p>
              <p className="text-xs text-[#5B647A]">
                Applies the next time you open ReelCraft
              </p>
            </div>
            <Switch
              checked={form.sidebarCollapsed}
              onCheckedChange={(checked) => update("sidebarCollapsed", checked)}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="button" onClick={handleSave}>
              Save settings
            </Button>
            {saved ? (
              <span className="text-sm text-emerald-600">Saved locally</span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
