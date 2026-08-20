import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, CheckCircle2, Circle, FlaskConical, Heart, Pill } from "lucide-react";
import { toast } from "sonner";
import { GlassCard, Ring, SectionTitle } from "@/components/cb/glass";
import { recompute, usePatient, useStore } from "@/lib/carebridge/store";
import type { CarePlanMilestone } from "@/lib/carebridge/types";

export const Route = createFileRoute("/patient/_dash/recovery")({
  head: () => ({
    meta: [
      { title: "My Recovery Journey — CareBridge" },
      { name: "description", content: "Track your post-discharge recovery milestones and progress." },
    ],
  }),
  component: PatientRecovery,
});

const ICON: Record<CarePlanMilestone["category"], typeof Pill> = {
  medication: Pill,
  appointment: CalendarCheck,
  test: FlaskConical,
  recovery: Heart,
};

function PatientRecovery() {
  const { patientId, update } = useStore();
  const patient = usePatient(patientId);
  if (!patient) return null;

  const plan = patient.carePlan;

  if (!plan || !plan.active) {
    return (
      <div className="space-y-5">
        <SectionTitle sub="Your recovery plan appears once your hospital activates it.">My Recovery Journey</SectionTitle>
        <GlassCard data-testid="recovery-empty">
          <p className="text-sm text-muted-foreground">
            No active recovery plan yet. After discharge, your care team will set up a personalised recovery journey
            here with milestones, reminders and check-ins.
          </p>
        </GlassCard>
      </div>
    );
  }

  const toggle = (id: string) =>
    update(patient.id, (p) => {
      if (!p.carePlan) return p;
      const milestones = p.carePlan.milestones.map((m) => (m.id === id ? { ...m, done: !m.done } : m));
      const progress = Math.round((milestones.filter((m) => m.done).length / (milestones.length || 1)) * 100);
      return recompute({ ...p, carePlan: { ...p.carePlan, milestones, progress } });
    });

  const completed = plan.milestones.filter((m) => m.done).length;

  return (
    <div className="space-y-5">
      <SectionTitle sub="Every step you complete brings you closer to full recovery.">My Recovery Journey</SectionTitle>

      <GlassCard className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Recovery from</p>
          <h2 className="text-xl font-semibold">{patient.condition}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {completed} of {plan.milestones.length} milestones done · started {plan.startedOn}
          </p>
        </div>
        <Ring value={plan.progress} label="complete" size={132} />
      </GlassCard>

      <GlassCard>
        <SectionTitle sub="Tap a milestone when you've completed it.">Milestones &amp; timeline</SectionTitle>
        <ol className="relative space-y-3 border-l border-border pl-6" data-testid="recovery-milestones">
          {plan.milestones.map((m) => {
            const Icon = ICON[m.category];
            return (
              <li key={m.id} className="relative">
                <span className="absolute -left-[31px] grid h-6 w-6 place-items-center rounded-full bg-glass-strong text-primary">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <button
                  data-testid={`recovery-milestone-${m.id}`}
                  onClick={() => toggle(m.id)}
                  className="glass-soft flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm transition hover:bg-glass-strong"
                >
                  <span className="flex items-center gap-3">
                    {m.done ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                    <span className={m.done ? "text-muted-foreground line-through" : "text-foreground"}>{m.label}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{m.due}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </GlassCard>

      {plan.discharge?.recoveryInstructions?.length ? (
        <GlassCard>
          <SectionTitle sub="From your discharge summary.">Recovery instructions</SectionTitle>
          <ul className="space-y-2 text-sm">
            {plan.discharge.recoveryInstructions.map((ins, i) => (
              <li key={i} className="glass-soft rounded-2xl px-4 py-2.5">{ins}</li>
            ))}
          </ul>
        </GlassCard>
      ) : null}
    </div>
  );
}
