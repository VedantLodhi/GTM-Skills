import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-16 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none",
        "placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring transition-shadow resize-y",
        className
      )}
      {...props}
    />
  );
}
