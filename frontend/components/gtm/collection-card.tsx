import Link from "next/link";
import { Layers, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CollectionListItem } from "@/lib/api/types";

export function CollectionCard({ collection }: { collection: CollectionListItem }) {
  return (
    <Link href={`/collections/${collection.slug}`} className="block group">
      <Card className="h-full transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="h-5 w-5" />
            </div>
            <Badge variant="secondary">
              {collection.skill_count} skill{collection.skill_count === 1 ? "" : "s"}
            </Badge>
          </div>
          <div>
            <h3 className="font-semibold group-hover:text-primary transition-colors">{collection.name}</h3>
            {collection.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{collection.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            View collection <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
