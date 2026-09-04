import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[140px] w-full rounded-2xl border border-[#E4E7F5] bg-[#FAFBFF] px-4 py-3 text-sm text-[#172033] placeholder:text-[#9AA3B8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C4DFF]/35 focus-visible:border-[#6C4DFF] disabled:cursor-not-allowed disabled:opacity-50 resize-none",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
