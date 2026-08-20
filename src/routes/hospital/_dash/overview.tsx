import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CalendarCheck, IndianRupee, Users, XCircle, ShieldAlert } from "lucide-react";
import { Bar, GlassCard, RiskPill, SectionTitle, Stat } from "@/components/cb/glass";
import { useStore } from "@/lib/carebridge/store";

export const Route = createFileRoute("/hospital/_dash/overview")({
  head: () => ({
    meta: [
      { title: "Today's Care Overview — CareBridge AI" },
      { name: "description", content: "Live view of active patients, high-risk cases, follow-ups and revenue at risk." },
      { property: "og:title", content: "Hospital Overview — CareBridge AI" },
      { property: "og:description", content: "Active patients, drop-off risk distribution and today's follow-ups." },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { patients } = useStore();
  const high = patients.filter((p) => p.risk >= 70);
  const medium = patients.filter((p) => p.risk >= 45 && p.risk < 70);
  const low = patients.filter((p) => p.risk < 45);
  const total = patients.length || 1;
  const revenueAtRisk = high.reduce((a, p) => a + p.revenueAtRisk, 0);

  return (
    <div className="space-y-5">
      <SectionTitle sub="Live signals from clinical records, patient app activity and behaviour.">
        Today's Care Overview
      </SectionTitle>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Stat label="Active Patients" value={(12540).toLocaleString("en-IN")} sub="Across all care programmes" icon={<Users className="h-5 w-5" />} />
        <Stat label="High-Risk Patients" value={(1284).toLocaleString("en-IN")} sub={`${high.length} in this cohort`} icon={<ShieldAlert className="h-5 w-5" />} />
        <Stat label="Follow-Ups Today" value="186" sub="Scheduled visits" icon={<CalendarCheck className="h-5 w-5" />} />
        <Stat label="Missed Follow-Ups" value="32" sub="Last 24 hours" icon={<XCircle className="h-5 w-5" />} />
        <Stat label="Patients At Risk" value="247" sub="Rising drop-off signals" icon={<AlertTriangle className="h-5 w-5" />} />
        <Stat
          label="Revenue At Risk"
          value={`₹${(revenueAtRisk / 100000).toFixed(1)} L`}
          sub="Estimated from service economics"
          icon={<IndianRupee className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <SectionTitle sub="Share of monitored patients by drop-off risk band.">Patient Risk Distribution</SectionTitle>
          <div className="space-y-4">
            <Bar label="Low" value={Math.round((low.length / total) * 100)} />
            <Bar label="Medium" value={Math.round((medium.length / total) * 100)} />
            <Bar label="High" value={Math.round((high.length / total) * 100)} />
          </div>
        </GlassCard>

        <GlassCard>
          <SectionTitle sub="AI says these patients need attention today.">Priority queue</SectionTitle>
          <ul className="space-y-2">
            {[...patients]
              .sort((a, b) => b.risk - a.risk)
              .slice(0, 5)
              .map((p) => (
                <li key={p.id}>
                  <Link
                    to="/hospital/patient/$id"
                    params={{ id: p.id }}
                    className="glass-soft flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition hover:bg-glass-strong"
                  >
                    <span>
                      <span className="font-medium">{p.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{p.condition}</span>
                    </span>
                    <RiskPill risk={p.risk} />
                  </Link>
                </li>
              ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
