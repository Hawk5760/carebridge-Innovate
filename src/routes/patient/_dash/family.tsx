import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Heart, Phone, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { GlassCard, SectionTitle } from "@/components/cb/glass";
import { usePatient, useStore } from "@/lib/carebridge/store";

export const Route = createFileRoute("/patient/_dash/family")({
  head: () => ({
    meta: [
      { title: "Family & Caregiver — CareBridge" },
      { name: "description", content: "Add a care partner and emergency contacts who can support your care." },
    ],
  }),
  component: PatientFamily,
});

const RULES = [
  "Missed medicine for 2 consecutive days",
  "Missed a follow-up appointment",
  "Missed a critical diagnostic test",
  "High-risk & inactive for 7 days",
];

const ESC_STYLE = {
  pending: "bg-warning/25 text-warning",
  acknowledged: "bg-primary/20 text-primary",
  resolved: "bg-success/20 text-success",
} as const;

function PatientFamily() {
  const { patientId, update } = useStore();
  const patient = usePatient(patientId);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  const [ecName, setEcName] = useState("");
  const [ecRelation, setEcRelation] = useState("");
  const [ecPhone, setEcPhone] = useState("");
  if (!patient) return null;

  const cg = patient.caregiver;
  const contacts = patient.emergencyContacts ?? [];
  const escalations = patient.escalations ?? [];

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

  const removeCg = () => {
    update(patient.id, (p) => ({ ...p, caregiver: undefined }));
    setName(""); setRelation(""); setPhone("");
    toast.success("Care partner removed.");
  };

  const addContact = () => {
    if (!ecName || ecPhone.replace(/\D/g, "").length < 10) {
      toast.error("Enter a name and valid phone number.");
      return;
    }
    update(patient.id, (p) => ({
      ...p,
      emergencyContacts: [
        ...(p.emergencyContacts ?? []),
        { id: `${p.id}-ec-${Date.now()}`, name: ecName, relation: ecRelation || "Contact", phone: ecPhone },
      ],
    }));
    setEcName(""); setEcRelation(""); setEcPhone("");
    toast.success("Emergency contact added.");
  };

  const removeContact = (id: string) =>
    update(patient.id, (p) => ({ ...p, emergencyContacts: (p.emergencyContacts ?? []).filter((c) => c.id !== id) }));

  return (
    <div className="space-y-5">
      <SectionTitle sub="Loved ones can gently support your care — only with your consent.">
        Family &amp; caregiver
      </SectionTitle>

      {cg ? (
        <GlassCard data-testid="patient-caregiver-card">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/20 text-primary"><Heart className="h-6 w-6" /></span>
            <div>
              <p className="text-lg font-semibold">{cg.name}</p>
              <p className="text-xs text-muted-foreground">{cg.relation} · {cg.phone}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-glass-strong px-4 py-3">
            <div className="flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-primary" /> Consent to notify this person</div>
            <button
              data-testid="patient-consent-toggle"
              onClick={toggleConsent}
              className={cg.consent ? "rounded-full bg-success px-4 py-1.5 text-xs font-semibold text-success-foreground" : "glass-soft rounded-full px-4 py-1.5 text-xs font-medium"}
            >
              {cg.consent ? "Allowed" : "Paused"}
            </button>
          </div>
          <button data-testid="patient-remove-caregiver" onClick={removeCg} className="mt-3 text-xs text-destructive">Remove care partner</button>
        </GlassCard>
      ) : (
        <GlassCard>
          <div className="mb-4 flex items-center gap-2"><UserPlus className="h-4 w-4 text-primary" /><h3 className="text-base font-semibold">Nominate a care partner</h3></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input data-testid="caregiver-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="rounded-2xl bg-input px-4 py-3 text-sm outline-none ring-ring focus:ring-2" />
            <input data-testid="caregiver-relation" value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="Relation" className="rounded-2xl bg-input px-4 py-3 text-sm outline-none ring-ring focus:ring-2" />
            <input data-testid="caregiver-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="rounded-2xl bg-input px-4 py-3 text-sm outline-none ring-ring focus:ring-2" />
          </div>
          <button data-testid="patient-nominate-btn" onClick={nominate} className="mt-4 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground">Add care partner</button>
        </GlassCard>
      )}

      <GlassCard>
        <SectionTitle sub="People we can reach in an emergency.">Emergency contacts</SectionTitle>
        <ul className="space-y-2" data-testid="emergency-contacts">
          {contacts.length === 0 ? <li className="text-sm text-muted-foreground">No emergency contacts added yet.</li> : null}
          {contacts.map((c) => (
            <li key={c.id} className="glass-soft flex items-center justify-between rounded-2xl px-4 py-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span><b>{c.name}</b> · {c.relation} · {c.phone}</span>
              </div>
              <button onClick={() => removeContact(c.id)} className="text-destructive" data-testid={`remove-contact-${c.id}`}><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <input data-testid="ec-name" value={ecName} onChange={(e) => setEcName(e.target.value)} placeholder="Name" className="rounded-2xl bg-input px-4 py-3 text-sm outline-none ring-ring focus:ring-2" />
          <input data-testid="ec-relation" value={ecRelation} onChange={(e) => setEcRelation(e.target.value)} placeholder="Relation" className="rounded-2xl bg-input px-4 py-3 text-sm outline-none ring-ring focus:ring-2" />
          <input data-testid="ec-phone" value={ecPhone} onChange={(e) => setEcPhone(e.target.value)} placeholder="Phone" className="rounded-2xl bg-input px-4 py-3 text-sm outline-none ring-ring focus:ring-2" />
          <button data-testid="add-contact-btn" onClick={addContact} className="rounded-2xl bg-primary px-4 py-3 text-xs font-semibold text-primary-foreground">Add contact</button>
        </div>
      </GlassCard>

      <GlassCard>
        <SectionTitle sub="Your care partner is gently notified only when one of these happens.">Escalation rules</SectionTitle>
        <ul className="grid gap-2 sm:grid-cols-2">
          {RULES.map((r) => (
            <li key={r} className="glass-soft rounded-2xl px-4 py-2.5 text-sm"><Bell className="mr-2 inline h-3.5 w-3.5 text-primary" />{r}</li>
          ))}
        </ul>
      </GlassCard>

      {escalations.length > 0 ? (
        <GlassCard>
          <SectionTitle sub="When your family was notified to support you.">Family support history</SectionTitle>
          <ul className="space-y-2" data-testid="patient-escalation-history">
            {escalations.map((e) => (
              <li key={e.id} className="glass-soft rounded-2xl px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{e.trigger}</p>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${ESC_STYLE[e.status]}`}>{e.status}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Notified {e.caregiver ?? "caregiver"} · {e.at}</p>
              </li>
            ))}
          </ul>
        </GlassCard>
      ) : null}
    </div>
  );
}
