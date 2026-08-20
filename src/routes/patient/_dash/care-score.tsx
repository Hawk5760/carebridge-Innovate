import { createFileRoute } from "@tanstack/react-router";
import { Bar, GlassCard, Ring, SectionTitle } from "@/components/cb/glass";
import { usePatient, useStore } from "@/lib/carebridge/store";

export const Route = createFileRoute("/patient/_dash/care-score")({
  head: () => ({
    meta: [
      { title: "Care Score — CareBridge" },
      { name: "description", content: "See how your care continuity score is calculated and how it's trending." },
    ],
  }),
  component: PatientCareScore,
});

function PatientCareScore() {
  const { patientId } = useStore();
  const patient = usePatient(patientId);
  if (!patient) return null;

  const trend = patient.scoreTrend;
  const max = Math.max(100, ...trend);

  return (
    <div className="space-y-5">
      <SectionTitle sub="A single number for how well you're staying on your care plan.">Your care score</SectionTitle>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="flex flex-col items-center justify-center gap-2">
          <Ring value={patient.careScore} label="out of 100" size={180} />
          <p className="text-sm text-muted-foreground">
            {patient.careScore >= 80 ? "Excellent — keep it up!" : patient.careScore >= 60 ? "Good, with room to improve." : "Let's work on this together."}
          </p>
        </GlassCard>

        <GlassCard>
          <SectionTitle sub="What makes up your score">Score components</SectionTitle>
          <div className="space-y-4">
            <Bar label="Appointment adherence" value={patient.breakdown.appointment} />
            <Bar label="Medication adherence" value={patient.breakdown.medication} />
            <Bar label="Test completion" value={patient.breakdown.tests} />
            <Bar label="Engagement" value={patient.breakdown.engagement} />
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <SectionTitle sub="Your score over recent check-ins">Trend</SectionTitle>
        <div className="flex items-end gap-3" style={{ height: 160 }} data-testid="patient-score-trend">
          {trend.map((v, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-2xl bg-primary transition-all duration-700"
                style={{ height: `${(v / max) * 120}px` }}
              />
              <span className="text-xs font-medium text-foreground">{v}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
