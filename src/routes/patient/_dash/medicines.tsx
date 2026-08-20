import { createFileRoute } from "@tanstack/react-router";
import { Check, Clock, Pill, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { GlassCard, SectionTitle } from "@/components/cb/glass";
import { recompute, usePatient, useStore } from "@/lib/carebridge/store";
import { refillState, REFILL_LABEL, refillCompliance, type RefillStatus } from "@/lib/carebridge/metrics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/patient/_dash/medicines")({
  head: () => ({
    meta: [
      { title: "Medicines & Refills — CareBridge" },
      { name: "description", content: "Track doses, remaining supply and request refills in one tap." },
    ],
  }),
  component: PatientMedicines,
});

const STATUS_STYLE: Record<RefillStatus, string> = {
  active: "bg-success/20 text-success",
  "due-soon": "bg-warning/25 text-warning",
  overdue: "bg-destructive/15 text-destructive",
};

function PatientMedicines() {
  const { patientId, update } = useStore();
  const patient = usePatient(patientId);
  if (!patient) return null;

  const markTaken = (id: string) => {
    update(patient.id, (p) =>
      recompute({
        ...p,
        medicines: p.medicines.map((m) =>
          m.id === id
            ? {
                ...m,
                taken: true,
                takenAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
                quantity: Math.max(0, m.quantity - 1),
              }
            : m,
        ),
      }),
    );
    toast.success("Recorded. Great job staying on track!");
  };

  const requestRefill = (id: string) => {
    update(patient.id, (p) =>
      recompute({
        ...p,
        medicines: p.medicines.map((m) =>
          m.id === id
            ? { ...m, refillRequested: true, quantity: m.perDay * 30, refillsLeft: Math.max(0, m.refillsLeft - 1) }
            : m,
        ),
      }),
    );
    toast.success("Refill requested — a 30-day supply is on the way.");
  };

  const taken = patient.medicines.filter((m) => m.taken).length;
  const compliance = refillCompliance(patient);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Taken today</p>
          <p className="mt-1 text-2xl font-semibold">{taken}/{patient.medicines.length}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Refill compliance</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{compliance}%</p>
        </GlassCard>
        <GlassCard>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Needs refill soon</p>
          <p className="mt-1 text-2xl font-semibold">
            {patient.medicines.filter((m) => refillState(m).status !== "active").length}
          </p>
        </GlassCard>
      </div>

      <SectionTitle sub="Track each medicine, remaining supply and refills.">Medicines &amp; refills</SectionTitle>

      <div className="space-y-4">
        {patient.medicines.map((m) => {
          const { daysLeft, status } = refillState(m);
          const trend = m.adherenceTrend;
          const maxT = Math.max(100, ...trend);
          return (
            <GlassCard key={m.id} data-testid={`patient-medicine-${m.id}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/20 text-primary">
                    <Pill className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-base font-semibold">{m.name}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {m.dose} · {m.time} · {m.perDay}/day
                    </p>
                  </div>
                </div>
                <span className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", STATUS_STYLE[status])} data-testid={`refill-status-${m.id}`}>
                  {REFILL_LABEL[status]}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="glass-soft rounded-2xl p-3">
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="text-lg font-semibold" data-testid={`refill-remaining-${m.id}`}>{m.quantity} tablets</p>
                </div>
                <div className="glass-soft rounded-2xl p-3">
                  <p className="text-xs text-muted-foreground">Countdown</p>
                  <p className={cn("text-lg font-semibold", status === "overdue" ? "text-destructive" : status === "due-soon" ? "text-warning" : "text-foreground")}>
                    {daysLeft <= 0 ? "Refill needed now" : `Refill in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="glass-soft rounded-2xl p-3">
                  <p className="text-xs text-muted-foreground">Refills left</p>
                  <p className="text-lg font-semibold">{m.refillsLeft}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-end gap-1.5" title="Adherence trend">
                  {trend.map((v, i) => (
                    <div key={i} className="w-4 rounded-t bg-primary/60" style={{ height: `${(v / maxT) * 28 + 4}px` }} />
                  ))}
                  <span className="ml-1 text-[11px] text-muted-foreground">adherence trend</span>
                </div>
                <div className="flex gap-2">
                  {!m.taken ? (
                    <button
                      data-testid={`patient-take-${m.id}`}
                      onClick={() => markTaken(m.id)}
                      className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                    >
                      Take now
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-success/20 px-3 py-2 text-xs font-semibold text-success">
                      <Check className="h-3.5 w-3.5" /> {m.takenAt}
                    </span>
                  )}
                  <button
                    data-testid={`patient-refill-${m.id}`}
                    onClick={() => requestRefill(m.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold",
                      status === "active" ? "glass-soft hover:bg-glass-strong" : "bg-primary text-primary-foreground",
                    )}
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> {m.refillRequested ? "Refill requested" : "Request refill"}
                  </button>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
