import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Stage } from "@/lib/api/types";

/** "Browse by category" tile — routes into the real stage filter on the
 * skills discovery page (`/skills?stage=<slug>`), not a fabricated
 * category system. */
export function CategoryCard({ stage }: { stage: Stage }) {
  return (
    <Link
      href={`/skills?stage=${stage.slug}`}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background: `radial-gradient(180px circle at 15% 15%, ${stage.color ?? "var(--color-primary)"}22, transparent 70%)`,
        }}
      />
      <div className="relative flex items-start justify-between">
        <span
          className="mb-4 flex h-2.5 w-8 rounded-full"
          style={{ backgroundColor: stage.color ?? undefined }}
        />
        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="relative font-medium leading-snug group-hover:text-primary transition-colors">
        {stage.name}
      </p>
      {stage.description && (
        <p className="relative mt-1.5 text-xs text-muted-foreground line-clamp-2">{stage.description}</p>
      )}
    </Link>
  );
}
