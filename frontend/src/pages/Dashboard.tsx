import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "@/api/client";
import type { DashboardSummary } from "@/api/types";
import RiskHeatMap from "@/components/RiskHeatMap";
import { LevelBadge, Spinner, StatCard, StatusBadge } from "@/components/ui";

const LEVEL_COLORS: Record<string, string> = {
  Low: "#34d399",
  Medium: "#fbbf24",
  High: "#fb923c",
  Critical: "#f43f5e",
};

const FUNCTION_COLORS: Record<string, string> = {
  GOVERN: "#60a5fa",
  MAP: "#34d399",
  MEASURE: "#fbbf24",
  MANAGE: "#f43f5e",
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    api.summary().then(setData).catch(console.error);
  }, []);

  if (!data) return <Spinner />;

  const levelData = Object.entries(data.by_level).map(([name, value]) => ({ name, value }));
  const statusData = Object.entries(data.by_status).map(([name, value]) => ({ name, value }));
  const functionData = Object.entries(data.ai_by_function).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Dashboard</h2>
        <p className="text-sm text-slate-500">
          NIST SP 800-53 Rev 5 &amp; NIST AI RMF 1.0 risk posture overview
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Risks" value={data.total_risks} accent="text-blue-400" />
        <StatCard label="AI Risks" value={data.total_ai_risks} accent="text-violet-400" />
        <StatCard
          label="Open High/Critical"
          value={data.open_critical_high}
          accent="text-rose-400"
          sub="Requires attention"
        />
        <StatCard label="AI Functions Covered" value={Object.keys(data.ai_by_function).length} sub="of 4" />
        <StatCard
          label="Control Families Referenced"
          value={new Set(data.recent_risks.flatMap((r) => (r.control ? [r.control.family_code] : []))).size}
          sub="linked controls"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-3 text-sm font-semibold text-slate-200">5&times;5 Risk Heat Map</h3>
          <RiskHeatMap data={data.matrix_heat} />
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="mb-3 text-sm font-semibold text-slate-200">Risks by Level</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={levelData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                    {levelData.map((entry) => (
                      <Cell key={entry.name} fill={LEVEL_COLORS[entry.name] ?? "#64748b"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                    itemStyle={{ color: "#e2e8f0" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs">
              {levelData.map((d) => (
                <span key={d.name} className="flex items-center gap-1 text-slate-400">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: LEVEL_COLORS[d.name] }} />
                  {d.name}: {d.value}
                </span>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="mb-3 text-sm font-semibold text-slate-200">AI Risks by Function</h3>
            <div className="grid grid-cols-2 gap-2">
              {functionData.length === 0 && <p className="col-span-2 text-sm text-slate-500">No AI risks recorded yet.</p>}
              {functionData.map((d) => (
                <div key={d.name} className="rounded-md border border-slate-800 bg-slate-950/50 p-3">
                  <p className="text-xs font-semibold" style={{ color: FUNCTION_COLORS[d.name] ?? "#94a3b8" }}>
                    {d.name}
                  </p>
                  <p className="text-xl font-bold text-slate-100">{d.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Recently Updated Risks</h3>
            <Link to="/register" className="text-xs font-medium text-blue-400 hover:text-blue-300">
              View all &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-2">Title</th>
                  <th className="pb-2 pl-3">Level</th>
                  <th className="pb-2 pl-3">Score</th>
                  <th className="pb-2 pl-3">Status</th>
                  <th className="pb-2 pl-3">Owner</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_risks.map((r) => (
                  <tr key={r.id} className="border-b border-slate-800/60 last:border-0">
                    <td className="py-2">
                      <p className="font-medium text-slate-200">{r.title}</p>
                      {r.control && (
                        <p className="text-xs text-slate-500">{r.control.control_id} &middot; {r.control.control_name}</p>
                      )}
                    </td>
                    <td className="py-2 pl-3"><LevelBadge level={r.risk_level} /></td>
                    <td className="py-2 pl-3 text-slate-300">{r.risk_score}</td>
                    <td className="py-2 pl-3"><StatusBadge status={r.status} /></td>
                    <td className="py-2 pl-3 text-slate-400">{r.owner ?? "—"}</td>
                  </tr>
                ))}
                {data.recent_risks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-500">
                      No risks recorded yet.{" "}
                      <Link to="/register" className="text-blue-400">Add your first risk &rarr;</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="mb-3 text-sm font-semibold text-slate-200">Risk Status</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                  {statusData.map((entry, idx) => (
                    <Cell key={entry.name} fill={["#3b82f6", "#34d399", "#a78bfa", "#64748b"][idx % 4]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}