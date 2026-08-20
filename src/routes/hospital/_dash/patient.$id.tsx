import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { Bar, GlassCard, Ring, RiskPill, SectionTitle } from "@/components/cb/glass";
import { AIInsight } from "@/components/cb/ai-panel";
import { usePatient, useStore } from "@/lib/carebridge/store";
import { aiInterventionMessage, aiRiskExplanation } from "@/lib/carebridge/ai";

export const Route = createFileRoute("/hospital/_dash/patient/$id")({
  head: () => ({
    meta: [
      { title: "Patient Details — CareBridge AI" },
      { name: "description", content: "Care continuity score, explainable AI risk factors and intervention history." },
      { property: "og:title", content: "Patient Details — CareBridge AI" },
      { property: "og:description", content: "Why this patient is at risk — and what to do next." },
    ],
  }),
  component: PatientDetail,
});

function PatientDetail() {
  const { id } = useParams({ from: "/hospital/_dash/patient/$id" });
  const patient = usePatient(id);
  const { update } = useStore();

  if (!patient) {
    return (
      <GlassCard>
        <p className="text-sm text-muted-foreground">Patient not found.</p>
        <Link to="/hospital/patients" className="mt-3 inline-block text-sm text-primary">
          Back to patients
        </Link>
      </GlassCard>
    );
  }

  const log = (channel: string) => {
    update(patient.id, (p) => ({
      ...p,
      interventions: [
        {
          id: `${p.id}-${Date.now()}`,
          stage: 3,
          channel,
          note: `${channel} sent from patient profile`,
          at: new Date().toLocaleString("en-IN"),
          resolved: false,
        },
        ...p.interventions,
      ],
    }));
    toast.success(`${channel} logged for ${patient.name}`);
  };

  return (
    <div className="space-y-5">
      <GlassCard className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{patient.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Age {patient.age} · {patient.condition} · Diagnosed {patient.diagnosedOn}
          </p>
          <p className="text-sm text-muted-foreground">
            Next visit: {patient.appointments[0]?.date ?? "—"} · Coordinator: {patient.coordinator}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Call", "WhatsApp", "Teleconsult offer", "Assign coordinator"].map((a) => (
              <button
                key={a}
                onClick={() => log(a)}
                className="glass-soft rounded-full px-4 py-2 text-xs font-medium hover:bg-glass-strong"
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Ring value={patient.careScore} label="Care score" />
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">AI drop-off risk</p>
            <div className="mt-2"><RiskPill risk={patient.risk} /></div>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <SectionTitle sub="Explainable signal weights — decision support, not diagnosis.">Why is this patient at risk?</SectionTitle>
          <ul className="space-y-2">
            {patient.riskFactors.length === 0 ? (
              <li className="text-sm text-muted-foreground">No elevated risk signals detected.</li>
            ) : (
              patient.riskFactors.map((f) => (
                <li key={f.label} className="glass-soft flex items-center justify-between rounded-2xl px-4 py-2.5 text-sm">
                  <span>{f.label}</span>
                  <span className="font-semibold text-primary">+{f.points}</span>
                </li>
              ))
            )}
          </ul>
          {patient.barriers.length > 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Patient-reported barriers: {patient.barriers.join(", ")}
            </p>
          ) : null}
        </GlassCard>

        <GlassCard>
          <SectionTitle sub="Care continuity score breakdown">Score components</SectionTitle>
          <div className="space-y-4">
            <Bar label="Appointment adherence" value={patient.breakdown.appointment} />
            <Bar label="Medication adherence" value={patient.breakdown.medication} />
            <Bar label="Test completion" value={patient.breakdown.tests} />
            <Bar label="Engagement" value={patient.breakdown.engagement} />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Trend: {patient.scoreTrend.join(" → ")}
          </p>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AIInsight
          testid="hospital-ai-risk"
          title="AI risk explanation"
          sub="Plain-language summary of why this patient may disengage — decision support only."
          cta="Explain"
          run={() => aiRiskExplanation(patient)}
        />
        <AIInsight
          testid="hospital-ai-message"
          title="Draft outreach message"
          sub="A warm, personalised WhatsApp message the care team can send."
          cta="Draft WhatsApp"
          run={() => aiInterventionMessage(patient, "WhatsApp")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <SectionTitle>Medication &amp; tests</SectionTitle>
          <ul className="space-y-2 text-sm">
            {patient.medicines.map((m) => (
              <li key={m.id} className="glass-soft flex items-center justify-between rounded-2xl px-4 py-2.5">
                <span>{m.name} · {m.dose} · {m.time}</span>
                <span className={m.taken ? "text-success" : "text-destructive"}>{m.taken ? "Taken" : "Missed"}</span>
              </li>
            ))}
            {patient.tests.map((t) => (
              <li key={t.id} className="glass-soft flex items-center justify-between rounded-2xl px-4 py-2.5">
                <span>{t.name} · due {t.due}</span>
                <span className="capitalize text-muted-foreground">{t.status}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <SectionTitle>Intervention history</SectionTitle>
          {patient.interventions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No interventions logged yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {patient.interventions.map((i) => (
                <li key={i.id} className="glass-soft rounded-2xl px-4 py-2.5">
                  <p className="font-medium">Stage {i.stage} · {i.channel}</p>
                  <p className="text-xs text-muted-foreground">{i.note} — {i.at}</p>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
