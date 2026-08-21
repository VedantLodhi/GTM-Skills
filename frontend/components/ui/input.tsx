import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-border bg-input px-3 text-sm outline-none",
        "placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring transition-shadow",
        className
      )}
      {...props}
    />
  );
}
