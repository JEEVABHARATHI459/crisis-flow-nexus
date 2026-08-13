import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/crisis/AppShell";
import { EmptyState, PageHeader, StatusBadge, UrgencyBadge, timeAgo } from "@/components/crisis/ui-bits";
import { Button } from "@/components/ui/button";
import { useCrisis } from "@/lib/crisis/store";
import type { Source } from "@/lib/crisis/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reports/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Incoming Reports — CrisisMesh" },
      { name: "description", content: "Unified inbox of WhatsApp, SMS, social, voice and manual emergency reports." },
      { property: "og:title", content: "Incoming Reports — CrisisMesh" },
      { property: "og:description", content: "Every emergency report in one triage inbox." },
    ],
  }),
  component: ReportsPage,
});

const TABS: { key: Source | "all"; label: string }[] = [
  { key: "all", label: "ALL" },
  { key: "whatsapp", label: "WHATSAPP" },
  { key: "sms", label: "SMS" },
  { key: "social", label: "SOCIAL MEDIA" },
  { key: "voice", label: "VOICE TRANSCRIPT" },
  { key: "manual", label: "MANUAL" },
];

function ReportsPage() {
  const state = useCrisis();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Source | "all">("all");
  const [q, setQ] = useState("");

  const reports = state.reports.filter(
    (r) => (tab === "all" || r.source === tab) && `${r.id} ${r.message} ${r.location}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppShell>
      <PageHeader
        title="Incoming Reports"
        subtitle={`${state.reports.length} reports ingested across all channels.`}
        actions={<Button onClick={() => navigate({ to: "/reports/new" })}>+ ADD EMERGENCY REPORT</Button>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-[11px] font-semibold tracking-widest transition-colors",
              tab === tb.key ? "border-ai/50 bg-ai/10 text-ai" : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {tb.label}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search reports…"
          className="ml-auto h-8 w-full rounded-md border border-border bg-card px-3 text-xs sm:w-56"
        />
      </div>

      {reports.length === 0 ? (
        <EmptyState title="No reports match this filter" hint="Try another channel or clear the search." />
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <article key={r.id} className="panel rise flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold">{r.id}</span>
                  <span className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] tracking-widest uppercase">
                    {r.source}
                  </span>
                  {r.urgency ? <UrgencyBadge urgency={r.urgency} /> : null}
                  <StatusBadge status={r.status === "merged" ? "resolved" : r.status === "processed" ? "assigned" : "new"} />
                  {r.language !== "en" ? (
                    <span className="rounded border border-ai/40 bg-ai/10 px-1.5 py-0.5 text-[10px] text-ai uppercase">
                      {r.language}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm">{r.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.location} • {r.affectedPeople} affected • {timeAgo(r.createdAt)}
                  {r.incidentId ? ` • ${r.incidentId}` : ""}
                </p>
              </div>
              {r.incidentId ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate({ to: "/incidents/$id", params: { id: r.incidentId! } })}
                >
                  VIEW INCIDENT
                </Button>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}
