import Link from "next/link";
import { Layers, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CollectionListItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function CollectionCard({
  collection,
  className,
}: {
  collection: CollectionListItem;
  className?: string;
}) {
  return (
    <Link href={`/collections/${collection.slug}`} className={cn("block group", className)}>
      <Card className="h-full overflow-hidden transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
        <div className="bg-glow relative flex h-24 items-center justify-center border-b border-border bg-secondary/40">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm">
            <Layers className="h-6 w-6" />
          </div>
        </div>
        <CardContent className="space-y-3 pt-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors">
              {collection.name}
            </h3>
            <Badge variant="secondary" className="shrink-0">
              {collection.skill_count} skill{collection.skill_count === 1 ? "" : "s"}
            </Badge>
          </div>
          {collection.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{collection.description}</p>
          )}
          <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            View collection <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/** Dense rail card for the homepage's horizontal collections row — icon
 * inline rather than a banner, real description preview + skill-count
 * meta line. Same data (CollectionListItem from the real Collections
 * API), just a tighter layout for a marketplace-style scroll rail. */
export function CollectionRailCard({
  collection,
  className,
}: {
  collection: CollectionListItem;
  className?: string;
}) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className={cn(
        "group block rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <Layers className="h-5 w-5" />
        </div>
        <Badge variant="secondary" className="shrink-0">
          {collection.skill_count} skill{collection.skill_count === 1 ? "" : "s"}
        </Badge>
      </div>
      <h3 className="mt-4 font-semibold leading-snug group-hover:text-primary transition-colors">
        {collection.name}
      </h3>
      {collection.description && (
        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{collection.description}</p>
      )}
    </Link>
  );
}
