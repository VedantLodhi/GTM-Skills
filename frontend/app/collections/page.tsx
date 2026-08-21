import { Layers } from "lucide-react";
import { getCollections } from "@/lib/api/skills";
import { CollectionCard } from "@/components/gtm/collection-card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Collections — GTM Skills" };

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Collections</h1>
        <p className="mt-2 text-muted-foreground">Curated skill sets built around a specific GTM motion.</p>
      </div>

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
  );
}
