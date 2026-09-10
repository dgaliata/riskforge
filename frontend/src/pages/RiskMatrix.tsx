import { useEffect, useState } from "react";
import { api } from "@/api/client";
import type { NISTControl, Risk, RiskPayload } from "@/api/types";
import RiskFormModal from "@/components/RiskFormModal";
import RiskHeatMap from "@/components/RiskHeatMap";
import { LevelBadge, Spinner, StatusBadge } from "@/components/ui";
import { IMPACT_LABELS, LIKELIHOOD_LABELS, levelFor } from "@/lib/risk";

export default function RiskMatrix() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [controls, setControls] = useState<NISTControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<{ likelihood: number; impact: number } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Risk | null>(null);

  useEffect(() => {
    Promise.all([api.listRisks(), api.listControls()])
      .then(([riskList, controlList]) => {
        setRisks(riskList);
        setControls(controlList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const heat: Record<string, number> = {};
  risks.forEach((r) => {
    const key = `${r.likelihood}x${r.impact}`;
    heat[key] = (heat[key] ?? 0) + 1;
  });

  const filtered = selected
    ? risks.filter((r) => r.likelihood === selected.likelihood && r.impact === selected.impact)
    : [];

  const handleSave = async (payload: RiskPayload) => {
    if (editing) {
      await api.updateRisk(editing.id, payload);
    } else if (selected) {
      await api.createRisk({ ...payload, likelihood: selected.likelihood, impact: selected.impact });
    }
    const updated = await api.listRisks();
    setRisks(updated);
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this risk?")) return;
    await api.deleteRisk(id);
    const updated = await api.listRisks();
    setRisks(updated);
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">5&times;5 Risk Matrix</h2>
        <p className="text-sm text-slate-500">
          Click a cell to view risks at that likelihood &times; impact intersection, or add one tied to that scoring.
        </p>
      </div>

      <div className="card">
        <RiskHeatMap
          data={heat}
          onCellClick={(likelihood, impact) => setSelected({ likelihood, impact })}
        />
      </div>

      {selected && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200">
                {LIKELIHOOD_LABELS[selected.likelihood]} ({selected.likelihood}) &times;{" "}
                {IMPACT_LABELS[selected.impact]} ({selected.impact}) ={" "}
                <span className="font-bold">{selected.likelihood * selected.impact}</span>{" "}
                <span className="font-semibold text-slate-400">({levelFor(selected.likelihood * selected.impact)})</span>
              </span>
              <span className="text-sm text-slate-500">{filtered.length} risk(s)</span>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              + Add Risk at this scoring
            </button>
          </div>

          {filtered.length > 0 && (
            <div className="card overflow-x-auto p-0">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Risk</th>
                    <th className="px-4 py-3">Level</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Control</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-slate-800/60 last:border-0">
                      <td className="px-4 py-3 font-medium text-slate-200">{r.title}</td>
                      <td className="px-4 py-3"><LevelBadge level={r.risk_level} /></td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-slate-400">
                        <span className="rounded border border-slate-700 bg-slate-800/60 px-1.5 py-0.5 font-mono text-xs text-slate-300">
                          {r.control?.control_id ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button className="btn btn-secondary px-2 py-1 text-xs" onClick={() => { setEditing(r); setModalOpen(true); }}>
                            Edit
                          </button>
                          <button className="btn btn-danger px-2 py-1 text-xs" onClick={() => handleDelete(r.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <RiskFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        risk={editing}
        controls={controls}
      />
    </div>
  );
}