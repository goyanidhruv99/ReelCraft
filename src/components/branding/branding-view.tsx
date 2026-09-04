"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClientSnapshot } from "@/hooks/use-client-snapshot";
import {
  defaultBranding,
  getBranding,
  saveBranding,
} from "@/services/storage/local-store";
import type { BrandingSettings } from "@/types";

const serverBranding = defaultBranding;

export function BrandingView() {
  const stored = useClientSnapshot(getBranding, () => serverBranding);
  const [draft, setDraft] = useState<BrandingSettings | null>(null);
  const form = draft ?? stored;
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof BrandingSettings>(
    key: K,
    value: BrandingSettings[K]
  ) => {
    setDraft((prev) => ({ ...(prev ?? stored), [key]: value }));
    setSaved(false);
  };

  const handleLogo = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      update(
        "logoDataUrl",
        typeof reader.result === "string" ? reader.result : null
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    saveBranding(form);
    setDraft(null);
    setSaved(true);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#172033]">Branding</h1>
        <p className="mt-2 text-sm text-[#5B647A]">
          Set channel defaults that future renders can apply as watermark and
          end-card branding.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Channel identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channelName">Channel name</Label>
            <Input
              id="channelName"
              value={form.channelName}
              onChange={(e) => update("channelName", e.target.value)}
              placeholder="Your channel name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube">YouTube channel name</Label>
            <Input
              id="youtube"
              value={form.youtubeChannelName}
              onChange={(e) => update("youtubeChannelName", e.target.value)}
              placeholder="YouTube display name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram handle</Label>
            <Input
              id="instagram"
              value={form.instagramHandle}
              onChange={(e) => update("instagramHandle", e.target.value)}
              placeholder="@yourhandle"
            />
          </div>

          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-[#E4E7F5] bg-[#F7F8FF]">
                {form.logoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.logoDataUrl}
                    alt="Channel logo preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-[#9AA3B8]">No logo</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileRef.current?.click()}
                >
                  Upload logo
                </Button>
                {form.logoDataUrl ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => update("logoDataUrl", null)}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => handleLogo(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#E8EAF5] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#172033]">Watermark</p>
              <p className="text-xs text-[#5B647A]">
                Apply logo watermark in future renders
              </p>
            </div>
            <Switch
              checked={form.watermarkEnabled}
              onCheckedChange={(checked) => update("watermarkEnabled", checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Default branding position</Label>
            <Select
              value={form.watermarkPosition}
              onValueChange={(v) =>
                update(
                  "watermarkPosition",
                  v as BrandingSettings["watermarkPosition"]
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-left">Top left</SelectItem>
                <SelectItem value="top-right">Top right</SelectItem>
                <SelectItem value="bottom-left">Bottom left</SelectItem>
                <SelectItem value="bottom-right">Bottom right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="button" onClick={handleSave}>
              Save branding
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
