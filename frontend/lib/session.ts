/**
 * Anonymous demo-session id. This is a public showcase with no login — a
 * random id is created once in localStorage and sent as X-Session-Id on
 * every personalized request (bookmarks, workflow). Not an auth boundary.
 */
const STORAGE_KEY = "gtm-skills-session-id";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
