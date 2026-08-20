import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Stethoscope } from "lucide-react";
import { Bar, GlassCard, Ring, RiskPill, SectionTitle } from "@/components/cb/glass";
import { AIInsight } from "@/components/cb/ai-panel";
import { recompute, usePatient, useStore } from "@/lib/carebridge/store";
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
  const { update, hospitalUser } = useStore();
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [condition, setCondition] = useState("");

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

  const pendingAppt = patient.appointments.find((a) => a.status !== "completed");
  const diagnoses = patient.diagnoses ?? [];

  const recordDiagnosis = () => {
    if (!summary.trim()) {
      toast.error("Please enter a diagnosis summary.");
      return;
    }
    const doctor = hospitalUser?.name ?? pendingAppt?.doctor ?? "Attending doctor";
    const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    update(patient.id, (p) =>
      recompute({
        ...p,
        condition: condition.trim() || p.condition,
        diagnoses: [
          {
            id: `${p.id}-dx-${Date.now()}`,
            date: today,
            doctor,
            summary: summary.trim(),
            notes: notes.trim() || undefined,
            appointmentId: pendingAppt?.id,
          },
          ...(p.diagnoses ?? []),
        ],
        appointments: pendingAppt
          ? p.appointments.map((a) => (a.id === pendingAppt.id ? { ...a, status: "completed" } : a))
          : p.appointments,
      }),
    );
    setSummary("");
    setNotes("");
    setCondition("");
    toast.success("Diagnosis recorded & follow-up visit completed.");
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

      <GlassCard className="border-l-4 border-l-primary" data-testid="diagnosis-card">
        <SectionTitle sub="When the patient comes in for their follow-up, record the doctor's diagnosis. This completes the visit.">
          <span className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" /> Follow-up visit &amp; diagnosis
          </span>
        </SectionTitle>

        <div className="mb-3 rounded-2xl bg-glass-strong px-4 py-3 text-sm">
          {pendingAppt ? (
            <span data-testid="diagnosis-pending-appt">
              Recording for follow-up on <b>{pendingAppt.date} · {pendingAppt.time}</b> with {pendingAppt.doctor}
              {" "}(currently <span className="capitalize">{pendingAppt.status}</span>).
            </span>
          ) : (
            <span className="text-muted-foreground">No pending follow-up — this will be saved as a general visit note.</span>
          )}
        </div>

        <div className="grid gap-3">
          <label className="space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Diagnosis summary *</span>
            <input
              data-testid="diagnosis-summary-input"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. Type 2 Diabetes — HbA1c improving, BP well controlled"
              className="w-full rounded-2xl bg-input px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Clinical notes / plan</span>
            <textarea
              data-testid="diagnosis-notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Advice, medication changes, next review date…"
              className="w-full rounded-2xl bg-input px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Update primary condition (optional)
            </span>
            <input
              data-testid="diagnosis-condition-input"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder={patient.condition}
              className="w-full rounded-2xl bg-input px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
            />
          </label>
          <button
            data-testid="diagnosis-submit-btn"
            onClick={recordDiagnosis}
            className="justify-self-start rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Record diagnosis &amp; complete visit
          </button>
        </div>

        {diagnoses.length > 0 ? (
          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Diagnosis history</p>
            <ul className="space-y-2" data-testid="diagnosis-history">
              {diagnoses.map((d) => (
                <li key={d.id} className="glass-soft rounded-2xl px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{d.summary}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{d.date}</span>
                  </div>
                  {d.notes ? <p className="mt-1 text-xs text-muted-foreground">{d.notes}</p> : null}
                  <p className="mt-1 text-[11px] text-muted-foreground">— {d.doctor}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </GlassCard>

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
