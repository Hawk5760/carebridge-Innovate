import { createFileRoute } from "@tanstack/react-router";
import { FlaskConical, Upload } from "lucide-react";
import { toast } from "sonner";
import { GlassCard, SectionTitle } from "@/components/cb/glass";
import { recompute, usePatient, useStore } from "@/lib/carebridge/store";
import type { LabTest } from "@/lib/carebridge/types";

export const Route = createFileRoute("/patient/_dash/tests")({
  head: () => ({
    meta: [
      { title: "Tests — CareBridge" },
      { name: "description", content: "Book lab tests or upload your reports." },
    ],
  }),
  component: PatientTests,
});

const STATUS_STYLE: Record<LabTest["status"], string> = {
  pending: "bg-warning/25 text-warning",
  booked: "bg-primary/20 text-primary",
  completed: "bg-success/20 text-success",
};

function PatientTests() {
  const { patientId, update } = useStore();
  const patient = usePatient(patientId);
  if (!patient) return null;

  const setStatus = (id: string, status: LabTest["status"], msg: string) => {
    update(patient.id, (p) =>
      recompute({ ...p, tests: p.tests.map((t) => (t.id === id ? { ...t, status } : t)) }),
    );
    toast.success(msg);
  };

  return (
    <div className="space-y-5">
      <SectionTitle sub="Completing tests keeps your care plan accurate.">Your tests</SectionTitle>
      <div className="space-y-4">
        {patient.tests.map((t) => (
          <GlassCard key={t.id} className="flex flex-wrap items-center justify-between gap-3" data-testid={`patient-test-${t.id}`}>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/20 text-primary">
                <FlaskConical className="h-5 w-5" />
              </span>
              <div>
                <p className="text-base font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">Due {t.due}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${STATUS_STYLE[t.status]}`}>
                {t.status}
              </span>
              {t.status === "pending" ? (
                <button
                  data-testid={`patient-book-test-${t.id}`}
                  onClick={() => setStatus(t.id, "booked", "Test booked. We'll remind you before the date.")}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                >
                  Book test
                </button>
              ) : t.status === "booked" ? (
                <button
                  data-testid={`patient-upload-test-${t.id}`}
                  onClick={() => setStatus(t.id, "completed", "Report uploaded. Your hospital has been notified.")}
                  className="glass-soft flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium hover:bg-glass-strong"
                >
                  <Upload className="h-3.5 w-3.5" /> Upload report
                </button>
              ) : null}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
