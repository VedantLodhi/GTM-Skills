"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Stage } from "@/lib/api/types";
import { ROLE_PRESETS, CATEGORY_PRESETS, EXECUTION_TYPE_PRESETS, STATUS_PRESETS } from "@/lib/gtm-constants";

export function SkillsFilterBar({ stages }: { stages: Stage[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeStage = searchParams.get("stage");
  const activeRole = searchParams.get("role");
  const activeCategory = searchParams.get("category");
  const activeExecutionType = searchParams.get("execution_type");
  const activeStatus = searchParams.get("status");
  const activeFeatured = searchParams.get("featured") === "true";

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page"); // any filter change starts back at page 1
    startTransition(() => router.push(`/skills?${params.toString()}`));
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setParam("q", q || null), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const hasFilters =
    activeStage || activeRole || activeCategory || activeExecutionType || activeStatus || activeFeatured || searchParams.get("q");

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search skills…"
          className="pl-9"
        />
      </div>

      <button
        onClick={() => setParam("featured", activeFeatured ? null : "true")}
        type="button"
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
          activeFeatured
            ? "border-warning/40 bg-warning/10 text-warning"
            : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <Star className={cn("h-4 w-4", activeFeatured && "fill-warning")} />
        Featured only
      </button>

      <FilterGroup label="Stage">
        <FilterChip active={!activeStage} onClick={() => setParam("stage", null)}>
          All stages
        </FilterChip>
        {stages.map((stage) => (
          <FilterChip
            key={stage.id}
            active={activeStage === stage.slug}
            onClick={() => setParam("stage", stage.slug)}
            dotColor={stage.color}
          >
            {stage.name}
          </FilterChip>
        ))}
      </FilterGroup>

      <FilterGroup label="Role">
        <FilterChip active={!activeRole} onClick={() => setParam("role", null)}>
          All roles
        </FilterChip>
        {ROLE_PRESETS.map((role) => (
          <FilterChip key={role} active={activeRole === role} onClick={() => setParam("role", role)}>
            {role}
          </FilterChip>
        ))}
      </FilterGroup>

      <FilterGroup label="Category">
        <FilterChip active={!activeCategory} onClick={() => setParam("category", null)}>
          All categories
        </FilterChip>
        {CATEGORY_PRESETS.map((cat) => (
          <FilterChip key={cat} active={activeCategory === cat} onClick={() => setParam("category", cat)}>
            {cat}
          </FilterChip>
        ))}
      </FilterGroup>

      <FilterGroup label="Execution">
        <FilterChip active={!activeExecutionType} onClick={() => setParam("execution_type", null)}>
          All types
        </FilterChip>
        {EXECUTION_TYPE_PRESETS.map((et) => (
          <FilterChip
            key={et.value}
            active={activeExecutionType === et.value}
            onClick={() => setParam("execution_type", et.value)}
          >
            {et.label}
          </FilterChip>
        ))}
      </FilterGroup>

      <FilterGroup label="Status">
        <FilterChip active={!activeStatus} onClick={() => setParam("status", null)}>
          All statuses
        </FilterChip>
        {STATUS_PRESETS.map((s) => (
          <FilterChip key={s.value} active={activeStatus === s.value} onClick={() => setParam("status", s.value)}>
            {s.label}
          </FilterChip>
        ))}
      </FilterGroup>

      {hasFilters && (
        <button
          onClick={() => {
            setQ("");
            startTransition(() => router.push("/skills"));
          }}
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" /> Clear all filters
        </button>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  dotColor,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dotColor?: string | null;
}) {
  return (
    <button onClick={onClick} type="button">
      <Badge
        variant={active ? "default" : "outline"}
        className={cn("cursor-pointer transition-colors", !active && "hover:bg-secondary")}
      >
        {dotColor && (
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
        )}
        {children}
      </Badge>
    </button>
  );
}
