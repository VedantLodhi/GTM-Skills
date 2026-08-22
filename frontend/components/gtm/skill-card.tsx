import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExecutionBadge } from "@/components/gtm/execution-badge";
import { SkillIcon } from "@/components/gtm/skill-icon";
import type { SkillListItem } from "@/lib/api/types";

export function SkillCard({ skill }: { skill: SkillListItem }) {
  return (
    <Link href={`/skills/${skill.slug}`} className="block group">
      <Card className="h-full overflow-hidden transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${skill.stage.color}1a`, color: skill.stage.color ?? undefined }}
          >
            <SkillIcon name={skill.icon} className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-1.5">
            {skill.is_featured && <Star className="h-4 w-4 fill-warning text-warning" />}
            <ExecutionBadge type={skill.execution_type} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors">
              {skill.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{skill.short_description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" style={{ borderColor: skill.stage.color ?? undefined }}>
              {skill.stage.name}
            </Badge>
            {skill.roles.slice(0, 2).map((role) => (
              <Badge key={role} variant="secondary">
                {role}
              </Badge>
            ))}
            {skill.status !== "live" && (
              <Badge variant="warning" className="capitalize">
                {skill.status}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function SkillCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="h-11 w-11 rounded-xl bg-muted animate-pulse" />
        <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
          <div className="h-3 w-full rounded bg-muted animate-pulse" />
          <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 w-20 rounded-full bg-muted animate-pulse" />
          <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
