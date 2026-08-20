import type { Medicine, Patient } from "./types";

export type RefillStatus = "active" | "due-soon" | "overdue";

export interface RefillInfo {
  daysLeft: number;
  status: RefillStatus;
}

export function refillState(m: Medicine): RefillInfo {
  const perDay = m.perDay > 0 ? m.perDay : 1;
  const daysLeft = Math.floor(m.quantity / perDay);
  const status: RefillStatus = daysLeft <= 0 ? "overdue" : daysLeft <= 5 ? "due-soon" : "active";
  return { daysLeft, status };
}

export const REFILL_LABEL: Record<RefillStatus, string> = {
  active: "Active",
  "due-soon": "Refill Due Soon",
  overdue: "Overdue",
};

export interface CostSummary {
  physicalVisit: number;
  teleconsult: number;
  teleSavings: number;
  total30: number;
  covered: number;
  outOfPocket: number;
}

export function costSummary(p: Patient): CostSummary {
  const c = p.costs;
  const physicalVisit = c.consultationFee + c.travelCost + c.lostWagesCost;
  const teleconsult = c.teleconsultFee;
  const teleSavings = Math.max(0, physicalVisit - teleconsult);
  const total30 = c.consultationFee + c.travelCost + c.lostWagesCost + c.medicineRefillCost + c.testCost;
  const outOfPocket = Math.round(total30 * (1 - c.insuranceCoveragePct / 100));
  const covered = total30 - outOfPocket;
  return { physicalVisit, teleconsult, teleSavings, total30, covered, outOfPocket };
}

export type CostBand = "high" | "medium" | "low";

export function costBand(financialRisk: number): CostBand {
  if (financialRisk >= 66) return "high";
  if (financialRisk >= 40) return "medium";
  return "low";
}

/** Refill compliance % across a patient's active medicines. */
export function refillCompliance(p: Patient): number {
  if (p.medicines.length === 0) return 100;
  const ok = p.medicines.filter((m) => refillState(m).status === "active").length;
  return Math.round((ok / p.medicines.length) * 100);
}

export function inr(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

/** Escalation rules — which caregiver-escalation triggers a patient currently matches. */
export function detectTriggers(p: Patient): string[] {
  const t: string[] = [];
  const overdue = p.medicines.some((m) => refillState(m).status === "overdue");
  if (p.breakdown.medication < 50) t.push("Missed medicine for 2 consecutive days");
  if (p.appointments.some((a) => a.status === "missed")) t.push("Missed follow-up appointment");
  if (p.tests.some((x) => x.status === "pending") && p.risk >= 70) t.push("Missed critical diagnostic test");
  if (p.lastActiveDays >= 7 && p.risk >= 70) t.push("High-risk patient inactive for 7 days");
  if (overdue) t.push("Prescription refill overdue");
  return t;
}
