"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AiHealthStatus } from "@/types";
import { cn } from "@/lib/utils";

export function AiStatusIndicator({ className }: { className?: string }) {
  const [health, setHealth] = useState<AiHealthStatus | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/health", { cache: "no-store" });
      const data = (await res.json()) as AiHealthStatus;
      if (mounted.current) setHealth(data);
    } catch {
      if (mounted.current) {
        setHealth({
          available: false,
          ollama: false,
          model: "qwen3:8b",
          modelInstalled: false,
          code: "ollama_not_running",
          message: "Local AI is not running. Start Ollama and try again.",
        });
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const id = window.setTimeout(() => {
      void refresh();
    }, 0);
    const interval = window.setInterval(() => void refresh(), 20_000);
    return () => {
      mounted.current = false;
      window.clearTimeout(id);
      window.clearInterval(interval);
    };
  }, [refresh]);

  const ready = health?.available === true;

  return (
    <button
      type="button"
      onClick={() => void refresh()}
      title={health?.message || "Checking Local AI…"}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[#E4E7F5] bg-white px-3 py-1.5 text-xs font-medium text-[#44506A] transition-colors hover:bg-[#F8F9FF]",
        className
      )}
    >
      <span className="text-[#8B93A7]">Local AI</span>
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          ready ? "bg-emerald-500" : "bg-rose-400"
        )}
        aria-hidden
      />
      <span className={ready ? "text-emerald-700" : "text-rose-600"}>
        {health ? (ready ? "Ready" : "Offline") : "…"}
      </span>
    </button>
  );
}
