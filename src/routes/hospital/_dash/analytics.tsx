import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bar, GlassCard, SectionTitle, Stat } from "@/components/cb/glass";
import { useStore } from "@/lib/carebridge/store";

export const Route = createFileRoute("/hospital/_dash/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — CareBridge AI" },
      { name: "description", content: "Follow-up completion, adherence, drop-off rate and intervention success trends." },
      { property: "og:title", content: "Care Analytics — CareBridge AI" },
      { property: "og:description", content: "Programme-level trends for hospital management." },
    ],
  }),
  component: Analytics,
});

const data = [
  { month: "Jan", completion: 68 },
  { month: "Feb", completion: 71 },
  { month: "Mar", completion: 75 },
  { month: "Apr", completion: 81 },
];

function Analytics() {
  const { patients } = useStore();
  const adherence = Math.round(patients.reduce((a, p) => a + p.breakdown.medication, 0) / (patients.length || 1));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Medication Adherence" value={`${adherence}%`} />
        <Stat label="Drop-Off Rate" value="↓ 19%" sub="vs previous quarter" />
        <Stat label="High-Risk Patients" value="1,284" />
        <Stat label="Intervention Success" value="62%" />
      </div>

      <GlassCard>
        <SectionTitle sub="Monthly follow-up completion rate">Follow-Up Completion</SectionTitle>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis domain={[50, 100]} stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="completion" stroke="var(--color-chart-1)" fill="url(#fill)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard>
        <SectionTitle>Programme health</SectionTitle>
        <div className="space-y-4">
          <Bar label="Follow-up completion" value={81} />
          <Bar label="Medication adherence" value={adherence} />
          <Bar label="Test completion" value={64} />
          <Bar label="Intervention success" value={62} />
        </div>
      </GlassCard>
    </div>
  );
}
