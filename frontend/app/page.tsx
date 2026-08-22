import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getCollections, getSkills, getSkillsPage, getStages } from "@/lib/api/skills";
import { LinkButton } from "@/components/ui/button";
import { CollectionRailCard } from "@/components/gtm/collection-card";
import { CategoryCard } from "@/components/gtm/category-card";
import { SkillCard } from "@/components/gtm/skill-card";
import { StatCard } from "@/components/gtm/stat-card";

export default async function HomePage() {
  const [stages, collections, totalPage, featuredPage, featuredSkills] = await Promise.all([
    getStages(),
    getCollections(),
    getSkillsPage({ limit: 1 }),
    getSkillsPage({ featured: true, limit: 1 }),
    getSkills({ featured: true, limit: 6 }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-glow relative overflow-hidden border-b border-border">
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />A structured GTM skills marketplace
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Turn <span className="text-gradient-accent">GTM</span> knowledge into repeatable{" "}
            <span className="text-gradient-accent">execution.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground text-balance">
            Discover proven GTM skills, run deterministic playbooks step by
            step, bookmark the ones that work, and compose your own sequence
            into a personal workflow.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LinkButton href="/skills" size="lg">
              Browse Skills <ArrowRight className="h-4 w-4" />
            </LinkButton>
            <LinkButton href="/collections" size="lg" variant="outline">
              Explore Collections
            </LinkButton>
          </div>
        </div>
      </section>

      {/* Stats — every number here is fetched live, never hardcoded */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard value={String(totalPage.total)} label="GTM Skills" />
          <StatCard value={String(stages.length)} label="GTM Stages" />
          <StatCard value={String(collections.length)} label="Collections" />
          <StatCard value={String(featuredPage.total)} label="Featured Skills" />
        </div>
      </section>

      {/* Source strip */}
      <section className="border-y border-border bg-secondary/30 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Built from 16 hand-written GTM skills plus 243 prompts imported from{" "}
            <a
              href="https://github.com/gtm-skills/gtm"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              gtm-skills/gtm
            </a>
          </p>
        </div>
      </section>

      {/* Featured collections — dense horizontal rail at every breakpoint */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Featured collections</h2>
            <p className="mt-2 text-muted-foreground">Curated sets built around a specific motion.</p>
          </div>
          <Link href="/collections" className="hidden text-sm font-medium text-primary hover:underline sm:block">
            View all
          </Link>
        </div>
        <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-2">
          {collections.map((collection) => (
            <CollectionRailCard key={collection.id} collection={collection} className="w-56 shrink-0" />
          ))}
        </div>
      </section>

      {/* Browse by category (real GTM stages) */}
      <section className="border-t border-border bg-secondary/20">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Browse by category</h2>
            <p className="text-sm text-muted-foreground">
              {stages.length} categories · {totalPage.total} skills
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {stages.map((stage) => (
              <CategoryCard key={stage.id} stage={stage} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular skills */}
      {featuredSkills.length > 0 && (
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
            {featuredSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">Not sure where to start?</h2>
          <p className="mt-2 text-muted-foreground">
            Every skill library starts with knowing who you&apos;re selling to.
          </p>
          <LinkButton href="/skills/icp-definition-builder" size="lg" className="mt-6">
            Start with ICP Definition <ArrowRight className="h-4 w-4" />
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
