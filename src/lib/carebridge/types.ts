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
  quantity: number; // tablets/capsules remaining
  perDay: number; // consumed per day
  refillsLeft: number; // prescribed refills remaining
  refillRequested?: boolean;
  adherenceTrend: number[]; // % adherence over recent weeks
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
  cost: number;
  insuredPct: number;
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

export interface CostEstimate {
  consultationFee: number;
  teleconsultFee: number;
  travelCost: number;
  lostWagesCost: number;
  medicineRefillCost: number;
  testCost: number;
  insuranceCoveragePct: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface Caregiver {
  name: string;
  relation: string;
  phone: string;
  consent: boolean;
  email?: string;
}

export interface Escalation {
  id: string;
  trigger: string;
  message: string;
  at: string;
  status: "pending" | "acknowledged" | "resolved";
  caregiver?: string;
}

export interface CarePlanMilestone {
  id: string;
  label: string;
  category: "medication" | "appointment" | "test" | "recovery";
  done: boolean;
  due: string;
}

export interface DischargeSummary {
  uploaded: boolean;
  uploadedOn?: string;
  rawText?: string;
  diagnosis?: string;
  recoveryInstructions?: string[];
  riskFactors?: string[];
}

export interface CarePlan {
  active: boolean;
  startedOn?: string;
  progress: number;
  milestones: CarePlanMilestone[];
  discharge?: DischargeSummary;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  condition: string;
  diagnosedOn: string;
  coordinator: string;
  location: string;
  distanceKm: number;
  risk: number; // drop-off risk 0-100
  financialRisk: number;
  medicationRisk: number;
  recoveryRisk: number;
  riskFactors: RiskFactor[];
  careScore: number;
  scoreTrend: number[];
  breakdown: { appointment: number; medication: number; tests: number; engagement: number };
  barriers: string[];
  lastActiveDays: number;
  revenueAtRisk: number;
  nextAction: "Call" | "WhatsApp" | "Staff Alert" | "Monitor";
  costs: CostEstimate;
  medicines: Medicine[];
  tasks: CareTask[];
  tests: LabTest[];
  appointments: Appointment[];
  messages: MessageItem[];
  interventions: InterventionLog[];
  diagnoses?: Diagnosis[];
  caregiver?: Caregiver;
  emergencyContacts?: EmergencyContact[];
  escalations?: Escalation[];
  carePlan?: CarePlan;
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
    "refills",
    "financial",
    "onboarding",
    "escalations",
    "interventions",
    "analytics",
    "revenue",
    "settings",
  ],
  Doctor: ["overview", "patients", "high-risk", "follow-ups", "onboarding", "refills", "analytics"],
  "Care Coordinator": [
    "overview",
    "patients",
    "high-risk",
    "follow-ups",
    "financial",
    "escalations",
    "onboarding",
    "interventions",
    "analytics",
  ],
  Nurse: ["overview", "patients", "medications", "refills", "follow-ups", "escalations"],
};

export function riskBand(risk: number): RiskBand {
  if (risk >= 85) return "critical";
  if (risk >= 70) return "high";
  if (risk >= 45) return "medium";
  return "low";
}
