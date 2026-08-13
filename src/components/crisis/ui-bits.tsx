import { cn } from "@/lib/utils";
import type { IncidentStatus, TaskStatus, Urgency } from "@/lib/crisis/types";

export function UrgencyBadge({ urgency, className }: { urgency: Urgency; className?: string }) {
  const map: Record<Urgency, string> = {
    critical: "bg-critical/15 text-critical border-critical/40",
    high: "bg-high/15 text-high border-high/40",
    medium: "bg-medium/15 text-medium border-medium/40",
    low: "bg-resolved/15 text-resolved border-resolved/40",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase",
        map[urgency],
        className,
      )}
    >
      {urgency}
    </span>
  );
}

export function StatusBadge({ status }: { status: IncidentStatus | TaskStatus }) {
  const tone =
    status === "resolved" || status === "completed"
      ? "bg-resolved/15 text-resolved border-resolved/40"
      : status === "in_progress"
        ? "bg-ai/15 text-ai border-ai/40"
        : status === "assigned"
          ? "bg-primary/15 text-primary border-primary/40"
          : status === "cancelled"
            ? "bg-muted text-muted-foreground border-border"
            : "bg-high/10 text-high border-high/30";
  return (
    <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase", tone)}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "critical" | "ai" | "resolved" | "high";
}) {
  const toneClass = {
    default: "text-foreground",
    critical: "text-critical",
    ai: "text-ai",
    resolved: "text-resolved",
    high: "text-high",
  }[tone];
  return (
    <div className="panel rise p-4">
      <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">{label}</p>
      <p className={cn("mt-2 font-mono text-3xl font-bold tabular-nums", toneClass)}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-[0.12em] uppercase sm:text-2xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="panel flex flex-col items-center justify-center gap-1 p-10 text-center">
      <p className="font-semibold">{title}</p>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function SafetyNote() {
  return (
    <p className="mt-8 rounded-lg border border-border bg-panel/60 p-3 text-xs leading-relaxed text-muted-foreground">
      CrisisMesh is an AI-assisted coordination prototype. It does not replace emergency services, trained responders, or
      official authorities. All AI-generated recommendations require human verification.
    </p>
  );
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function clock(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
