import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getSkill } from "@/lib/api/skills";
import { ApiError } from "@/lib/api/base";
import { ExecutionBadge } from "@/components/gtm/execution-badge";
import { SkillIcon } from "@/components/gtm/skill-icon";
import { RunSkillPanel } from "@/components/gtm/run-skill-panel";
import { BookmarkButton } from "@/components/gtm/bookmark-button";
import { AddToWorkflowButton } from "@/components/gtm/add-to-workflow-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const skill = await getSkill(slug);
    return { title: `${skill.title} — GTM Skills` };
  } catch {
    return { title: "Skill — GTM Skills" };
  }
}

export default async function SkillDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let skill;
  try {
    skill = await getSkill(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link
        href="/skills"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to library
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <header className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${skill.stage.color}1a`, color: skill.stage.color ?? undefined }}
              >
                <SkillIcon name={skill.icon} className="h-6 w-6" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ExecutionBadge type={skill.execution_type} />
                <Badge variant="outline" style={{ borderColor: skill.stage.color ?? undefined }}>
                  {skill.stage.name}
                </Badge>
              </div>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">{skill.title}</h1>
            <p className="text-lg text-muted-foreground">{skill.short_description}</p>
          </header>

          <Section title="When to use this">
            <p className="text-sm leading-relaxed text-muted-foreground">{skill.when_to_use}</p>
          </Section>

          <Section title="Inputs">
            <dl className="space-y-3">
              {skill.inputs.map((input) => (
                <div key={input.label}>
                  <dt className="text-sm font-medium">{input.label}</dt>
                  <dd className="text-sm text-muted-foreground">{input.description}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section title="Run this skill">
            <RunSkillPanel skill={skill} />
          </Section>

          <Section title="Outputs">
            <dl className="space-y-3">
              {skill.outputs.map((output) => (
                <div key={output.label}>
                  <dt className="text-sm font-medium">{output.label}</dt>
                  <dd className="text-sm text-muted-foreground">{output.description}</dd>
                </div>
              ))}
            </dl>
          </Section>

          {skill.related_skills.length > 0 && (
            <Section title="Related skills">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {skill.related_skills.map((related) => (
                  <Link
                    key={related.id}
                    href={`/skills/${related.slug}`}
                    className="group flex items-center justify-between gap-3 rounded-lg border border-border p-3 hover:border-primary/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium group-hover:text-primary">{related.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{related.short_description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                  </Link>
                ))}
              </div>
            </Section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <AddToWorkflowButton skillId={skill.id} />
              <BookmarkButton slug={skill.slug} />

              <div className="space-y-3 border-t border-border pt-4">
                <FactRow label="Roles">
                  <div className="flex flex-wrap justify-end gap-1">
                    {skill.roles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </FactRow>
                <FactRow label="Categories">
                  <div className="flex flex-wrap justify-end gap-1">
                    {skill.categories.map((cat) => (
                      <Badge key={cat} variant="muted">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </FactRow>
                <FactRow label="Status">
                  <span className="text-sm capitalize">{skill.status}</span>
                </FactRow>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

function FactRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
