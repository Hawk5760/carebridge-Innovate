import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { GlassCard, Ring, SectionTitle } from "@/components/cb/glass";
import { AIInsight } from "@/components/cb/ai-panel";
import { recompute, usePatient, useStore } from "@/lib/carebridge/store";
import { aiCareInsight } from "@/lib/carebridge/ai";

export const Route = createFileRoute("/patient/_dash/home")({
  head: () => ({
    meta: [
      { title: "Home — CareBridge" },
      { name: "description", content: "Your care status, today's tasks and next appointment." },
    ],
  }),
  component: PatientHome,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function PatientHome() {
  const { patientId, update } = useStore();
  const patient = usePatient(patientId);
  if (!patient) return null;

  const firstName = patient.name.split(" ")[0];
  const nextAppt = patient.appointments.find((a) => a.status === "upcoming" || a.status === "confirmed");

  const toggleTask = (id: string) =>
    update(patient.id, (p) => recompute({ ...p, tasks: p.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));

  const confirmAppt = () => {
    if (!nextAppt) return;
    update(patient.id, (p) => recompute({
      ...p,
      appointments: p.appointments.map((a) => (a.id === nextAppt.id ? { ...a, status: "confirmed" } : a)),
    }));
    toast.success("Appointment confirmed. See you then!");
  };

  return (
    <div className="space-y-5">
      <GlassCard className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="patient-greeting">
            {greeting()}, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's your care status for today.</p>
        </div>
        <Ring value={patient.careScore} label="Care score" size={132} />
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <SectionTitle sub="Tap to check off what you've done.">Today's tasks</SectionTitle>
          <ul className="space-y-2">
            {patient.tasks.map((t) => (
              <li key={t.id}>
                <button
                  data-testid={`patient-task-${t.id}`}
                  onClick={() => toggleTask(t.id)}
                  className="glass-soft flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm transition hover:bg-glass-strong"
                >
                  {t.done ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className={t.done ? "text-muted-foreground line-through" : "text-foreground"}>{t.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <SectionTitle sub="Your next visit with the care team.">Next appointment</SectionTitle>
          {nextAppt ? (
            <div className="glass-soft rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/20 text-primary">
                  <CalendarCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-base font-semibold">{nextAppt.date} · {nextAppt.time}</p>
                  <p className="text-xs text-muted-foreground">{nextAppt.doctor}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {nextAppt.status === "confirmed" ? (
                  <span className="rounded-full bg-success/20 px-4 py-2 text-xs font-semibold text-success">Confirmed ✓</span>
                ) : (
                  <button
                    data-testid="patient-confirm-appt-btn"
                    onClick={confirmAppt}
                    className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    Confirm appointment
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
          )}
        </GlassCard>
      </div>

      <AIInsight
        testid="patient-ai-insight"
        title="Why am I struggling?"
        sub="A gentle, personalised look at what might be making your plan hard — and small steps to help."
        cta="Get insight"
        run={() => aiCareInsight(patient)}
      />
    </div>
  );
}
