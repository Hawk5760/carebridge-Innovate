import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { GlassCard, SectionTitle } from "@/components/cb/glass";
import { usePatient, useStore } from "@/lib/carebridge/store";

export const Route = createFileRoute("/patient/_dash/family")({
  head: () => ({
    meta: [
      { title: "Family & Caregiver — CareBridge" },
      { name: "description", content: "Nominate a care partner who can be notified — only with your consent." },
    ],
  }),
  component: PatientFamily,
});

function PatientFamily() {
  const { patientId, update } = useStore();
  const patient = usePatient(patientId);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  if (!patient) return null;

  const cg = patient.caregiver;

  const nominate = () => {
    if (!name || !relation || phone.replace(/\D/g, "").length < 10) {
      toast.error("Please fill in name, relation and a valid phone number.");
      return;
    }
    update(patient.id, (p) => ({ ...p, caregiver: { name, relation, phone, consent: true } }));
    toast.success("Care partner added with your consent.");
  };

  const toggleConsent = () =>
    update(patient.id, (p) => (p.caregiver ? { ...p, caregiver: { ...p.caregiver, consent: !p.caregiver.consent } } : p));

  const remove = () => {
    update(patient.id, (p) => ({ ...p, caregiver: undefined }));
    setName(""); setRelation(""); setPhone("");
    toast.success("Care partner removed.");
  };

  return (
    <div className="space-y-5">
      <SectionTitle sub="A trusted person we can gently remind if you miss important care — only if you allow it.">
        Family &amp; caregiver
      </SectionTitle>

      {cg ? (
        <GlassCard data-testid="patient-caregiver-card">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/20 text-primary">
              <Heart className="h-6 w-6" />
            </span>
            <div>
              <p className="text-lg font-semibold">{cg.name}</p>
              <p className="text-xs text-muted-foreground">{cg.relation} · {cg.phone}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-glass-strong px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Consent to notify this person
            </div>
            <button
              data-testid="patient-consent-toggle"
              onClick={toggleConsent}
              className={cg.consent ? "rounded-full bg-success px-4 py-1.5 text-xs font-semibold text-success-foreground" : "glass-soft rounded-full px-4 py-1.5 text-xs font-medium"}
            >
              {cg.consent ? "Allowed" : "Paused"}
            </button>
          </div>

          <button data-testid="patient-remove-caregiver" onClick={remove} className="mt-3 text-xs text-destructive">
            Remove care partner
          </button>
        </GlassCard>
      ) : (
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold">Nominate a care partner</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input data-testid="caregiver-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="rounded-2xl bg-input px-4 py-3 text-sm outline-none ring-ring focus:ring-2" />
            <input data-testid="caregiver-relation" value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="Relation" className="rounded-2xl bg-input px-4 py-3 text-sm outline-none ring-ring focus:ring-2" />
            <input data-testid="caregiver-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="rounded-2xl bg-input px-4 py-3 text-sm outline-none ring-ring focus:ring-2" />
          </div>
          <button data-testid="patient-nominate-btn" onClick={nominate} className="mt-4 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground">
            Add care partner
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            We never share your medical details automatically — only gentle reminders, and only with your consent.
          </p>
        </GlassCard>
      )}
    </div>
  );
}
