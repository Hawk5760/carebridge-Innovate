import type { Patient } from "./types";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = "AI request failed";
    try {
      const j = (await res.json()) as { detail?: string };
      if (j.detail) detail = j.detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return (await res.json()) as T;
}

export async function aiRiskExplanation(p: Patient): Promise<string> {
  const { text } = await post<{ text: string }>("/api/ai/risk-explanation", {
    name: p.name,
    age: p.age,
    condition: p.condition,
    risk: p.risk,
    careScore: p.careScore,
    riskFactors: p.riskFactors,
    barriers: p.barriers,
  });
  return text;
}

export async function aiInterventionMessage(p: Patient, channel: string): Promise<string> {
  const { text } = await post<{ text: string }>("/api/ai/intervention-message", {
    name: p.name,
    condition: p.condition,
    channel,
    risk: p.risk,
    barriers: p.barriers,
  });
  return text;
}

export async function aiCareInsight(p: Patient): Promise<string> {
  const missedMedicines = p.medicines.filter((m) => !m.taken).length;
  const pendingTasks = p.tasks.filter((t) => !t.done).length;
  const firstName = p.name.split(" ")[0] ?? p.name;
  const { text } = await post<{ text: string }>("/api/ai/care-insight", {
    name: firstName,
    condition: p.condition,
    careScore: p.careScore,
    barriers: p.barriers,
    missedMedicines,
    pendingTasks,
  });
  return text;
}

export async function aiCostAlert(p: Patient, cost: {
  physicalVisit: number;
  teleconsult: number;
  teleSavings: number;
  outOfPocket: number;
}): Promise<string> {
  const firstName = p.name.split(" ")[0] ?? p.name;
  const nextTest = p.tests.find((t) => t.status !== "completed");
  const { text } = await post<{ text: string }>("/api/ai/cost-alert", {
    name: firstName,
    condition: p.condition,
    physicalVisit: cost.physicalVisit,
    teleconsult: cost.teleconsult,
    teleSavings: cost.teleSavings,
    insuranceCoveragePct: p.costs.insuranceCoveragePct,
    testName: nextTest?.name,
    testCost: nextTest?.cost,
    outOfPocket: cost.outOfPocket,
  });
  return text;
}

export async function aiEscalationMessage(p: Patient, trigger: string): Promise<string> {
  const firstName = p.name.split(" ")[0] ?? p.name;
  const { text } = await post<{ text: string }>("/api/ai/escalation-message", {
    name: firstName,
    caregiverName: p.caregiver?.name ?? "there",
    relation: p.caregiver?.relation ?? "family member",
    trigger,
    condition: p.condition,
  });
  return text;
}

export interface DischargePlan {
  diagnosis: string;
  medications: { name: string; dose: string; time: string; perDay: number; quantity: number }[];
  appointments: { date: string; doctor: string }[];
  tests: { name: string; due: string }[];
  recoveryInstructions: string[];
  riskFactors: string[];
}

export async function aiDischargeAnalysis(text: string, patientName?: string): Promise<DischargePlan> {
  return post<DischargePlan>("/api/ai/discharge-analysis", { text, patientName });
}
