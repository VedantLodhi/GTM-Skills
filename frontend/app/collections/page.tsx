import { Layers } from "lucide-react";
import { getCollections } from "@/lib/api/skills";
import { CollectionCard } from "@/components/gtm/collection-card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Collections — GTM Skills" };

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div>
      <div className="bg-glow border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Collections</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Curated skill sets built around a specific GTM motion — {collections.length} to start from.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {collections.length === 0 ? (
          <EmptyState icon={Layers} title="No collections yet" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
