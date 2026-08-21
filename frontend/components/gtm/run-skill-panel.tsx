"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Play, Sparkles, Clock, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { runSkill } from "@/lib/api/skills";
import { ApiError } from "@/lib/api/base";
import type { SkillDetail } from "@/lib/api/types";

/**
 * "Run" is a real, persisted action (POST /skills/{slug}/run records a
 * gtm_skill_runs row) that unlocks a deterministic, structured walkthrough
 * built from the skill's own inputs/workflow_steps/outputs — there is no
 * LLM call. Framing changes by execution_type; mechanics stay identical.
 *
 * Imported skills (gtm-skills/gtm) carry `content_body` instead of
 * workflow_steps/inputs/outputs — a raw copy-paste prompt template, not a
 * numbered walkthrough. That case is never converted into fake steps; it
 * gets its own copyable block above the run action.
 */
export function RunSkillPanel({ skill }: { skill: SkillDetail }) {
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [runCount, setRunCount] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [inputValues, setInputValues] = useState<Record<number, string>>({});

  const isComingSoon = skill.execution_type === "coming_soon";
  const isMethodOnly = skill.execution_type === "method_only";
  const hasSteps = skill.workflow_steps.length > 0;

  const handleRun = async () => {
    setRunning(true);
    try {
      const res = await runSkill(skill.slug);
      setRunCount(res.run_count);
      setStarted(true);
      toast.success("Skill started", { description: `Run #${res.run_count} for this skill.` });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't start this skill");
    } finally {
      setRunning(false);
    }
  };

  const toggleStep = (i: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const allDone = hasSteps && completedSteps.size === skill.workflow_steps.length;

  if (isComingSoon) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <Clock className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-medium">This skill is coming soon</p>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              It&apos;s planned but not yet available to run in this workspace.
            </p>
          </div>
          <Button variant="secondary" disabled>
            Notify me when it ships
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        {skill.content_body && <PromptTemplateBlock content={skill.content_body} />}

        {!started ? (
          <div className="flex flex-col items-start gap-4">
            <div>
              <p className="font-medium">
                {skill.execution_type === "assisted" ? "Guided walkthrough" : "Run this skill"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {skill.execution_type === "assisted"
                  ? "Pairs with your own tool — walks you through each step with fields to fill in as you go."
                  : hasSteps
                    ? "Walks you through each step below, with fields to fill in as you go."
                    : "Records this as a run — copy the prompt above and use it in your own tool."}
              </p>
            </div>
            <Button onClick={handleRun} loading={running}>
              <Play className="h-4 w-4" /> Run this skill
            </Button>
          </div>
        ) : !hasSteps ? (
          <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/10 p-4">
            <p className="text-sm font-medium text-success">Run recorded</p>
            {runCount !== null && <Badge variant="muted">Run #{runCount}</Badge>}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="font-medium">Guided walkthrough</p>
              </div>
              {runCount !== null && <Badge variant="muted">Run #{runCount}</Badge>}
            </div>

            <ol className="space-y-4">
              {skill.workflow_steps.map((step, i) => {
                const done = completedSteps.has(i);
                return (
                  <li key={i} className="flex gap-3">
                    <button
                      onClick={() => toggleStep(i)}
                      className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors"
                      aria-label={done ? "Mark step incomplete" : "Mark step complete"}
                    >
                      {done ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    <div className="flex-1 space-y-2">
                      <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : ""}`}>
                        {i + 1}. {step.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {skill.inputs[i] && (
                        <Textarea
                          placeholder={`${skill.inputs[i].label}…`}
                          value={inputValues[i] ?? ""}
                          onChange={(e) => setInputValues((prev) => ({ ...prev, [i]: e.target.value }))}
                          className="mt-1"
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {allDone && (
              <div className="rounded-lg border border-success/30 bg-success/10 p-4">
                <p className="text-sm font-medium text-success">Walkthrough complete</p>
                <ul className="mt-2 space-y-1">
                  {skill.outputs.map((output) => (
                    <li key={output.label} className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{output.label}:</span> {output.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {isMethodOnly && !skill.content_body && (
          <p className="text-xs text-muted-foreground">
            This is a method-only skill — a playbook to follow yourself, not an automated output.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function PromptTemplateBlock({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Prompt copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select and copy the text manually");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Prompt template</p>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-muted p-4 font-mono text-xs leading-relaxed text-foreground">
        {content}
      </pre>
    </div>
  );
}
