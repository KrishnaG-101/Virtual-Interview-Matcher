export type ExperienceLevel = "fresher" | "mid" | "senior";
export type ParseStatus = "pending" | "done" | "failed";
export type MatchStatus = "suggested" | "approved" | "overridden" | "declined";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  domain: string;
  experience_level: ExperienceLevel;
  parse_status: ParseStatus;
  parsed_skills: string[];
  experience_years: number;
  created_at: string;
}

export interface Expert {
  id: string;
  name: string;
  designation: string;
  domain: string;
  skills: string[];
  experience_years: number;
  is_active: boolean;
}

export interface ScoreBreakdown {
  semantic_similarity: number;
  skill_overlap: number;
  experience_delta: number;
  domain_match: number;
  availability_score: number;
}

export interface MatchScore {
  id: string;
  expert_id: string;
  candidate_id: string;
  total_score: number;
  score_breakdown: ScoreBreakdown;
  rank: number;
  explanation: string;
  status: MatchStatus;
  override_reason: string | null;
  assigned_by: string | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  candidate_name: string;
  expert_name: string;
  total_score: number;
  status: MatchStatus;
  assigned_by: string | null;
  override_reason: string | null;
  created_at: string;
  domain: string;
}
