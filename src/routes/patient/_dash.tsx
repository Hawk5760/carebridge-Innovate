import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  CalendarCheck,
  FlaskConical,
  Gauge,
  Home,
  LogOut,
  MessageCircle,
  Pill,
  Route as RouteIcon,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { Blobs } from "@/components/cb/glass";
import { usePatient, useStore } from "@/lib/carebridge/store";

export const Route = createFileRoute("/patient/_dash")({
  component: PatientShell,
});

const NAV = [
  { to: "/patient/home", label: "Home", icon: Home },
  { to: "/patient/medicines", label: "Medicines", icon: Pill },
  { to: "/patient/appointments", label: "Appointments", icon: CalendarCheck },
  { to: "/patient/tests", label: "Tests", icon: FlaskConical },
  { to: "/patient/cost", label: "Cost Insights", icon: Wallet },
  { to: "/patient/recovery", label: "Recovery", icon: RouteIcon },
  { to: "/patient/care-score", label: "Care Score", icon: Gauge },
  { to: "/patient/messages", label: "Messages", icon: MessageCircle },
  { to: "/patient/family", label: "Family", icon: Users },
  { to: "/patient/profile", label: "Profile", icon: User },
] as const;

function PatientShell() {
  const { patientId, patientLogout, hydrated } = useStore();
  const patient = usePatient(patientId);
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && !patientId) void navigate({ to: "/patient/login" });
  }, [hydrated, patientId, navigate]);

  if (!hydrated || !patient) return null;

  return (
    <div className="relative min-h-screen">
      <Blobs />
      <div className="relative mx-auto flex max-w-[1200px] gap-5 p-4 lg:p-6">
        <aside className="glass sticky top-6 hidden h-[calc(100vh-3rem)] w-60 shrink-0 flex-col rounded-3xl p-4 lg:flex">
          <Link to="/" className="mb-6 flex items-center gap-2 px-2">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/25 text-sm font-bold text-primary">
              CB
            </span>
            <span className="text-sm font-semibold">CareBridge</span>
          </Link>
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                data-testid={`patient-nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
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
            data-testid="patient-signout-btn"
            onClick={() => {
              patientLogout();
              void navigate({ to: "/patient/login" });
            }}
            className="mt-3 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-glass-strong"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </aside>

        <main className="min-w-0 flex-1 space-y-5">
          <header className="glass flex flex-wrap items-center justify-between gap-3 rounded-3xl px-5 py-3">
            <div>
              <p className="text-sm font-semibold" data-testid="patient-header-name">{patient.name}</p>
              <p className="text-xs text-muted-foreground">{patient.condition}</p>
            </div>
            <span className="rounded-full bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary">
              Care score {patient.careScore}
            </span>
          </header>

          <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {NAV.map((n) => (
              <Link
                key={n.to}
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
