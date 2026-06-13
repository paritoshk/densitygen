// Types for the DensityGen ALD-screening backend (the teammate's FastAPI
// service, e.g. https://yushg-densitygen-ald.hf.space). Mirrors /api/screen.

export type Confidence = "measured" | "estimated" | "unknown";

export interface ScoreComponent {
  name: string; // delivery | thermal_window | surface_reactivity | ...
  score: number; // 0..1
  evidence: string;
  confidence: Confidence;
}

export interface ScorecardCandidate {
  name: string;
  formula: string | null;
  molecular_weight: number | null;
  film_element: string | null;
  overall_score: number; // 0..1
  components: ScoreComponent[];
  warnings: string[];
  recommended_next_step: string;
  is_known_recipe: boolean;
  origin: string;
  ml_energy_ev: number | null;
  ml_calls: unknown[];
}

export interface ModelProvenance {
  compute_backend: string | null; // "local-descriptors" | "chgnet" | "uma" ...
  model_name: string | null;
  replicate_model: string | null;
  notes: string | null;
}

export interface ScreenResponse {
  film: string;
  co_reactant: string | null;
  ranked_candidates: ScorecardCandidate[];
  warnings: string[];
  model_provenance: ModelProvenance | null;
  billing: unknown;
}

export interface CandidateInput {
  name: string;
  formula?: string;
}

export interface ScreenRequest {
  film: string;
  co_reactant?: string;
  temperature_max_c?: number;
  surface?: string;
  forbidden_elements?: string[];
  use_ml_potential?: boolean;
  candidates: CandidateInput[];
}
