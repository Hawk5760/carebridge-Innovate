import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import { GlassCard, SectionTitle } from "@/components/cb/glass";
import { recompute, usePatient, useStore } from "@/lib/carebridge/store";

export const Route = createFileRoute("/patient/_dash/appointments")({
  head: () => ({
    meta: [
      { title: "Appointments — CareBridge" },
      { name: "description", content: "Confirm, reschedule or tell us if you need help attending." },
    ],
  }),
  component: PatientAppointments,
});

const BARRIERS = ["Cost", "Transportation", "Busy schedule", "Side effects", "Feeling better", "Fear/anxiety"];

function PatientAppointments() {
  const { patientId, update } = useStore();
  const patient = usePatient(patientId);
  const [helpFor, setHelpFor] = useState<string | null>(null);
  if (!patient) return null;

  const setStatus = (id: string, status: "confirmed" | "rescheduled") => {
    update(patient.id, (p) =>
      recompute({ ...p, appointments: p.appointments.map((a) => (a.id === id ? { ...a, status } : a)) }),
    );
    toast.success(status === "confirmed" ? "Appointment confirmed." : "We'll help you find a new slot.");
  };

  const reportBarrier = (barrier: string) => {
    update(patient.id, (p) => recompute({ ...p, barriers: Array.from(new Set([...p.barriers, barrier])) }));
    setHelpFor(null);
    toast.success("Thanks for telling us — your care team will reach out with options.");
  };

  return (
    <div className="space-y-5">
      <SectionTitle sub="Confirming early helps us keep your care on track.">Your appointments</SectionTitle>
      <div className="space-y-4">
        {patient.appointments.map((a) => (
          <GlassCard key={a.id} data-testid={`patient-appt-${a.id}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/20 text-primary">
                  <CalendarCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-base font-semibold">{a.date} · {a.time}</p>
                  <p className="text-xs text-muted-foreground">{a.doctor}</p>
                </div>
              </div>
              <span className="rounded-full bg-glass-strong px-3 py-1.5 text-xs font-medium capitalize">{a.status}</span>
            </div>

            {a.status !== "completed" ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  data-testid={`patient-appt-confirm-${a.id}`}
                  onClick={() => setStatus(a.id, "confirmed")}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setStatus(a.id, "rescheduled")}
                  className="glass-soft rounded-full px-4 py-2 text-xs font-medium hover:bg-glass-strong"
                >
                  Reschedule
                </button>
                <button
                  data-testid={`patient-appt-help-${a.id}`}
                  onClick={() => setHelpFor(helpFor === a.id ? null : a.id)}
                  className="glass-soft rounded-full px-4 py-2 text-xs font-medium hover:bg-glass-strong"
                >
                  Need help
                </button>
              </div>
            ) : null}

            {helpFor === a.id ? (
              <div className="mt-4 rounded-2xl bg-glass-strong p-4">
                <p className="mb-3 text-xs font-medium text-muted-foreground">What's making this hard?</p>
                <div className="flex flex-wrap gap-2">
                  {BARRIERS.map((b) => (
                    <button
                      key={b}
                      data-testid={`patient-barrier-${b.toLowerCase().replace(/\s+/g, "-")}`}
                      onClick={() => reportBarrier(b)}
                      className="glass-soft rounded-full px-3 py-1.5 text-xs font-medium hover:bg-primary hover:text-primary-foreground"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
