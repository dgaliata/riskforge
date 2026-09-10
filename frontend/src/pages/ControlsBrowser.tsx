import { useEffect, useMemo, useState } from "react";
import { api } from "@/api/client";
import type { FamilyInfo, NISTControl, Risk } from "@/api/types";
import { LevelBadge, Spinner, StatusBadge } from "@/components/ui";

const FAMILY_DESCRIPTIONS: Record<string, string> = {
  AC: "Access Control",
  AT: "Awareness and Training",
  AU: "Audit and Accountability",
  CA: "Assessment, Authorization, and Monitoring",
  CM: "Configuration Management",
  CP: "Contingency Planning",
  IA: "Identification and Authentication",
  IR: "Incident Response",
  MA: "Maintenance",
  MP: "Media Protection",
  PE: "Physical and Environmental Protection",
  PL: "Planning",
  PM: "Program Management",
  PS: "Personnel Security",
  PT: "PII Processing and Transparency",
  RA: "Risk Assessment",
  SA: "System and Services Acquisition",
  SC: "System and Communications Protection",
  SI: "System and Information Integrity",
  SR: "Supply Chain Risk Management",
};

export default function ControlsBrowser() {
  const [families, setFamilies] = useState<FamilyInfo[]>([]);
  const [controls, setControls] = useState<NISTControl[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<NISTControl | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.listFamilies(), api.listControls(), api.listRisks()])
      .then(([fam, ctrls, rks]) => {
        setFamilies(fam);
        setControls(ctrls);
        setRisks(rks);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = controls;
    if (selectedFamily) list = list.filter((c) => c.family_code === selectedFamily);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.control_id.toLowerCase().includes(q) ||
          c.control_name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [controls, selectedFamily, search]);

  const riskCountFor = (controlId: string) => risks.filter((r) => r.control?.control_id === controlId).length;

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">NIST SP 800-53 Controls</h2>
        <p className="text-sm text-slate-500">
          Rev 5 control catalog &mdash; 20 families. Browse controls and see which register risks map to each.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className={`btn text-xs ${!selectedFamily ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setSelectedFamily(null)}
        >
          All ({controls.length})
        </button>
        {families.map((f) => (
          <button
            key={f.family_code}
            className={`btn text-xs ${selectedFamily === f.family_code ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setSelectedFamily(f.family_code)}
            title={FAMILY_DESCRIPTIONS[f.family_code] ?? f.family_name}
          >
            {f.family_code} <span className="text-xs opacity-70">({f.control_count})</span>
          </button>
        ))}
      </div>

      <div className="card space-y-4">
        <input
          className="input w-full md:max-w-sm"
          placeholder="Search controls (ID, name, or statement)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3">ID</th>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Baseline</th>
                <th className="py-2 pr-3">Priority</th>
                <th className="py-2 pr-3">Linked Risks</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="cursor-pointer border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30"
                  onClick={() => setSelected(c)}
                >
                  <td className="py-2.5 pr-3 font-mono text-xs font-semibold text-blue-400">{c.control_id}</td>
                  <td className="py-2.5 pr-3 font-medium text-slate-200">{c.control_name}</td>
                  <td className="py-2.5 pr-3 text-xs text-slate-400">{c.baseline ?? "—"}</td>
                  <td className="py-2.5 pr-3">
                    <span className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-300">
                      {c.priority ?? "—"}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-400">
                      {riskCountFor(c.control_id)}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">No controls match filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="card">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-blue-400">{selected.control_id}</span>
              <h3 className="text-lg font-semibold text-slate-100">{selected.control_name}</h3>
            </div>
            <button className="btn btn-secondary text-xs" onClick={() => setSelected(null)}>Close</button>
          </div>
          <p className="mb-4 text-sm leading-relaxed text-slate-400">{selected.description}</p>
          <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <div>
              <p className="text-xs uppercase text-slate-500">Family</p>
              <p className="text-slate-300">{selected.family_code} &middot; {selected.family_name}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Baseline</p>
              <p className="text-slate-300">{selected.baseline ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Priority</p>
              <p className="text-slate-300">{selected.priority ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Related Controls</p>
              <p className="text-slate-300">{selected.related_controls ?? "—"}</p>
            </div>
          </div>

          {riskCountFor(selected.control_id) > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 text-sm font-semibold text-slate-200">Linked Risks</h4>
              <div className="space-y-2">
                {risks
                  .filter((r) => r.control?.control_id === selected.control_id)
                  .map((r) => (
                    <div key={r.id} className="flex items-center gap-3 rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2">
                      <p className="flex-1 text-sm text-slate-200">{r.title}</p>
                      <LevelBadge level={r.risk_level} />
                      <StatusBadge status={r.status} />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}