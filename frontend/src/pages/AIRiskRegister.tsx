import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/api/client";
import type { AIMFunction, AIRisk, AIRiskPayload, AITaxonomyMeta, OwaspLLMCategory } from "@/api/types";
import AIRiskFormModal from "@/components/AIRiskFormModal";
import { AIFunctionBadge, Badge, LevelBadge, Spinner, StatusBadge } from "@/components/ui";

const STATUS_OPTIONS = ["", "Identified", "Assessed", "Treated", "Monitored"];
const LEVEL_OPTIONS = ["", "Low", "Medium", "High", "Critical"];
const TAXONOMY_OPTIONS = [
  { value: "", label: "All taxonomies" },
  { value: "ai_rmf", label: "NIST AI RMF 1.0" },
  { value: "owasp", label: "OWASP LLM Top 10 2026" },
];

export default function AIRiskRegister() {
  const [risks, setRisks] = useState<AIRisk[]>([]);
  const [framework, setFramework] = useState<AIMFunction[]>([]);
  const [taxonomyMeta, setTaxonomyMeta] = useState<AITaxonomyMeta | null>(null);
  const [owaspCategories, setOwaspCategories] = useState<OwaspLLMCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [functionFilter, setFunctionFilter] = useState("");
  const [taxonomyFilter, setTaxonomyFilter] = useState("");
  const [owaspFilter, setOwaspFilter] = useState("");
  const [level, setLevel] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AIRisk | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      if (functionFilter) params.function = functionFilter;
      if (taxonomyFilter) params.taxonomy = taxonomyFilter;
      if (owaspFilter) params.owasp = owaspFilter;
      if (level) params.level = level;
      if (search) params.search = search;
      const [riskList, frameworkData, taxonomyData, owaspData] = await Promise.all([
        api.listAIRisks(params),
        api.getAIFramework(),
        api.getAITaxonomy(),
        api.getOwaspCategories(),
      ]);
      setRisks(riskList);
      setFramework(frameworkData);
      setTaxonomyMeta(taxonomyData);
      setOwaspCategories(owaspData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [status, functionFilter, taxonomyFilter, owaspFilter, level, search]);

  useEffect(() => {
    load();
  }, [load]);

  const subLabel = useMemo(() => {
    const map = new Map<string, { sub: string; cat: string }>();
    framework.forEach((fn) =>
      fn.categories?.forEach((cat) =>
        cat.subcategories?.forEach((sub) => map.set(sub.id, { sub: sub.code, cat: cat.code }))
      )
    );
    return map;
  }, [framework]);

  const handleSave = async (payload: AIRiskPayload) => {
    if (editing) {
      await api.updateAIRisk(editing.id, payload);
    } else {
      await api.createAIRisk(payload);
    }
    setEditing(null);
    await load();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete AI risk "${title}"?`)) return;
    await api.deleteAIRisk(id);
    await load();
  };

  const subLabelFor = (risk: AIRisk) => {
    const info = risk.subcategory_id ? subLabel.get(risk.subcategory_id) : null;
    return info ? `${info.cat} / ${info.sub}` : null;
  };

  const mappingFor = (risk: AIRisk) => {
    if (risk.taxonomy === "owasp") {
      return risk.owasp_category ? `${risk.owasp_category.code} · ${risk.owasp_category.name}` : "-";
    }
    return subLabelFor(risk) ?? "-";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">AI Risk Register</h2>
          <p className="text-sm text-slate-500">NIST AI RMF 1.0 &middot; OWASP LLM Top 10 2026 &middot; {risks.length} AI risks</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add AI Risk
        </button>
      </div>

      <div className="card grid grid-cols-2 gap-3 md:grid-cols-6">
        <input className="input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" value={taxonomyFilter} onChange={(e) => { setTaxonomyFilter(e.target.value); setOwaspFilter(""); }}>
          {TAXONOMY_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        {taxonomyFilter === "owasp" ? (
          <select className="input" value={owaspFilter} onChange={(e) => setOwaspFilter(e.target.value)}>
            <option value="">All LLM categories</option>
            {owaspCategories.map((c) => (
              <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
            ))}
          </select>
        ) : (
          <select className="input" value={functionFilter} onChange={(e) => setFunctionFilter(e.target.value)}>
            <option value="">All functions</option>
            {framework.map((f) => (
              <option key={f.code} value={f.code}>{f.code}</option>
            ))}
          </select>
        )}
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === "" ? "All statuses" : s}</option>
          ))}
        </select>
        <select className="input" value={level} onChange={(e) => setLevel(e.target.value)}>
          {LEVEL_OPTIONS.map((l) => (
            <option key={l} value={l}>{l === "" ? "All levels" : l}</option>
          ))}
        </select>
        <div />
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Risk / System</th>
                <th className="px-4 py-3">Taxonomy</th>
                <th className="px-4 py-3">Mapping</th>
                <th className="px-4 py-3">Characteristic</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Response</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((r) => (
                <tr key={r.id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-200">{r.title}</p>
                    <p className="text-xs text-slate-500">{r.ai_system_name ?? "-"}</p>
                  </td>
                  <td className="px-4 py-3">
                    {r.taxonomy === "owasp" ? (
                      <Badge className="border-purple-500/40 bg-purple-500/10 text-purple-300">OWASP 2026</Badge>
                    ) : (
                      <AIFunctionBadge code={r.function_code} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{mappingFor(r)}</td>
                  <td className="px-4 py-3">
                    {r.trust_characteristic && <Badge className="bg-slate-700/30 text-slate-300 border-slate-600/40">{r.trust_characteristic}</Badge>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-100">{r.risk_score}</td>
                  <td className="px-4 py-3"><LevelBadge level={r.risk_level} /></td>
                  <td className="px-4 py-3 text-slate-400">{r.risk_response ?? "-"}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="btn btn-secondary px-2 py-1 text-xs" onClick={() => { setEditing(r); setModalOpen(true); }}>
                        Edit
                      </button>
                      <button className="btn btn-danger px-2 py-1 text-xs" onClick={() => handleDelete(r.id, r.title)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {risks.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    No AI risks match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AIRiskFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        risk={editing}
        framework={framework}
        taxonomy={taxonomyMeta}
        owaspCategories={owaspCategories}
      />
    </div>
  );
}