// Mirrors the backend's constant presets (app/db/models/gtm_skill.py) —
// used to render filter options without an extra round trip.
// "Sales Manager" added for the gtm-skills/gtm import (salesManagerPrompts).
export const ROLE_PRESETS = ["SDR", "AE", "RevOps", "Marketing", "Founder", "CS", "Sales Manager"] as const;

export const CATEGORY_PRESETS = ["Email", "Calls", "Research", "Enablement", "Pricing", "Retention"] as const;

export const EXECUTION_TYPE_PRESETS = [
  { value: "native", label: "Native" },
  { value: "assisted", label: "Assisted" },
  { value: "method_only", label: "Method-only" },
  { value: "coming_soon", label: "Coming Soon" },
] as const;
