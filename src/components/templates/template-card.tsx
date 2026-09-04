"use client";

import Link from "next/link";
import type { TemplateItem } from "@/types";
import { cn } from "@/lib/utils";

export function TemplateCard({
  template,
  className,
}: {
  template: TemplateItem;
  className?: string;
}) {
  return (
    <Link
      href={`/create?template=${template.id}`}
      className={cn(
        "group block overflow-hidden rounded-2xl border border-[#E8EAF5] bg-white transition-colors hover:border-[#D0D5EF]",
        className
      )}
    >
      <div
        className={cn(
          "aspect-square bg-gradient-to-br",
          template.thumbnailGradient
        )}
      />
      <div className="p-3">
        <p className="text-sm font-semibold text-[#172033] group-hover:text-[#6C4DFF]">
          {template.title}
        </p>
        <p className="mt-0.5 text-xs text-[#8B93A7]">{template.category}</p>
      </div>
    </Link>
  );
}
