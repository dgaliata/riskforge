import type { ReactNode } from "react";
import { levelBadge, statusBadge, aiFunctionBadge } from "@/lib/risk";

export function Badge({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

export function LevelBadge({ level }: { level: string | null | undefined }) {
  if (!level) return null;
  return <Badge className={levelBadge(level)}>{level}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge className={statusBadge(status)}>{status}</Badge>;
}

export function AIFunctionBadge({ code }: { code: string | null | undefined }) {
  if (!code) return null;
  return <Badge className={aiFunctionBadge(code)}>{code}</Badge>;
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="RiskForge logo">
      <defs>
        <linearGradient id="logo-tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f172a" />
          <stop offset="1" stopColor="#1e1b4b" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logo-tile)" />
      <rect x="5" y="12.5" width="5.1" height="7" rx="1.8" fill="#34d399" />
      <rect x="10.6" y="12.5" width="5.1" height="7" rx="1.8" fill="#fbbf24" />
      <rect x="16.2" y="12.5" width="5.1" height="7" rx="1.8" fill="#fb923c" />
      <rect x="21.8" y="12.5" width="5.1" height="7" rx="1.8" fill="#f43f5e" />
    </svg>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">
      <div
        className={`mt-8 w-full ${wide ? "max-w-3xl" : "max-w-xl"} rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-xl`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  accent,
  sub,
}: {
  label: string;
  value: ReactNode;
  accent?: string;
  sub?: string;
}) {
  return (
    <div className="card">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent ?? "text-slate-100"}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
    </div>
  );
}