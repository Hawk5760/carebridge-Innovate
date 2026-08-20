import { createFileRoute } from "@tanstack/react-router";
import { Check, Clock, Pill } from "lucide-react";
import { toast } from "sonner";
import { GlassCard, SectionTitle } from "@/components/cb/glass";
import { recompute, usePatient, useStore } from "@/lib/carebridge/store";

export const Route = createFileRoute("/patient/_dash/medicines")({
  head: () => ({
    meta: [
      { title: "Medicines — CareBridge" },
      { name: "description", content: "Track and confirm your daily medicines." },
    ],
  }),
  component: PatientMedicines,
});

function PatientMedicines() {
  const { patientId, update } = useStore();
  const patient = usePatient(patientId);
  if (!patient) return null;

  const markTaken = (id: string) => {
    update(patient.id, (p) =>
      recompute({
        ...p,
        medicines: p.medicines.map((m) =>
          m.id === id ? { ...m, taken: true, takenAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) } : m,
        ),
      }),
    );
    toast.success("Recorded. Great job staying on track!");
  };

  const taken = patient.medicines.filter((m) => m.taken).length;

  return (
    <div className="space-y-5">
      <SectionTitle sub={`${taken} of ${patient.medicines.length} taken today.`}>Today's medicines</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        {patient.medicines.map((m) => (
          <GlassCard key={m.id} className="flex items-center justify-between gap-3" data-testid={`patient-medicine-${m.id}`}>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/20 text-primary">
                <Pill className="h-5 w-5" />
              </span>
              <div>
                <p className="text-base font-semibold">{m.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {m.dose} · {m.time}
                </p>
              </div>
            </div>
            {m.taken ? (
              <span className="flex items-center gap-1 rounded-full bg-success/20 px-3 py-1.5 text-xs font-semibold text-success">
                <Check className="h-3.5 w-3.5" /> {m.takenAt ?? "Taken"}
              </span>
            ) : (
              <button
                data-testid={`patient-take-${m.id}`}
                onClick={() => markTaken(m.id)}
                className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground"
              >
                Take now
              </button>
            )}
          </GlassCard>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Missing doses lowers your care score and may prompt your care team to check in.
      </p>
    </div>
  );
}
