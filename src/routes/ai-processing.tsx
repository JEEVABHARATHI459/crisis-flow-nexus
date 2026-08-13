import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Brain,
  Copy,
  Gauge,
  Inbox,
  ListChecks,
  MapPin,
  Sparkles,
  Type as TypeIcon,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/crisis/AppShell";
import { PageHeader, SafetyNote, UrgencyBadge, clock } from "@/components/crisis/ui-bits";
import { Button } from "@/components/ui/button";
import { actions, useCrisis } from "@/lib/crisis/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ai-processing")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "AI Processing Pipeline — CrisisMesh" },
      { name: "description", content: "Watch reports move through normalization, extraction, duplicate detection and task creation." },
      { property: "og:title", content: "AI Processing Pipeline — CrisisMesh" },
      { property: "og:description", content: "Transparent, auditable AI-assisted triage stages." },
    ],
  }),
  component: AIProcessingPage,
});

const STAGES = [
  { key: "received", label: "REPORT RECEIVED", icon: Inbox },
  { key: "normalize", label: "TEXT NORMALIZATION", icon: TypeIcon },
  { key: "entities", label: "ENTITY EXTRACTION", icon: Sparkles },
  { key: "location", label: "LOCATION IDENTIFICATION", icon: MapPin },
  { key: "duplicate", label: "DUPLICATE DETECTION", icon: Copy },
  { key: "urgency", label: "URGENCY CLASSIFICATION", icon: Gauge },
  { key: "resource", label: "RESOURCE MATCHING", icon: Wrench },
  { key: "task", label: "TASK CREATION", icon: ListChecks },
];

function AIProcessingPage() {
  const state = useCrisis();
  const navigate = useNavigate();
  const last = state.lastProcessed;
  const report = last ? state.reports.find((r) => r.id === last.reportId) : state.reports[0];
  const incident = last ? state.incidents.find((i) => i.id === last.incidentId) : state.incidents[0];
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
    const id = setInterval(() => setStep((s) => (s >= STAGES.length ? s : s + 1)), 550);
    return () => clearInterval(id);
  }, [last?.reportId]);

  const dupReports = incident ? state.reports.filter((r) => incident.reportIds.includes(r.id)) : [];
  const pendingDuplicates = incident
    ? state.reports.filter((r) => r.status === "pending" && r.location === incident.location)
    : [];

  return (
    <AppShell>
      <PageHeader
        title="AI Processing"
        subtitle="Deterministic rule-based extraction engine (no external LLM configured) — swappable behind one service interface."
        actions={<Button variant="outline" onClick={() => navigate({ to: "/reports/new" })}>+ PROCESS NEW REPORT</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="panel p-4 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Brain className="size-5 text-ai" />
            <h2 className="font-mono text-sm font-bold tracking-widest">PIPELINE</h2>
          </div>
          <ol className="mt-4 space-y-2">
            {STAGES.map((s, i) => {
              const done = i < step;
              const active = i === step;
              const confidence = incident ? Math.round((incident.confidence - i * 0.005) * 100) : 90;
              return (
                <li
                  key={s.key}
                  className={cn(
                    "flex items-center gap-3 rounded-md border p-3 transition-all",
                    done ? "border-resolved/40 bg-resolved/5" : active ? "border-ai/50 bg-ai/10 glow-ai" : "border-border bg-card opacity-60",
                  )}
                >
                  <s.icon className={cn("size-4", done ? "text-resolved" : active ? "text-ai" : "text-muted-foreground")} />
                  <span className="font-mono text-xs font-semibold tracking-widest">{s.label}</span>
                  <span className="ml-auto text-[11px] text-muted-foreground">
                    {done ? "COMPLETE" : active ? "PROCESSING…" : "QUEUED"}
                  </span>
                  <span className="hidden font-mono text-[11px] text-ai sm:inline">{done || active ? `${confidence}%` : "—"}</span>
                  <span className="hidden font-mono text-[11px] text-muted-foreground md:inline">
                    {report ? clock(report.createdAt) : ""}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="space-y-4">
          <div className="panel p-4">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Latest extraction</h2>
            {report && incident ? (
              <dl className="mt-3 space-y-1.5 text-sm">
                <p className="rounded border border-border bg-card p-2 text-xs">{report.message}</p>
                <Row k="incidentType" v={incident.type} />
                <Row k="location" v={incident.location} />
                <Row k="affectedPeople" v={String(incident.affectedPeople)} />
                <Row k="requiredResource" v={incident.requiredResource} />
                <Row k="urgency" v={incident.urgency.toUpperCase()} />
                <Row k="confidence" v={`${Math.round(incident.confidence * 100)}%`} />
                <Row k="source" v={report.source} />
                <Row k="language" v={report.language} />
                <Row k="duplicates" v={`${incident.reportIds.length} linked`} />
              </dl>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No report processed yet.</p>
            )}
          </div>

          {incident && (last?.merged || pendingDuplicates.length > 0) ? (
            <div className="panel glow-ai p-4">
              <p className="font-mono text-xs font-bold tracking-widest text-ai">POSSIBLE DUPLICATE INCIDENT</p>
              <dl className="mt-2 space-y-1 text-sm">
                <Row k="Similarity" v={`${Math.round((last?.similarity || 0.92) * 100)}%`} />
                <Row k="Reports" v={String(incident.reportIds.length)} />
                <Row k="Location" v={incident.location} />
                <Row k="Requirement" v={incident.requiredResource} />
              </dl>
              <div className="mt-2">
                <UrgencyBadge urgency={incident.urgency} />
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    actions.mergeReports(
                      incident.id,
                      pendingDuplicates.length ? pendingDuplicates.map((r) => r.id) : [last!.reportId],
                    );
                    toast.success("Reports merged into one incident");
                  }}
                >
                  MERGE REPORTS
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    actions.keepSeparate(last?.reportId ?? incident.id);
                    toast.info("Kept as separate incidents");
                  }}
                >
                  KEEP SEPARATE
                </Button>
              </div>
            </div>
          ) : null}

          {incident ? (
            <Button className="w-full" onClick={() => navigate({ to: "/incidents/$id", params: { id: incident.id } })}>
              OPEN {incident.id}
            </Button>
          ) : null}
        </section>
      </div>

      {dupReports.length > 0 ? (
        <section className="panel mt-4 p-4">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            {dupReports.length} reports consolidated
          </h2>
          <ul className="mt-3 space-y-2">
            {dupReports.map((r) => (
              <li key={r.id} className="rounded border border-border bg-card p-2 text-xs">
                <span className="font-mono font-bold">#{r.id}</span>{" "}
                <span className="tracking-widest text-muted-foreground uppercase">{r.source}</span>
                {r.status === "merged" ? <span className="ml-2 text-[10px] tracking-widest text-ai">MERGED</span> : null}
                <p className="mt-1">{r.message}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <SafetyNote />
    </AppShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/50 py-1 text-xs">
      <span className="font-mono text-muted-foreground">{k}</span>
      <span className="text-right font-semibold">{v}</span>
    </div>
  );
}
