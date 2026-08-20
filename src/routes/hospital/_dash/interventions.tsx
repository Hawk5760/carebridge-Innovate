import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { GlassCard, RiskPill, SectionTitle } from "@/components/cb/glass";
import { useStore } from "@/lib/carebridge/store";

export const Route = createFileRoute("/hospital/_dash/interventions")({
  head: () => ({
    meta: [
      { title: "Intervention Center — CareBridge AI" },
      { name: "description", content: "One place to triage critical, high and medium risk alerts and act on them." },
      { property: "og:title", content: "Intervention Center — CareBridge AI" },
      { property: "og:description", content: "Graduated interventions from push nudge to coordinator call." },
    ],
  }),
  component: Interventions,
});

const STAGES = [
  "Stage 1 · Push notification",
  "Stage 2 · WhatsApp reminder",
  "Stage 3 · Personalised message",
  "Stage 4 · Coordinator alert",
  "Stage 5 · Hospital call",
];

function Interventions() {
  const { patients, update } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const critical = patients.filter((p) => p.risk >= 85);
  const high = patients.filter((p) => p.risk >= 70 && p.risk < 85);
  const medium = patients.filter((p) => p.risk >= 45 && p.risk < 70);
  const active = patients.find((p) => p.id === selected) ?? null;

  const run = (stage: number, channel: string) => {
    if (!active) return;
    update(active.id, (p) => ({
      ...p,
      interventions: [
        {
          id: `${p.id}-${Date.now()}`,
          stage,
          channel,
          note:
            stage === 3
              ? `Personalised message: "${p.name.split(" ")[0]}, your follow-up is due soon. You mentioned ${p.barriers[0] ?? "difficulty"} — would you like a teleconsultation?"`
              : `${channel} triggered`,
          at: new Date().toLocaleString("en-IN"),
          resolved: false,
        },
        ...p.interventions,
      ],
    }));
    toast.success(`${channel} sent to ${active.name}`);
  };

  const resolve = () => {
    if (!active) return;
    update(active.id, (p) => ({
      ...p,
      interventions: p.interventions.map((i) => ({ ...i, resolved: true })),
      lastActiveDays: 0,
    }));
    toast.success(`${active.name} marked resolved`);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { l: "Critical", n: critical.length, c: "text-destructive" },
          { l: "High Risk", n: high.length, c: "text-warning" },
          { l: "Medium Risk", n: medium.length, c: "text-primary" },
        ].map((s) => (
          <GlassCard key={s.l}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.l}</p>
            <p className={`mt-2 text-3xl font-semibold ${s.c}`}>{s.n}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <GlassCard>
          <SectionTitle sub="Select a patient to open the graduated intervention ladder.">Today's actions</SectionTitle>
          <ul className="max-h-[26rem] space-y-2 overflow-y-auto">
            {[...critical, ...high, ...medium].map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => setSelected(p.id)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${
                    selected === p.id ? "bg-primary text-primary-foreground" : "glass-soft hover:bg-glass-strong"
                  }`}
                >
                  <span className="text-left">
                    <span className="font-medium">{p.name}</span>
                    <span className="ml-2 text-xs opacity-75">{p.condition}</span>
                  </span>
                  {selected === p.id ? <span className="text-xs">{p.risk}%</span> : <RiskPill risk={p.risk} />}
                </button>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          {!active ? (
            <p className="text-sm text-muted-foreground">Select a patient from the alert queue.</p>
          ) : (
            <>
              <SectionTitle sub={`Risk ${active.risk}% · barriers: ${active.barriers.join(", ") || "none reported"}`}>
                {active.name}
              </SectionTitle>
              <div className="space-y-2">
                {STAGES.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => run(i + 1, s.split("· ")[1] ?? s)}
                    className="glass-soft flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm hover:bg-glass-strong"
                  >
                    <span>{s}</span>
                    <span className="text-xs text-primary">Trigger</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={resolve} className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                  Mark resolved
                </button>
              </div>
              <div className="mt-5 space-y-2">
                {active.interventions.map((i) => (
                  <div key={i.id} className="glass-soft rounded-2xl px-4 py-2.5 text-xs">
                    <p className="font-medium">Stage {i.stage} · {i.channel} {i.resolved ? "· resolved" : ""}</p>
                    <p className="text-muted-foreground">{i.note} — {i.at}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
