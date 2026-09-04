"use client";

import { useMemo, useState } from "react";
import { TemplateCard } from "@/components/templates/template-card";
import { TEMPLATE_CATEGORIES, TEMPLATES } from "@/data/catalog";
import { cn } from "@/lib/utils";

export function TemplatesView() {
  const [category, setCategory] = useState<(typeof TEMPLATE_CATEGORIES)[number]>(
    "All"
  );

  const filtered = useMemo(() => {
    if (category === "All") return TEMPLATES;
    return TEMPLATES.filter((t) => t.category === category);
  }, [category]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#172033]">Templates</h1>
        <p className="mt-2 text-sm text-[#5B647A]">
          Start faster with story structures tuned for Shorts and Reels.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              category === cat
                ? "border-[#6C4DFF] bg-[#EEF0FF] text-[#6C4DFF]"
                : "border-[#E4E7F5] bg-white text-[#44506A] hover:bg-[#F8F9FF]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
