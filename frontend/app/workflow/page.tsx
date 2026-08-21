"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ListTodo, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ExecutionBadge } from "@/components/gtm/execution-badge";
import { SkillIcon } from "@/components/gtm/skill-icon";
import { deleteWorkflowItem, getWorkflow, updateWorkflowItem } from "@/lib/api/skills";
import { ApiError } from "@/lib/api/base";
import type { Workflow } from "@/lib/api/types";

export default function WorkflowPage() {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setWorkflow(await getWorkflow());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load your workflow");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const items = workflow?.items ?? [];

  const move = async (itemId: string, direction: "up" | "down") => {
    const idx = items.findIndex((i) => i.id === itemId);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx === -1 || swapIdx < 0 || swapIdx >= items.length) return;

    setPendingId(itemId);
    try {
      const a = items[idx];
      const b = items[swapIdx];
      await Promise.all([
        updateWorkflowItem(a.id, { position: b.position }),
        updateWorkflowItem(b.id, { position: a.position }),
      ]);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't reorder");
    } finally {
      setPendingId(null);
    }
  };

  const remove = async (itemId: string) => {
    setPendingId(itemId);
    try {
      const updated = await deleteWorkflowItem(itemId);
      setWorkflow(updated);
      toast.success("Removed from workflow");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't remove item");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">My Workflow</h1>
        <p className="mt-2 text-muted-foreground">
          Your personal sequence of skills — reorder them into the order you'll actually run them.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={ListTodo}
          title="Couldn't load your workflow"
          description={error}
          action={
            <Button variant="outline" onClick={load}>
              Try again
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="Your workflow is empty"
          description="Open any skill and hit “Add to Workflow” to start building your sequence."
          action={
            <Link href="/skills">
              <Button>Browse the library</Button>
            </Link>
          }
        />
      ) : (
        <ol className="space-y-3">
          {items.map((item, idx) => (
            <li key={item.id}>
              <Card>
                <CardContent className="flex items-center gap-4 py-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                    {idx + 1}
                  </span>
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: `${item.skill.stage.color}1a`,
                      color: item.skill.stage.color ?? undefined,
                    }}
                  >
                    <SkillIcon name={item.skill.icon} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/skills/${item.skill.slug}`} className="font-medium hover:text-primary">
                      {item.skill.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline">{item.skill.stage.name}</Badge>
                      <ExecutionBadge type={item.skill.execution_type} />
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={idx === 0 || pendingId === item.id}
                      onClick={() => move(item.id, "up")}
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={idx === items.length - 1 || pendingId === item.id}
                      onClick={() => move(item.id, "down")}
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={pendingId === item.id}
                      onClick={() => remove(item.id)}
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
