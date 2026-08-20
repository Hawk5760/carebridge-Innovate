import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { GlassCard, SectionTitle } from "@/components/cb/glass";
import { useStore } from "@/lib/carebridge/store";

export const Route = createFileRoute("/hospital/_dash/settings")({
  head: () => ({
    meta: [
      { title: "Admin Settings — CareBridge AI" },
      { name: "description", content: "Configure care programmes, reminder channels, risk thresholds and staff assignment." },
      { property: "og:title", content: "Admin Settings — CareBridge AI" },
      { property: "og:description", content: "Diseases, channels, thresholds and coordinator assignment." },
    ],
  }),
  component: SettingsPage,
});

const DISEASES = ["Diabetes", "Hypertension", "TB", "Cardiac", "Post-surgery"];
const CHANNELS = ["SMS", "WhatsApp", "Email", "Voice"];

function SettingsPage() {
  const { patients, update, reset } = useStore();
  const [diseases, setDiseases] = useState<string[]>(["Diabetes", "Hypertension", "Cardiac"]);
  const [channels, setChannels] = useState<string[]>(["SMS", "WhatsApp"]);
  const [thresholds, setThresholds] = useState({ medium: 45, high: 70, critical: 85 });

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <div className="space-y-5">
      <GlassCard>
        <SectionTitle sub="Programmes monitored by CareBridge">Diseases</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {DISEASES.map((d) => (
            <button
              key={d}
              onClick={() => toggle(diseases, setDiseases, d)}
              className={diseases.includes(d) ? "rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground" : "glass-soft rounded-full px-4 py-2 text-xs"}
            >
              {d}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <SectionTitle sub="Used by the automation and intervention engine">Reminder channels</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {CHANNELS.map((c) => (
            <button
              key={c}
              onClick={() => toggle(channels, setChannels, c)}
              className={channels.includes(c) ? "rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground" : "glass-soft rounded-full px-4 py-2 text-xs"}
            >
              {c}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <SectionTitle sub="Risk bands that drive escalation">Risk thresholds</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-3">
          {(["medium", "high", "critical"] as const).map((k) => (
            <label key={k} className="block text-sm">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{k}</span>
              <input
                type="range"
                min={20}
                max={99}
                value={thresholds[k]}
                onChange={(e) => setThresholds({ ...thresholds, [k]: Number(e.target.value) })}
                className="mt-2 w-full accent-primary"
              />
              <span className="font-semibold">{thresholds[k]}%</span>
            </label>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <SectionTitle sub="Which coordinator handles which patient">Staff assignment</SectionTitle>
        <div className="grid gap-2 md:grid-cols-2">
          {patients.slice(0, 8).map((p) => (
            <div key={p.id} className="glass-soft flex items-center justify-between rounded-2xl px-4 py-2.5 text-sm">
              <span>{p.name}</span>
              <select
                value={p.coordinator}
                onChange={(e) => {
                  const v = e.target.value;
                  update(p.id, (x) => ({ ...x, coordinator: v }));
                  toast.success(`${p.name} assigned to ${v}`);
                }}
                className="rounded-xl bg-input px-3 py-1.5 text-xs outline-none"
              >
                {["Meera Nair", "Arun Verma", "Sana Qureshi", "Vikram Rao"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            reset();
            toast.success("Demo data reset");
          }}
          className="mt-5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
        >
          Reset demo data
        </button>
      </GlassCard>
    </div>
  );
}
