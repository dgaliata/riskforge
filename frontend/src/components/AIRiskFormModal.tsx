import { useEffect, useMemo, useState } from "react";
import type { AIMFunction, AIRisk, AIRiskPayload, AITaxonomy, AITaxonomyMeta, OwaspLLMCategory } from "@/api/types";
import { Modal } from "@/components/ui";
import { IMPACT_LABELS, LIKELIHOOD_LABELS, levelFor, scoreFor } from "@/lib/risk";

const STATUS_OPTIONS = ["Identified", "Assessed", "Treated", "Monitored"];

export default function AIRiskFormModal({
  open,
  onClose,
  onSave,
  risk,
  framework,
  taxonomy,
  owaspCategories,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: AIRiskPayload) => Promise<void>;
  risk: AIRisk | null;
  framework: AIMFunction[];
  taxonomy: AITaxonomyMeta | null;
  owaspCategories: OwaspLLMCategory[];
}) {
  const [form, setForm] = useState<AIRiskPayload>({
    title: "",
    description: "",
    status: "Identified",
    ai_system_name: "",
    taxonomy: "ai_rmf",
    function_code: "GOVERN",
    subcategory_id: null,
    owasp_llm_id: null,
    trust_characteristic: "",
    gai_risk_category: "",
    likelihood: 3,
    impact: 3,
    risk_response: "Mitigate",
    residual_risk: null,
    owner: "",
    review_date: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const subcategories = useMemo(() => {
    const fn = framework.find((f) => f.code === form.function_code);
    return fn?.categories ?? [];
  }, [framework, form.function_code]);

  useEffect(() => {
    if (open) {
      setForm(
        risk
          ? {
              title: risk.title,
              description: risk.description ?? "",
              status: risk.status,
              ai_system_name: risk.ai_system_name ?? "",
              taxonomy: risk.taxonomy ?? "ai_rmf",
              function_code: risk.function_code ?? "GOVERN",
              subcategory_id: risk.subcategory_id ?? null,
              owasp_llm_id: risk.owasp_llm_id ?? null,
              trust_characteristic: risk.trust_characteristic ?? "",
              gai_risk_category: risk.gai_risk_category ?? "",
              likelihood: risk.likelihood,
              impact: risk.impact,
              risk_response: risk.risk_response ?? "Mitigate",
              residual_risk: risk.residual_risk ?? null,
              owner: risk.owner ?? "",
              review_date: risk.review_date ?? new Date().toISOString().slice(0, 10),
              notes: risk.notes ?? "",
            }
          : {
              title: "",
              description: "",
              status: "Identified",
              ai_system_name: "",
              taxonomy: "ai_rmf",
              function_code: "GOVERN",
              subcategory_id: null,
              owasp_llm_id: null,
              trust_characteristic: "",
              gai_risk_category: "",
              likelihood: 3,
              impact: 3,
              risk_response: "Mitigate",
              residual_risk: null,
              owner: "",
              review_date: new Date().toISOString().slice(0, 10),
              notes: "",
            }
      );
    }
  }, [open, risk]);

  const setTaxonomy = (taxonomy: AIRiskPayload["taxonomy"]) => {
    setForm((prev) => ({
      ...prev,
      taxonomy,
      function_code: taxonomy === "ai_rmf" ? prev.function_code ?? "GOVERN" : null,
      subcategory_id: taxonomy === "ai_rmf" ? prev.subcategory_id : null,
      owasp_llm_id: taxonomy === "owasp" ? prev.owasp_llm_id : null,
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const score = scoreFor(form.likelihood, form.impact);

  return (
    <Modal open={open} onClose={onClose} title={risk ? "Edit AI Risk" : "New AI Risk"} wide>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Title</label>
            <input className="input w-full" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">AI System</label>
            <input
              className="input w-full"
              value={form.ai_system_name ?? ""}
              placeholder="e.g. Customer support chatbot"
              onChange={(e) => setForm({ ...form, ai_system_name: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input w-full" rows={2} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div>
          <label className="label">Taxonomy</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTaxonomy("ai_rmf")}
              className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                form.taxonomy === "ai_rmf"
                  ? "border-blue-500 bg-blue-500/10 text-blue-300"
                  : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="font-semibold">NIST AI RMF 1.0</div>
              <div className="text-xs opacity-70">Function &amp; subcategory mapping</div>
            </button>
            <button
              type="button"
              onClick={() => setTaxonomy("owasp")}
              className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                form.taxonomy === "owasp"
                  ? "border-blue-500 bg-blue-500/10 text-blue-300"
                  : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="font-semibold">OWASP LLM Top 10 2026</div>
              <div className="text-xs opacity-70">GenAI-specific categories LLM01&ndash;LLM10</div>
            </button>
          </div>
        </div>

        {form.taxonomy === "ai_rmf" ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">AI RMF Function</label>
              <select className="input w-full" value={form.function_code ?? ""} onChange={(e) => setForm({ ...form, function_code: e.target.value, subcategory_id: null })}>
                {framework.map((f) => (
                  <option key={f.code} value={f.code}>{f.code}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Subcategory</label>
              <select className="input w-full" value={form.subcategory_id ?? ""} onChange={(e) => setForm({ ...form, subcategory_id: e.target.value || null })}>
                <option value="">-- Select {form.function_code} subcategory --</option>
                {subcategories.map((cat) => (
                  <optgroup key={cat.id} label={cat.code}>
                    {(cat.subcategories ?? []).map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div>
            <label className="label">OWASP GenAI LLM Category</label>
            <select
              className="input w-full"
              value={form.owasp_llm_id ?? ""}
              onChange={(e) => setForm({ ...form, owasp_llm_id: e.target.value || null })}
            >
              <option value="">-- Select LLM category --</option>
              {owaspCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.code} - {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Trustworthy Characteristic</label>
            <select className="input w-full" value={form.trust_characteristic ?? ""} onChange={(e) => setForm({ ...form, trust_characteristic: e.target.value })}>
              <option value="">-- None --</option>
              {(taxonomy?.trust_characteristics ?? []).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">GenAI Risk Category (optional)</label>
            <select className="input w-full" value={form.gai_risk_category ?? ""} onChange={(e) => setForm({ ...form, gai_risk_category: e.target.value })}>
              <option value="">-- Not generative AI --</option>
              {(taxonomy?.gai_risk_categories ?? []).map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Status</label>
            <select className="input w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AIRiskPayload["status"] })}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Risk Response</label>
            <select className="input w-full" value={form.risk_response ?? ""} onChange={(e) => setForm({ ...form, risk_response: e.target.value })}>
              {(taxonomy?.risk_responses ?? ["Mitigate", "Transfer", "Avoid", "Accept"]).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Likelihood</label>
            <select className="input w-full" value={form.likelihood} onChange={(e) => setForm({ ...form, likelihood: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} - {LIKELIHOOD_LABELS[n]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Impact</label>
            <select className="input w-full" value={form.impact} onChange={(e) => setForm({ ...form, impact: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} - {IMPACT_LABELS[n]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm">
          Score: <span className="font-bold text-slate-100">{score}</span> &rarr;{" "}
          <span className={`font-bold ${score >= 12 ? "text-rose-400" : score >= 6 ? "text-amber-400" : "text-emerald-400"}`}>
            {levelFor(score)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Owner</label>
            <input className="input w-full" value={form.owner ?? ""} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
          </div>
          <div>
            <label className="label">Review Date</label>
            <input type="date" className="input w-full" value={form.review_date ?? ""} onChange={(e) => setForm({ ...form, review_date: e.target.value })} />
          </div>
          <div>
            <label className="label">Residual Risk</label>
            <input type="number" min="0" max="25" className="input w-full" value={form.residual_risk ?? ""} onChange={(e) => setForm({ ...form, residual_risk: e.target.value ? Number(e.target.value) : null })} />
          </div>
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea className="input w-full" rows={2} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : risk ? "Save Changes" : "Create AI Risk"}
          </button>
        </div>
      </form>
    </Modal>
  );
}