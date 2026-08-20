import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { GlassCard, SectionTitle } from "@/components/cb/glass";
import { usePatient, useStore } from "@/lib/carebridge/store";
import { aiCareInsight } from "@/lib/carebridge/ai";
import type { MessageItem } from "@/lib/carebridge/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/patient/_dash/messages")({
  head: () => ({
    meta: [
      { title: "Messages — CareBridge" },
      { name: "description", content: "Chat with your care team and ask CareBridge AI for support." },
    ],
  }),
  component: PatientMessages,
});

function PatientMessages() {
  const { patientId, update } = useStore();
  const patient = usePatient(patientId);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  if (!patient) return null;

  const add = (msg: Omit<MessageItem, "id">) =>
    update(patient.id, (p) => ({
      ...p,
      messages: [...p.messages, { ...msg, id: `${p.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }],
    }));

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    add({ from: "patient", text, at: "just now" });
    setDraft("");
  };

  const askAi = async () => {
    setLoading(true);
    try {
      const reply = await aiCareInsight(patient);
      add({ from: "ai", text: reply, at: "just now" });
    } catch (e) {
      add({ from: "ai", text: e instanceof Error ? e.message : "Sorry, I couldn't respond right now.", at: "just now" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle sub="Your care team and CareBridge AI are here to help.">Messages</SectionTitle>

      <GlassCard>
        <ul className="space-y-3" data-testid="patient-messages-list">
          {patient.messages.map((m) => (
            <li
              key={m.id}
              className={cn("flex", m.from === "patient" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                  m.from === "patient"
                    ? "bg-primary text-primary-foreground"
                    : m.from === "ai"
                      ? "aqua-panel border-none text-foreground"
                      : "glass-soft text-foreground",
                )}
              >
                <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider opacity-80">
                  {m.from === "ai" ? <Sparkles className="h-3 w-3" /> : null}
                  {m.from === "care-team" ? "Care team" : m.from === "ai" ? "CareBridge AI" : "You"} · {m.at}
                </p>
                <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center gap-2">
          <input
            data-testid="patient-message-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message…"
            className="w-full rounded-2xl bg-input px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
          />
          <button
            data-testid="patient-send-message-btn"
            onClick={send}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <button
          data-testid="patient-ask-ai-btn"
          onClick={askAi}
          disabled={loading}
          className="mt-3 flex items-center gap-2 rounded-full bg-glass-strong px-4 py-2 text-xs font-semibold text-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {loading ? "Thinking…" : "Ask CareBridge AI for support"}
        </button>
      </GlassCard>
    </div>
  );
}
