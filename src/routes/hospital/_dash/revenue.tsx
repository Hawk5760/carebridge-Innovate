import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, GlassCard, SectionTitle, Stat } from "@/components/cb/glass";
import { useStore } from "@/lib/carebridge/store";

export const Route = createFileRoute("/hospital/_dash/revenue")({
  head: () => ({
    meta: [
      { title: "Revenue Recovery — CareBridge AI" },
      { name: "description", content: "Estimated revenue recovered from re-engaged patients and completed follow-ups." },
      { property: "og:title", content: "Revenue Recovery — CareBridge AI" },
      { property: "og:description", content: "Measurable financial ROI of preventing care drop-off." },
    ],
  }),
  component: Revenue,
});

function Revenue() {
  const { patients } = useStore();
  const [visitValue, setVisitValue] = useState(2700);
  const recoveredPatients = 420;
  const recoveredAppointments = 680;
  const recovered = recoveredAppointments * visitValue;
  const atRisk = patients.filter((p) => p.risk >= 70).reduce((a, p) => a + p.revenueAtRisk, 0) + 2000000;
  const rate = Math.round((recovered / (recovered + atRisk)) * 100);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Stat label="Patients Recovered" value={recoveredPatients.toLocaleString("en-IN")} />
        <Stat label="Follow-Ups Recovered" value={recoveredAppointments.toLocaleString("en-IN")} />
        <Stat label="Estimated Revenue Recovered" value={`₹${(recovered / 100000).toFixed(1)} L`} sub="Estimated, from your service economics" />
        <Stat label="Revenue At Risk" value={`₹${(atRisk / 100000).toFixed(1)} L`} sub="Estimated" />
        <Stat label="Recovery Rate" value={`${rate}%`} />
      </div>

      <GlassCard>
        <SectionTitle sub="Set your average realised value per follow-up visit to recalculate estimates.">
          Revenue model
        </SectionTitle>
        <label className="block text-sm">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Average value per visit (₹)</span>
          <input
            type="range"
            min={500}
            max={8000}
            step={100}
            value={visitValue}
            onChange={(e) => setVisitValue(Number(e.target.value))}
            className="mt-3 w-full accent-primary"
          />
          <span className="mt-1 block font-semibold">₹{visitValue.toLocaleString("en-IN")}</span>
        </label>
        <div className="mt-5 space-y-4">
          <Bar label="Recovered" value={rate} amount={`₹${(recovered / 100000).toFixed(1)} L`} />
          <Bar label="Still at risk" value={100 - rate} amount={`₹${(atRisk / 100000).toFixed(1)} L`} />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          All figures are estimates derived from recovered appointments × your configured visit economics.
        </p>
      </GlassCard>
    </div>
  );
}
