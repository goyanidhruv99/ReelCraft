"use client";

import { useCallback, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { useClientSnapshot } from "@/hooks/use-client-snapshot";
import {
  defaultAppSettings,
  getAppSettings,
  saveAppSettings,
} from "@/services/storage/local-store";
import { cn } from "@/lib/utils";

const serverSettings = defaultAppSettings;

export function AppShell({ children }: { children: React.ReactNode }) {
  const settings = useClientSnapshot(getAppSettings, () => serverSettings);
  const [collapsedOverride, setCollapsedOverride] = useState<boolean | null>(
    null
  );
  const collapsed = collapsedOverride ?? settings.sidebarCollapsed;

  const handleToggle = useCallback(() => {
    setCollapsedOverride((prev) => {
      const current = prev ?? settings.sidebarCollapsed;
      const next = !current;
      saveAppSettings({ ...getAppSettings(), sidebarCollapsed: next });
      return next;
    });
  }, [settings.sidebarCollapsed]);

  return (
    <div className="min-h-screen bg-[#F5F7FF] text-[#172033]">
      <Sidebar collapsed={collapsed} onToggle={handleToggle} />
      <div
        className={cn(
          "min-h-screen transition-[padding] duration-200",
          collapsed ? "pl-[72px]" : "pl-[72px] lg:pl-[260px]"
        )}
      >
        <TopBar />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
