import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, Phone, RotateCcw, Stethoscope, User } from "lucide-react";
import { toast } from "sonner";
import { GlassCard, RiskPill, SectionTitle } from "@/components/cb/glass";
import { usePatient, useStore } from "@/lib/carebridge/store";

export const Route = createFileRoute("/patient/_dash/profile")({
  head: () => ({
    meta: [
      { title: "Profile — CareBridge" },
      { name: "description", content: "Your details, care team and account controls." },
    ],
  }),
  component: PatientProfile,
});

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass-soft flex items-center gap-3 rounded-2xl px-4 py-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/20 text-primary">{icon}</span>
      <div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function PatientProfile() {
  const { patientId, patientLogout, reset } = useStore();
  const patient = usePatient(patientId);
  const navigate = useNavigate();
  if (!patient) return null;

  return (
    <div className="space-y-5">
      <SectionTitle sub="Your details and account controls.">Profile</SectionTitle>

      <GlassCard>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-3xl bg-primary/20 text-2xl font-bold text-primary">
              {patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </span>
            <div>
              <h1 className="text-xl font-semibold">{patient.name}</h1>
              <p className="text-sm text-muted-foreground">Age {patient.age} · {patient.condition}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Drop-off risk</p>
            <div className="mt-1"><RiskPill risk={patient.risk} /></div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Row icon={<User className="h-4 w-4" />} label="Patient ID" value={patient.id} />
          <Row icon={<Phone className="h-4 w-4" />} label="Mobile" value={patient.phone} />
          <Row icon={<Stethoscope className="h-4 w-4" />} label="Condition" value={patient.condition} />
          <Row icon={<User className="h-4 w-4" />} label="Care coordinator" value={patient.coordinator} />
        </div>
      </GlassCard>

      <GlassCard className="flex flex-wrap items-center gap-3">
        <button
          data-testid="patient-profile-signout"
          onClick={() => {
            patientLogout();
            void navigate({ to: "/patient/login" });
          }}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
        <button
          data-testid="patient-reset-demo"
          onClick={() => {
            reset();
            toast.success("Demo data reset.");
            void navigate({ to: "/patient/login" });
          }}
          className="glass-soft flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium hover:bg-glass-strong"
        >
          <RotateCcw className="h-4 w-4" /> Reset demo data
        </button>
      </GlassCard>
    </div>
  );
}
