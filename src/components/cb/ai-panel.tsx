import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/cb/glass";
import { cn } from "@/lib/utils";

export function AIInsight({
  title,
  sub,
  cta,
  run,
  testid,
  className,
}: {
  title: string;
  sub?: string;
  cta: string;
  run: () => Promise<string>;
  testid: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const go = async () => {
    setLoading(true);
    setError("");
    try {
      setText(await run());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard
      className={cn("border-l-4 border-l-primary", className)}
      data-testid={`${testid}-card`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
          </div>
          {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
        </div>
        <button
          onClick={go}
          disabled={loading}
          data-testid={`${testid}-btn`}
          className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {loading ? "Thinking…" : cta}
        </button>
      </div>

      {error ? (
        <p
          className="mt-4 rounded-2xl bg-destructive/10 px-4 py-3 text-xs text-destructive"
          data-testid={`${testid}-error`}
        >
          {error}
        </p>
      ) : null}

      {text ? (
        <div
          className="mt-4 whitespace-pre-line rounded-2xl bg-glass-strong px-4 py-3 text-sm leading-relaxed text-foreground"
          data-testid={`${testid}-result`}
        >
          {text}
        </div>
      ) : null}
    </GlassCard>
  );
}
