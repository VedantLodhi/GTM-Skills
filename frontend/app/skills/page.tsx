import { SearchX } from "lucide-react";
import { getSkillsPage, getStages } from "@/lib/api/skills";
import { SkillsFilterBar } from "@/components/gtm/skills-filter-bar";
import { SkillCard } from "@/components/gtm/skill-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";

export const metadata = { title: "Skill Library — GTM Skills" };

export default async function SkillsLibraryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Number(params.page) > 0 ? Number(params.page) : 1;

  const [stages, result] = await Promise.all([
    getStages(),
    getSkillsPage({
      stage: params.stage,
      role: params.role,
      category: params.category,
      execution_type: params.execution_type,
      status: params.status,
      featured: params.featured === "true" ? true : undefined,
      q: params.q,
      page,
      limit: 24,
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Skill Library</h1>
        <p className="mt-2 text-muted-foreground">
          {result.total} skill{result.total === 1 ? "" : "s"} across every stage of the GTM funnel.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <SkillsFilterBar stages={stages} />
        </aside>

        <section>
          {result.items.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No skills match these filters"
              description="Try clearing a filter or searching a different term."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
              <Pagination page={result.page} totalPages={result.totalPages} total={result.total} limit={result.limit} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
