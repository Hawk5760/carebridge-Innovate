import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GlassCard, RiskPill, SectionTitle } from "@/components/cb/glass";
import { useStore } from "@/lib/carebridge/store";

export const Route = createFileRoute("/hospital/_dash/patients")({
  head: () => ({
    meta: [
      { title: "Patients — CareBridge AI" },
      { name: "description", content: "Search and filter every enrolled patient with live care continuity scores." },
      { property: "og:title", content: "Patient Registry — CareBridge AI" },
      { property: "og:description", content: "Every enrolled patient with condition, care score and drop-off risk." },
    ],
  }),
  component: Patients,
});

function Patients() {
  const { patients } = useStore();
  const [q, setQ] = useState("");
  const [band, setBand] = useState<"all" | "low" | "medium" | "high">("all");

  const rows = patients.filter((p) => {
    const matchQ = (p.name + p.condition).toLowerCase().includes(q.toLowerCase());
    const matchBand =
      band === "all" ||
      (band === "high" && p.risk >= 70) ||
      (band === "medium" && p.risk >= 45 && p.risk < 70) ||
      (band === "low" && p.risk < 45);
    return matchQ && matchBand;
  });

  return (
    <GlassCard>
      <SectionTitle sub={`${rows.length} patients matching your filters.`}>Patients</SectionTitle>
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or condition…"
          className="min-w-52 flex-1 rounded-2xl bg-input px-4 py-2.5 text-sm outline-none ring-ring focus:ring-2"
        />
        {(["all", "low", "medium", "high"] as const).map((b) => (
          <button
            key={b}
            onClick={() => setBand(b)}
            className={
              b === band
                ? "rounded-2xl bg-primary px-4 py-2.5 text-xs font-semibold capitalize text-primary-foreground"
                : "glass-soft rounded-2xl px-4 py-2.5 text-xs font-medium capitalize"
            }
          >
            {b}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="pb-3">Patient</th>
              <th className="pb-3">Condition</th>
              <th className="pb-3">Care Score</th>
              <th className="pb-3">Risk</th>
              <th className="pb-3">Coordinator</th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="py-3 font-medium">{p.name}<span className="ml-2 text-xs text-muted-foreground">{p.age}y</span></td>
                <td className="py-3 text-muted-foreground">{p.condition}</td>
                <td className="py-3">{p.careScore}/100</td>
                <td className="py-3"><RiskPill risk={p.risk} /></td>
                <td className="py-3 text-muted-foreground">{p.coordinator}</td>
                <td className="py-3 text-right">
                  <Link
                    to="/hospital/patient/$id"
                    params={{ id: p.id }}
                    className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
