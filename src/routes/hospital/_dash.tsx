import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  CalendarCheck,
  ClipboardList,
  HeartHandshake,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  PackageOpen,
  Pill,
  Settings,
  ShieldAlert,
  Users,
  Wallet,
} from "lucide-react";
import { Blobs } from "@/components/cb/glass";
import { useStore } from "@/lib/carebridge/store";
import { ROLE_ACCESS } from "@/lib/carebridge/types";

export const Route = createFileRoute("/hospital/_dash")({
  component: HospitalShell,
});

const NAV = [
  { key: "overview", to: "/hospital/overview", label: "Overview", icon: LayoutDashboard },
  { key: "patients", to: "/hospital/patients", label: "Patients", icon: Users },
  { key: "high-risk", to: "/hospital/high-risk", label: "High-Risk", icon: ShieldAlert },
  { key: "follow-ups", to: "/hospital/follow-ups", label: "Follow-Ups", icon: CalendarCheck },
  { key: "medications", to: "/hospital/medications", label: "Medication", icon: Pill },
  { key: "refills", to: "/hospital/refills", label: "Refill Monitor", icon: PackageOpen },
  { key: "financial", to: "/hospital/financial", label: "Financial Risk", icon: Wallet },
  { key: "onboarding", to: "/hospital/onboarding", label: "Onboarding", icon: ClipboardList },
  { key: "escalations", to: "/hospital/escalations", label: "Escalations", icon: HeartHandshake },
  { key: "interventions", to: "/hospital/interventions", label: "Interventions", icon: Activity },
  { key: "analytics", to: "/hospital/analytics", label: "Analytics", icon: BarChart3 },
  { key: "revenue", to: "/hospital/revenue", label: "Revenue Recovery", icon: IndianRupee },
  { key: "settings", to: "/hospital/settings", label: "Settings", icon: Settings },
] as const;

function HospitalShell() {
  const { hospitalUser, hospitalLogout, patients, hydrated } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && !hospitalUser) void navigate({ to: "/hospital/login" });
  }, [hydrated, hospitalUser, navigate]);

  if (!hydrated || !hospitalUser) return null;
  const allowed = ROLE_ACCESS[hospitalUser.role];
  const critical = patients.filter((p) => p.risk >= 85).length;

  return (
    <div className="relative min-h-screen">
      <Blobs />
      <div className="relative mx-auto flex max-w-[1400px] gap-5 p-4 lg:p-6">
        <aside className="glass sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col rounded-3xl p-4 lg:flex">
          <Link to="/" className="mb-6 flex items-center gap-2 px-2">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/25 text-sm font-bold text-primary">
              CB
            </span>
            <span className="text-sm font-semibold">CareBridge AI</span>
          </Link>
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {NAV.filter((n) => allowed.includes(n.key)).map((n) => (
              <Link
                key={n.key}
                to={n.to}
                activeProps={{ className: "bg-primary text-primary-foreground" }}
                inactiveProps={{ className: "text-muted-foreground hover:bg-glass-strong" }}
                className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition"
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={() => {
              hospitalLogout();
              void navigate({ to: "/hospital/login" });
            }}
            className="mt-3 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-glass-strong"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </aside>

        <main className="min-w-0 flex-1 space-y-5">
          <header className="glass flex flex-wrap items-center justify-between gap-3 rounded-3xl px-5 py-3">
            <div>
              <p className="text-sm font-semibold">{hospitalUser.name}</p>
              <p className="text-xs text-muted-foreground">
                {hospitalUser.role} · {hospitalUser.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/hospital/interventions"
                className="glass-soft flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium"
              >
                <Bell className="h-4 w-4 text-primary" /> {critical} critical alerts
              </Link>
            </div>
          </header>

          <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {NAV.filter((n) => allowed.includes(n.key)).map((n) => (
              <Link
                key={n.key}
                to={n.to}
                activeProps={{ className: "bg-primary text-primary-foreground" }}
                inactiveProps={{ className: "glass-soft text-muted-foreground" }}
                className="whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium"
              >
                {n.label}
              </Link>
            ))}
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
