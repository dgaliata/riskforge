import { NavLink, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import RiskRegister from "./pages/RiskRegister";
import RiskMatrix from "./pages/RiskMatrix";
import ControlsBrowser from "./pages/ControlsBrowser";
import AIRiskRegister from "./pages/AIRiskRegister";
import Reports from "./pages/Reports";
import { Logo } from "./components/ui";

const NAV = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/register", label: "Risk Register" },
  { to: "/matrix", label: "Risk Matrix" },
  { to: "/controls", label: "NIST Controls" },
  { to: "/ai-risks", label: "AI Risks" },
  { to: "/reports", label: "Reports" },
];

function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <div>
              <h1 className="text-sm font-semibold text-slate-100">RiskForge</h1>
              <p className="text-[11px] text-slate-500">NIST SP 800-53 &middot; AI RMF 1.0</p>
            </div>
          </div>
        </div>
      </header>
      <nav className="border-b border-slate-800 bg-slate-900/70">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-b-2 border-blue-500 text-blue-400"
                    : "border-b-2 border-transparent text-slate-400 hover:text-slate-200"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<RiskRegister />} />
          <Route path="/matrix" element={<RiskMatrix />} />
          <Route path="/controls" element={<ControlsBrowser />} />
          <Route path="/ai-risks" element={<AIRiskRegister />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return <Layout />;
}