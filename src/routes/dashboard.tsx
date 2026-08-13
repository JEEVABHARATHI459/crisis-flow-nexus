import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Brain, Play } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/crisis/AppShell";
import { PageHeader, SafetyNote, Stat, StatusBadge, UrgencyBadge, timeAgo } from "@/components/crisis/ui-bits";
import { Button } from "@/components/ui/button";
import { actions, matchResources, useCrisis } from "@/lib/crisis/store";
import { t } from "@/lib/crisis/i18n";
import { DemoRunner } from "@/components/crisis/DemoRunner";
import { AssignDialog } from "@/components/crisis/AssignDialog";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Crisis Operations Center — CrisisMesh" },
      { name: "description", content: "Live crisis dashboard: critical incidents, affected people, volunteers and AI activity." },
      { property: "og:title", content: "Crisis Operations Center — CrisisMesh" },
      { property: "og:description", content: "Real-time AI-assisted emergency coordination dashboard." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const state = useCrisis();
  const navigate = useNavigate();
  const [assignFor, setAssignFor] = useState<string | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);

  const active = state.incidents.filter((i) => i.status !== "resolved" && i.status !== "cancelled");
  const critical = active.filter((i) => i.urgency === "critical");
  const affected = active.reduce((s, i) => s + i.affectedPeople, 0);
  const availableVolunteers = state.volunteers.filter((v) => v.status === "available").length;
  const unresolved = state.reports.filter((r) => r.status === "pending").length + active.filter((i) => !i.assignedVolunteerId).length;

  const feed = [...active].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 6);
  const incident = state.incidents.find((i) => i.id === assignFor) ?? null;

  return (
    <AppShell>
      <PageHeader
        title={t(state.language, "operationsCenter")}
        subtitle={t(state.language, "operationsSub")}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate({ to: "/reports/new" })}>
              + ADD EMERGENCY REPORT
            </Button>
            <Button onClick={() => setDemoOpen(true)}>
              <Play className="size-4" /> {t(state.language, "runDemo")}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Critical Incidents" value={critical.length} tone="critical" hint="Require immediate action" />
        <Stat label="Active Incidents" value={active.length} tone="high" hint="Open across all wards" />
        <Stat label="People Affected" value={affected} hint="Across active incidents" />
        <Stat label="Available Volunteers" value={availableVolunteers} tone="resolved" hint={`${state.volunteers.length} total`} />
        <Stat label="Unresolved Requests" value={unresolved} tone="ai" hint="Pending reports + unassigned" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <section className="xl:col-span-2">
          <h2 className="mb-3 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Live incident feed</h2>
          <div className="space-y-3">
            {feed.map((inc) => {
              const vol = state.volunteers.find((v) => v.id === inc.assignedVolunteerId);
              return (
                <article key={inc.id} className="panel rise p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold">{inc.id}</span>
                    <UrgencyBadge urgency={inc.urgency} />
                    <StatusBadge status={inc.status} />
                    <span className="ml-auto text-xs text-muted-foreground">{timeAgo(inc.createdAt)}</span>
                  </div>
                  <h3 className="mt-2 font-semibold">{inc.type}</h3>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
                    <p>
                      Location<br />
                      <span className="text-foreground">{inc.location}</span>
                    </p>
                    <p>
                      Affected<br />
                      <span className="text-foreground">{inc.affectedPeople}</span>
                    </p>
                    <p>
                      Resource<br />
                      <span className="text-foreground">{inc.requiredResource}</span>
                    </p>
                    <p>
                      Reports merged<br />
                      <span className="text-foreground">{inc.reportIds.length}</span>
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-border bg-card px-2 py-1 font-mono text-xs">
                      Priority {inc.priorityScore}/100
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Team: {vol ? `${vol.name} (${vol.team})` : "Unassigned"}
                    </span>
                    <div className="ml-auto flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link to="/incidents/$id" params={{ id: inc.id }}>
                          VIEW INCIDENT
                        </Link>
                      </Button>
                      <Button size="sm" onClick={() => setAssignFor(inc.id)}>
                        ASSIGN RESOURCE
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">CrisisMesh AI</h2>
          <div className="panel glow-ai p-4">
            <div className="flex items-center gap-2">
              <Brain className="size-5 text-ai" />
              <span className="font-mono text-sm font-bold tracking-widest">CRISISMESH AI</span>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              {[
                ["Reports processed", state.aiStats.reportsProcessed],
                ["Entities extracted", state.aiStats.entitiesExtracted],
                ["Duplicates detected", state.aiStats.duplicatesDetected],
                ["Incident clusters created", state.aiStats.clustersCreated],
                ["Resources matched", state.aiStats.resourcesMatched],
                ["Tasks created", state.aiStats.tasksCreated],
              ].map(([l, v]) => (
                <div key={l as string} className="flex items-center justify-between border-b border-border/60 pb-1">
                  <dt className="text-muted-foreground">{l}</dt>
                  <dd className="font-mono font-bold text-ai">{v}</dd>
                </div>
              ))}
            </dl>
            <Button className="mt-4 w-full" variant="outline" onClick={() => navigate({ to: "/ai-processing" })}>
              VIEW AI PROCESSING
            </Button>
          </div>

          <div className="panel mt-4 p-4">
            <h3 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Recent activity</h3>
            <ul className="mt-3 space-y-2 text-xs">
              {state.audit.slice(0, 8).map((a) => (
                <li key={a.id} className="flex gap-2">
                  <span className="font-mono text-muted-foreground">{new Date(a.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="font-semibold text-ai">{a.action}</span>
                  <span className="truncate text-muted-foreground">{a.entity}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <SafetyNote />

      <AssignDialog
        incident={incident}
        matches={incident ? matchResources(incident, state.volunteers).slice(0, 4) : []}
        onClose={() => setAssignFor(null)}
        onAssign={(volunteerId) => {
          if (!incident) return;
          actions.assignVolunteer(incident.id, volunteerId);
          toast.success(`Volunteer assigned to ${incident.id}`);
          setAssignFor(null);
        }}
      />

      <DemoRunner open={demoOpen} onClose={() => setDemoOpen(false)} />
    </AppShell>
  );
}
