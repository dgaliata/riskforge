export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export const LEVEL_STYLES: Record<RiskLevel, string> = {
  Low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  High: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Critical: "bg-rose-600/20 text-rose-400 border-rose-500/40",
};

const CELL_STYLES: Record<number, string> = {
  1: "bg-emerald-600/20 text-emerald-300 border-emerald-700/40 hover:bg-emerald-600/35",
  2: "bg-emerald-700/25 text-emerald-200 border-emerald-700/50 hover:bg-emerald-700/40",
  3: "bg-amber-600/30 text-amber-200 border-amber-600/50 hover:bg-amber-600/45",
  4: "bg-amber-500/30 text-amber-100 border-amber-500/50 hover:bg-amber-500/45",
  5: "bg-rose-700/40 text-rose-200 border-rose-700/50 hover:bg-rose-700/55",
  8: "bg-rose-600/45 text-rose-100 border-rose-600/55 hover:bg-rose-600/60",
  9: "bg-orange-600/35 text-orange-200 border-orange-600/50 hover:bg-orange-600/50",
  10: "bg-orange-500/45 text-orange-100 border-orange-500/55 hover:bg-orange-500/60",
  12: "bg-orange-600/45 text-orange-100 border-orange-600/55 hover:bg-orange-600/60",
  15: "bg-orange-500/50 text-orange-100 border-orange-500/60 hover:bg-orange-500/65",
  16: "bg-rose-700/50 text-rose-100 border-rose-700/60 hover:bg-rose-700/65",
  20: "bg-rose-600/60 text-rose-50 border-rose-600/70 hover:bg-rose-600/75",
  25: "bg-rose-500/70 text-white border-rose-500/80 hover:bg-rose-500/85",
};

export function matrixCellStyle(score: number): string {
  return CELL_STYLES[score] ?? "bg-slate-800 text-slate-300 border-slate-700";
}

export function scoreFor(likelihood: number, impact: number): number {
  return likelihood * impact;
}

export function levelFor(score: number): RiskLevel {
  if (score >= 20) return "Critical";
  if (score >= 12) return "High";
  if (score >= 6) return "Medium";
  return "Low";
}

export const LIKELIHOOD_LABELS: Record<number, string> = {
  1: "Rare",
  2: "Unlikely",
  3: "Possible",
  4: "Likely",
  5: "Almost Certain",
};

export const IMPACT_LABELS: Record<number, string> = {
  1: "Negligible",
  2: "Minor",
  3: "Moderate",
  4: "Significant",
  5: "Critical",
};

export const STATUS_STYLES: Record<string, string> = {
  Open: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Mitigated: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Accepted: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  Closed: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  Identified: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Assessed: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  Treated: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Monitored: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

export const AI_FUNCTION_COLORS: Record<string, string> = {
  GOVERN: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  MAP: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  MEASURE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  MANAGE: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

export function levelBadge(level: string | null | undefined) {
  if (!level) return "";
  return LEVEL_STYLES[level as RiskLevel] ?? "";
}

export function statusBadge(status: string) {
  return STATUS_STYLES[status] ?? "bg-slate-600/20 text-slate-300 border-slate-600/40";
}

export function aiFunctionBadge(code: string | null | undefined) {
  if (!code) return "";
  return AI_FUNCTION_COLORS[code] ?? "";
}