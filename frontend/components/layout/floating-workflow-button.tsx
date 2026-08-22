"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListTodo } from "lucide-react";
import { getWorkflow } from "@/lib/api/skills";

/**
 * The reference design's bottom-right floating action slot — reused here
 * for a real feature (jump to the workflow builder, with a live item
 * count) rather than an AI-assistant affordance this project doesn't have.
 */
export function FloatingWorkflowButton() {
  const pathname = usePathname();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getWorkflow()
      .then((wf) => {
        if (!cancelled) setCount(wf.items.length);
      })
      .catch(() => {
        /* anonymous session may not have a workflow yet — non-fatal */
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (pathname === "/workflow") return null;

  return (
    <Link
      href="/workflow"
      className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105"
    >
      <ListTodo className="h-4 w-4" />
      My Workflow
      {count !== null && count > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-foreground/20 px-1 text-xs">
          {count}
        </span>
      )}
    </Link>
  );
}
