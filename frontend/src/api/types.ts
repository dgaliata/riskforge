export type RiskStatus = "Open" | "Mitigated" | "Accepted" | "Closed";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type AIRiskStatus = "Identified" | "Assessed" | "Treated" | "Monitored";
export type AITaxonomy = "ai_rmf" | "owasp";

export interface OwaspLLMCategory {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface NISTControl {
  id: string;
  control_id: string;
  family_code: string;
  family_name: string;
  control_name: string;
  description: string;
  baseline: string | null;
  priority: string | null;
  related_controls?: string | null;
  risk_count?: number;
}

export interface Risk {
  id: string;
  title: string;
  description: string | null;
  status: RiskStatus;
  category: string | null;
  likelihood: number;
  impact: number;
  risk_score: number | null;
  risk_level: RiskLevel | null;
  owner: string | null;
  identified_date: string | null;
  target_mitigation_date: string | null;
  mitigation_notes: string | null;
  control_id: string | null;
  control?: NISTControl | null;
  created_at: string;
  updated_at: string;
}

export interface RiskPayload {
  title: string;
  description?: string | null;
  status?: RiskStatus;
  category?: string | null;
  likelihood: number;
  impact: number;
  owner?: string | null;
  identified_date?: string | null;
  target_mitigation_date?: string | null;
  mitigation_notes?: string | null;
  control_id?: string | null;
}

export interface AIMSubcategory {
  id: string;
  code: string;
  description: string;
}

export interface AIMCategory {
  id: string;
  code: string;
  title: string;
  sort_order: number;
  subcategories?: AIMSubcategory[];
}

export interface AIMFunction {
  id: string;
  code: "GOVERN" | "MAP" | "MEASURE" | "MANAGE";
  name: string;
  description: string;
  sort_order: number;
  categories?: AIMCategory[];
}

export interface AIRisk {
  id: string;
  title: string;
  description: string | null;
  status: AIRiskStatus;
  ai_system_name: string | null;
  taxonomy: AITaxonomy;
  function_code: string | null;
  subcategory_id: string | null;
  owasp_llm_id: string | null;
  trust_characteristic: string | null;
  gai_risk_category: string | null;
  likelihood: number;
  impact: number;
  risk_score: number | null;
  risk_level: RiskLevel | null;
  risk_response: string | null;
  residual_risk: number | null;
  owner: string | null;
  review_date: string | null;
  notes: string | null;
  subcategory?: AIMSubcategory | null;
  owasp_category?: OwaspLLMCategory | null;
  created_at: string;
  updated_at: string;
}

export interface AIRiskPayload {
  title: string;
  description?: string | null;
  status?: AIRiskStatus;
  ai_system_name?: string | null;
  taxonomy?: AITaxonomy;
  function_code?: string | null;
  subcategory_id?: string | null;
  owasp_llm_id?: string | null;
  trust_characteristic?: string | null;
  gai_risk_category?: string | null;
  likelihood: number;
  impact: number;
  risk_response?: string | null;
  residual_risk?: number | null;
  owner?: string | null;
  review_date?: string | null;
  notes?: string | null;
}

export interface AITaxonomyMeta {
  trust_characteristics: string[];
  gai_risk_categories: string[];
  risk_responses: string[];
}

export interface DashboardSummary {
  total_risks: number;
  total_ai_risks: number;
  by_level: Record<string, number>;
  by_status: Record<string, number>;
  ai_by_function: Record<string, number>;
  ai_by_characteristic: Record<string, number>;
  open_critical_high: number;
  matrix_heat: Record<string, number>;
  recent_risks: Risk[];
}

export interface FamilyInfo {
  family_code: string;
  family_name: string;
  control_count: number;
}