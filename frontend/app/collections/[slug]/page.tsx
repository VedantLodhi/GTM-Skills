import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";
import { notFound } from "next/navigation";
import { getCollection } from "@/lib/api/skills";
import { ApiError } from "@/lib/api/base";
import { SkillCard } from "@/components/gtm/skill-card";
import { EmptyState } from "@/components/ui/empty-state";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const collection = await getCollection(slug);
    return { title: `${collection.name} — GTM Skills` };
  } catch {
    return { title: "Collection — GTM Skills" };
  }
}

export default async function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let collection;
  try {
    collection = await getCollection(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link
        href="/collections"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to collections
      </Link>

      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Layers className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{collection.name}</h1>
          {collection.description && <p className="mt-2 text-muted-foreground">{collection.description}</p>}
        </div>
      </div>

      {collection.skills.length === 0 ? (
        <EmptyState icon={Layers} title="This collection is empty" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {collection.skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}
