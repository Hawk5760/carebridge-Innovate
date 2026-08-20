import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { GlassCard, RiskPill, SectionTitle } from "@/components/cb/glass";
import { useStore } from "@/lib/carebridge/store";

export const Route = createFileRoute("/hospital/_dash/high-risk")({
  head: () => ({
    meta: [
      { title: "High-Risk Patients — CareBridge AI" },
      { name: "description", content: "AI-ranked patients most likely to drop off, with the reason and next best action." },
      { property: "og:title", content: "High-Risk Patients — CareBridge AI" },
      { property: "og:description", content: "The patients who need attention today, ranked by drop-off risk." },
    ],
  }),
  component: HighRisk,
});

function HighRisk() {
  const { patients, update } = useStore();
  const rows = patients.filter((p) => p.risk >= 60).sort((a, b) => b.risk - a.risk);

  const act = (id: string, name: string, action: string) => {
    update(id, (p) => ({
      ...p,
      interventions: [
        {
          id: `${p.id}-${Date.now()}`,
          stage: action === "Staff Alert" ? 4 : action === "Call" ? 5 : 2,
          channel: action,
          note: `${action} initiated by care team`,
          at: new Date().toLocaleString("en-IN"),
          resolved: false,
        },
        ...p.interventions,
      ],
    }));
    toast.success(`${action} logged for ${name}`);
  };

  return (
    <GlassCard>
      <SectionTitle sub={`AI says these ${rows.length} patients need attention today.`}>High-Risk Patients</SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="pb-3">Patient</th>
              <th className="pb-3">Disease</th>
              <th className="pb-3">Risk</th>
              <th className="pb-3">Reason</th>
              <th className="pb-3">Next Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="py-3 font-medium">
                  <Link to="/hospital/patient/$id" params={{ id: p.id }} className="hover:underline">
                    {p.name}
                  </Link>
                </td>
                <td className="py-3 text-muted-foreground">{p.condition}</td>
                <td className="py-3"><RiskPill risk={p.risk} /></td>
                <td className="py-3 text-muted-foreground">
                  {p.riskFactors[0]?.label ?? "Engagement declining"}
                </td>
                <td className="py-3">
                  <button
                    onClick={() => act(p.id, p.name, p.nextAction)}
                    className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  >
                    {p.nextAction}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
