import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getCollections, getSkills, getStages } from "@/lib/api/skills";
import { LinkButton } from "@/components/ui/button";
import { CollectionCard } from "@/components/gtm/collection-card";
import { SkillCard } from "@/components/gtm/skill-card";
import { SkillIcon } from "@/components/gtm/skill-icon";

export default async function HomePage() {
  const [stages, collections, featuredSkills] = await Promise.all([
    getStages(),
    getCollections(),
    getSkills(),
  ]);

  const featured = featuredSkills.filter((s) => s.is_featured).slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(600px circle at 20% 0%, color-mix(in oklab, var(--color-primary) 25%, transparent), transparent 60%), radial-gradient(500px circle at 90% 20%, color-mix(in oklab, var(--color-accent) 20%, transparent), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {featuredSkills.length} skills · {stages.length} GTM stages
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            The GTM playbook, <span className="text-primary">structured.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Browse a library of structured go-to-market skills — from ICP definition to renewal
            health checks. Run them step by step, save the ones that matter, and compose your own
            workflow.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/skills" size="lg">
              Browse the library <ArrowRight className="h-4 w-4" />
            </LinkButton>
            <LinkButton href="/collections" size="lg" variant="outline">
              Explore collections
            </LinkButton>
          </div>
        </div>
      </section>

      {/* Stages overview */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">The GTM funnel, end to end</h2>
            <p className="mt-2 text-muted-foreground">Every skill is mapped to one of 7 stages.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {stages.map((stage) => (
            <Link
              key={stage.id}
              href={`/skills?stage=${stage.slug}`}
              className="group rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span
                className="mb-3 flex h-2 w-8 rounded-full"
                style={{ backgroundColor: stage.color ?? undefined }}
              />
              <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors">
                {stage.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured collections */}
      <section className="border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Featured collections</h2>
              <p className="mt-2 text-muted-foreground">Curated sets built around a specific motion.</p>
            </div>
            <Link href="/collections" className="hidden text-sm font-medium text-primary hover:underline sm:block">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured skills */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Popular skills</h2>
              <p className="mt-2 text-muted-foreground">Start with the ones most teams reach for first.</p>
            </div>
            <Link href="/skills" className="hidden text-sm font-medium text-primary hover:underline sm:block">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featured.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <SkillIcon name="target" className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Not sure where to start?</h2>
          <p className="mt-2 text-muted-foreground">
            Every skill library starts with knowing who you're selling to.
          </p>
          <LinkButton href="/skills/icp-definition-builder" size="lg" className="mt-6">
            Start with ICP Definition <ArrowRight className="h-4 w-4" />
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
