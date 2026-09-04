import { AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnavailableNoticeProps {
  title?: string;
  message: string;
  variant?: "info" | "warning";
  className?: string;
}

export function UnavailableNotice({
  title = "Not available yet",
  message,
  variant = "info",
  className,
}: UnavailableNoticeProps) {
  const Icon = variant === "warning" ? AlertCircle : Info;
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3 text-sm",
        variant === "info" &&
          "border-[#E0E4F5] bg-[#F7F8FF] text-[#44506A]",
        variant === "warning" &&
          "border-amber-200 bg-amber-50 text-amber-900",
        className
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 opacity-90">{message}</p>
      </div>
    </div>
  );
}
