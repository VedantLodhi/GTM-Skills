import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type BadgeVariant = "default" | "secondary" | "outline" | "success" | "warning" | "info" | "muted";

const variantClass: Record<BadgeVariant, string> = {
  default: "bg-primary/15 text-primary",
  secondary: "bg-secondary text-secondary-foreground",
  outline: "border border-border text-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  info: "bg-info/15 text-info",
  muted: "bg-muted text-muted-foreground",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: { variant?: BadgeVariant } & ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        variantClass[variant],
        className
      )}
      {...props}
    />
  );
}
