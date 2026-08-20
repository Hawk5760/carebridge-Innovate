import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Bus, CircleDollarSign, FlaskConical, Pill, ShieldCheck, Video } from "lucide-react";
import { GlassCard, SectionTitle, Stat } from "@/components/cb/glass";
import { AIInsight } from "@/components/cb/ai-panel";
import { usePatient, useStore } from "@/lib/carebridge/store";
import { costSummary, inr } from "@/lib/carebridge/metrics";
import { aiCostAlert } from "@/lib/carebridge/ai";

export const Route = createFileRoute("/patient/_dash/cost")({
  head: () => ({
    meta: [
      { title: "Cost Insights — CareBridge" },
      { name: "description", content: "See what your care may cost and how to save with teleconsultation and insurance." },
    ],
  }),
  component: PatientCost,
});

function PatientCost() {
  const { patientId } = useStore();
  const patient = usePatient(patientId);
  if (!patient) return null;

  const c = patient.costs;
  const s = costSummary(patient);
  const nextTest = patient.tests.find((t) => t.status !== "completed");

  return (
    <div className="space-y-5">
      <SectionTitle sub="A clear picture of your healthcare spending — and where you can save.">
        Cost Insights
      </SectionTitle>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Next appointment" value={inr(c.consultationFee)} sub="Consultation fee" icon={<CircleDollarSign className="h-5 w-5" />} />
        <Stat label="Travel cost" value={inr(c.travelCost)} sub={`${patient.location} · ${patient.distanceKm} km`} icon={<Bus className="h-5 w-5" />} />
        <Stat label="Medicine refill" value={inr(c.medicineRefillCost)} sub="Estimated this month" icon={<Pill className="h-5 w-5" />} />
        <Stat label="Upcoming tests" value={inr(c.testCost)} sub={nextTest ? nextTest.name : "No tests due"} icon={<FlaskConical className="h-5 w-5" />} />
        <Stat label="Total (next 30 days)" value={inr(s.total30)} sub="Expected healthcare spend" icon={<CircleDollarSign className="h-5 w-5" />} />
        <Stat label="Est. out-of-pocket" value={inr(s.outOfPocket)} sub={`After ${c.insuranceCoveragePct}% insurance`} icon={<ShieldCheck className="h-5 w-5" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <SectionTitle sub="Choosing teleconsultation when clinically suitable can save you money.">
            Physical visit vs Teleconsultation
          </SectionTitle>
          <div className="flex items-center justify-between gap-3">
            <div className="glass-soft flex-1 rounded-2xl p-4 text-center">
              <p className="text-xs text-muted-foreground">Physical visit</p>
              <p className="mt-1 text-2xl font-semibold" data-testid="cost-physical">{inr(s.physicalVisit)}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">fee + travel + time off</p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1 rounded-2xl bg-primary/15 p-4 text-center">
              <p className="flex items-center justify-center gap-1 text-xs text-primary"><Video className="h-3.5 w-3.5" /> Teleconsult</p>
              <p className="mt-1 text-2xl font-semibold text-primary" data-testid="cost-tele">{inr(s.teleconsult)}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">from home</p>
            </div>
          </div>
          {s.teleSavings > 0 ? (
            <div className="mt-4 rounded-2xl bg-success/15 px-4 py-3 text-sm font-semibold text-success" data-testid="cost-savings">
              💚 You could save {inr(s.teleSavings)} by choosing a teleconsultation.
            </div>
          ) : null}
        </GlassCard>

        <GlassCard>
          <SectionTitle sub="Your insurance and what you pay.">Insurance coverage</SectionTitle>
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Coverage</span>
            <span className="font-semibold" data-testid="cost-insurance-pct">
              {c.insuranceCoveragePct > 0 ? `${c.insuranceCoveragePct}% covered` : "No active insurance"}
            </span>
          </div>
          <div className="h-3 rounded-full bg-border">
            <div className="h-3 rounded-full bg-primary transition-all duration-700" style={{ width: `${c.insuranceCoveragePct}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="glass-soft rounded-2xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Insurance pays</p>
              <p className="mt-1 text-lg font-semibold text-success">{inr(s.covered)}</p>
            </div>
            <div className="glass-soft rounded-2xl p-3 text-center">
              <p className="text-xs text-muted-foreground">You pay</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{inr(s.outOfPocket)}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <AIInsight
        testid="patient-ai-cost"
        title="AI affordability alert"
        sub="Personalised tips to reduce what you spend on your care."
        cta="Get cost tips"
        run={() =>
          aiCostAlert(patient, {
            physicalVisit: s.physicalVisit,
            teleconsult: s.teleconsult,
            teleSavings: s.teleSavings,
            outOfPocket: s.outOfPocket,
          })
        }
      />
    </div>
  );
}
