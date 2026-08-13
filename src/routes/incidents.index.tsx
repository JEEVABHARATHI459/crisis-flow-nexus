import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/crisis/AppShell";
import { EmptyState, PageHeader, StatusBadge, UrgencyBadge, timeAgo } from "@/components/crisis/ui-bits";
import { Button } from "@/components/ui/button";
import { useCrisis } from "@/lib/crisis/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/incidents/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Live Incidents — CrisisMesh" },
      { name: "description", content: "Filter, search and triage every consolidated incident across the response area." },
      { property: "og:title", content: "Live Incidents — CrisisMesh" },
      { property: "og:description", content: "Consolidated incidents with AI priority scoring." },
    ],
  }),
  component: IncidentsPage,
});

const FILTERS = ["all", "critical", "high", "medium", "low", "unassigned", "assigned", "in_progress", "resolved"] as const;

function IncidentsPage() {
  const state = useCrisis();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [q, setQ] = useState("");

  const list = state.incidents
    .filter((i) => {
      if (filter === "all") return true;
      if (["critical", "high", "medium", "low"].includes(filter)) return i.urgency === filter;
      if (filter === "unassigned") return !i.assignedVolunteerId;
      return i.status === filter;
    })
    .filter((i) => `${i.id} ${i.location} ${i.type}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  return (
    <AppShell>
      <PageHeader title="Live Incidents" subtitle={`${state.incidents.length} incidents in the operational picture.`} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-[11px] font-semibold tracking-widest uppercase",
              filter === f ? "border-ai/50 bg-ai/10 text-ai" : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {f.replace("_", " ")}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search ID, location or type…"
          className="ml-auto h-8 w-full rounded-md border border-border bg-card px-3 text-xs sm:w-64"
        />
      </div>

      {list.length === 0 ? (
        <EmptyState title="No incidents match" hint="Adjust the filters or search term." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((inc) => {
            const vol = state.volunteers.find((v) => v.id === inc.assignedVolunteerId);
            return (
              <button
                key={inc.id}
                onClick={() => navigate({ to: "/incidents/$id", params: { id: inc.id } })}
                className="panel rise cursor-pointer p-4 text-left transition-colors hover:border-ai/50"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold">{inc.id}</span>
                  <UrgencyBadge urgency={inc.urgency} />
                  <span className="ml-auto font-mono text-xs text-ai">{inc.priorityScore}</span>
                </div>
                <h3 className="mt-2 font-semibold">{inc.type}</h3>
                <p className="text-xs text-muted-foreground">
                  {inc.location} • {inc.affectedPeople} affected • {inc.requiredResource}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <StatusBadge status={inc.status} />
                  <span className="text-[11px] text-muted-foreground">{vol ? vol.team : "Unassigned"}</span>
                  <span className="ml-auto text-[11px] text-muted-foreground">{timeAgo(inc.updatedAt)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <Button variant="outline" onClick={() => navigate({ to: "/reports/new" })}>
          + ADD EMERGENCY REPORT
        </Button>
      </div>
    </AppShell>
  );
}
