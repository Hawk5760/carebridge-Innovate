import type { CarePlan, Escalation, Patient } from "./types";

const conditions = [
  "Type 2 Diabetes",
  "Hypertension",
  "Heart Disease",
  "Post-Surgery Care",
  "Tuberculosis",
  "Chronic Kidney Disease",
];
const coordinators = ["Meera Nair", "Arun Verma", "Sana Qureshi", "Vikram Rao"];
const locations = ["Andheri", "Thane", "Navi Mumbai", "Borivali", "Dadar", "Kalyan", "Vashi", "Bandra"];
const names = [
  "Rahul Sharma", "Priya Menon", "Amit Deshmukh", "Kavya Iyer", "Rohit Bansal",
  "Neha Kulkarni", "Imran Shaikh", "Divya Pillai", "Suresh Reddy", "Anjali Gupta",
  "Manoj Tiwari", "Farhan Ali", "Ritu Chawla", "Vivek Anand", "Sneha Joshi",
  "Karan Mehta", "Pooja Rana", "Deepak Nair", "Ayesha Khan", "Sanjay Patil",
  "Nisha Agarwal", "Harish Kumar", "Meenakshi Rao", "Tarun Sethi",
];

const barrierPool = ["Cost", "Transportation", "Busy schedule", "Side effects", "Feeling better", "Fear/anxiety"];
const insuranceTiers = [0, 50, 70, 80, 90];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

const r50 = (n: number) => Math.round(n / 50) * 50;

export function buildPatients(): Patient[] {
  const rand = rng(42);
  return names.map((name, i) => {
    const risk = Math.round(20 + rand() * 75);
    const condition = conditions[i % conditions.length]!;
    const barriers = barrierPool.filter(() => rand() > 0.72).slice(0, 2);
    const appointment = Math.round(55 + rand() * 45);
    const medication = Math.round(45 + rand() * 55);
    const tests = Math.round(40 + rand() * 60);
    const engagement = Math.round(45 + rand() * 55);
    const careScore = Math.round((appointment + medication + tests + engagement) / 4);
    const id = name.toLowerCase().split(" ")[0]!;
    const distanceKm = Math.round(3 + rand() * 42);
    const consultationFee = r50(500 + rand() * 1200);
    const insuranceCoveragePct = insuranceTiers[Math.floor(rand() * insuranceTiers.length)]!;
    const lastActiveDays = Math.round(rand() * 9);

    // refill quantities engineered for a realistic mix of active / due-soon / overdue
    const qtyPool = [0, 2, 3, 4, 9, 12, 18, 25];
    const q1 = qtyPool[Math.floor(rand() * qtyPool.length)]!;
    const q2 = qtyPool[Math.floor(rand() * qtyPool.length)]!;

    const hasCaregiver = i % 3 === 0;
    const caregiver = hasCaregiver
      ? { name: "Ananya Sharma", relation: "Daughter", phone: "9876543210", consent: true, email: "ananya@example.com" }
      : undefined;

    // care plan: some discharged+active, some discharged+not-started, rest none
    let carePlan: CarePlan | undefined;
    if (i % 3 === 0) {
      const progress = Math.round(20 + rand() * 60);
      carePlan = {
        active: true,
        startedOn: "12 Aug 2026",
        progress,
        discharge: {
          uploaded: true,
          uploadedOn: "11 Aug 2026",
          diagnosis: `${condition} — stable at discharge`,
          recoveryInstructions: ["Rest for 7 days", "Low-salt diet", "Daily 15-min walk", "Monitor symptoms"],
          riskFactors: ["Readmission risk", ...(barriers.includes("Cost") ? ["Financial burden"] : [])],
        },
        milestones: [
          { id: `${id}-ms1`, label: "Start prescribed medication", category: "medication", done: progress > 20, due: "13 Aug 2026" },
          { id: `${id}-ms2`, label: "First follow-up call", category: "appointment", done: progress > 40, due: "18 Aug 2026" },
          { id: `${id}-ms3`, label: "Complete blood test", category: "test", done: progress > 60, due: "25 Aug 2026" },
          { id: `${id}-ms4`, label: "Review appointment", category: "appointment", done: progress > 80, due: "10 Sep 2026" },
          { id: `${id}-ms5`, label: "Recovery check-in", category: "recovery", done: false, due: "20 Sep 2026" },
        ],
      };
    } else if (i % 3 === 1) {
      carePlan = {
        active: false,
        progress: 0,
        discharge: {
          uploaded: true,
          uploadedOn: "11 Aug 2026",
          diagnosis: `${condition} — discharged, plan pending activation`,
          recoveryInstructions: ["Awaiting onboarding"],
          riskFactors: ["Onboarding not started"],
        },
        milestones: [],
      };
    }

    const escalations: Escalation[] = risk > 70 && hasCaregiver
      ? [
          {
            id: `${id}-esc1`,
            trigger: "Missed medicine for 2 consecutive days",
            message: `Hi Ananya, ${name.split(" ")[0]} has missed medication for 2 days. A gentle reminder from you could really help.`,
            at: "1 day ago",
            status: "pending",
            caregiver: "Ananya Sharma",
          },
        ]
      : [];

    return {
      id,
      name,
      age: 28 + Math.round(rand() * 45),
      phone: `98${(10000000 + Math.floor(rand() * 89999999)).toString()}`,
      condition,
      diagnosedOn: "10 Aug 2026",
      coordinator: coordinators[i % coordinators.length]!,
      location: locations[i % locations.length]!,
      distanceKm,
      risk,
      financialRisk: 0,
      medicationRisk: 0,
      recoveryRisk: 0,
      riskFactors: [],
      careScore,
      scoreTrend: [careScore - 12, careScore - 5, careScore - 8, careScore],
      breakdown: { appointment, medication, tests, engagement },
      barriers,
      lastActiveDays,
      revenueAtRisk: 4000 + Math.round(rand() * 26000),
      nextAction: "Monitor",
      costs: {
        consultationFee,
        teleconsultFee: r50(consultationFee * 0.35),
        travelCost: r50(distanceKm * 12 + rand() * 120),
        lostWagesCost: r50(200 + rand() * 700),
        medicineRefillCost: r50(300 + rand() * 1000),
        testCost: r50(400 + rand() * 1800),
        insuranceCoveragePct,
      },
      medicines: [
        {
          id: `${id}-m1`, name: "Metformin", dose: "500 mg", time: "8:00 AM", taken: true, takenAt: "8:04 AM",
          quantity: q1, perDay: 2, refillsLeft: 2, adherenceTrend: [88, 82, 76, medication],
        },
        {
          id: `${id}-m2`, name: "Amlodipine", dose: "5 mg", time: "8:00 PM", taken: false,
          quantity: q2, perDay: 1, refillsLeft: 1, adherenceTrend: [70, 66, 60, Math.max(30, medication - 12)],
        },
      ],
      tasks: [
        { id: `${id}-t1`, label: "Morning medicine", done: true },
        { id: `${id}-t2`, label: "Check blood sugar", done: true },
        { id: `${id}-t3`, label: "Drink 3L water", done: false },
        { id: `${id}-t4`, label: "Confirm follow-up", done: false },
      ],
      tests: [
        { id: `${id}-l1`, name: "HbA1c", due: "10 Sep 2026", status: "pending", cost: 650, insuredPct: insuranceCoveragePct },
        { id: `${id}-l2`, name: "Lipid Profile", due: "18 Sep 2026", status: "booked", cost: 900, insuredPct: insuranceCoveragePct },
      ],
      appointments: [
        { id: `${id}-a1`, date: "15 Sep 2026", time: "10:30 AM", doctor: "Dr. Sharma", status: risk > 75 ? "missed" : "upcoming" },
        { id: `${id}-a0`, date: "12 Aug 2026", time: "11:00 AM", doctor: "Dr. Sharma", status: "completed" },
      ],
      messages: [
        {
          id: `${id}-msg1`,
          from: "ai",
          text: `${name.split(" ")[0]!}, your follow-up is due soon. Would you like a teleconsultation instead of travelling?`,
          at: "2 days ago",
        },
      ],
      interventions: [],
      diagnoses: [],
      caregiver,
      emergencyContacts: hasCaregiver
        ? [{ id: `${id}-ec1`, name: "Ananya Sharma", relation: "Daughter", phone: "9876543210" }]
        : [],
      escalations,
      carePlan,
    } satisfies Patient;
  });
}

export const DEMO_PATIENT_PHONE = "9876500001";
