import { apiFetch } from "@/lib/api/base";
import { getSessionId } from "@/lib/session";
import type {
  BookmarkToggleResponse,
  CollectionDetail,
  CollectionListItem,
  RunSkillResponse,
  SkillDetail,
  SkillFilters,
  SkillListItem,
  Stage,
  Workflow,
} from "@/lib/api/types";

// ---------- Reads (used from Server Components and Client Components) ----------

export function getStages() {
  return apiFetch<Stage[]>("/api/stages");
}

export function getSkills(filters: SkillFilters = {}) {
  const params = new URLSearchParams();
  if (filters.stage) params.set("stage", filters.stage);
  if (filters.role) params.set("role", filters.role);
  if (filters.category) params.set("category", filters.category);
  if (filters.execution_type) params.set("execution_type", filters.execution_type);
  if (filters.q) params.set("q", filters.q);
  const qs = params.toString();
  return apiFetch<SkillListItem[]>(`/api/skills${qs ? `?${qs}` : ""}`);
}

export function getSkill(slug: string) {
  return apiFetch<SkillDetail>(`/api/skills/${slug}`);
}

export function getCollections() {
  return apiFetch<CollectionListItem[]>("/api/collections");
}

export function getCollection(slug: string) {
  return apiFetch<CollectionDetail>(`/api/collections/${slug}`);
}

// ---------- Writes (Client Components only — need the browser session id) ----------

function sessionHeaders(): HeadersInit {
  return { "X-Session-Id": getSessionId() };
}

export function runSkill(slug: string) {
  return apiFetch<RunSkillResponse>(`/api/skills/${slug}/run`, {
    method: "POST",
    headers: sessionHeaders(),
  });
}

export function toggleBookmark(slug: string) {
  return apiFetch<BookmarkToggleResponse>(`/api/skills/${slug}/bookmark`, {
    method: "POST",
    headers: sessionHeaders(),
  });
}

export function getBookmarks() {
  return apiFetch<SkillListItem[]>("/api/bookmarks", { headers: sessionHeaders() });
}

export function getWorkflow() {
  return apiFetch<Workflow>("/api/workflow", { headers: sessionHeaders() });
}

export function addWorkflowItem(skillId: string, notes?: string) {
  return apiFetch<Workflow>("/api/workflow/items", {
    method: "POST",
    headers: sessionHeaders(),
    body: JSON.stringify({ skill_id: skillId, notes }),
  });
}

export function updateWorkflowItem(itemId: string, patch: { position?: number; notes?: string }) {
  return apiFetch<Workflow>(`/api/workflow/items/${itemId}`, {
    method: "PATCH",
    headers: sessionHeaders(),
    body: JSON.stringify(patch),
  });
}

export function deleteWorkflowItem(itemId: string) {
  return apiFetch<Workflow>(`/api/workflow/items/${itemId}`, {
    method: "DELETE",
    headers: sessionHeaders(),
  });
}
