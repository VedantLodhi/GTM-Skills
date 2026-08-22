import { apiFetch, apiFetchWithHeaders } from "@/lib/api/base";
import { getSessionId } from "@/lib/session";
import type {
  BookmarkToggleResponse,
  CollectionDetail,
  CollectionListItem,
  PaginatedSkills,
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

function skillFilterParams(filters: SkillFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.stage) params.set("stage", filters.stage);
  if (filters.role) params.set("role", filters.role);
  if (filters.category) params.set("category", filters.category);
  if (filters.execution_type) params.set("execution_type", filters.execution_type);
  if (filters.status) params.set("status", filters.status);
  if (filters.featured !== undefined) params.set("featured", String(filters.featured));
  if (filters.q) params.set("q", filters.q);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  return params;
}

export function getSkills(filters: SkillFilters = {}) {
  const qs = skillFilterParams(filters).toString();
  return apiFetch<SkillListItem[]>(`/api/skills${qs ? `?${qs}` : ""}`);
}

/**
 * Same endpoint as getSkills, but also surfaces the pagination totals the
 * backend returns as response headers (X-Total-Count / X-Total-Pages) —
 * used by the skills discovery page's pager. GET /api/skills' response
 * body is unchanged either way (a plain array).
 */
export async function getSkillsPage(filters: SkillFilters = {}): Promise<PaginatedSkills> {
  const qs = skillFilterParams(filters).toString();
  const { data, headers } = await apiFetchWithHeaders<SkillListItem[]>(`/api/skills${qs ? `?${qs}` : ""}`);
  const total = Number(headers.get("x-total-count") ?? data.length);
  const page = Number(headers.get("x-page") ?? filters.page ?? 1);
  const limit = Number(headers.get("x-limit") ?? filters.limit ?? data.length);
  const totalPages = Number(headers.get("x-total-pages") ?? 1);
  return { items: data, total, page, limit, totalPages };
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
