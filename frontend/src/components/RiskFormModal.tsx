import { useEffect, useState } from "react";
import type { NISTControl, Risk, RiskPayload } from "@/api/types";
import { Modal } from "@/components/ui";
import { IMPACT_LABELS, LIKELIHOOD_LABELS, levelFor, scoreFor } from "@/lib/risk";

function LikelihoodImpactRow({
  value,
  kind,
  onChange,
}: {
  value: number;
  kind: "likelihood" | "impact";
  onChange: (n: number) => void;
}) {
  const labels = kind === "likelihood" ? LIKELIHOOD_LABELS : IMPACT_LABELS;
  const id = `risk-${kind}`;
  return (
    <div>
      <label className="label" htmlFor={id}>{kind === "likelihood" ? "Likelihood" : "Impact"}</label>
      <select id={id} className="input w-full" value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n} - {labels[n]}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function RiskFormModal({
  open,
  onClose,
  onSave,
  risk,
  controls,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: RiskPayload) => Promise<void>;
  risk: Risk | null;
  controls: NISTControl[];
}) {
  const [form, setForm] = useState<RiskPayload>({
    title: "",
    description: "",
    status: "Open",
    category: "",
    likelihood: 3,
    impact: 3,
    owner: "",
    identified_date: new Date().toISOString().slice(0, 10),
    target_mitigation_date: "",
    mitigation_notes: "",
    control_id: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        risk
          ? {
              title: risk.title,
              description: risk.description ?? "",
              status: risk.status,
              category: risk.category ?? "",
              likelihood: risk.likelihood,
              impact: risk.impact,
              owner: risk.owner ?? "",
              identified_date: risk.identified_date ?? new Date().toISOString().slice(0, 10),
              target_mitigation_date: risk.target_mitigation_date ?? "",
              mitigation_notes: risk.mitigation_notes ?? "",
              control_id: risk.control_id ?? null,
            }
          : {
              title: "",
              description: "",
              status: "Open",
              category: "",
              likelihood: 3,
              impact: 3,
              owner: "",
              identified_date: new Date().toISOString().slice(0, 10),
              target_mitigation_date: "",
              mitigation_notes: "",
              control_id: null,
            }
      );
    }
  }, [open, risk]);

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
    <Modal open={open} onClose={onClose} title={risk ? "Edit Risk" : "New Risk"} wide>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="risk-title">Title</label>
          <input
            id="risk-title"
            className="input w-full"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="risk-description">Description</label>
          <textarea
            id="risk-description"
            className="input w-full"
            rows={3}
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="risk-status">Status</label>
            <select
              id="risk-status"
              className="input w-full"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as RiskPayload["status"] })}
            >
              <option>Open</option>
              <option>Mitigated</option>
              <option>Accepted</option>
              <option>Closed</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="risk-category">Category</label>
            <input
              id="risk-category"
              className="input w-full"
              value={form.category ?? ""}
              placeholder="e.g. External, Technical, Compliance"
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <LikelihoodImpactRow value={form.likelihood} kind="likelihood" onChange={(n) => setForm({ ...form, likelihood: n })} />
          <LikelihoodImpactRow value={form.impact} kind="impact" onChange={(n) => setForm({ ...form, impact: n })} />
        </div>
        <div className="rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm">
          Score: <span className="font-bold text-slate-100">{score}</span> &rarr;{" "}
          <span className={`font-bold ${score >= 12 ? "text-rose-400" : score >= 6 ? "text-amber-400" : "text-emerald-400"}`}>
            {levelFor(score)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="risk-owner">Owner</label>
            <input id="risk-owner" className="input w-full" value={form.owner ?? ""} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="risk-control">NIST 800-53 Control</label>
            <select
              id="risk-control"
              className="input w-full"
              value={form.control_id ?? ""}
              onChange={(e) => setForm({ ...form, control_id: e.target.value || null })}
            >
              <option value="">-- None --</option>
              {controls.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.control_id} - {c.control_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="risk-identified-date">Identified Date</label>
            <input
              id="risk-identified-date"
              type="date"
              className="input w-full"
              value={form.identified_date ?? ""}
              onChange={(e) => setForm({ ...form, identified_date: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="risk-target-mitigation-date">Target Mitigation Date</label>
            <input
              id="risk-target-mitigation-date"
              type="date"
              className="input w-full"
              value={form.target_mitigation_date ?? ""}
              onChange={(e) => setForm({ ...form, target_mitigation_date: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="risk-mitigation-notes">Mitigation Notes</label>
          <textarea
            id="risk-mitigation-notes"
            className="input w-full"
            rows={3}
            value={form.mitigation_notes ?? ""}
            onChange={(e) => setForm({ ...form, mitigation_notes: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : risk ? "Save Changes" : "Create Risk"}
          </button>
        </div>
      </form>
    </Modal>
  );
}