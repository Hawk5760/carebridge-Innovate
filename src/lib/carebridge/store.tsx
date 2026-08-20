import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { buildPatients } from "./seed";
import type { HospitalUser, Patient, RiskFactor } from "./types";
import { costSummary, refillState } from "./metrics";

const KEY = "carebridge-state-v2";

interface State {
  patients: Patient[];
  hospitalUser: HospitalUser | null;
  patientId: string | null;
}

interface Ctx extends State {
  hydrated: boolean;
  hospitalLogin: (u: HospitalUser) => void;
  hospitalLogout: () => void;
  patientLogin: (id: string) => void;
  patientLogout: () => void;
  update: (id: string, fn: (p: Patient) => Patient) => void;
  reset: () => void;
}

const defaultState = (): State => ({ patients: buildPatients().map(recompute), hospitalUser: null, patientId: null });

const StoreContext = createContext<Ctx | null>(null);

export function CareBridgeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw) as State);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const update = useCallback((id: string, fn: (p: Patient) => Patient) => {
    setState((s) => ({ ...s, patients: s.patients.map((p) => (p.id === id ? fn(p) : p)) }));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      hydrated,
      update,
      hospitalLogin: (u) => setState((s) => ({ ...s, hospitalUser: u })),
      hospitalLogout: () => setState((s) => ({ ...s, hospitalUser: null })),
      patientLogin: (id) => setState((s) => ({ ...s, patientId: id })),
      patientLogout: () => setState((s) => ({ ...s, patientId: null })),
      reset: () => setState(defaultState()),
    }),
    [state, hydrated, update],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside CareBridgeProvider");
  return ctx;
}

export function usePatient(id: string | null | undefined) {
  const { patients } = useStore();
  return patients.find((p) => p.id === id) ?? null;
}

/** Recompute care score + all risk scores from live signals — the "AI" engine. */
export function recompute(p: Patient): Patient {
  const medTotal = p.medicines.length || 1;
  const medTaken = p.medicines.filter((m) => m.taken).length;
  const medication = Math.round((medTaken / medTotal) * 100);
  const testsTotal = p.tests.length || 1;
  const testsDone = p.tests.filter((t) => t.status === "completed").length;
  const tests = Math.round((testsDone / testsTotal) * 100);
  const apptTotal = p.appointments.length || 1;
  const missedAppts = p.appointments.filter((a) => a.status === "missed").length;
  const apptOk = p.appointments.filter((a) => a.status !== "missed").length;
  const appointment = Math.round((apptOk / apptTotal) * 100);
  const tasksTotal = p.tasks.length || 1;
  const engagement = Math.round((p.tasks.filter((t) => t.done).length / tasksTotal) * 100);

  const careScore = Math.round((appointment + medication + tests + engagement) / 4);

  const overdue = p.medicines.filter((m) => refillState(m).status === "overdue");
  const dueSoon = p.medicines.filter((m) => refillState(m).status === "due-soon");
  const worstOverdueDays = overdue.reduce((mx, m) => Math.max(mx, -refillState(m).daysLeft), 0);

  const hasCaregiver = !!(p.caregiver && p.caregiver.consent);
  const cost = costSummary(p);
  const costBarrier = p.barriers.includes("Cost");

  const medicationRisk = clamp((100 - medication) * 0.6 + overdue.length * 22 + dueSoon.length * 8);
  const financialRisk = clamp(cost.outOfPocket / 60 + (costBarrier ? 28 : 0) + (p.costs.insuranceCoveragePct < 50 ? 15 : 0));
  const planProgress = p.carePlan?.active ? p.carePlan.progress : p.carePlan ? 0 : tests;
  const recoveryRisk = clamp((100 - planProgress) * 0.5 + (100 - tests) * 0.3 + missedAppts * 20 - (hasCaregiver ? 8 : 0));

  const factors: RiskFactor[] = [];
  if (missedAppts > 0) factors.push({ label: `Missed ${missedAppts} appointment${missedAppts > 1 ? "s" : ""}`, points: 12 + missedAppts * 8 });
  if (medication < 70) factors.push({ label: "Medication adherence declining", points: 20 });
  if (overdue.length > 0) factors.push({ label: `Refill overdue by ${worstOverdueDays} day${worstOverdueDays !== 1 ? "s" : ""}`, points: 18 });
  else if (dueSoon.length > 0) factors.push({ label: "Refill due soon", points: 8 });
  if (engagement < 60) factors.push({ label: `Engagement low (${engagement}%)`, points: 15 });
  if (p.lastActiveDays >= 7) factors.push({ label: `Inactive for ${p.lastActiveDays} days`, points: 16 });
  else if (p.lastActiveDays >= 3) factors.push({ label: "Reminders ignored", points: 10 });
  if (costBarrier || financialRisk >= 66) factors.push({ label: "High financial burden", points: 15 });
  if (p.barriers.includes("Transportation")) factors.push({ label: "Long travel distance", points: 10 });
  if (tests < 50) factors.push({ label: "Pending lab test", points: 10 });
  if (!hasCaregiver) factors.push({ label: "No caregiver assigned", points: 10 });
  if (p.carePlan && !p.carePlan.active) factors.push({ label: "Care plan not started", points: 14 });

  const risk = clamp(factors.reduce((a, f) => a + f.points, 0) * 0.7 + Math.max(0, 40 - careScore / 2), 97);
  const trend = [...p.scoreTrend.slice(-3), careScore];

  return {
    ...p,
    breakdown: { appointment, medication, tests, engagement },
    careScore,
    scoreTrend: trend,
    riskFactors: factors,
    risk,
    financialRisk,
    medicationRisk,
    recoveryRisk,
    nextAction: risk >= 85 ? "Staff Alert" : risk >= 70 ? "Call" : risk >= 45 ? "WhatsApp" : "Monitor",
  };
}

function clamp(n: number, max = 100): number {
  return Math.max(0, Math.min(max, Math.round(n)));
}
