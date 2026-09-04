"use client";

import { ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiStatusIndicator } from "@/components/layout/ai-status-indicator";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-2 border-b border-[#E8EAF5] bg-[#F5F7FF]/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <AiStatusIndicator className="mr-auto sm:mr-0" />
      <Button variant="secondary" size="sm" className="gap-1.5" type="button">
        English
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </Button>
      <Button variant="secondary" size="sm" className="gap-2" type="button">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EEF0FF] text-[#6C4DFF]">
          <User className="h-3.5 w-3.5" />
        </span>
        Creator
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </Button>
    </header>
  );
}
