"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clapperboard,
  Film,
  LayoutDashboard,
  Library,
  Mic2,
  Music2,
  Palette,
  Settings,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  accent?: boolean;
}[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/create", label: "Create Video", icon: Sparkles, accent: true },
  { href: "/videos", label: "My Videos", icon: Film },
  { href: "/templates", label: "Templates", icon: Library },
  { href: "/voices", label: "Voices", icon: Mic2 },
  { href: "/music", label: "Music", icon: Music2 },
  { href: "/branding", label: "Branding", icon: Palette },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#E4E7F5] bg-white transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 border-b border-[#EEF0F8] px-4 py-5",
          collapsed && "justify-center px-2"
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6C4DFF] via-[#8B5CF6] to-[#EC4899] text-white shadow-sm">
          <Clapperboard className="h-5 w-5" />
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-base font-bold tracking-tight text-[#172033]">
              ReelCraft
            </p>
            <p className="truncate text-xs text-[#8B93A7]">
              AI Stories. Viral Videos.
            </p>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                collapsed && "justify-center px-2",
                active && item.accent
                  ? "bg-gradient-to-r from-[#6C4DFF] to-[#8B5CF6] text-white shadow-sm shadow-[#6C4DFF]/25"
                  : active
                    ? "bg-[#F0F2FF] text-[#6C4DFF]"
                    : "text-[#44506A] hover:bg-[#F5F7FF] hover:text-[#172033]"
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-[#EEF0F8] p-3">
        {!collapsed ? (
          <div className="rounded-2xl bg-gradient-to-br from-[#F5F7FF] to-[#EEF0FF] p-4">
            <p className="text-sm font-semibold text-[#172033]">Free Forever</p>
            <p className="mt-1 text-xs leading-relaxed text-[#5B647A]">
              Create unlimited videos. No credits. No paid AI APIs.
            </p>
          </div>
        ) : null}

        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          className={cn("w-full", !collapsed && "justify-start")}
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              Collapse
            </>
          )}
        </Button>

        {!collapsed ? (
          <p className="px-1 pb-1 text-[11px] leading-relaxed text-[#9AA3B8]">
            ReelCraft. Made with ♥ in India for creators.
          </p>
        ) : null}
      </div>
    </aside>
  );
}
