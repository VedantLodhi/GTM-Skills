export interface Stage {
  id: string;
  slug: string;
  name: string;
  position: number;
  description: string | null;
  color: string | null;
}

export type ExecutionType = "native" | "assisted" | "method_only" | "coming_soon";
export type SkillStatus = "beta" | "live" | "planned";

export interface SkillListItem {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  stage: Stage;
  roles: string[];
  categories: string[];
  execution_type: ExecutionType;
  status: SkillStatus;
  icon: string | null;
  color: string | null;
  is_featured: boolean;
}

export interface IOField {
  label: string;
  description: string;
}

export interface WorkflowStep {
  title: string;
  description: string;
}

export interface SkillDetail extends SkillListItem {
  when_to_use: string;
  inputs: IOField[];
  workflow_steps: WorkflowStep[];
  outputs: IOField[];
  related_skills: SkillListItem[];
  // Imported-content fields (gtm-skills/gtm import) — null for the 16
  // hand-written skills.
  content_body: string | null;
  source_url: string | null;
  difficulty: string | null;
}

export interface CollectionListItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  is_featured: boolean;
  skill_count: number;
}

export interface CollectionDetail extends CollectionListItem {
  skills: SkillListItem[];
}

export interface RunSkillResponse {
  skill: SkillDetail;
  run_id: string;
  run_count: number;
}

export interface BookmarkToggleResponse {
  skill_id: string;
  bookmarked: boolean;
}

export interface WorkflowItem {
  id: string;
  position: number;
  notes: string | null;
  skill: SkillListItem;
}

export interface Workflow {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  items: WorkflowItem[];
}

export interface SkillFilters {
  stage?: string;
  role?: string;
  category?: string;
  execution_type?: string;
  status?: string;
  featured?: boolean;
  q?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedSkills {
  items: SkillListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
