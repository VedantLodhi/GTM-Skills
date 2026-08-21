import { SearchX } from "lucide-react";
import { getSkills, getStages } from "@/lib/api/skills";
import { SkillsFilterBar } from "@/components/gtm/skills-filter-bar";
import { SkillCard } from "@/components/gtm/skill-card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Skill Library — GTM Skills" };

export default async function SkillsLibraryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [stages, skills] = await Promise.all([
    getStages(),
    getSkills({
      stage: params.stage,
      role: params.role,
      category: params.category,
      execution_type: params.execution_type,
      q: params.q,
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Skill Library</h1>
        <p className="mt-2 text-muted-foreground">
          {skills.length} skill{skills.length === 1 ? "" : "s"} across every stage of the GTM funnel.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <SkillsFilterBar stages={stages} />
        </aside>

        <section>
          {skills.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No skills match these filters"
              description="Try clearing a filter or searching a different term."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
