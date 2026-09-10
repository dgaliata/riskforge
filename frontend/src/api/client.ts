import type {
  AIMFunction,
  AIRisk,
  AIRiskPayload,
  AITaxonomyMeta,
  DashboardSummary,
  FamilyInfo,
  NISTControl,
  OwaspLLMCategory,
  Risk,
  RiskPayload,
} from "./types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(detail.detail ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  // Risks
  listRisks: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<Risk[]>(`/risks${qs ? `?${qs}` : ""}`);
  },
  createRisk: (payload: RiskPayload) =>
    request<Risk>("/risks", { method: "POST", body: JSON.stringify(payload) }),
  updateRisk: (id: string, payload: Partial<RiskPayload>) =>
    request<Risk>(`/risks/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteRisk: (id: string) => request<void>(`/risks/${id}`, { method: "DELETE" }),

  // Controls
  listControls: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<NISTControl[]>(`/controls${qs ? `?${qs}` : ""}`);
  },
  listFamilies: () => request<FamilyInfo[]>("/controls/families"),

  // AI RMF
  getAIFramework: () => request<AIMFunction[]>("/ai/framework"),
  getAITaxonomy: () => request<AITaxonomyMeta>("/ai/taxonomy"),
  getOwaspCategories: () => request<OwaspLLMCategory[]>("/ai/owasp"),
  listAIRisks: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<AIRisk[]>(`/ai/risks${qs ? `?${qs}` : ""}`);
  },
  createAIRisk: (payload: AIRiskPayload) =>
    request<AIRisk>("/ai/risks", { method: "POST", body: JSON.stringify(payload) }),
  updateAIRisk: (id: string, payload: Partial<AIRiskPayload>) =>
    request<AIRisk>(`/ai/risks/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteAIRisk: (id: string) => request<void>(`/ai/risks/${id}`, { method: "DELETE" }),

  // Reports
  summary: () => request<DashboardSummary>("/reports/summary"),
  exportRisks: (riskType: "standard" | "ai") => `${BASE}/reports/risk-export?risk_type=${riskType}&format=csv`,
};