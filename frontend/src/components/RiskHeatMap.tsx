import { IMPACT_LABELS, LIKELIHOOD_LABELS, matrixCellStyle, scoreFor } from "@/lib/risk";

export default function RiskHeatMap({
  data,
  onCellClick,
}: {
  data: Record<string, number>;
  onCellClick?: (likelihood: number, impact: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="border-separate" style={{ borderSpacing: "4px" }}>
        <thead>
          <tr>
            <th className="pr-3 text-left text-xs font-medium text-slate-500">Likelihood &darr; / Impact &rarr;</th>
            {[1, 2, 3, 4, 5].map((i) => (
              <th key={i} className="min-w-[72px] text-center text-xs font-medium text-slate-400">
                {i}
                <span className="block text-[10px] font-normal text-slate-600">{IMPACT_LABELS[i]}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[5, 4, 3, 2, 1].map((l) => (
            <tr key={l}>
              <td className="pr-3 text-right">
                <span className="text-xs font-medium text-slate-300">{l}</span>
                <span className="block text-[10px] font-normal text-slate-600">{LIKELIHOOD_LABELS[l]}</span>
              </td>
              {[1, 2, 3, 4, 5].map((i) => {
                const score = scoreFor(l, i);
                const count = data[`${l}x${i}`] ?? 0;
                return (
                  <td key={i}>
                    <button
                      onClick={() => onCellClick?.(l, i)}
                      className={`flex h-16 w-full min-w-[72px] flex-col items-center justify-center rounded-md border text-center transition-colors ${
                        count === 0 && !onCellClick ? "cursor-default opacity-70" : ""
                      } ${matrixCellStyle(score)}`}
                    >
                      <span className="text-lg font-bold leading-none">{score}</span>
                      {count > 0 && (
                        <span className="mt-1 rounded bg-black/30 px-1.5 text-[10px] font-semibold">{count}</span>
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-600/40" /> Low (1&ndash;5)</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-amber-600/40" /> Medium (6&ndash;11)</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-orange-600/50" /> High (12&ndash;19)</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-rose-600/60" /> Critical (20&ndash;25)</span>
      </div>
    </div>
  );
}