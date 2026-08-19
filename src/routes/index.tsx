import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowRight, Brain, HeartPulse, ShieldCheck, TrendingUp } from "lucide-react";
import { Blobs, GlassCard } from "@/components/cb/glass";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareBridge AI — Prevent patients from disappearing after diagnosis" },
      {
        name: "description",
        content:
          "AI-powered patient continuity platform that predicts follow-up drop-off and helps hospitals intervene early.",
      },
      { property: "og:title", content: "CareBridge AI — Patient Continuity Platform" },
      {
        property: "og:description",
        content: "Predict drop-off risk, understand why, and intervene before patients leave the care journey.",
      },
    ],
  }),
  component: Landing,
});

const problem = ["Diagnosis", "Discharge", "Missed appointment", "Medication stops", "Condition worsens"];
const solution = [
  "Diagnosis",
  "CareBridge AI",
  "Risk prediction",
  "Personalised intervention",
  "Follow-up",
  "Better outcome",
];

function Flow({ steps, tone }: { steps: string[]; tone: "bad" | "good" }) {
  return (
    <ol className="space-y-2">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-3">
          <span
            className={
              tone === "good"
                ? "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/25 text-xs font-semibold text-primary"
                : "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-destructive/15 text-xs font-semibold text-destructive"
            }
          >
            {i + 1}
          </span>
          <span className="text-sm text-foreground">{s}</span>
        </li>
      ))}
    </ol>
  );
}

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Blobs />
      <div className="relative mx-auto max-w-6xl px-5 py-6">
        <header className="glass flex items-center justify-between rounded-full px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/25 text-primary">
              <HeartPulse className="h-5 w-5" />
            </span>
            <span className="text-base font-semibold">CareBridge AI</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              to="/hospital/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground transition hover:bg-glass-strong"
            >
              For Hospitals
            </Link>
            <Link
              to="/patient/login"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Patient Login
            </Link>
          </nav>
        </header>

        <section className="mt-14 text-center">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Clinically-guided, consent-first care continuity
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-foreground sm:text-6xl">
            Prevent patients from
            <br />
            disappearing after diagnosis.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground">
            AI-powered patient continuity platform that predicts follow-up drop-off and helps hospitals
            intervene before patients leave the care journey.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/hospital/login"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:opacity-90"
            >
              For Hospitals <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/patient/login"
              className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-glass-strong"
            >
              Patient Login
            </Link>
          </div>
        </section>

        <section className="mt-14 grid gap-4 sm:grid-cols-3">
          {[
            { n: "01", t: "Predict", d: "Drop-off risk scored continuously from clinical + behavioural signals.", i: Brain },
            { n: "02", t: "Intervene", d: "Graduated nudges — push, WhatsApp, personalised message, staff call.", i: Activity },
            { n: "03", t: "Recover", d: "Follow-ups completed, care scores rise, revenue recovered.", i: TrendingUp },
          ].map((c) => (
            <GlassCard key={c.t} className="text-left">
              <c.i className="h-6 w-6 text-primary" />
              <p className="mt-4 text-xs font-semibold tracking-[0.2em] text-muted-foreground">{c.n}</p>
              <h3 className="mt-1 text-xl font-semibold">{c.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
            </GlassCard>
          ))}
        </section>

        <section className="mt-14 grid gap-4 md:grid-cols-2">
          <GlassCard>
            <h3 className="text-lg font-semibold">The problem</h3>
            <p className="mb-4 text-sm text-muted-foreground">Diagnosis is not the end of treatment.</p>
            <Flow steps={problem} tone="bad" />
          </GlassCard>
          <GlassCard>
            <h3 className="text-lg font-semibold">Our solution</h3>
            <p className="mb-4 text-sm text-muted-foreground">A continuous bridge from diagnosis to outcome.</p>
            <Flow steps={solution} tone="good" />
          </GlassCard>
        </section>

        <section className="mt-14">
          <GlassCard className="aqua-panel rounded-3xl border-none p-8 text-center">
            <h3 className="text-2xl font-semibold">
              "We don't wait for the patient to disappear."
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm opacity-90">
              We identify the warning signals early — and intervene while it still matters.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/hospital/login"
                className="rounded-full bg-glass-strong px-6 py-3 text-sm font-semibold text-foreground"
              >
                Explore hospital dashboard
              </Link>
            </div>
          </GlassCard>
        </section>

        <footer className="py-10 text-center text-xs text-muted-foreground">
          CareBridge AI — risk scores are decision support, not diagnostic predictions.
        </footer>
      </div>
    </div>
  );
}
