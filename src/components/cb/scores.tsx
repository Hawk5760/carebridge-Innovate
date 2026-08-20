import { cn } from "@/lib/utils";
import type { Patient } from "@/lib/carebridge/types";

function band(v: number): "crit" | "high" | "med" | "low" {
  if (v >= 70) return "crit";
  if (v >= 45) return "high";
  if (v >= 25) return "med";
  return "low";
}

const TEXT = { crit: "text-destructive", high: "text-destructive", med: "text-warning", low: "text-success" } as const;
const BAR = { crit: "bg-destructive", high: "bg-destructive", med: "bg-warning", low: "bg-success" } as const;

export function RiskScore({ label, value, testid }: { label: string; value: number; testid?: string }) {
  const b = band(value);
  return (
    <div className="glass-soft rounded-2xl p-4" data-testid={testid}>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold", TEXT[b])}>{value}</p>
      <div className="mt-2 h-1.5 rounded-full bg-border">
        <div className={cn("h-1.5 rounded-full transition-all duration-700", BAR[b])} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function RiskScores({ patient }: { patient: Patient }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="risk-scores">
      <RiskScore label="Drop-off risk" value={patient.risk} testid="score-dropoff" />
      <RiskScore label="Financial risk" value={patient.financialRisk} testid="score-financial" />
      <RiskScore label="Medication risk" value={patient.medicationRisk} testid="score-medication" />
      <RiskScore label="Recovery risk" value={patient.recoveryRisk} testid="score-recovery" />
    </div>
  );
}
