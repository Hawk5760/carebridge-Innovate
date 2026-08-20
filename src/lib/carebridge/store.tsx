import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { buildPatients } from "./seed";
import type { HospitalUser, Patient } from "./types";

const KEY = "carebridge-state-v1";

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

const defaultState = (): State => ({ patients: buildPatients(), hospitalUser: null, patientId: null });

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

/** Recompute care score + risk from live signals — the "AI" engine. */
export function recompute(p: Patient): Patient {
  const medTotal = p.medicines.length || 1;
  const medTaken = p.medicines.filter((m) => m.taken).length;
  const medication = Math.round((medTaken / medTotal) * 100);
  const testsTotal = p.tests.length || 1;
  const testsDone = p.tests.filter((t) => t.status === "completed").length;
  const tests = Math.round((testsDone / testsTotal) * 100);
  const apptTotal = p.appointments.length || 1;
  const apptOk = p.appointments.filter((a) => a.status !== "missed").length;
  const appointment = Math.round((apptOk / apptTotal) * 100);
  const tasksTotal = p.tasks.length || 1;
  const engagement = Math.round((p.tasks.filter((t) => t.done).length / tasksTotal) * 100);

  const careScore = Math.round((appointment + medication + tests + engagement) / 4);

  const factors = [
    { label: "Appointment missed", points: p.appointments.some((a) => a.status === "missed") ? 25 : 0 },
    { label: "Medication adherence declining", points: medication < 70 ? 20 : 0 },
    { label: "Reminders ignored", points: p.lastActiveDays >= 3 ? 15 : 0 },
    { label: "Long travel distance", points: p.barriers.includes("Transportation") ? 10 : 0 },
    { label: "Financial difficulty", points: p.barriers.includes("Cost") ? 15 : 0 },
    { label: "Pending lab test", points: tests < 50 ? 10 : 0 },
  ].filter((f) => f.points > 0);

  const risk = Math.min(97, factors.reduce((a, f) => a + f.points, 0) + Math.max(0, 40 - careScore / 2));
  const trend = [...p.scoreTrend.slice(-3), careScore];

  return {
    ...p,
    breakdown: { appointment, medication, tests, engagement },
    careScore,
    scoreTrend: trend,
    riskFactors: factors,
    risk: Math.round(risk),
    nextAction: risk >= 85 ? "Staff Alert" : risk >= 70 ? "Call" : risk >= 45 ? "WhatsApp" : "Monitor",
  };
}
