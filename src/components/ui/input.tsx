import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-10 w-full rounded-xl border border-[#E4E7F5] bg-white px-3 py-2 text-sm text-[#172033] placeholder:text-[#9AA3B8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C4DFF]/35 focus-visible:border-[#6C4DFF] disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
