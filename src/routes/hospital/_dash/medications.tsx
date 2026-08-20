import { createFileRoute } from "@tanstack/react-router";
import { Bar, GlassCard, SectionTitle } from "@/components/cb/glass";
import { useStore } from "@/lib/carebridge/store";

export const Route = createFileRoute("/hospital/_dash/medications")({
  head: () => ({
    meta: [
      { title: "Medication Adherence — CareBridge AI" },
      { name: "description", content: "Monitor which patients are taking their medicines and who is slipping." },
      { property: "og:title", content: "Medication Adherence — CareBridge AI" },
      { property: "og:description", content: "Per-patient adherence tracking with missed-dose detection." },
    ],
  }),
  component: Medications,
});

function Medications() {
  const { patients } = useStore();
  const avg = Math.round(patients.reduce((a, p) => a + p.breakdown.medication, 0) / (patients.length || 1));

  return (
    <div className="space-y-5">
      <GlassCard>
        <SectionTitle sub="Cohort average across all active prescriptions.">Medication Adherence</SectionTitle>
        <Bar label="Overall adherence" value={avg} />
      </GlassCard>

      <GlassCard>
        <SectionTitle sub="Patients below 70% adherence need a nurse check-in.">Per patient</SectionTitle>
        <div className="grid gap-3 md:grid-cols-2">
          {patients.map((p) => (
            <div key={p.id} className="glass-soft rounded-2xl p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">{p.name}</span>
                <span className="text-xs text-muted-foreground">{p.condition}</span>
              </div>
              <Bar label="Adherence" value={p.breakdown.medication} />
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {p.medicines.map((m) => (
                  <li key={m.id}>
                    {m.name} {m.dose} at {m.time} — {m.taken ? `taken ${m.takenAt ?? ""}` : "not taken"}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
