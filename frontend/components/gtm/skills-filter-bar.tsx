"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Stage } from "@/lib/api/types";
import { ROLE_PRESETS, EXECUTION_TYPE_PRESETS } from "@/lib/gtm-constants";

export function SkillsFilterBar({ stages }: { stages: Stage[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeStage = searchParams.get("stage");
  const activeRole = searchParams.get("role");
  const activeExecutionType = searchParams.get("execution_type");

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
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

  const hasFilters = activeStage || activeRole || activeExecutionType || searchParams.get("q");

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search skills…"
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Stage</p>
        <div className="flex flex-wrap gap-1.5">
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
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</p>
          <div className="flex flex-wrap gap-1.5">
            <FilterChip active={!activeRole} onClick={() => setParam("role", null)}>
              All roles
            </FilterChip>
            {ROLE_PRESETS.map((role) => (
              <FilterChip key={role} active={activeRole === role} onClick={() => setParam("role", role)}>
                {role}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Execution</p>
          <div className="flex flex-wrap gap-1.5">
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
          </div>
        </div>
      </div>

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
