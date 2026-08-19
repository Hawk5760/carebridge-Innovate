import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { riskBand } from "@/lib/carebridge/types";

export function Blobs() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <span className="blob left-[-6rem] top-24 h-72 w-72 bg-primary/40" />
      <span className="blob right-[-4rem] top-[30%] h-80 w-80 bg-accent/50" />
      <span className="blob bottom-[-6rem] left-[35%] h-96 w-96 bg-primary/25" />
    </div>
  );
}

export function GlassCard({
  children,
  className,
  ...rest
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("glass rounded-3xl p-5", className)} {...rest}>
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
}) {
  return (
    <GlassCard className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
        {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
      </div>
      {icon ? (
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/20 text-primary">
          {icon}
        </span>
      ) : null}
    </GlassCard>
  );
}

export function RiskPill({ risk }: { risk: number }) {
  const band = riskBand(risk);
  const map = {
    low: "bg-success/20 text-success",
    medium: "bg-warning/25 text-warning",
    high: "bg-destructive/15 text-destructive",
    critical: "bg-destructive/25 text-destructive",
  } as const;
  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", map[band])}>
      {risk}% {band}
    </span>
  );
}

export function Ring({ value, label, size = 168 }: { value: number; label?: string; size?: number }) {
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={14} className="fill-none stroke-border" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * c} ${c}`}
          className="fill-none stroke-primary transition-all duration-700"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        {label ? <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p> : null}
      </div>
    </div>
  );
}

export function Bar({ label, value, amount }: { label: string; value: number; amount?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{label}</span>
        <span>{amount ?? `${value}%`}</span>
      </div>
      <div className="h-2 rounded-full bg-border">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-700"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-foreground">{children}</h2>
      {sub ? <p className="text-sm text-muted-foreground">{sub}</p> : null}
    </div>
  );
}
