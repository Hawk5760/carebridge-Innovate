import type { Patient } from "./types";

const conditions = [
  "Type 2 Diabetes",
  "Hypertension",
  "Heart Disease",
  "Post-Surgery Care",
  "Tuberculosis",
  "Chronic Kidney Disease",
];
const coordinators = ["Meera Nair", "Arun Verma", "Sana Qureshi", "Vikram Rao"];
const names = [
  "Rahul Sharma", "Priya Menon", "Amit Deshmukh", "Kavya Iyer", "Rohit Bansal",
  "Neha Kulkarni", "Imran Shaikh", "Divya Pillai", "Suresh Reddy", "Anjali Gupta",
  "Manoj Tiwari", "Farhan Ali", "Ritu Chawla", "Vivek Anand", "Sneha Joshi",
  "Karan Mehta", "Pooja Rana", "Deepak Nair", "Ayesha Khan", "Sanjay Patil",
  "Nisha Agarwal", "Harish Kumar", "Meenakshi Rao", "Tarun Sethi",
];

const barrierPool = ["Cost", "Transportation", "Busy schedule", "Side effects", "Feeling better", "Fear/anxiety"];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

function factorsFor(r: number, barriers: string[]) {
  const f = [
    { label: "Appointment missed", points: r > 60 ? 25 : 5 },
    { label: "Medication adherence declining", points: r > 50 ? 20 : 6 },
    { label: "Reminders ignored", points: r > 70 ? 15 : 4 },
    { label: "Long travel distance", points: barriers.includes("Transportation") ? 10 : 0 },
    { label: "Financial difficulty", points: barriers.includes("Cost") ? 15 : 0 },
  ];
  return f.filter((x) => x.points > 0);
}

export function buildPatients(): Patient[] {
  const rand = rng(42);
  return names.map((name, i) => {
    const risk = Math.round(20 + rand() * 75);
    const condition = conditions[i % conditions.length];
    const barriers = barrierPool.filter(() => rand() > 0.72).slice(0, 2);
    const appointment = Math.round(55 + rand() * 45);
    const medication = Math.round(45 + rand() * 55);
    const tests = Math.round(40 + rand() * 60);
    const engagement = Math.round(45 + rand() * 55);
    const careScore = Math.round((appointment + medication + tests + engagement) / 4);
    const id = name.toLowerCase().split(" ")[0];
    return {
      id,
      name,
      age: 28 + Math.round(rand() * 45),
      phone: `98${(10000000 + Math.floor(rand() * 89999999)).toString()}`,
      condition,
      diagnosedOn: "10 Aug 2026",
      coordinator: coordinators[i % coordinators.length],
      risk,
      riskFactors: factorsFor(risk, barriers),
      careScore,
      scoreTrend: [careScore - 12, careScore - 5, careScore - 8, careScore],
      breakdown: { appointment, medication, tests, engagement },
      barriers,
      lastActiveDays: Math.round(rand() * 9),
      revenueAtRisk: 4000 + Math.round(rand() * 26000),
      nextAction: risk >= 85 ? "Staff Alert" : risk >= 70 ? "Call" : risk >= 45 ? "WhatsApp" : "Monitor",
      medicines: [
        { id: `${id}-m1`, name: "Metformin", dose: "500 mg", time: "8:00 AM", taken: true, takenAt: "8:04 AM" },
        { id: `${id}-m2`, name: "Amlodipine", dose: "5 mg", time: "8:00 PM", taken: false },
      ],
      tasks: [
        { id: `${id}-t1`, label: "Morning medicine", done: true },
        { id: `${id}-t2`, label: "Check blood sugar", done: true },
        { id: `${id}-t3`, label: "Drink 3L water", done: false },
        { id: `${id}-t4`, label: "Confirm follow-up", done: false },
      ],
      tests: [
        { id: `${id}-l1`, name: "HbA1c", due: "10 Sep 2026", status: "pending" },
        { id: `${id}-l2`, name: "Lipid Profile", due: "18 Sep 2026", status: "booked" },
      ],
      appointments: [
        { id: `${id}-a1`, date: "15 Sep 2026", time: "10:30 AM", doctor: "Dr. Sharma", status: "upcoming" },
        { id: `${id}-a0`, date: "12 Aug 2026", time: "11:00 AM", doctor: "Dr. Sharma", status: "completed" },
      ],
      messages: [
        {
          id: `${id}-msg1`,
          from: "ai",
          text: `${name.split(" ")[0]}, your follow-up is due soon. Would you like a teleconsultation instead of travelling?`,
          at: "2 days ago",
        },
      ],
      interventions: [],
      caregiver:
        i % 3 === 0
          ? { name: "Ananya", relation: "Daughter", phone: "9876543210", consent: true }
          : undefined,
    } satisfies Patient;
  });
}

export const DEMO_PATIENT_PHONE = "9876500001";
