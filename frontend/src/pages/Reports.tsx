import { useEffect, useMemo, useState } from "react";
import { api } from "@/api/client";
import type { AIMFunction, AIRisk, DashboardSummary, FamilyInfo, NISTControl, OwaspLLMCategory, Risk } from "@/api/types";
import { Spinner, StatCard } from "@/components/ui";
import { levelBadge } from "@/lib/risk";

export default function Reports() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [aiRisks, setAIRisks] = useState<AIRisk[]>([]);
  const [framework, setFramework] = useState<AIMFunction[]>([]);
  const [owaspCategories, setOwaspCategories] = useState<OwaspLLMCategory[]>([]);
  const [controls, setControls] = useState<NISTControl[]>([]);
  const [families, setFamilies] = useState<FamilyInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.summary(),
      api.listRisks(),
      api.listAIRisks(),
      api.getAIFramework(),
      api.getOwaspCategories(),
      api.listControls(),
      api.listFamilies(),
    ])
      .then(([s, r, ar, f, ow, c, fam]) => {
        setSummary(s);
        setRisks(r);
        setAIRisks(ar);
        setFramework(f);
        setOwaspCategories(ow);
        setControls(c);
        setFamilies(fam);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const aiCoverage = useMemo(() => {
    return framework.map((fn) => {
      const totalSubs = fn.categories?.reduce((acc, cat) => acc + (cat.subcategories?.length ?? 0), 0) ?? 0;
      const subIds = new Set(
        (fn.categories ?? []).flatMap((cat) => (cat.subcategories ?? []).map((sub) => sub.id))
      );
      const covered = aiRisks.filter((r) => r.subcategory_id && subIds.has(r.subcategory_id)).length;
      return {
        code: fn.code,
        categories: fn.categories?.length ?? 0,
        subcategories: totalSubs,
        risks: covered,
      };
    });
  }, [framework, aiRisks]);

  const controlsWithRisks = useMemo(() => {
    const ids = new Set(risks.map((r) => r.control_id).filter(Boolean));
    return controls.filter((c) => ids.has(c.id)).length;
  }, [controls, risks]);

  const owaspCoverage = useMemo(() => {
    return owaspCategories.map((cat) => {
      const covered = aiRisks.filter((r) => r.owasp_llm_id === cat.id).length;
      return { ...cat, risks: covered };
    });
  }, [owaspCategories, aiRisks]);

  const totalCategoriesUsed = useMemo(() => {
    const subIds = new Set(risks.filter((r) => r.control_id).map((r) => r.control?.family_code).filter(Boolean));
    return subIds.size;
  }, [risks]);

  if (loading || !summary) return <Spinner />;

  const download = (riskType: "standard" | "ai") => {
    window.open(api.exportRisks(riskType), "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Reports &amp; Exports</h2>
        <p className="text-sm text-slate-500">Posture summary, framework coverage, and CSV export for audits.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Risks" value={summary.total_risks} accent="text-blue-400" />
        <StatCard label="AI Risks" value={summary.total_ai_risks} accent="text-violet-400" />
        <StatCard
          label="Controls Referenced"
          value={controlsWithRisks}
          sub={`of ${controls.length} in catalog (${families.length} families)`}
        />
        <StatCard label="Open High/Critical" value={summary.open_critical_high} accent="text-rose-400" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-3 text-sm font-semibold text-slate-200">NIST AI RMF Coverage</h3>
          <div className="space-y-2">
            {aiCoverage.map((fn) => {
              const pct = fn.subcategories ? (fn.risks / fn.subcategories) * 100 : 0;
              return (
                <div key={fn.code}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">
                      {fn.code} <span className="font-normal text-slate-500">({fn.categories} categories, {fn.subcategories} subcategories)</span>
                    </span>
                    <span className="text-slate-500">{fn.risks} risk(s)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {aiRisks.length === 0 && (
              <p className="text-sm text-slate-500">No AI risks recorded yet. Add risks from the AI Risks page to populate coverage.</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="mb-3 text-sm font-semibold text-slate-200">Risk Level Distribution</h3>
          <div className="space-y-2">
            {(["Critical", "High", "Medium", "Low"] as const).map((level) => {
              const count = summary.by_level[level] ?? 0;
              const total = summary.total_risks || 1;
              return (
                <div key={level}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-300">{level}</span>
                    <span className="text-slate-500">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className={`h-2 rounded-full ${levelBadge(level).split(" ")[0]}`}
                      style={{ width: `${(count / total) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-3 text-sm font-semibold text-slate-200">OWASP GenAI LLM Top 10 2026 Coverage</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {owaspCoverage.map((cat) => (
            <div
              key={cat.code}
              className={`rounded-md border p-3 ${
                cat.risks > 0 ? "border-purple-500/30 bg-purple-500/5" : "border-slate-800 bg-slate-950/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-purple-300">{cat.code}</span>
                <span className="text-xs text-slate-500">{cat.risks} risk{cat.risks === 1 ? "" : "s"}</span>
              </div>
              <p className="mt-1 truncate text-sm font-medium text-slate-200" title={cat.name}>{cat.name}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Maps AI risks tagged with the <span className="text-purple-300">OWASP 2026</span> taxonomy. Switch an AI risk to a
          category such as LLM01 Prompt Injection by selecting "OWASP LLM Top 10 2026" as its taxonomy.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-3 text-sm font-semibold text-slate-200">Export Risk Register</h3>
          <p className="mb-4 text-sm text-slate-500">
            Download the full register as CSV, including likelihood, impact, score, level, owner, and linked NIST control.
          </p>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={() => download("standard")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export Risks (.csv)
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="mb-3 text-sm font-semibold text-slate-200">Export AI Risk Register</h3>
          <p className="mb-4 text-sm text-slate-500">
            Download AI risks as CSV, including AI RMF function, subcategory, trustworthy characteristic, and risk response.
          </p>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={() => download("ai")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export AI Risks (.csv)
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-3 text-sm font-semibold text-slate-200">Control Family Coverage</h3>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5">
          {families.map((fam) => {
            const linked = risks.filter((r) => r.control?.family_code === fam.family_code).length;
            return (
              <div key={fam.family_code} className="rounded-md border border-slate-800 bg-slate-950/50 p-3">
                <p className="font-mono text-sm font-bold text-slate-200">{fam.family_code}</p>
                <p className="truncate text-xs text-slate-500" title={fam.family_name}>{fam.family_name}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {linked} linked risk{linked === 1 ? "" : "s"} / {fam.control_count} controls
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}