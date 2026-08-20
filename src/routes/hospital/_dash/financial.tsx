import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Wallet } from "lucide-react";
import { GlassCard, SectionTitle, Stat } from "@/components/cb/glass";
import { useStore } from "@/lib/carebridge/store";
import { costBand, costSummary, inr, type CostBand } from "@/lib/carebridge/metrics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hospital/_dash/financial")({
  head: () => ({
    meta: [
      { title: "Financial Risk — CareBridge AI" },
      { name: "description", content: "Patients at risk of dropping out due to financial burden." },
    ],
  }),
  component: FinancialRisk,
});

const BADGE: Record<CostBand, string> = {
  high: "bg-destructive/15 text-destructive",
  medium: "bg-warning/25 text-warning",
  low: "bg-success/20 text-success",
};

const FILTERS: { key: CostBand | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "high", label: "High Cost Risk" },
  { key: "medium", label: "Medium Cost Risk" },
  { key: "low", label: "Low Cost Risk" },
];

function FinancialRisk() {
  const { patients } = useStore();
  const [filter, setFilter] = useState<CostBand | "all">("all");

  const rows = patients
    .map((p) => ({ p, band: costBand(p.financialRisk), s: costSummary(p) }))
    .filter((r) => filter === "all" || r.band === filter)
    .sort((a, b) => b.p.financialRisk - a.p.financialRisk);

  const highCount = patients.filter((p) => costBand(p.financialRisk) === "high").length;
  const avgOOP = Math.round(patients.reduce((a, p) => a + costSummary(p).outOfPocket, 0) / (patients.length || 1));
  const revAtRisk = patients.filter((p) => costBand(p.financialRisk) !== "low").reduce((a, p) => a + p.revenueAtRisk, 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="High cost risk" value={String(highCount)} sub="patients likely to drop off" icon={<Wallet className="h-5 w-5" />} />
        <Stat label="Avg out-of-pocket" value={inr(avgOOP)} sub="per patient / 30 days" />
        <Stat label="Revenue at risk" value={inr(revAtRisk)} sub="from cost-sensitive patients" />
      </div>

      <GlassCard>
        <SectionTitle sub="Patients ranked by financial-burden drop-off risk. Filter by cost-risk band.">
          Financial Risk
        </SectionTitle>

        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              data-testid={`financial-filter-${f.key}`}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition",
                filter === f.key ? "bg-primary text-primary-foreground" : "glass-soft text-muted-foreground hover:bg-glass-strong",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="pb-3">Patient</th>
                <th className="pb-3">Financial risk</th>
                <th className="pb-3">Out-of-pocket</th>
                <th className="pb-3">Insurance</th>
                <th className="pb-3">Barriers</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody data-testid="financial-table">
              {rows.map(({ p, band, s }) => (
                <tr key={p.id} className="border-t border-border" data-testid={`financial-row-${p.id}`}>
                  <td className="py-3 font-medium">{p.name}<span className="block text-xs text-muted-foreground">{p.condition}</span></td>
                  <td className="py-3">
                    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", BADGE[band])}>{p.financialRisk} · {band}</span>
                  </td>
                  <td className="py-3 font-semibold">{inr(s.outOfPocket)}</td>
                  <td className="py-3 text-muted-foreground">{p.costs.insuranceCoveragePct}%</td>
                  <td className="py-3 text-muted-foreground">{p.barriers.join(", ") || "—"}</td>
                  <td className="py-3">
                    <Link to="/hospital/patient/$id" params={{ id: p.id }} className="text-xs font-semibold text-primary">View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
