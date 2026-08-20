export type RiskBand = "low" | "medium" | "high" | "critical";

export interface RiskFactor {
  label: string;
  points: number;
}

export interface Medicine {
  id: string;
  name: string;
  dose: string;
  time: string;
  taken: boolean;
  takenAt?: string;
}

export interface CareTask {
  id: string;
  label: string;
  done: boolean;
}

export interface LabTest {
  id: string;
  name: string;
  due: string;
  status: "pending" | "booked" | "completed";
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  status: "upcoming" | "confirmed" | "missed" | "completed" | "rescheduled";
}

export interface MessageItem {
  id: string;
  from: "care-team" | "patient" | "ai";
  text: string;
  at: string;
}

export interface InterventionLog {
  id: string;
  stage: number;
  channel: string;
  note: string;
  at: string;
  resolved: boolean;
}

export interface Diagnosis {
  id: string;
  date: string;
  doctor: string;
  summary: string;
  notes?: string;
  appointmentId?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  condition: string;
  diagnosedOn: string;
  coordinator: string;
  risk: number;
  riskFactors: RiskFactor[];
  careScore: number;
  scoreTrend: number[];
  breakdown: { appointment: number; medication: number; tests: number; engagement: number };
  barriers: string[];
  lastActiveDays: number;
  revenueAtRisk: number;
  nextAction: "Call" | "WhatsApp" | "Staff Alert" | "Monitor";
  medicines: Medicine[];
  tasks: CareTask[];
  tests: LabTest[];
  appointments: Appointment[];
  messages: MessageItem[];
  interventions: InterventionLog[];
  diagnoses?: Diagnosis[];
  caregiver?: { name: string; relation: string; phone: string; consent: boolean };
}

export type HospitalRole = "Admin" | "Doctor" | "Care Coordinator" | "Nurse";

export interface HospitalUser {
  email: string;
  name: string;
  role: HospitalRole;
}

export const ROLE_ACCESS: Record<HospitalRole, string[]> = {
  Admin: [
    "overview",
    "patients",
    "high-risk",
    "follow-ups",
    "medications",
    "interventions",
    "analytics",
    "revenue",
    "settings",
  ],
  Doctor: ["overview", "patients", "high-risk", "follow-ups", "analytics"],
  "Care Coordinator": ["overview", "patients", "high-risk", "follow-ups", "interventions", "analytics"],
  Nurse: ["overview", "patients", "medications", "follow-ups"],
};

export function riskBand(risk: number): RiskBand {
  if (risk >= 85) return "critical";
  if (risk >= 70) return "high";
  if (risk >= 45) return "medium";
  return "low";
}
