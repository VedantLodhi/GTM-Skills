import { Badge } from "@/components/ui/badge";
import type { ExecutionType } from "@/lib/api/types";

const CONFIG: Record<ExecutionType, { label: string; variant: "success" | "info" | "muted" | "warning" }> = {
  native: { label: "Native", variant: "success" },
  assisted: { label: "Assisted", variant: "info" },
  method_only: { label: "Method-only", variant: "muted" },
  coming_soon: { label: "Coming Soon", variant: "warning" },
};

export function ExecutionBadge({ type }: { type: ExecutionType }) {
  const cfg = CONFIG[type];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
