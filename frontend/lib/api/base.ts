/**
 * Server Components run fetch() outside the browser, so a relative "/api/..."
 * URL doesn't resolve — they need the backend's absolute origin. Client
 * Components run in the browser and use a relative path, which Next's
 * rewrite (next.config.ts) forwards to the same backend without any CORS
 * setup. This one helper picks the right base for whichever side calls it.
 */
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://127.0.0.1:8000";

export function apiUrl(path: string): string {
  const base = typeof window === "undefined" ? BACKEND_ORIGIN : "";
  return `${base}${path}`;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function doFetch(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body?.detail || detail;
    } catch {
      /* non-JSON error body — keep statusText */
    }
    throw new ApiError(res.status, typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return res;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await doFetch(path, init);
  return res.json() as Promise<T>;
}

/**
 * Same as apiFetch, but also returns response headers — GET /api/skills
 * returns its pagination totals (X-Total-Count etc.) as headers rather
 * than wrapping the body, so the discovery page's pager needs this to
 * read them without changing the existing apiFetch call sites.
 */
export async function apiFetchWithHeaders<T>(
  path: string,
  init?: RequestInit
): Promise<{ data: T; headers: Headers }> {
  const res = await doFetch(path, init);
  const data = (await res.json()) as T;
  return { data, headers: res.headers };
}
