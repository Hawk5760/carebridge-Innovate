import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { GlassCard, SectionTitle } from "@/components/cb/glass";
import { recompute, useStore } from "@/lib/carebridge/store";

export const Route = createFileRoute("/hospital/_dash/follow-ups")({
  head: () => ({
    meta: [
      { title: "Follow-Ups — CareBridge AI" },
      { name: "description", content: "Track scheduled, confirmed and missed follow-up appointments in one queue." },
      { property: "og:title", content: "Follow-Up Queue — CareBridge AI" },
      { property: "og:description", content: "Confirm, reschedule or flag missed follow-ups across the cohort." },
    ],
  }),
  component: FollowUps,
});

function FollowUps() {
  const { patients, update } = useStore();

  const setStatus = (pid: string, aid: string, status: "confirmed" | "missed" | "completed" | "rescheduled") => {
    update(pid, (p) =>
      recompute({
        ...p,
        appointments: p.appointments.map((a) => (a.id === aid ? { ...a, status } : a)),
      }),
    );
    toast.success(`Appointment marked ${status}`);
  };

  const rows = patients.flatMap((p) => p.appointments.map((a) => ({ p, a })));

  return (
    <GlassCard>
      <SectionTitle sub="Automation runs reminders at 7 days, 3 days and 1 day before each visit.">
        Follow-Ups
      </SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="pb-3">Patient</th>
              <th className="pb-3">Date</th>
              <th className="pb-3">Doctor</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ p, a }) => (
              <tr key={a.id} className="border-t border-border">
                <td className="py-3 font-medium">{p.name}</td>
                <td className="py-3 text-muted-foreground">{a.date} · {a.time}</td>
                <td className="py-3 text-muted-foreground">{a.doctor}</td>
                <td className="py-3 capitalize">{a.status}</td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => setStatus(p.id, a.id, "confirmed")} className="glass-soft rounded-full px-3 py-1.5 text-xs">Confirm</button>
                    <button onClick={() => setStatus(p.id, a.id, "rescheduled")} className="glass-soft rounded-full px-3 py-1.5 text-xs">Reschedule</button>
                    <button onClick={() => setStatus(p.id, a.id, "missed")} className="glass-soft rounded-full px-3 py-1.5 text-xs">Mark missed</button>
                    <button onClick={() => setStatus(p.id, a.id, "completed")} className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Completed</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
