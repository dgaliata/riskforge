import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/api/client";
import type { NISTControl, Risk, RiskPayload } from "@/api/types";
import RiskFormModal from "@/components/RiskFormModal";
import { LevelBadge, Spinner, StatusBadge } from "@/components/ui";

const STATUS_OPTIONS = ["", "Open", "Mitigated", "Accepted", "Closed"];
const LEVEL_OPTIONS = ["", "Low", "Medium", "High", "Critical"];

export default function RiskRegister() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [controls, setControls] = useState<NISTControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [control, setControl] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Risk | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      if (level) params.level = level;
      if (category) params.category = category;
      if (search) params.search = search;
      if (control) params.control = control;
      const [riskList, controlList] = await Promise.all([api.listRisks(params), api.listControls()]);
      setRisks(riskList);
      setControls(controlList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [status, level, category, search, control]);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(() => {
    return Array.from(new Set(risks.map((r) => r.category).filter(Boolean))) as string[];
  }, [risks]);

  const handleSave = async (payload: RiskPayload) => {
    if (editing) {
      await api.updateRisk(editing.id, payload);
    } else {
      await api.createRisk(payload);
    }
    setEditing(null);
    await load();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete risk "${title}"?`)) return;
    await api.deleteRisk(id);
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Risk Register</h2>
          <p className="text-sm text-slate-500">NIST SP 800-53 &middot; {risks.length} risks</p>
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
          Add Risk
        </button>
      </div>

      <div className="card grid grid-cols-2 gap-3 md:grid-cols-5">
        <input className="input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          className="input"
          placeholder="Filter by control (e.g. AC-2)"
          value={control}
          onChange={(e) => setControl(e.target.value)}
        />
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">L&times;I</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">NIST Control</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((r) => (
                <tr key={r.id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-200">{r.title}</p>
                    <p className="max-w-[260px] truncate text-xs text-slate-500">{r.description}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{r.category ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-300">{r.likelihood} &times; {r.impact}</td>
                  <td className="px-4 py-3 font-semibold text-slate-100">{r.risk_score}</td>
                  <td className="px-4 py-3"><LevelBadge level={r.risk_level} /></td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    {r.control ? (
                      <span className="rounded border border-slate-700 bg-slate-800/60 px-1.5 py-0.5 font-mono text-xs text-slate-300">
                        {r.control.control_id}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{r.owner ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        className="btn btn-secondary px-2 py-1 text-xs"
                        onClick={() => {
                          setEditing(r);
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger px-2 py-1 text-xs"
                        onClick={() => handleDelete(r.id, r.title)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {risks.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    No risks match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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